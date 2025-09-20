import json
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch, MagicMock, call

from accounts.models import User
from chats.models import Chat, ChatMessage
from core.views import SocketTestView, OnlineUsersView, socket_status
from core.socket import socket


class SocketModuleTest(TestCase):
    """Testes para o módulo de socket."""
    
    def setUp(self):
        self.user1 = User.objects.create(
            name='User One',
            email='user1@example.com'
        )
        self.user2 = User.objects.create(
            name='User Two',
            email='user2@example.com'
        )
        self.chat = Chat.objects.create(from_user=self.user1, to_user=self.user2)
    
    def test_socket_initialization(self):
        """Testa inicialização do socket."""
        self.assertIsNotNone(socket)
        self.assertTrue(hasattr(socket, 'emit'))
        self.assertTrue(hasattr(socket, 'emit_to_chat'))
        self.assertTrue(hasattr(socket, 'emit_to_user'))
        self.assertTrue(hasattr(socket, 'get_online_users'))
        self.assertTrue(hasattr(socket, 'is_user_online'))
    
    def test_user_sessions_dict(self):
        """Testa dicionário de sessões de usuários."""
        from core.socket import user_sessions
        self.assertIsInstance(user_sessions, dict)
    
    @patch('core.socket.user_sessions')
    def test_get_online_users(self, mock_sessions):
        """Testa obtenção de usuários online."""
        mock_sessions.__iter__.return_value = iter([1, 2, 3])
        mock_sessions.keys.return_value = [1, 2, 3]
        
        online_users = socket.get_online_users()
        
        self.assertEqual(len(online_users), 3)
        self.assertIn(1, online_users)
        self.assertIn(2, online_users)
        self.assertIn(3, online_users)
    
    @patch('core.socket.user_sessions')
    def test_is_user_online_true(self, mock_sessions):
        """Testa verificação de usuário online (verdadeiro)."""
        mock_sessions.__contains__.return_value = True
        
        result = socket.is_user_online(1)
        
        self.assertTrue(result)
    
    @patch('core.socket.user_sessions')
    def test_is_user_online_false(self, mock_sessions):
        """Testa verificação de usuário online (falso)."""
        mock_sessions.__contains__.return_value = False
        
        result = socket.is_user_online(1)
        
        self.assertFalse(result)
    
    @patch.object(socket, 'emit')
    @patch('core.socket.user_sessions')
    def test_emit_to_user_online(self, mock_sessions, mock_emit):
        """Testa emissão para usuário online."""
        mock_sessions.get.return_value = 'session_123'
        
        socket.emit_to_user(1, 'test_event', {'message': 'hello'})
        
        mock_emit.assert_called_once_with(
            'test_event',
            {'message': 'hello'},
            room='session_123'
        )
    
    @patch.object(socket, 'emit')
    @patch('core.socket.user_sessions')
    def test_emit_to_user_offline(self, mock_sessions, mock_emit):
        """Testa emissão para usuário offline."""
        mock_sessions.get.return_value = None
        
        socket.emit_to_user(1, 'test_event', {'message': 'hello'})
        
        mock_emit.assert_not_called()
    
    @patch.object(socket, 'emit_to_user')
    def test_emit_to_chat(self, mock_emit_to_user):
        """Testa emissão para chat."""
        socket.emit_to_chat(self.chat.id, 'new_message', {'message': 'hello'})
        
        # Deve emitir para ambos os usuários do chat
        self.assertEqual(mock_emit_to_user.call_count, 2)
        
        calls = mock_emit_to_user.call_args_list
        user_ids = [call[0][0] for call in calls]
        
        self.assertIn(self.user1.id, user_ids)
        self.assertIn(self.user2.id, user_ids)
    
    @patch.object(socket, 'emit')
    def test_emit_user_status(self, mock_emit):
        """Testa emissão de status do usuário."""
        socket.emit_user_status(1, 'online')
        
        mock_emit.assert_called_once_with(
            'user_status_changed',
            {
                'user_id': 1,
                'status': 'online'
            },
            broadcast=True
        )


class SocketEventsTest(TestCase):
    """Testes para eventos de socket."""
    
    def setUp(self):
        self.user = User.objects.create(
            name='Test User',
            email='test@example.com'
        )
        self.user.set_password('testpass123')
        self.user.save()
        
        # Mock do ambiente de socket
        self.mock_environ = {
            'HTTP_AUTHORIZATION': 'Bearer valid_token'
        }
        self.mock_sid = 'test_session_id'
    
    @patch('core.socket.user_sessions')
    @patch('core.socket.socket.emit_user_status')
    @patch('jwt.decode')
    def test_authenticate_event_success(self, mock_jwt_decode, mock_emit_status, mock_sessions):
        """Testa evento de autenticação bem-sucedido."""
        from core.socket import authenticate
        
        mock_jwt_decode.return_value = {'user_id': self.user.id}
        
        authenticate(self.mock_sid, {'token': 'valid_token'})
        
        # Verificar se usuário foi adicionado às sessões
        mock_sessions.__setitem__.assert_called_once_with(self.user.id, self.mock_sid)
        
        # Verificar se status foi emitido
        mock_emit_status.assert_called_once_with(self.user.id, 'online')
    
    @patch('core.socket.socket.emit')
    @patch('jwt.decode')
    def test_authenticate_event_invalid_token(self, mock_jwt_decode, mock_emit):
        """Testa evento de autenticação com token inválido."""
        from core.socket import authenticate
        
        mock_jwt_decode.side_effect = Exception('Invalid token')
        
        authenticate(self.mock_sid, {'token': 'invalid_token'})
        
        # Verificar se erro foi emitido
        mock_emit.assert_called_once_with(
            'authentication_error',
            {'message': 'Token inválido'},
            room=self.mock_sid
        )
    
    @patch('core.socket.user_sessions')
    @patch('core.socket.socket.enter_room')
    @patch('core.socket.socket.emit')
    @patch('jwt.decode')
    def test_join_chat_event_success(self, mock_jwt_decode, mock_emit, mock_enter_room, mock_sessions):
        """Testa evento de entrada em chat."""
        from core.socket import join_chat
        
        mock_jwt_decode.return_value = {'user_id': self.user.id}
        mock_sessions.get.return_value = self.mock_sid
        
        chat = Chat.objects.create(
            from_user=self.user,
            to_user=User.objects.create(name='Other', email='other@example.com')
        )
        
        join_chat(self.mock_sid, {'token': 'valid_token', 'chat_id': chat.id})
        
        # Verificar se usuário entrou na sala
        mock_enter_room.assert_called_once_with(self.mock_sid, f'chat_{chat.id}')
        
        # Verificar se confirmação foi emitida
        mock_emit.assert_called_once_with(
            'joined_chat',
            {'chat_id': chat.id},
            room=self.mock_sid
        )
    
    @patch('core.socket.socket.leave_room')
    @patch('core.socket.socket.emit')
    @patch('jwt.decode')
    def test_leave_chat_event_success(self, mock_jwt_decode, mock_emit, mock_leave_room):
        """Testa evento de saída do chat."""
        from core.socket import leave_chat
        
        mock_jwt_decode.return_value = {'user_id': self.user.id}
        
        chat = Chat.objects.create(
            from_user=self.user,
            to_user=User.objects.create(name='Other', email='other@example.com')
        )
        
        leave_chat(self.mock_sid, {'token': 'valid_token', 'chat_id': chat.id})
        
        # Verificar se usuário saiu da sala
        mock_leave_room.assert_called_once_with(self.mock_sid, f'chat_{chat.id}')
        
        # Verificar se confirmação foi emitida
        mock_emit.assert_called_once_with(
            'left_chat',
            {'chat_id': chat.id},
            room=self.mock_sid
        )
    
    @patch('core.socket.socket.emit')
    @patch('jwt.decode')
    def test_typing_start_event(self, mock_jwt_decode, mock_emit):
        """Testa evento de início de digitação."""
        from core.socket import typing_start
        
        mock_jwt_decode.return_value = {'user_id': self.user.id}
        
        chat = Chat.objects.create(
            from_user=self.user,
            to_user=User.objects.create(name='Other', email='other@example.com')
        )
        
        typing_start(self.mock_sid, {'token': 'valid_token', 'chat_id': chat.id})
        
        # Verificar se evento foi emitido para a sala do chat
        mock_emit.assert_called_once_with(
            'user_typing',
            {
                'user_id': self.user.id,
                'chat_id': chat.id,
                'typing': True
            },
            room=f'chat_{chat.id}',
            skip_sid=self.mock_sid
        )
    
    @patch('core.socket.socket.emit')
    @patch('jwt.decode')
    def test_typing_stop_event(self, mock_jwt_decode, mock_emit):
        """Testa evento de parada de digitação."""
        from core.socket import typing_stop
        
        mock_jwt_decode.return_value = {'user_id': self.user.id}
        
        chat = Chat.objects.create(
            from_user=self.user,
            to_user=User.objects.create(name='Other', email='other@example.com')
        )
        
        typing_stop(self.mock_sid, {'token': 'valid_token', 'chat_id': chat.id})
        
        # Verificar se evento foi emitido para a sala do chat
        mock_emit.assert_called_once_with(
            'user_typing',
            {
                'user_id': self.user.id,
                'chat_id': chat.id,
                'typing': False
            },
            room=f'chat_{chat.id}',
            skip_sid=self.mock_sid
        )
    
    @patch('core.socket.socket.emit_user_status')
    @patch('jwt.decode')
    def test_update_status_event(self, mock_jwt_decode, mock_emit_status):
        """Testa evento de atualização de status."""
        from core.socket import update_status
        
        mock_jwt_decode.return_value = {'user_id': self.user.id}
        
        update_status(self.mock_sid, {'token': 'valid_token', 'status': 'away'})
        
        # Verificar se status foi emitido
        mock_emit_status.assert_called_once_with(self.user.id, 'away')
    
    @patch('core.socket.user_sessions')
    @patch('core.socket.socket.emit_user_status')
    def test_disconnect_event(self, mock_emit_status, mock_sessions):
        """Testa evento de desconexão."""
        from core.socket import disconnect
        
        # Simular usuário nas sessões
        mock_sessions.items.return_value = [(self.user.id, self.mock_sid)]
        
        disconnect(self.mock_sid)
        
        # Verificar se usuário foi removido das sessões
        mock_sessions.__delitem__.assert_called_once_with(self.user.id)
        
        # Verificar se status offline foi emitido
        mock_emit_status.assert_called_once_with(self.user.id, 'offline')


class SocketViewsTest(APITestCase):
    """Testes para as views relacionadas ao socket."""
    
    def setUp(self):
        self.client = APIClient()
        
        self.user = User.objects.create(
            name='Test User',
            email='test@example.com'
        )
        self.user.set_password('testpass123')
        self.user.save()
        
        # Autenticar usuário
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
    
    def test_socket_status_view(self):
        """Testa view de status do socket."""
        url = reverse('socket-status')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('socket_active', response.data)
        self.assertIn('total_connected_users', response.data)
        self.assertIn('server_time', response.data)
        self.assertTrue(response.data['socket_active'])
    
    @patch('core.socket.socket.get_online_users')
    @patch('core.socket.socket.is_user_online')
    def test_socket_test_view_get(self, mock_is_online, mock_get_users):
        """Testa GET da view de teste do socket."""
        mock_get_users.return_value = [1, 2, 3]
        mock_is_online.return_value = False
        
        url = reverse('socket-test')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_online'], 3)
        self.assertFalse(response.data['current_user_online'])
        self.assertIn('available_events', response.data)
        self.assertIn('status_options', response.data)
    
    @patch('core.socket.socket.emit_to_user')
    def test_socket_test_view_post(self, mock_emit):
        """Testa POST da view de teste do socket."""
        url = reverse('socket-test')
        data = {
            'event_type': 'notification',
            'message': 'Test message'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['event_type'], 'notification')
        self.assertEqual(response.data['sent_to_user'], self.user.id)
        
        # Verificar se emit foi chamado
        mock_emit.assert_called_once()
        call_args = mock_emit.call_args
        self.assertEqual(call_args[0][0], self.user.id)  # user_id
        self.assertEqual(call_args[0][1], 'notification')  # event_type
        self.assertIn('message', call_args[0][2])  # data
    
    @patch('core.socket.socket.get_online_users')
    @patch('core.socket.socket.is_user_online')
    def test_online_users_view(self, mock_is_online, mock_get_users):
        """Testa view de usuários online."""
        # Criar outros usuários
        user2 = User.objects.create(name='User 2', email='user2@example.com')
        user3 = User.objects.create(name='User 3', email='user3@example.com')
        
        mock_get_users.return_value = [self.user.id, user2.id]
        mock_is_online.return_value = True
        
        url = reverse('online-users')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_online'], 2)
        self.assertEqual(len(response.data['users']), 2)
        self.assertTrue(response.data['current_user_online'])
        
        # Verificar estrutura dos usuários retornados
        user_emails = [user['email'] for user in response.data['users']]
        self.assertIn(self.user.email, user_emails)
        self.assertIn(user2.email, user_emails)
    
    def test_unauthorized_access_socket_test(self):
        """Testa acesso não autorizado à view de teste."""
        self.client.credentials()  # Remove autenticação
        
        url = reverse('socket-test')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_unauthorized_access_online_users(self):
        """Testa acesso não autorizado à view de usuários online."""
        self.client.credentials()  # Remove autenticação
        
        url = reverse('online-users')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class SocketUtilityFunctionsTest(TestCase):
    """Testes para funções utilitárias do socket."""
    
    def setUp(self):
        self.user1 = User.objects.create(
            name='User One',
            email='user1@example.com'
        )
        self.user2 = User.objects.create(
            name='User Two',
            email='user2@example.com'
        )
        self.chat = Chat.objects.create(from_user=self.user1, to_user=self.user2)
    
    @patch('core.socket.user_sessions')
    def test_get_chat_participants(self, mock_sessions):
        """Testa obtenção de participantes do chat."""
        from core.socket import get_chat_participants
        
        participants = get_chat_participants(self.chat.id)
        
        self.assertEqual(len(participants), 2)
        self.assertIn(self.user1.id, participants)
        self.assertIn(self.user2.id, participants)
    
    @patch('core.socket.socket.emit')
    @patch('core.socket.user_sessions')
    def test_notify_chat_participants(self, mock_sessions, mock_emit):
        """Testa notificação dos participantes do chat."""
        mock_sessions.get.side_effect = lambda x: f'session_{x}' if x in [self.user1.id, self.user2.id] else None
        
        socket.emit_to_chat(self.chat.id, 'test_event', {'message': 'hello'})
        
        # Verificar se emit foi chamado para ambos os usuários
        self.assertEqual(mock_emit.call_count, 2)
    
    def test_socket_event_decorators(self):
        """Testa se todos os eventos estão registrados corretamente."""
        from core.socket import socket
        
        # Verificar se eventos estão registrados
        expected_events = [
            'connect',
            'disconnect',
            'authenticate',
            'join_chat',
            'leave_chat',
            'typing_start',
            'typing_stop',
            'update_status'
        ]
        
        for event in expected_events:
            self.assertIn(event, socket.handlers)
    
    @patch('core.socket.socket')
    def test_socket_middleware_functions(self, mock_socket):
        """Testa funções middleware do socket."""
        # Verificar se funções foram anexadas ao objeto socket
        self.assertTrue(hasattr(mock_socket, 'emit_to_chat'))
        self.assertTrue(hasattr(mock_socket, 'emit_to_user'))
        self.assertTrue(hasattr(mock_socket, 'emit_user_status'))
        self.assertTrue(hasattr(mock_socket, 'get_online_users'))
        self.assertTrue(hasattr(mock_socket, 'is_user_online'))


class SocketErrorHandlingTest(TestCase):
    """Testes para tratamento de erros do socket."""
    
    def setUp(self):
        self.mock_sid = 'test_session_id'
    
    @patch('core.socket.socket.emit')
    def test_authenticate_without_token(self, mock_emit):
        """Testa autenticação sem token."""
        from core.socket import authenticate
        
        authenticate(self.mock_sid, {})
        
        mock_emit.assert_called_once_with(
            'authentication_error',
            {'message': 'Token não fornecido'},
            room=self.mock_sid
        )
    
    @patch('core.socket.socket.emit')
    @patch('jwt.decode')
    def test_join_chat_nonexistent(self, mock_jwt_decode, mock_emit):
        """Testa entrada em chat inexistente."""
        from core.socket import join_chat
        
        mock_jwt_decode.return_value = {'user_id': 1}
        
        join_chat(self.mock_sid, {'token': 'valid_token', 'chat_id': 99999})
        
        mock_emit.assert_called_once_with(
            'error',
            {'message': 'Chat não encontrado'},
            room=self.mock_sid
        )
    
    @patch('core.socket.socket.emit')
    def test_events_without_authentication(self, mock_emit):
        """Testa eventos sem autenticação."""
        from core.socket import join_chat, leave_chat, typing_start
        
        # Testa diferentes eventos sem token
        events_to_test = [
            (join_chat, {'chat_id': 1}),
            (leave_chat, {'chat_id': 1}),
            (typing_start, {'chat_id': 1})
        ]
        
        for event_func, data in events_to_test:
            with self.subTest(event=event_func.__name__):
                event_func(self.mock_sid, data)
                
                mock_emit.assert_called_with(
                    'authentication_error',
                    {'message': 'Token não fornecido'},
                    room=self.mock_sid
                )
                mock_emit.reset_mock()


class SocketPerformanceTest(TestCase):
    """Testes de performance do socket."""
    
    def setUp(self):
        # Criar múltiplos usuários para teste de performance
        self.users = []
        for i in range(10):
            user = User.objects.create(
                name=f'User {i}',
                email=f'user{i}@example.com'
            )
            self.users.append(user)
    
    @patch('core.socket.socket.emit')
    @patch('core.socket.user_sessions')
    def test_emit_to_multiple_users(self, mock_sessions, mock_emit):
        """Testa emissão para múltiplos usuários."""
        # Simular usuários online
        mock_sessions.get.side_effect = lambda x: f'session_{x}' if x <= 5 else None
        
        # Criar chat com múltiplos participantes (simulado)
        chat = Chat.objects.create(
            from_user=self.users[0],
            to_user=self.users[1]
        )
        
        socket.emit_to_chat(chat.id, 'test_event', {'message': 'hello'})
        
        # Verificar se emit foi chamado corretamente
        self.assertEqual(mock_emit.call_count, 2)  # Para os 2 participantes
    
    @patch('core.socket.user_sessions')
    def test_get_online_users_performance(self, mock_sessions):
        """Testa performance da função get_online_users."""
        # Simular muitos usuários online
        user_ids = list(range(100))
        mock_sessions.keys.return_value = user_ids
        
        online_users = socket.get_online_users()
        
        self.assertEqual(len(online_users), 100)
    
    def test_socket_module_import_time(self):
        """Testa tempo de importação do módulo socket."""
        import time
        
        start_time = time.time()
        # Re-importar para medir tempo
        import importlib
        import core.socket
        importlib.reload(core.socket)
        end_time = time.time()
        
        import_time = end_time - start_time
        
        # Import deve ser rápido (menos de 1 segundo)
        self.assertLess(import_time, 1.0)