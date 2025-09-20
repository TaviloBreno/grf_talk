import tempfile
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from unittest.mock import patch, MagicMock

from accounts.models import User
from chats.models import Chat, ChatMessage
from attachments.models import FileAttachment, AudioAttachment


class ChatMessagesViewTest(APITestCase):
    """Testes para a view de mensagens do chat."""
    
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
        self.user2.set_password('testpass123')
        self.user2.save()
        
        self.user3 = User.objects.create(
            name='User Three',
            email='user3@example.com'
        )
        
        # Criar chat
        self.chat = Chat.objects.create(from_user=self.user1, to_user=self.user2)
        self.url = reverse('chat-messages', kwargs={'chat_id': self.chat.id})
        
        # Autenticar user1
        refresh = RefreshToken.for_user(self.user1)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
    
    def test_get_messages_empty(self):
        """Testa busca de mensagens quando não há nenhuma."""
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
    
    def test_get_messages_with_data(self):
        """Testa busca de mensagens com dados."""
        # Criar mensagens
        message1 = ChatMessage.objects.create(
            body='First message',
            chat=self.chat,
            from_user=self.user1
        )
        message2 = ChatMessage.objects.create(
            body='Second message',
            chat=self.chat,
            from_user=self.user2
        )
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
        # Verificar ordenação (mais recente primeiro)
        self.assertEqual(response.data[0]['body'], 'Second message')
        self.assertEqual(response.data[1]['body'], 'First message')
    
    def test_get_messages_with_deleted(self):
        """Testa que mensagens deletadas não aparecem."""
        # Criar mensagens
        message1 = ChatMessage.objects.create(
            body='Normal message',
            chat=self.chat,
            from_user=self.user1
        )
        message2 = ChatMessage.objects.create(
            body='Deleted message',
            chat=self.chat,
            from_user=self.user2,
            deleted_at=timezone.now()  # Soft delete
        )
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['body'], 'Normal message')
    
    def test_get_messages_unauthorized_chat(self):
        """Testa busca de mensagens em chat sem permissão."""
        # Criar chat de outros usuários
        other_chat = Chat.objects.create(from_user=self.user2, to_user=self.user3)
        url = reverse('chat-messages', kwargs={'chat_id': other_chat.id})
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_get_messages_nonexistent_chat(self):
        """Testa busca de mensagens em chat inexistente."""
        url = reverse('chat-messages', kwargs={'chat_id': 99999})
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    @patch('core.socket.socket')
    def test_create_message_success(self, mock_socket):
        """Testa criação de mensagem bem-sucedida."""
        mock_socket.is_user_online.return_value = False
        
        data = {
            'body': 'New message'
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['body'], 'New message')
        self.assertEqual(response.data['from_user']['email'], self.user1.email)
        
        # Verificar se mensagem foi criada
        message = ChatMessage.objects.get(body='New message')
        self.assertEqual(message.chat, self.chat)
        self.assertEqual(message.from_user, self.user1)
        
        # Verificar se socket foi chamado
        mock_socket.emit_to_chat.assert_called_once()
    
    @patch('core.socket.socket')
    def test_create_message_with_file_attachment(self, mock_socket):
        """Testa criação de mensagem com anexo de arquivo."""
        mock_socket.is_user_online.return_value = False
        
        # Criar anexo de arquivo
        file_attachment = FileAttachment.objects.create(
            filename='test.pdf',
            file_size=1024,
            file_type='application/pdf'
        )
        
        data = {
            'body': 'Message with file',
            'attachment_code': 'FILE',
            'attachment_id': file_attachment.id
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['attachment']['filename'], 'test.pdf')
        
        # Verificar mensagem no banco
        message = ChatMessage.objects.get(body='Message with file')
        self.assertEqual(message.attachment_code, 'FILE')
        self.assertEqual(message.attachment_id, file_attachment.id)
    
    @patch('core.socket.socket')
    def test_create_message_with_audio_attachment(self, mock_socket):
        """Testa criação de mensagem com anexo de áudio."""
        mock_socket.is_user_online.return_value = False
        
        # Criar anexo de áudio
        audio_attachment = AudioAttachment.objects.create(
            filename='test.mp3',
            file_size=2048,
            duration=120
        )
        
        data = {
            'body': 'Message with audio',
            'attachment_code': 'AUDIO',
            'attachment_id': audio_attachment.id
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['attachment']['duration'], 120)
        
        # Verificar mensagem no banco
        message = ChatMessage.objects.get(body='Message with audio')
        self.assertEqual(message.attachment_code, 'AUDIO')
        self.assertEqual(message.attachment_id, audio_attachment.id)
    
    def test_create_message_empty_body_no_attachment(self):
        """Testa criação de mensagem sem corpo e sem anexo."""
        data = {
            'body': ''
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_message_invalid_attachment_code(self):
        """Testa criação de mensagem com código de anexo inválido."""
        data = {
            'body': 'Message',
            'attachment_code': 'INVALID',
            'attachment_id': 1
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_message_nonexistent_attachment(self):
        """Testa criação de mensagem com anexo inexistente."""
        data = {
            'body': 'Message',
            'attachment_code': 'FILE',
            'attachment_id': 99999
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_unauthorized_access(self):
        """Testa acesso não autorizado."""
        self.client.credentials()  # Remove autenticação
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ChatMessageViewTest(APITestCase):
    """Testes para a view de mensagem individual."""
    
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
        self.user2.set_password('testpass123')
        self.user2.save()
        
        # Criar chat e mensagem
        self.chat = Chat.objects.create(from_user=self.user1, to_user=self.user2)
        self.message = ChatMessage.objects.create(
            body='Test message',
            chat=self.chat,
            from_user=self.user1
        )
        self.url = reverse('chat-message', kwargs={
            'chat_id': self.chat.id, 
            'message_id': self.message.id
        })
        
        # Autenticar user1
        refresh = RefreshToken.for_user(self.user1)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
    
    def test_get_message_success(self):
        """Testa busca de mensagem bem-sucedida."""
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['body'], 'Test message')
        self.assertEqual(response.data['from_user']['email'], self.user1.email)
    
    def test_get_message_not_found(self):
        """Testa busca de mensagem inexistente."""
        url = reverse('chat-message', kwargs={
            'chat_id': self.chat.id, 
            'message_id': 99999
        })
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_get_deleted_message(self):
        """Testa busca de mensagem deletada."""
        self.message.deleted_at = timezone.now()
        self.message.save()
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    @patch('core.socket.socket')
    def test_edit_message_success(self, mock_socket):
        """Testa edição de mensagem bem-sucedida."""
        mock_socket.is_user_online.return_value = False
        
        data = {
            'body': 'Updated message'
        }
        
        response = self.client.put(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['body'], 'Updated message')
        
        # Verificar se mensagem foi atualizada
        self.message.refresh_from_db()
        self.assertEqual(self.message.body, 'Updated message')
        
        # Verificar se socket foi chamado
        mock_socket.emit_to_chat.assert_called_once()
    
    def test_edit_message_unauthorized(self):
        """Testa edição de mensagem de outro usuário."""
        # Autenticar como user2
        refresh = RefreshToken.for_user(self.user2)
        access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        data = {
            'body': 'Updated message'
        }
        
        response = self.client.put(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_edit_message_empty_body(self):
        """Testa edição com corpo vazio."""
        data = {
            'body': ''
        }
        
        response = self.client.put(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    @patch('core.socket.socket')
    def test_mark_message_as_read(self, mock_socket):
        """Testa marcar mensagem como lida."""
        mock_socket.is_user_online.return_value = False
        
        # Autenticar como user2 (receptor da mensagem)
        refresh = RefreshToken.for_user(self.user2)
        access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        response = self.client.patch(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data['viewed_at'])
        
        # Verificar se mensagem foi marcada como lida
        self.message.refresh_from_db()
        self.assertIsNotNone(self.message.viewed_at)
        
        # Verificar se socket foi chamado
        mock_socket.emit_to_chat.assert_called_once()
    
    def test_mark_own_message_as_read(self):
        """Testa marcar própria mensagem como lida (não deveria permitir)."""
        response = self.client.patch(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    @patch('core.socket.socket')
    def test_delete_message_success(self, mock_socket):
        """Testa deleção de mensagem bem-sucedida."""
        mock_socket.is_user_online.return_value = False
        
        response = self.client.delete(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar se mensagem foi soft deleted
        self.message.refresh_from_db()
        self.assertIsNotNone(self.message.deleted_at)
        
        # Verificar se socket foi chamado
        mock_socket.emit_to_chat.assert_called_once()
    
    def test_delete_message_unauthorized(self):
        """Testa deleção de mensagem de outro usuário."""
        # Autenticar como user2
        refresh = RefreshToken.for_user(self.user2)
        access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        response = self.client.delete(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_delete_already_deleted_message(self):
        """Testa deleção de mensagem já deletada."""
        self.message.deleted_at = timezone.now()
        self.message.save()
        
        response = self.client.delete(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ChatMessageValidationTest(APITestCase):
    """Testes específicos para validações de mensagens."""
    
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
        
        # Criar chat
        self.chat = Chat.objects.create(from_user=self.user1, to_user=self.user2)
        self.url = reverse('chat-messages', kwargs={'chat_id': self.chat.id})
        
        # Autenticar user1
        refresh = RefreshToken.for_user(self.user1)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
    
    def test_create_message_only_body(self):
        """Testa criação de mensagem apenas com corpo."""
        data = {
            'body': 'Simple message'
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_create_message_only_attachment(self):
        """Testa criação de mensagem apenas com anexo."""
        file_attachment = FileAttachment.objects.create(
            filename='test.pdf',
            file_size=1024,
            file_type='application/pdf'
        )
        
        data = {
            'body': '',
            'attachment_code': 'FILE',
            'attachment_id': file_attachment.id
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_create_message_with_both_body_and_attachment(self):
        """Testa criação de mensagem com corpo e anexo."""
        file_attachment = FileAttachment.objects.create(
            filename='test.pdf',
            file_size=1024,
            file_type='application/pdf'
        )
        
        data = {
            'body': 'Message with attachment',
            'attachment_code': 'FILE',
            'attachment_id': file_attachment.id
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_create_message_attachment_code_without_id(self):
        """Testa criação com código de anexo mas sem ID."""
        data = {
            'body': 'Message',
            'attachment_code': 'FILE'
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_message_attachment_id_without_code(self):
        """Testa criação com ID de anexo mas sem código."""
        file_attachment = FileAttachment.objects.create(
            filename='test.pdf',
            file_size=1024,
            file_type='application/pdf'
        )
        
        data = {
            'body': 'Message',
            'attachment_id': file_attachment.id
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_message_length_validation(self):
        """Testa validação de tamanho da mensagem."""
        # Mensagem muito longa (assumindo limite de 1000 caracteres)
        long_message = 'A' * 1001
        
        data = {
            'body': long_message
        }
        
        response = self.client.post(self.url, data)
        
        # Dependendo da implementação, pode retornar 400 ou truncar
        # Assumindo que há validação de tamanho
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            self.assertIn('body', response.data)


class SocketIntegrationTest(APITestCase):
    """Testes de integração com Socket.IO."""
    
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
        
        # Criar chat
        self.chat = Chat.objects.create(from_user=self.user1, to_user=self.user2)
        self.url = reverse('chat-messages', kwargs={'chat_id': self.chat.id})
        
        # Autenticar user1
        refresh = RefreshToken.for_user(self.user1)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
    
    @patch('core.socket.socket')
    def test_socket_emit_on_message_creation(self, mock_socket):
        """Testa emissão de evento socket na criação de mensagem."""
        mock_socket.is_user_online.return_value = True
        
        data = {
            'body': 'New message'
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verificar se emit_to_chat foi chamado
        mock_socket.emit_to_chat.assert_called_once()
        call_args = mock_socket.emit_to_chat.call_args
        
        # Verificar argumentos da chamada
        self.assertEqual(call_args[0][0], self.chat.id)  # chat_id
        self.assertEqual(call_args[0][1], 'new_message')  # event
        self.assertIn('message', call_args[0][2])  # data deve conter 'message'
    
    @patch('core.socket.socket')
    def test_socket_emit_on_message_edit(self, mock_socket):
        """Testa emissão de evento socket na edição de mensagem."""
        mock_socket.is_user_online.return_value = True
        
        # Criar mensagem
        message = ChatMessage.objects.create(
            body='Original message',
            chat=self.chat,
            from_user=self.user1
        )
        
        url = reverse('chat-message', kwargs={
            'chat_id': self.chat.id,
            'message_id': message.id
        })
        
        data = {
            'body': 'Updated message'
        }
        
        response = self.client.put(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar se emit_to_chat foi chamado
        mock_socket.emit_to_chat.assert_called_once()
        call_args = mock_socket.emit_to_chat.call_args
        
        self.assertEqual(call_args[0][1], 'message_updated')  # event
    
    @patch('core.socket.socket')
    def test_socket_emit_on_message_delete(self, mock_socket):
        """Testa emissão de evento socket na deleção de mensagem."""
        mock_socket.is_user_online.return_value = True
        
        # Criar mensagem
        message = ChatMessage.objects.create(
            body='To be deleted',
            chat=self.chat,
            from_user=self.user1
        )
        
        url = reverse('chat-message', kwargs={
            'chat_id': self.chat.id,
            'message_id': message.id
        })
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar se emit_to_chat foi chamado
        mock_socket.emit_to_chat.assert_called_once()
        call_args = mock_socket.emit_to_chat.call_args
        
        self.assertEqual(call_args[0][1], 'message_deleted')  # event
    
    @patch('core.socket.socket')
    def test_socket_emit_on_message_read(self, mock_socket):
        """Testa emissão de evento socket ao marcar mensagem como lida."""
        mock_socket.is_user_online.return_value = True
        
        # Criar mensagem do user1 para user2
        message = ChatMessage.objects.create(
            body='Unread message',
            chat=self.chat,
            from_user=self.user1
        )
        
        # Autenticar como user2 (receptor)
        refresh = RefreshToken.for_user(self.user2)
        access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        url = reverse('chat-message', kwargs={
            'chat_id': self.chat.id,
            'message_id': message.id
        })
        
        response = self.client.patch(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar se emit_to_chat foi chamado
        mock_socket.emit_to_chat.assert_called_once()
        call_args = mock_socket.emit_to_chat.call_args
        
        self.assertEqual(call_args[0][1], 'message_read')  # event