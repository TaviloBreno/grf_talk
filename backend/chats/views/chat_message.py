from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from core.socket import socket
from .base import BaseView
from ..models import Chat, ChatMessage
from ..serializers import ChatMessageSerializer


class ChatMessageView(BaseView):
    """View para operações individuais em mensagens de chat."""
    
    def get(self, request, chat_id, message_id):
        """
        Retorna uma mensagem específica de um chat.
        
        Args:
            request: Request object
            chat_id (int): ID do chat
            message_id (int): ID da mensagem
            
        Returns:
            Response: Mensagem serializada ou erro
        """
        # Verificar se chat existe e pertence ao usuário
        if not self.chat_belongs_to_user(chat_id, request.user.id):
            return Response(
                {'error': 'Chat não encontrado ou você não tem permissão para acessá-lo'}, 
                status=404
            )
        
        # Buscar mensagem
        try:
            message = ChatMessage.objects.get(
                id=message_id,
                chat_id=chat_id,
                deleted_at__isnull=True
            )
        except ChatMessage.DoesNotExist:
            return Response(
                {'error': 'Mensagem não encontrada'}, 
                status=404
            )
        
        # Serializar e retornar
        serializer = ChatMessageSerializer(message, context={'request': request})
        return Response(serializer.data)
    
    def put(self, request, chat_id, message_id):
        """
        Atualiza uma mensagem específica (apenas o body).
        
        Args:
            request: Request object
            chat_id (int): ID do chat
            message_id (int): ID da mensagem
            
        Returns:
            Response: Mensagem atualizada ou erro
        """
        # Verificar se chat existe e pertence ao usuário
        if not self.chat_belongs_to_user(chat_id, request.user.id):
            return Response(
                {'error': 'Chat não encontrado ou você não tem permissão para acessá-lo'}, 
                status=404
            )
        
        # Buscar mensagem
        try:
            message = ChatMessage.objects.get(
                id=message_id,
                chat_id=chat_id,
                from_user=request.user,  # Só pode editar suas próprias mensagens
                deleted_at__isnull=True
            )
        except ChatMessage.DoesNotExist:
            return Response(
                {'error': 'Mensagem não encontrada ou você não tem permissão para editá-la'}, 
                status=404
            )
        
        # Validar novo corpo da mensagem
        new_body = request.data.get('body', '').strip()
        if not new_body:
            return Response(
                {'error': 'Corpo da mensagem é obrigatório'}, 
                status=400
            )
        
        # Atualizar mensagem
        message.body = new_body
        message.save()
        
        # Serializar mensagem atualizada
        serializer = ChatMessageSerializer(message, context={'request': request})
        
        # Determinar usuário destinatário para socket
        chat = message.chat
        to_user = chat.to_user if chat.from_user.id == request.user.id else chat.from_user
        
        # Emitir evento socket
        socket.emit_to_user(to_user.id, 'message_updated', {
            'type': 'update',
            'message': serializer.data,
            'chat_id': chat_id
        })
        
        return Response(serializer.data)
    
    def patch(self, request, chat_id, message_id):
        """
        Marca uma mensagem como lida (viewed_at).
        
        Args:
            request: Request object
            chat_id (int): ID do chat
            message_id (int): ID da mensagem
            
        Returns:
            Response: Mensagem atualizada ou erro
        """
        # Verificar se chat existe e pertence ao usuário
        if not self.chat_belongs_to_user(chat_id, request.user.id):
            return Response(
                {'error': 'Chat não encontrado ou você não tem permissão para acessá-lo'}, 
                status=404
            )
        
        # Buscar mensagem
        try:
            message = ChatMessage.objects.get(
                id=message_id,
                chat_id=chat_id,
                deleted_at__isnull=True
            )
        except ChatMessage.DoesNotExist:
            return Response(
                {'error': 'Mensagem não encontrada'}, 
                status=404
            )
        
        # Só pode marcar como lida se não for o remetente
        if message.from_user.id == request.user.id:
            return Response(
                {'error': 'Você não pode marcar suas próprias mensagens como lidas'}, 
                status=400
            )
        
        # Marcar como lida
        message.viewed_at = timezone.now()
        message.save()
        
        # Serializar mensagem atualizada
        serializer = ChatMessageSerializer(message, context={'request': request})
        
        # Emitir evento socket para o remetente
        socket.emit_to_user(message.from_user.id, 'message_read', {
            'type': 'read',
            'message': serializer.data,
            'chat_id': chat_id,
            'read_by': request.user.id
        })
        
        return Response(serializer.data)
    
    def delete(self, request, chat_id, message_id):
        """
        Soft delete de uma mensagem específica.
        
        Args:
            request: Request object
            chat_id (int): ID do chat
            message_id (int): ID da mensagem
            
        Returns:
            Response: Confirmação da exclusão ou erro
        """
        # Verificar se chat existe e pertence ao usuário
        if not self.chat_belongs_to_user(chat_id, request.user.id):
            return Response(
                {'error': 'Chat não encontrado ou você não tem permissão para acessá-lo'}, 
                status=404
            )
        
        # Buscar mensagem
        try:
            message = ChatMessage.objects.get(
                id=message_id,
                chat_id=chat_id,
                from_user=request.user,  # Só pode deletar suas próprias mensagens
                deleted_at__isnull=True
            )
        except ChatMessage.DoesNotExist:
            return Response(
                {'error': 'Mensagem não encontrada ou você não tem permissão para deletá-la'}, 
                status=404
            )
        
        # Soft delete
        message.deleted_at = timezone.now()
        message.save()
        
        # Determinar usuário destinatário para socket
        chat = message.chat
        to_user = chat.to_user if chat.from_user.id == request.user.id else chat.from_user
        
        # Emitir evento socket
        socket.emit_to_user(to_user.id, 'message_deleted', {
            'type': 'delete',
            'message_id': message_id,
            'chat_id': chat_id
        })
        
        return Response(
            {'message': 'Mensagem deletada com sucesso'}, 
            status=200
        )