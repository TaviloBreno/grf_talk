#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from chats.models import ChatMessage

def check_chat3():
    print("=== VERIFICANDO CHAT 3 ===")
    
    chat3_messages = ChatMessage.objects.filter(chat_id=3, deleted_at__isnull=True).order_by('created_at')
    print(f"Chat 3 tem {chat3_messages.count()} mensagens:")
    
    for msg in chat3_messages:
        print(f"  ID {msg.id}: \"{msg.body}\" de {msg.from_user.email} em {msg.created_at}")

if __name__ == "__main__":
    check_chat3()