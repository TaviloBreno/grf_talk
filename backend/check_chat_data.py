#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from chats.models import Chat, ChatMessage
from accounts.models import User

print('=== DADOS DO BANCO ===')
print(f'Chats: {Chat.objects.count()}')
print(f'Mensagens: {ChatMessage.objects.count()}')
print(f'Usuários: {User.objects.count()}')
print()

# Verificar um chat específico
if Chat.objects.exists():
    chat = Chat.objects.first()
    print(f'Chat {chat.id}: {chat.from_user.name} <-> {chat.to_user.name}')
    print(f'  From: {chat.from_user.name} (ID: {chat.from_user.id}) - Avatar: {chat.from_user.avatar or "Nenhum"}')
    print(f'  To: {chat.to_user.name} (ID: {chat.to_user.id}) - Avatar: {chat.to_user.avatar or "Nenhum"}')
    print()
    
    # Verificar se há mensagens
    messages = chat.chatmessage_set.all()[:3]
    print(f'Últimas mensagens no chat {chat.id}:')
    for msg in messages:
        print(f'  - {msg.from_user.name}: {msg.body[:50]}...')
else:
    print('Nenhum chat encontrado!')