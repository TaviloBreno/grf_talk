from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from unittest.mock import patch, MagicMock

from accounts.models import User
from chats.models import Chat, ChatMessage
from chats.serializers import ChatSerializer, ChatMessageSerializer
from attachments.models import FileAttachment, AudioAttachment


class ChatModelTest(TestCase):
    """Testes para o modelo Chat."""
    
    def setUp(self):
        self.user1 = User.objects.create(
            name='User One',
            email='user1@example.com'
        )
        self.user2 = User.objects.create(
            name='User Two',
            email='user2@example.com'
        )
    
    def test_create_chat(self):
        """Testa criação de chat."""
        chat = Chat.objects.create(
            from_user=self.user1,
            to_user=self.user2
        )
        
        self.assertEqual(chat.from_user, self.user1)
        self.assertEqual(chat.to_user, self.user2)
        self.assertIsNotNone(chat.created_at)
    
    def test_chat_str_representation(self):
        """Testa representação string do chat."""
        chat = Chat.objects.create(
            from_user=self.user1,
            to_user=self.user2
        )
        
        expected = f"Chat entre {self.user1.name} e {self.user2.name}"
        self.assertEqual(str(chat), expected)
    
    def test_chat_creation_allows_duplicates(self):
        """Testa que múltiplos chats podem ser criados (sem constraint de unicidade)."""
        # Criar primeiro chat
        chat1 = Chat.objects.create(
            from_user=self.user1,
            to_user=self.user2
        )
        
        # Criar segundo chat (deveria permitir)
        chat2 = Chat.objects.create(
            from_user=self.user1,
            to_user=self.user2
        )
        
        self.assertNotEqual(chat1.id, chat2.id)
        self.assertEqual(Chat.objects.count(), 2)


class ChatMessageModelTest(TestCase):
    """Testes para o modelo ChatMessage."""
    
    def setUp(self):
        self.user1 = User.objects.create(
            name='User One',
            email='user1@example.com'
        )
        self.user2 = User.objects.create(
            name='User Two',
            email='user2@example.com'
        )
        self.chat = Chat.objects.create(
            from_user=self.user1,
            to_user=self.user2
        )
    
    def test_create_message(self):
        """Testa criação de mensagem."""
        message = ChatMessage.objects.create(
            body='Hello, World!',
            chat=self.chat,
            from_user=self.user1
        )
        
        self.assertEqual(message.body, 'Hello, World!')
        self.assertEqual(message.chat, self.chat)
        self.assertEqual(message.from_user, self.user1)
        self.assertIsNotNone(message.created_at)
        self.assertIsNone(message.viewed_at)
        self.assertIsNone(message.deleted_at)
    
    def test_message_str_representation(self):
        """Testa representação string da mensagem."""
        message = ChatMessage.objects.create(
            body='Hello, World!',
            chat=self.chat,
            from_user=self.user1
        )
        
        expected = f"Mensagem de {self.user1.name}: {message.body[:50]}..."
        self.assertEqual(str(message), expected)
    
    def test_message_with_attachment(self):
        """Testa mensagem com anexo."""
        file_attachment = FileAttachment.objects.create(
            name='test',
            extension='pdf',
            size=1024,
            src='/media/uploads/test.pdf',
            content_type='application/pdf'
        )
        
        message = ChatMessage.objects.create(
            body='',
            chat=self.chat,
            from_user=self.user1,
            attachment_code='FILE',
            attachment_id=file_attachment.id
        )
        
        self.assertEqual(message.attachment_code, 'FILE')
        self.assertEqual(message.attachment_id, file_attachment.id)
    
    def test_soft_delete(self):
        """Testa soft delete de mensagem."""
        message = ChatMessage.objects.create(
            body='To be deleted',
            chat=self.chat,
            from_user=self.user1
        )
        
        # Simular soft delete
        message.deleted_at = timezone.now()
        message.save()
        
        self.assertIsNotNone(message.deleted_at)
    
    def test_mark_as_viewed(self):
        """Testa marcação como visualizada."""
        message = ChatMessage.objects.create(
            body='To be viewed',
            chat=self.chat,
            from_user=self.user1
        )
        
        # Marcar como visualizada
        message.viewed_at = timezone.now()
        message.save()
        
        self.assertIsNotNone(message.viewed_at)


class ChatSerializerTest(TestCase):
    """Testes para o ChatSerializer."""
    
    def setUp(self):
        self.user1 = User.objects.create(
            name='User One',
            email='user1@example.com'
        )
        self.user2 = User.objects.create(
            name='User Two',
            email='user2@example.com'
        )
        self.chat = Chat.objects.create(
            from_user=self.user1,
            to_user=self.user2
        )
        
        # Criar algumas mensagens
        ChatMessage.objects.create(
            body='Message 1',
            chat=self.chat,
            from_user=self.user1
        )
        ChatMessage.objects.create(
            body='Message 2',
            chat=self.chat,
            from_user=self.user2,
            viewed_at=timezone.now()
        )
    
    def test_serializer_fields(self):
        """Testa campos do serializer."""
        serializer = ChatSerializer(self.chat)
        data = serializer.data
        
        expected_fields = ['id', 'user', 'last_message', 'unseen_count', 'created_at']
        
        for field in expected_fields:
            self.assertIn(field, data)
    
    def test_chat_with_field_from_user_perspective(self):
        """Testa campo chat_with da perspectiva do from_user."""
        # Mock do request com user1
        from django.test import RequestFactory
        factory = RequestFactory()
        request = factory.get('/')
        request.user = self.user1
        
        serializer = ChatSerializer(self.chat, context={'request': request})
        data = serializer.data
        
        # Deve retornar user2 (to_user)
        self.assertEqual(data['user']['email'], self.user2.email)
    
    def test_chat_with_field_to_user_perspective(self):
        """Testa campo chat_with da perspectiva do to_user."""
        from django.test import RequestFactory
        factory = RequestFactory()
        request = factory.get('/')
        request.user = self.user2
        
        serializer = ChatSerializer(self.chat, context={'request': request})
        data = serializer.data
        
        # Deve retornar user1 (from_user)
        self.assertEqual(data['user']['email'], self.user1.email)
    
    def test_last_message_field(self):
        """Testa campo last_message."""
        serializer = ChatSerializer(self.chat)
        data = serializer.data
        
        # Deve retornar a última mensagem
        self.assertEqual(data['last_message']['body'], 'Message 2')
    
    def test_unseen_count_field(self):
        """Testa campo unseen_count."""
        from django.test import RequestFactory
        factory = RequestFactory()
        request = factory.get('/')
        request.user = self.user2  # Perspectiva do user2
        
        serializer = ChatSerializer(self.chat, context={'request': request})
        data = serializer.data
        
        # User2 deve ter 1 mensagem não vista (Message 1 de user1)
        self.assertEqual(data['unseen_count'], 1)


class ChatMessageSerializerTest(TestCase):
    """Testes para o ChatMessageSerializer."""
    
    def setUp(self):
        self.user1 = User.objects.create(
            name='User One',
            email='user1@example.com'
        )
        self.user2 = User.objects.create(
            name='User Two',
            email='user2@example.com'
        )
        self.chat = Chat.objects.create(
            from_user=self.user1,
            to_user=self.user2
        )
        self.message = ChatMessage.objects.create(
            body='Test message',
            chat=self.chat,
            from_user=self.user1
        )
    
    def test_serializer_fields(self):
        """Testa campos do serializer."""
        serializer = ChatMessageSerializer(self.message)
        data = serializer.data
        
        expected_fields = ['id', 'body', 'attachment', 'chat', 'from_user', 'viewed_at', 'created_at']
        
        for field in expected_fields:
            self.assertIn(field, data)
    
    def test_from_user_field(self):
        """Testa campo from_user."""
        serializer = ChatMessageSerializer(self.message)
        data = serializer.data
        
        self.assertEqual(data['from_user']['email'], self.user1.email)
        self.assertEqual(data['from_user']['name'], self.user1.name)
    
    def test_attachment_field_none(self):
        """Testa campo attachment quando não há anexo."""
        serializer = ChatMessageSerializer(self.message)
        data = serializer.data
        
        self.assertIsNone(data['attachment'])
    
    def test_attachment_field_file(self):
        """Testa campo attachment com arquivo."""
        file_attachment = FileAttachment.objects.create(
            name='test',
            extension='pdf',
            size=1024,
            src='/media/uploads/test.pdf',
            content_type='application/pdf'
        )
        
        message_with_file = ChatMessage.objects.create(
            body='Message with file',
            chat=self.chat,
            from_user=self.user1,
            attachment_code='FILE',
            attachment_id=file_attachment.id
        )
        
        serializer = ChatMessageSerializer(message_with_file)
        data = serializer.data
        
        self.assertIsNotNone(data['attachment'])
        self.assertEqual(data['attachment']['type'], 'FILE')
        self.assertEqual(data['attachment']['data']['name'], 'test')
    
    def test_attachment_field_audio(self):
        """Testa campo attachment com áudio."""
        audio_attachment = AudioAttachment.objects.create(
            src='/media/uploads/test.mp3'
        )
        
        message_with_audio = ChatMessage.objects.create(
            body='Message with audio',
            chat=self.chat,
            from_user=self.user1,
            attachment_code='AUDIO',
            attachment_id=audio_attachment.id
        )
        
        serializer = ChatMessageSerializer(message_with_audio)
        data = serializer.data
        
        self.assertIsNotNone(data['attachment'])
        self.assertEqual(data['attachment']['type'], 'AUDIO')
        self.assertEqual(data['attachment']['data']['src'], 'http://127.0.0.1:8000/media/uploads/test.mp3')


class ChatsViewTest(APITestCase):
    """Testes para a view de chats."""
    
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('chats')
        
        # Criar usuários
        self.user1 = User.objects.create(
            name='User One',
            email='user1@example.com'
        )
        self.user1.set_password('testpass123')
        self.user1.save()
        
        self.user2 = User.objects.create(
            name='User Two',
            email='user2@example.com'
        )
        self.user2.set_password('testpass123')
        self.user2.save()
        
        self.user3 = User.objects.create(
            name='User Three',
            email='user3@example.com'
        )
        
        # Autenticar user1
        refresh = RefreshToken.for_user(self.user1)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
    
    def test_get_chats_empty(self):
        """Testa busca de chats quando não há nenhum."""
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
    
    def test_get_chats_with_data(self):
        """Testa busca de chats com dados."""
        # Criar chats
        chat1 = Chat.objects.create(from_user=self.user1, to_user=self.user2)
        chat2 = Chat.objects.create(from_user=self.user3, to_user=self.user1)
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_create_chat_success(self):
        """Testa criação de chat bem-sucedida."""
        data = {
            'email': self.user2.email
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['email'], self.user2.email)
        
        # Verificar se chat foi criado
        chat = Chat.objects.get(from_user=self.user1, to_user=self.user2)
        self.assertIsNotNone(chat)
    
    def test_create_chat_with_self(self):
        """Testa criação de chat consigo mesmo."""
        data = {
            'email': self.user1.email
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_chat_nonexistent_user(self):
        """Testa criação de chat com usuário inexistente."""
        data = {
            'email': 'nonexistent@example.com'
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_create_chat_already_exists(self):
        """Testa criação de chat que já existe."""
        # Criar chat primeiro
        Chat.objects.create(from_user=self.user1, to_user=self.user2)
        
        data = {
            'email': self.user2.email
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Deve retornar o chat existente
        self.assertIn('id', response.data)
    
    def test_create_chat_reverse_exists(self):
        """Testa criação de chat quando existe o reverso."""
        # Criar chat reverso primeiro (user2 -> user1)
        Chat.objects.create(from_user=self.user2, to_user=self.user1)
        
        data = {
            'email': self.user2.email
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Deve retornar o chat existente
        self.assertIn('id', response.data)
    
    def test_unauthorized_access(self):
        """Testa acesso não autorizado."""
        self.client.credentials()  # Remove autenticação
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ChatDetailViewTest(APITestCase):
    """Testes para a view de detalhes do chat."""
    
    def setUp(self):
        self.client = APIClient()
        
        # Criar usuários
        self.user1 = User.objects.create(
            name='User One',
            email='user1@example.com'
        )
        self.user1.set_password('testpass123')
        self.user1.save()
        
        self.user2 = User.objects.create(
            name='User Two',
            email='user2@example.com'
        )
        
        self.user3 = User.objects.create(
            name='User Three',
            email='user3@example.com'
        )
        
        # Criar chat
        self.chat = Chat.objects.create(from_user=self.user1, to_user=self.user2)
        self.url = reverse('chat-detail', kwargs={'pk': self.chat.id})
        
        # Autenticar user1
        refresh = RefreshToken.for_user(self.user1)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
    
    def test_get_chat_success(self):
        """Testa busca de chat bem-sucedida."""
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.chat.id)
        self.assertEqual(response.data['user']['email'], self.user2.email)
    
    def test_get_chat_not_found(self):
        """Testa busca de chat inexistente."""
        url = reverse('chat-detail', kwargs={'pk': 99999})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_get_chat_unauthorized(self):
        """Testa busca de chat sem permissão."""
        # Criar chat de outros usuários
        other_chat = Chat.objects.create(from_user=self.user2, to_user=self.user3)
        url = reverse('chat-detail', kwargs={'pk': other_chat.id})
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_delete_chat_success(self):
        """Testa deleção de chat bem-sucedida."""
        response = self.client.delete(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar soft delete
        self.chat.refresh_from_db()
        self.assertIsNotNone(self.chat.deleted_at)
    
    def test_delete_chat_unauthorized(self):
        """Testa deleção de chat sem permissão."""
        other_chat = Chat.objects.create(from_user=self.user2, to_user=self.user3)
        url = reverse('chat-detail', kwargs={'pk': other_chat.id})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)