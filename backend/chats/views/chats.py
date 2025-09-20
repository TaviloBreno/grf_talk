from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from core.socket import socket
from .base import BaseView
from ..models import Chat
from ..serializers import ChatSerializer


class ChatsView(BaseView):
    """View para listar e criar chats."""
    
    def get(self, request):
        """
        Retorna lista de chats do usuário logado.
        
        Returns:
            Response: Lista de chats serializados
        """
        user = request.user
        
        # Busca chats onde o usuário é participante (from_user ou to_user)
        chats = Chat.objects.filter(
            Q(from_user=user) | Q(to_user=user),
            deleted_at__isnull=True
        ).order_by('-viewed_at', '-created_at')
        
        # Serializa chats com contexto do usuário logado
        serializer = ChatSerializer(chats, many=True, context={'request': request})
        
        return Response(serializer.data)
    
    def post(self, request):
        """
        Cria novo chat entre usuários.
        
        Returns:
            Response: Chat criado serializado ou chat existente
        """
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'error': 'Email é obrigatório'}, 
                status=400
            )
        
        # Validar usuário destinatário
        to_user = self.get_user(email=email)
        
        # Verificar se usuário não está tentando criar chat consigo mesmo
        if to_user.id == request.user.id:
            return Response(
                {'error': 'Não é possível criar chat consigo mesmo'}, 
                status=400
            )
        
        # Verificar se chat já existe
        existing_chat = self.check_if_chat_exists_for_user(
            request.user.id, 
            to_user
        )
        
        if existing_chat:
            return Response(existing_chat)
        
        # Criar novo chat
        chat = Chat.objects.create(
            from_user=request.user,
            to_user=to_user,
            viewed_at=timezone.now()
        )
        
        # Serializar chat criado
        serializer = ChatSerializer(chat, context={'request': request})
        
        # Emitir evento socket para ambos os usuários
        socket.emit_to_user(request.user.id, 'update_chat', {
            'type': 'create',
            'chat': serializer.data
        })
        
        socket.emit_to_user(to_user.id, 'update_chat', {
            'type': 'create',
            'chat': serializer.data
        })
        
        return Response(serializer.data, status=201)


class ChatView(BaseView):
    """View para operações em chat específico."""
    
    def get(self, request, pk):
        """
        Busca um chat específico.
        
        Args:
            pk: ID do chat
            
        Returns:
            Response: Chat serializado
        """
        # Garantir que o chat pertence ao usuário
        chat = self.chat_belongs_to_user(pk, request.user.id)
        
        # Serializar chat
        serializer = ChatSerializer(chat, context={'request': request})
        
        return Response(serializer.data)
    
    def delete(self, request, pk):
        """
        Soft delete de um chat.
        
        Args:
            pk: ID do chat a ser deletado
            
        Returns:
            Response: Confirmação de sucesso
        """
        # Garantir que o chat pertence ao usuário
        chat = self.chat_belongs_to_user(pk, request.user.id)
        
        # Fazer soft delete
        chat.deleted_at = timezone.now()
        chat.save()
        
        # Emitir evento socket de delete para ambos os usuários
        socket.emit_to_user(chat.from_user.id, 'update_chat', {
            'type': 'delete',
            'chat_id': pk,
            'from_user_id': chat.from_user.id,
            'to_user_id': chat.to_user.id
        })
        
        socket.emit_to_user(chat.to_user.id, 'update_chat', {
            'type': 'delete',
            'chat_id': pk,
            'from_user_id': chat.from_user.id,
            'to_user_id': chat.to_user.id
        })
        
        return Response({'success': True})