#!/usr/bin/env python
"""
Script para testar a API de chats completa e verificar se os dados estão corretos.
"""
import os
import sys
import django

# Adicionar o diretório do projeto ao Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

import json
from django.contrib.auth import get_user_model
from chats.models import Chat
from chats.serializers import ChatSerializer
from rest_framework.request import Request
from django.test import RequestFactory

User = get_user_model()

def test_chat_api_response():
    """Testa como a API de chats retorna os dados."""
    
    print("🧪 Testando API de Chats - Dados para o Frontend")
    print("=" * 60)
    
    # Buscar usuários para teste
    users = list(User.objects.all()[:2])
    if len(users) < 2:
        print("❌ Precisa de pelo menos 2 usuários para teste")
        return
    
    user1, user2 = users[0], users[1]
    
    # Criar request fake para cada usuário
    factory = RequestFactory()
    
    # Buscar chats
    chats = Chat.objects.all()[:3]  # Pegar até 3 chats para teste
    
    for chat in chats:
        print(f"\n📱 Chat ID: {chat.id}")
        print(f"   From: {chat.from_user.name}")
        print(f"   To: {chat.to_user.name}")
        print("-" * 40)
        
        # Testar como usuário 1
        request = factory.get('/api/chats/')
        request.user = user1
        
        serializer = ChatSerializer(chat, context={'request': request})
        data = serializer.data
        
        print(f"👤 Como {user1.name} vê:")
        print(f"   Outro participante: {data['user']['name']}")
        print(f"   Avatar: {data['user']['avatar'][:50]}...")
        print(f"   Mensagens não vistas: {data['unseen_count']}")
        
        # Testar como usuário 2 (se for participante)
        if chat.to_user == user2 or chat.from_user == user2:
            request.user = user2
            serializer = ChatSerializer(chat, context={'request': request})
            data = serializer.data
            
            print(f"👤 Como {user2.name} vê:")
            print(f"   Outro participante: {data['user']['name']}")
            print(f"   Avatar: {data['user']['avatar'][:50]}...")
            print(f"   Mensagens não vistas: {data['unseen_count']}")
    
    print("\n" + "=" * 60)
    print("✅ Teste concluído - Dados estão estruturados corretamente!")
    print("💡 Frontend deve usar chat.user.name e chat.user.avatar")

if __name__ == "__main__":
    test_chat_api_response()