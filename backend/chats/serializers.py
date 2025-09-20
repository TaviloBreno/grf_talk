from rest_framework import serializers
from accounts.serializers import UserSerializer
from attachments.models import FileAttachment, AudioAttachment
from attachments.serializers import FileAttachmentSerializer, AudioAttachmentSerializer
from .models import Chat, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer para mensagens de chat."""
    
    from_user = serializers.SerializerMethodField()
    attachment = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = ["id", "body", "attachment", "from_user", "viewed_at", "created_at"]
    
    def get_from_user(self, obj):
        """Retorna o usuário remetente serializado."""
        return UserSerializer(obj.from_user).data
    
    def get_attachment(self, obj):
        """Retorna o anexo serializado conforme o tipo."""
        if not obj.attachment_code or not obj.attachment_id:
            return None
        
        try:
            if obj.attachment_code == "FILE":
                attachment = FileAttachment.objects.get(id=obj.attachment_id)
                return {
                    "type": "FILE",
                    "data": FileAttachmentSerializer(attachment).data
                }
            elif obj.attachment_code == "AUDIO":
                attachment = AudioAttachment.objects.get(id=obj.attachment_id)
                return {
                    "type": "AUDIO",
                    "data": AudioAttachmentSerializer(attachment).data
                }
        except (FileAttachment.DoesNotExist, AudioAttachment.DoesNotExist):
            return None
        
        return None


class ChatSerializer(serializers.ModelSerializer):
    """Serializer para chats."""
    
    user = serializers.SerializerMethodField()
    unseen_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Chat
        fields = ["id", "last_message", "unseen_count", "user", "viewed_at", "created_at"]
    
    def get_user(self, obj):
        """Retorna o 'outro usuário' do chat (não quem está logado)."""
        current_user = self.context.get('request').user if self.context.get('request') else None
        
        if current_user:
            # Se o usuário logado é o from_user, retorna o to_user
            if obj.from_user == current_user:
                return UserSerializer(obj.to_user).data
            # Caso contrário, retorna o from_user
            else:
                return UserSerializer(obj.from_user).data
        
        # Fallback: retorna o to_user se não houver contexto de request
        return UserSerializer(obj.to_user).data
    
    def get_unseen_count(self, obj):
        """Retorna a quantidade de mensagens não vistas no chat para o usuário logado."""
        current_user = self.context.get('request').user if self.context.get('request') else None
        
        if not current_user:
            return 0
        
        # Conta mensagens não vistas que não são do próprio usuário
        return ChatMessage.objects.filter(
            chat=obj,
            viewed_at__isnull=True,
            deleted_at__isnull=True
        ).exclude(from_user=current_user).count()
    
    def get_last_message(self, obj):
        """Retorna a última mensagem do chat."""
        last_message = ChatMessage.objects.filter(
            chat=obj,
            deleted_at__isnull=True
        ).order_by('-created_at').first()
        
        if last_message:
            return ChatMessageSerializer(last_message).data
        
        return None