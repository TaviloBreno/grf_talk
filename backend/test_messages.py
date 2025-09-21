#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from chats.models import Chat, ChatMessage
from accounts.models import User

def test_messages():
    print("=== TESTE DE MENSAGENS ===")
    
    # Listar todos os chats
    chats = Chat.objects.all()
    print(f"\n📂 Total de chats: {chats.count()}")
    
    for chat in chats:
        print(f"\n🗨️  Chat {chat.id}: {chat.from_user.email} <-> {chat.to_user.email}")
        
        # Listar mensagens do chat
        messages = ChatMessage.objects.filter(chat=chat, deleted_at__isnull=True).order_by('created_at')
        print(f"   📝 Mensagens: {messages.count()}")
        
        for msg in messages:
            print(f"      - ID {msg.id}: '{msg.body}' (de {msg.from_user.email}) em {msg.created_at}")
    
    print(f"\n📊 Total de mensagens no sistema: {ChatMessage.objects.filter(deleted_at__isnull=True).count()}")

if __name__ == "__main__":
    test_messages()