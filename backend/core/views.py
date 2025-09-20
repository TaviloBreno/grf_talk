from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from core.socket import socket


class SocketTestView(APIView):
    """View para testar funcionalidades do socket."""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Retorna informações sobre o sistema de socket.
        """
        return Response({
            'online_users': socket.get_online_users(),
            'total_online': len(socket.get_online_users()),
            'current_user_online': socket.is_user_online(request.user.id),
            'available_events': [
                'authenticate',
                'join_chat',
                'leave_chat', 
                'typing_start',
                'typing_stop',
                'update_status'
            ],
            'status_options': ['online', 'away', 'busy', 'offline']
        })
    
    def post(self, request):
        """
        Envia evento de teste para o usuário logado.
        """
        event_type = request.data.get('event_type', 'test_message')
        message = request.data.get('message', 'Mensagem de teste do socket!')
        
        # Enviar evento para o usuário atual
        socket.emit_to_user(request.user.id, event_type, {
            'message': message,
            'timestamp': str(__import__('datetime').datetime.now()),
            'from': 'server'
        })
        
        return Response({
            'message': 'Evento enviado com sucesso',
            'event_type': event_type,
            'sent_to_user': request.user.id,
            'user_online': socket.is_user_online(request.user.id)
        })


class OnlineUsersView(APIView):
    """View para obter lista de usuários online."""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Retorna lista de usuários atualmente online."""
        from accounts.models import User
        
        online_user_ids = socket.get_online_users()
        
        # Buscar informações dos usuários online
        online_users = []
        for user_id in online_user_ids:
            try:
                user = User.objects.get(id=user_id)
                online_users.append({
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'avatar': request.build_absolute_uri(user.avatar.url) if user.avatar else None
                })
            except User.DoesNotExist:
                continue
        
        return Response({
            'total_online': len(online_users),
            'users': online_users,
            'current_user_online': socket.is_user_online(request.user.id)
        })


def socket_status(request):
    """
    Endpoint simples para verificar status do socket (sem autenticação).
    """
    return JsonResponse({
        'socket_active': True,
        'total_connected_users': len(socket.get_online_users()),
        'server_time': str(__import__('datetime').datetime.now())
    })