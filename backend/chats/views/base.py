from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils import timezone
from django.db import models
from accounts.models import User
from ..models import Chat, ChatMessage
from ..serializers import ChatSerializer
from ..utils.exceptions import UserNotFound, ChatNotFound


class BaseView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    """Classe base para views do app chats com métodos utilitários reutilizáveis."""
    
    def get_user(self, raise_exception=True, **kwargs):
        """
        Retorna usuário filtrado pelos kwargs ou levanta UserNotFound.
        
        Args:
            raise_exception (bool): Se deve levantar exceção quando não encontrar usuário
            **kwargs: Filtros para buscar o usuário (ex: email, id)
            
        Returns:
            User: Usuário encontrado
            
        Raises:
            UserNotFound: Se usuário não for encontrado e raise_exception=True
        """
        try:
            return User.objects.get(**kwargs)
        except User.DoesNotExist:
            if raise_exception:
                raise UserNotFound()
            return None
    
    def check_if_chat_exists_for_user(self, user_id, to_user):
        """
        Verifica se já existe chat entre dois usuários.
        
        Args:
            user_id: ID do usuário logado
            to_user: Instância do usuário destinatário
            
        Returns:
            dict: ChatSerializer.data se chat existir, None caso contrário
        """
        # Busca chat onde user_id é from_user e to_user é to_user OU vice-versa
        from django.db.models import Q
        existing_chat = Chat.objects.filter(
            deleted_at__isnull=True
        ).filter(
            (Q(from_user_id=user_id) & Q(to_user=to_user)) |
            (Q(from_user=to_user) & Q(to_user_id=user_id))
        ).first()
        
        if existing_chat:
            # Usar context para identificar usuário logado no serializer
            serializer = ChatSerializer(existing_chat, context={'request': type('obj', (object,), {'user': User.objects.get(id=user_id)})()})
            return serializer.data
        
        return None
    
    def chat_belongs_to_user(self, chat_id, user_id):
        """
        Garante que o chat pertence ao usuário logado.
        
        Args:
            chat_id: ID do chat
            user_id: ID do usuário logado
            
        Returns:
            Chat: Instância do chat se pertencer ao usuário
            
        Raises:
            ChatNotFound: Se chat não existir ou não pertencer ao usuário
        """
        try:
            chat = Chat.objects.get(
                id=chat_id,
                deleted_at__isnull=True
            )
            
            # Verifica se o usuário participa do chat
            if chat.from_user_id == user_id or chat.to_user_id == user_id:
                return chat
            else:
                raise ChatNotFound()
                
        except Chat.DoesNotExist:
            raise ChatNotFound()
    
    def mark_messages_as_received(self, chat_id, user_id):
        """
        Marca mensagens do chat como visualizadas (atualiza viewed_at).
        
        Args:
            chat_id: ID do chat
            user_id: ID do usuário que está visualizando
        """
        # Atualiza mensagens não vistas que não são do próprio usuário
        ChatMessage.objects.filter(
            chat_id=chat_id,
            viewed_at__isnull=True,
            deleted_at__isnull=True
        ).exclude(
            from_user_id=user_id
        ).update(viewed_at=timezone.now())