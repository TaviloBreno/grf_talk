#!/usr/bin/env python
"""
Script para debugar como os dados do chat estão sendo retornados pelo API.
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

def debug_chat_serializer():
    """Debug do ChatSerializer para ver a estrutura exata dos dados."""
    
    # Buscar primeiro usuário para simular request
    user = User.objects.first()
    if not user:
        print("❌ Nenhum usuário encontrado")
        return
    
    # Criar uma request fake para o contexto
    factory = RequestFactory()
    request = factory.get('/api/chats/')
    request.user = user
    
    # Buscar primeiro chat
    chat = Chat.objects.first()
    if not chat:
        print("❌ Nenhum chat encontrado")
        return
    
    print(f"🔍 Debugando Chat ID: {chat.id}")
    print(f"   From User: {chat.from_user.name}")
    print(f"   To User: {chat.to_user.name}")
    print(f"   Current User (simulado): {user.name}")
    print("")
    
    # Serializar o chat
    serializer = ChatSerializer(chat, context={'request': request})
    serialized_data = serializer.data
    
    print("📄 Dados serializados do Chat:")
    print(json.dumps(serialized_data, indent=2, ensure_ascii=False, default=str))
    print("")
    
    # Verificar o campo 'user' especificamente
    user_field = serialized_data.get('user')
    if user_field:
        print("👤 Campo 'user' (outro participante):")
        print(f"   ID: {user_field.get('id')}")
        print(f"   Nome: {user_field.get('name')}")
        print(f"   Avatar: {user_field.get('avatar')}")
        print(f"   Email: {user_field.get('email')}")
    
    print("\n" + "="*50)
    
    # Testar com diferentes usuários logados
    print("🔄 Testando com diferentes usuários logados...")
    
    for test_user in User.objects.all()[:3]:  # Testar com 3 usuários
        request.user = test_user
        serializer = ChatSerializer(chat, context={'request': request})
        user_field = serializer.data.get('user')
        
        print(f"\n👤 Usuário logado: {test_user.name}")
        print(f"   Outro participante retornado: {user_field.get('name') if user_field else 'None'}")

if __name__ == "__main__":
    debug_chat_serializer()