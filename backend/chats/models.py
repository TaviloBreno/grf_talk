from django.db import models
from accounts.models import User


class Chat(models.Model):
    """Modelo para conversas entre usuários."""
    
    from_user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="chats_from_user_id"
    )
    to_user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="chats_to_user_id"
    )
    viewed_at = models.DateTimeField(null=True)
    deleted_at = models.DateTimeField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "chats"
    
    def __str__(self):
        return f"Chat entre {self.from_user.name} e {self.to_user.name}"


class ChatMessage(models.Model):
    """Modelo para mensagens de chat."""
    
    ATTACHMENT_CHOICES = [
        ("FILE", "FILE"),
        ("AUDIO", "AUDIO"),
    ]
    
    body = models.TextField(null=True)
    attachment_code = models.CharField(
        max_length=10, 
        null=True, 
        choices=ATTACHMENT_CHOICES
    )
    attachment_id = models.IntegerField(null=True)
    viewed_at = models.DateTimeField(null=True)
    deleted_at = models.DateTimeField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    from_user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    class Meta:
        db_table = "chat_messages"
    
    def __str__(self):
        if self.body:
            return f"Mensagem de {self.from_user.name}: {self.body[:50]}..."
        else:
            return f"Anexo {self.attachment_code} de {self.from_user.name}"
