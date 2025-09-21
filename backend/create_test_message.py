#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from chats.models import Chat, ChatMessage
from accounts.models import User

def create_test_message():
    print("=== CRIANDO MENSAGEM DE TESTE ===")
    
    # Pegar o primeiro chat disponível
    chat = Chat.objects.first()
    if not chat:
        print("❌ Nenhum chat encontrado!")
        return
    
    # Pegar o usuário destinatário (o que não é o from_user)
    sender = chat.to_user
    
    # Criar mensagem
    message_text = f"Mensagem de teste via script - {datetime.now().timestamp()}"
    
    message = ChatMessage.objects.create(
        chat=chat,
        from_user=sender,
        body=message_text
    )
    
    print(f"✅ Mensagem criada!")
    print(f"   ID: {message.id}")
    print(f"   Chat: {chat.id}")
    print(f"   Remetente: {sender.email}")
    print(f"   Texto: {message_text}")
    print(f"   Timestamp: {message.created_at}")
    
    print("\n🔍 Agora verifique no frontend se a mensagem aparece em até 3 segundos!")

if __name__ == "__main__":
    create_test_message()