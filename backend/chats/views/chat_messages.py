from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from core.temp_socket import socket
from attachments.models import FileAttachment, AudioAttachment
from .base import BaseView
from ..models import Chat, ChatMessage
from ..serializers import ChatMessageSerializer


class ChatMessagesView(BaseView):
    """View para listar e criar mensagens de um chat."""
    
    def get(self, request, chat_id):
        """
        Retorna lista de mensagens de um chat específico.
        
        Args:
            chat_id: ID do chat
            
        Returns:
            Response: Lista de mensagens serializadas
        """
        # Verificar se chat existe e pertence ao usuário
        if not self.user_can_access_chat(chat_id, request.user.id):
            return Response(
                {'error': 'Chat não encontrado ou você não tem permissão para acessá-lo'}, 
                status=404
            )
        
        # Buscar mensagens do chat (não deletadas)
        messages = ChatMessage.objects.filter(
            chat_id=chat_id,
            deleted_at__isnull=True
        ).order_by('created_at')
        
        # Serializar mensagens
        serializer = ChatMessageSerializer(messages, many=True, context={'request': request})
        
        # Marcar mensagens como recebidas pelo usuário logado
        self.mark_messages_as_received(chat_id, request.user.id)
        
        # Retornar em formato paginado para compatibilidade com o frontend
        return Response({
            'data': serializer.data,
            'total': len(serializer.data),
            'page': 1,
            'pages': 1,
            'per_page': 50
        })
    
    def post(self, request, chat_id):
        """
        Cria nova mensagem em um chat.
        
        Args:
            chat_id: ID do chat
            
        Returns:
            Response: Mensagem criada serializada
        """
        # Validar dados da mensagem
        body = request.data.get('body', '').strip()
        attachment_code = request.data.get('attachment_code')
        attachment_id = request.data.get('attachment_id')
        
        # Validar que pelo menos body ou anexo esteja presente
        if not body and not (attachment_code and attachment_id):
            return Response(
                {'error': 'Corpo da mensagem ou anexo é obrigatório'}, 
                status=400
            )
        
        # Validar attachment_code se fornecido
        if attachment_code and attachment_code not in ['FILE', 'AUDIO']:
            return Response(
                {'error': 'Código de anexo inválido. Use FILE ou AUDIO'}, 
                status=400
            )
        
        # Validar se attachment_id existe se attachment_code for fornecido
        if attachment_code and attachment_id:
            try:
                if attachment_code == 'FILE':
                    FileAttachment.objects.get(id=attachment_id)
                elif attachment_code == 'AUDIO':
                    AudioAttachment.objects.get(id=attachment_id)
            except (FileAttachment.DoesNotExist, AudioAttachment.DoesNotExist):
                return Response(
                    {'error': 'Anexo não encontrado'}, 
                    status=404
                )
        
        # Obter chat de forma segura
        try:
            chat = Chat.objects.get(id=chat_id, deleted_at__isnull=True)
            # Verificar se usuário tem acesso
            if chat.from_user_id != request.user.id and chat.to_user_id != request.user.id:
                return Response(
                    {'error': 'Chat não encontrado ou você não tem permissão para acessá-lo'}, 
                    status=404
                )
        except Chat.DoesNotExist:
            return Response(
                {'error': 'Chat não encontrado'}, 
                status=404
            )
        
        # Criar mensagem
        message_data = {
            'chat': chat,
            'from_user': request.user,
            'body': body
        }
        
        # Adicionar dados de anexo se fornecidos
        if attachment_code and attachment_id:
            message_data['attachment_code'] = attachment_code
            message_data['attachment_id'] = attachment_id
        
        message = ChatMessage.objects.create(**message_data)
        
        # Atualizar viewed_at do chat
        chat.viewed_at = timezone.now()
        chat.save()
        
        # Serializar mensagem criada
        serializer = ChatMessageSerializer(message, context={'request': request})
        
        # Determinar usuário destinatário
        to_user = chat.to_user if chat.from_user.id == request.user.id else chat.from_user
        
        # Emitir evento socket para o destinatário
        try:
            socket.emit_to_user(to_user.id, 'new_message', {
                'type': 'create',
                'message': serializer.data,
                'chat_id': chat_id
            })
        except Exception as e:
            pass  # Log error silently
        
        # Emitir evento de atualização do chat para o remetente
        try:
            socket.emit_to_user(request.user.id, 'update_chat', {
                'type': 'message_sent',
                'chat_id': chat_id,
                'message': serializer.data
            })
        except Exception as e:
            pass  # Log error silently
        
        return Response(serializer.data, status=201)