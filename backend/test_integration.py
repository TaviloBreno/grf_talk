import tempfile
import json
from django.test import TestCase, override_settings
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch, MagicMock
from PIL import Image
import io

from accounts.models import User
from chats.models import Chat, ChatMessage
from attachments.models import FileAttachment, AudioAttachment


class UserAuthenticationFlowTest(APITestCase):
    """Testes de fluxo completo de autenticação."""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_complete_user_registration_and_login_flow(self):
        """Testa fluxo completo: registro → login → obter perfil."""
        # 1. Registro
        signup_url = reverse('signup')
        signup_data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        signup_response = self.client.post(signup_url, signup_data)
        self.assertEqual(signup_response.status_code, status.HTTP_200_OK)
        self.assertIn('user', signup_response.data)
        self.assertIn('token', signup_response.data)
        
        # 2. Login
        signin_url = reverse('signin')
        signin_data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        signin_response = self.client.post(signin_url, signin_data)
        self.assertEqual(signin_response.status_code, status.HTTP_200_OK)
        self.assertIn('token', signin_response.data)
        
        # 3. Usar token para acessar perfil
        token = signin_response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        profile_url = reverse('user')
        profile_response = self.client.get(profile_url)
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data['email'], 'test@example.com')
        self.assertEqual(profile_response.data['name'], 'Test User')
    
    @override_settings(MEDIA_ROOT=tempfile.mkdtemp())
    def test_complete_avatar_management_flow(self):
        """Testa fluxo completo de gerenciamento de avatar."""
        # 1. Criar e autenticar usuário
        user = User.objects.create(
            name='Test User',
            email='test@example.com'
        )
        user.set_password('testpass123')
        user.save()
        
        refresh = RefreshToken.for_user(user)
        token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        avatar_url = reverse('avatar')
        
        # 2. Verificar avatar padrão
        get_response = self.client.get(avatar_url)
        self.assertEqual(get_response.status_code, status.HTTP_200_OK)
        self.assertFalse(get_response.data['has_custom_avatar'])
        self.assertIn('ui-avatars.com', get_response.data['avatar_url'])
        
        # 3. Upload de avatar customizado
        image = Image.new('RGB', (100, 100), color='red')
        file = io.BytesIO()
        image.save(file, 'JPEG')
        file.seek(0)
        avatar_file = SimpleUploadedFile(
            "test.jpg",
            file.getvalue(),
            content_type="image/jpeg"
        )
        
        upload_response = self.client.post(avatar_url, {'avatar': avatar_file})
        self.assertEqual(upload_response.status_code, status.HTTP_200_OK)
        self.assertTrue(upload_response.data['has_custom_avatar'])
        
        # 4. Verificar avatar customizado
        get_response = self.client.get(avatar_url)
        self.assertTrue(get_response.data['has_custom_avatar'])
        
        # 5. Deletar avatar (voltar ao padrão)
        delete_response = self.client.delete(avatar_url)
        self.assertEqual(delete_response.status_code, status.HTTP_200_OK)
        self.assertFalse(delete_response.data['has_custom_avatar'])


class ChatCreationAndMessagingFlowTest(APITestCase):
    """Testes de fluxo completo de chat e mensagens."""
    
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
        
        # Autenticar user1
        refresh = RefreshToken.for_user(self.user1)
        self.token1 = str(refresh.access_token)
        
        # Autenticar user2
        refresh = RefreshToken.for_user(self.user2)
        self.token2 = str(refresh.access_token)
    
    @patch('core.socket.socket')
    def test_complete_chat_creation_and_messaging_flow(self, mock_socket):
        """Testa fluxo completo: criar chat → enviar mensagens → ler mensagens."""
        mock_socket.is_user_online.return_value = False
        
        # 1. User1 cria chat com User2
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        
        chats_url = reverse('chats')
        chat_data = {'email': self.user2.email}
        
        chat_response = self.client.post(chats_url, chat_data)
        self.assertEqual(chat_response.status_code, status.HTTP_201_CREATED)
        
        chat_id = chat_response.data['id']
        
        # 2. User1 envia primeira mensagem
        messages_url = reverse('chat-messages', kwargs={'chat_id': chat_id})
        message_data = {'body': 'Hello from User1!'}
        
        message_response = self.client.post(messages_url, message_data)
        self.assertEqual(message_response.status_code, status.HTTP_201_CREATED)
        message1_id = message_response.data['id']
        
        # 3. User2 vê o chat
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token2}')
        
        chats_response = self.client.get(chats_url)
        self.assertEqual(chats_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(chats_response.data), 1)
        self.assertEqual(chats_response.data[0]['unseen_count'], 1)
        
        # 4. User2 lê as mensagens
        messages_response = self.client.get(messages_url)
        self.assertEqual(messages_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(messages_response.data), 1)
        self.assertEqual(messages_response.data[0]['body'], 'Hello from User1!')
        
        # 5. User2 marca mensagem como lida
        message_url = reverse('chat-message', kwargs={
            'chat_id': chat_id,
            'message_id': message1_id
        })
        
        read_response = self.client.patch(message_url)
        self.assertEqual(read_response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(read_response.data['viewed_at'])
        
        # 6. User2 responde
        reply_data = {'body': 'Hello back from User2!'}
        reply_response = self.client.post(messages_url, reply_data)
        self.assertEqual(reply_response.status_code, status.HTTP_201_CREATED)
        
        # 7. User1 vê a resposta
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        
        final_messages = self.client.get(messages_url)
        self.assertEqual(len(final_messages.data), 2)
        
        # Verificar ordem das mensagens (mais recente primeiro)
        self.assertEqual(final_messages.data[0]['body'], 'Hello back from User2!')
        self.assertEqual(final_messages.data[1]['body'], 'Hello from User1!')
        
        # Verificar se socket foi chamado
        self.assertTrue(mock_socket.emit_to_chat.called)
    
    @patch('core.socket.socket')
    def test_message_editing_and_deletion_flow(self, mock_socket):
        """Testa fluxo de edição e deleção de mensagens."""
        mock_socket.is_user_online.return_value = False
        
        # 1. Criar chat
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        
        chat = Chat.objects.create(from_user=self.user1, to_user=self.user2)
        messages_url = reverse('chat-messages', kwargs={'chat_id': chat.id})
        
        # 2. Enviar mensagem
        message_data = {'body': 'Original message'}
        message_response = self.client.post(messages_url, message_data)
        message_id = message_response.data['id']
        
        message_url = reverse('chat-message', kwargs={
            'chat_id': chat.id,
            'message_id': message_id
        })
        
        # 3. Editar mensagem
        edit_data = {'body': 'Edited message'}
        edit_response = self.client.put(message_url, edit_data)
        self.assertEqual(edit_response.status_code, status.HTTP_200_OK)
        self.assertEqual(edit_response.data['body'], 'Edited message')
        
        # 4. Verificar edição
        get_response = self.client.get(message_url)
        self.assertEqual(get_response.data['body'], 'Edited message')
        
        # 5. Deletar mensagem
        delete_response = self.client.delete(message_url)
        self.assertEqual(delete_response.status_code, status.HTTP_200_OK)
        
        # 6. Verificar que mensagem não aparece mais
        messages_response = self.client.get(messages_url)
        self.assertEqual(len(messages_response.data), 0)
        
        # 7. Tentar acessar mensagem deletada
        get_deleted_response = self.client.get(message_url)
        self.assertEqual(get_deleted_response.status_code, status.HTTP_404_NOT_FOUND)


class AttachmentFlowTest(APITestCase):
    """Testes de fluxo completo com anexos."""
    
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
        
        # Autenticar user1
        refresh = RefreshToken.for_user(self.user1)
        self.token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
    
    @patch('core.socket.socket')
    def test_file_attachment_flow(self, mock_socket):
        """Testa fluxo completo com anexo de arquivo."""
        mock_socket.is_user_online.return_value = False
        
        # 1. Criar anexo de arquivo
        file_attachment = FileAttachment.objects.create(
            name='document',
            extension='pdf',
            size=2048,
            src='/media/uploads/document.pdf',
            content_type='application/pdf'
        )
        
        # 2. Enviar mensagem com anexo
        messages_url = reverse('chat-messages', kwargs={'chat_id': self.chat.id})
        message_data = {
            'body': 'Here is the document',
            'attachment_code': 'FILE',
            'attachment_id': file_attachment.id
        }
        
        response = self.client.post(messages_url, message_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 3. Verificar anexo na resposta
        self.assertIsNotNone(response.data['attachment'])
        self.assertEqual(response.data['attachment']['name'], 'document')
        self.assertEqual(response.data['attachment']['extension'], 'pdf')
        
        # 4. Buscar mensagem e verificar anexo
        messages_response = self.client.get(messages_url)
        message_with_attachment = messages_response.data[0]
        
        self.assertEqual(message_with_attachment['body'], 'Here is the document')
        self.assertIsNotNone(message_with_attachment['attachment'])
        self.assertEqual(message_with_attachment['attachment']['name'], 'document')
    
    @patch('core.socket.socket')
    def test_audio_attachment_flow(self, mock_socket):
        """Testa fluxo completo com anexo de áudio."""
        mock_socket.is_user_online.return_value = False
        
        # 1. Criar anexo de áudio
        audio_attachment = AudioAttachment.objects.create(
            src='/media/uploads/voice_message.mp3'
        )
        
        # 2. Enviar mensagem com anexo de áudio
        messages_url = reverse('chat-messages', kwargs={'chat_id': self.chat.id})
        message_data = {
            'body': '',  # Mensagem apenas com áudio
            'attachment_code': 'AUDIO',
            'attachment_id': audio_attachment.id
        }
        
        response = self.client.post(messages_url, message_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 3. Verificar anexo de áudio na resposta
        self.assertIsNotNone(response.data['attachment'])
        self.assertEqual(response.data['attachment']['src'], '/media/uploads/voice_message.mp3')
        
        # 4. Buscar mensagem e verificar anexo
        messages_response = self.client.get(messages_url)
        message_with_audio = messages_response.data[0]
        
        self.assertEqual(message_with_audio['body'], '')
        self.assertIsNotNone(message_with_audio['attachment'])
        self.assertEqual(message_with_audio['attachment']['src'], '/media/uploads/voice_message.mp3')
    
    def test_invalid_attachment_flow(self):
        """Testa fluxo com anexo inválido."""
        # 1. Tentar enviar mensagem com anexo inexistente
        messages_url = reverse('chat-messages', kwargs={'chat_id': self.chat.id})
        message_data = {
            'body': 'Message with invalid attachment',
            'attachment_code': 'FILE',
            'attachment_id': 99999  # ID inexistente
        }
        
        response = self.client.post(messages_url, message_data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # 2. Tentar enviar com código inválido
        file_attachment = FileAttachment.objects.create(
            name='test',
            extension='pdf',
            size=1024,
            src='/media/uploads/test.pdf',
            content_type='application/pdf'
        )
        
        invalid_data = {
            'body': 'Message with invalid code',
            'attachment_code': 'INVALID',
            'attachment_id': file_attachment.id
        }
        
        response = self.client.post(messages_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@patch('core.socket.socket')
class SocketIntegrationFlowTest(APITestCase):
    """Testes de integração completa com Socket.IO."""
    
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
        
        # Autenticar user1
        refresh = RefreshToken.for_user(self.user1)
        self.token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
    
    def test_complete_socket_messaging_flow(self, mock_socket):
        """Testa fluxo completo de mensagens com socket."""
        mock_socket.is_user_online.return_value = True
        
        # 1. Testar status do socket
        status_url = reverse('socket-status')
        status_response = self.client.get(status_url)
        self.assertEqual(status_response.status_code, status.HTTP_200_OK)
        
        # 2. Testar informações do socket
        test_url = reverse('socket-test')
        test_response = self.client.get(test_url)
        self.assertEqual(test_response.status_code, status.HTTP_200_OK)
        self.assertIn('available_events', test_response.data)
        
        # 3. Enviar mensagem e verificar eventos socket
        messages_url = reverse('chat-messages', kwargs={'chat_id': self.chat.id})
        message_data = {'body': 'Real-time message'}
        
        message_response = self.client.post(messages_url, message_data)
        self.assertEqual(message_response.status_code, status.HTTP_201_CREATED)
        
        # Verificar se evento socket foi emitido
        mock_socket.emit_to_chat.assert_called()
        call_args = mock_socket.emit_to_chat.call_args
        self.assertEqual(call_args[0][0], self.chat.id)  # chat_id
        self.assertEqual(call_args[0][1], 'new_message')  # event
        
        # 4. Testar usuários online
        online_url = reverse('online-users')
        online_response = self.client.get(online_url)
        self.assertEqual(online_response.status_code, status.HTTP_200_OK)
        
        # 5. Testar envio de evento customizado
        event_data = {
            'event_type': 'custom_notification',
            'message': 'Custom event test'
        }
        
        event_response = self.client.post(test_url, event_data)
        self.assertEqual(event_response.status_code, status.HTTP_200_OK)
        
        # Verificar se evento foi enviado para o usuário
        mock_socket.emit_to_user.assert_called()
    
    def test_socket_events_sequence(self, mock_socket):
        """Testa sequência de eventos socket."""
        mock_socket.is_user_online.return_value = True
        
        messages_url = reverse('chat-messages', kwargs={'chat_id': self.chat.id})
        
        # 1. Criar mensagem
        message_response = self.client.post(messages_url, {'body': 'Test message'})
        message_id = message_response.data['id']
        
        # 2. Editar mensagem
        message_url = reverse('chat-message', kwargs={
            'chat_id': self.chat.id,
            'message_id': message_id
        })
        
        self.client.put(message_url, {'body': 'Edited message'})
        
        # 3. Marcar como lida (user2)
        refresh = RefreshToken.for_user(self.user2)
        token2 = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token2}')
        
        self.client.patch(message_url)
        
        # 4. Deletar mensagem (user1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.client.delete(message_url)
        
        # Verificar sequência de eventos socket
        expected_events = ['new_message', 'message_updated', 'message_read', 'message_deleted']
        
        call_args_list = mock_socket.emit_to_chat.call_args_list
        actual_events = [call[0][1] for call in call_args_list]
        
        self.assertEqual(actual_events, expected_events)


class PermissionAndAuthorizationFlowTest(APITestCase):
    """Testes de fluxo completo de permissões e autorização."""
    
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
        
        # Criar chats
        self.chat12 = Chat.objects.create(from_user=self.user1, to_user=self.user2)
        self.chat23 = Chat.objects.create(from_user=self.user2, to_user=self.user3)
        
        # Tokens
        refresh1 = RefreshToken.for_user(self.user1)
        self.token1 = str(refresh1.access_token)
        
        refresh2 = RefreshToken.for_user(self.user2)
        self.token2 = str(refresh2.access_token)
    
    def test_chat_access_permissions(self):
        """Testa permissões de acesso aos chats."""
        # 1. User1 pode acessar chat12
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        
        chat_url = reverse('chat-detail', kwargs={'pk': self.chat12.id})
        response = self.client.get(chat_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 2. User1 NÃO pode acessar chat23
        chat23_url = reverse('chat-detail', kwargs={'pk': self.chat23.id})
        response = self.client.get(chat23_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # 3. User2 pode acessar ambos os chats
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token2}')
        
        response = self.client.get(chat_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        response = self.client.get(chat23_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_message_editing_permissions(self):
        """Testa permissões de edição de mensagens."""
        # 1. User1 cria mensagem
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        
        message = ChatMessage.objects.create(
            body='User1 message',
            chat=self.chat12,
            from_user=self.user1
        )
        
        message_url = reverse('chat-message', kwargs={
            'chat_id': self.chat12.id,
            'message_id': message.id
        })
        
        # 2. User1 pode editar sua própria mensagem
        edit_response = self.client.put(message_url, {'body': 'Edited by User1'})
        self.assertEqual(edit_response.status_code, status.HTTP_200_OK)
        
        # 3. User2 NÃO pode editar mensagem do User1
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token2}')
        
        edit_response = self.client.put(message_url, {'body': 'Edited by User2'})
        self.assertEqual(edit_response.status_code, status.HTTP_403_FORBIDDEN)
        
        # 4. User2 pode marcar mensagem como lida
        read_response = self.client.patch(message_url)
        self.assertEqual(read_response.status_code, status.HTTP_200_OK)
        
        # 5. User1 NÃO pode marcar própria mensagem como lida
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')
        
        read_response = self.client.patch(message_url)
        self.assertEqual(read_response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_unauthorized_access_flow(self):
        """Testa fluxo de acesso não autorizado."""
        # 1. Tentar acessar endpoints sem token
        endpoints = [
            reverse('chats'),
            reverse('user'),
            reverse('avatar'),
            reverse('socket-test'),
            reverse('online-users')
        ]
        
        for endpoint in endpoints:
            with self.subTest(endpoint=endpoint):
                response = self.client.get(endpoint)
                self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # 2. Tentar usar token inválido
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token')
        
        for endpoint in endpoints:
            with self.subTest(endpoint=endpoint):
                response = self.client.get(endpoint)
                self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ErrorHandlingFlowTest(APITestCase):
    """Testes de fluxo completo para tratamento de erros."""
    
    def setUp(self):
        self.client = APIClient()
        
        self.user = User.objects.create(
            name='Test User',
            email='test@example.com'
        )
        self.user.set_password('testpass123')
        self.user.save()
        
        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
    
    def test_not_found_errors_flow(self):
        """Testa fluxo de erros 404."""
        # 1. Chat inexistente
        response = self.client.get(reverse('chat-detail', kwargs={'pk': 99999}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # 2. Mensagem inexistente
        chat = Chat.objects.create(
            from_user=self.user,
            to_user=User.objects.create(name='Other', email='other@example.com')
        )
        
        response = self.client.get(reverse('chat-message', kwargs={
            'chat_id': chat.id,
            'message_id': 99999
        }))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # 3. Criar chat com usuário inexistente
        response = self.client.post(reverse('chats'), {'email': 'nonexistent@example.com'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_validation_errors_flow(self):
        """Testa fluxo de erros de validação."""
        # 1. Registro com dados inválidos
        signup_url = reverse('signup')
        
        # Sem nome
        response = self.client.post(signup_url, {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Email inválido
        response = self.client.post(signup_url, {
            'name': 'Test',
            'email': 'invalid_email',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # 2. Mensagem vazia sem anexo
        chat = Chat.objects.create(
            from_user=self.user,
            to_user=User.objects.create(name='Other', email='other@example.com')
        )
        
        response = self.client.post(
            reverse('chat-messages', kwargs={'chat_id': chat.id}),
            {'body': ''}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_rate_limiting_simulation(self):
        """Simula teste de rate limiting."""
        # Este teste simularia rate limiting, mas como não está implementado,
        # apenas verifica que múltiplas requisições são processadas
        
        chat = Chat.objects.create(
            from_user=self.user,
            to_user=User.objects.create(name='Other', email='other@example.com')
        )
        
        messages_url = reverse('chat-messages', kwargs={'chat_id': chat.id})
        
        # Enviar múltiplas mensagens rapidamente
        for i in range(10):
            response = self.client.post(messages_url, {'body': f'Message {i}'})
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verificar se todas foram criadas
        messages_response = self.client.get(messages_url)
        self.assertEqual(len(messages_response.data), 10)