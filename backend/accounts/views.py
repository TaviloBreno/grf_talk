import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import AuthenticationFailed
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.utils.timezone import now
from rest_framework_simplejwt.tokens import RefreshToken

from .auth import Authentication
from .serializers import UserSerializer
from .models import User
from core.utils.exceptions import ValidationError


class SignInView(APIView, Authentication):
    """View para autenticação de usuários."""
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Realiza o login do usuário."""
        email = request.data.get('email')
        password = request.data.get('password')
        
        # Chama o método signin da classe Authentication
        user = self.signin(email, password)
        
        if not user:
            raise AuthenticationFailed('Credenciais inválidas')
        
        # Serializa o usuário
        serializer = UserSerializer(user)
        
        # Gera os tokens JWT
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        return Response({
            'user': serializer.data,
            'token': str(access_token)
        })


class SignUpView(APIView, Authentication):
    """View para registro de novos usuários."""
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Realiza o registro de um novo usuário."""
        name = request.data.get('name')
        email = request.data.get('email')
        password = request.data.get('password')
        
        # Valida a presença dos campos obrigatórios
        if not all([name, email, password]):
            raise AuthenticationFailed('Nome, email e senha são obrigatórios')
        
        # Chama o método signup da classe Authentication
        user = self.signup(name, email, password)
        
        if not user:
            raise AuthenticationFailed('Email já está em uso')
        
        # Serializa o usuário
        serializer = UserSerializer(user)
        
        # Gera os tokens JWT
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        return Response({
            'user': serializer.data,
            'token': str(access_token)
        })


class UserView(APIView):
    """View para gerenciamento do usuário logado."""
    
    def get(self, request):
        """Retorna os dados do usuário logado."""
        user = request.user
        
        # Atualiza last_access
        user.last_access = now()
        user.save()
        
        # Serializa e retorna o usuário
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    def put(self, request):
        """Atualiza os dados do usuário logado."""
        user = request.user
        name = request.data.get('name')
        email = request.data.get('email')
        password = request.data.get('password')
        avatar_file = request.FILES.get('avatar')
        
        # Valida campos obrigatórios
        if not name or not email:
            raise ValidationError('Nome e email são obrigatórios')
        
        # Atualiza campos básicos
        user.name = name
        user.email = email
        
        # Atualiza senha se fornecida
        if password:
            user.set_password(password)
        
        # Processa upload do avatar se fornecido
        if avatar_file:
            # Configura FileSystemStorage
            fs = FileSystemStorage(
                location=settings.MEDIA_ROOT,
                base_url=settings.MEDIA_URL
            )
            
            # Valida tipo do arquivo
            if not avatar_file.content_type in ['image/png', 'image/jpeg']:
                raise ValidationError('Formato de avatar inválido. Use apenas PNG ou JPG')
            
            try:
                # Salva o novo avatar
                filename = fs.save(f'avatars/{avatar_file.name}', avatar_file)
                new_avatar_path = f'/{settings.MEDIA_URL}{filename}'
                
                # Remove avatar antigo se não for o default
                old_avatar = user.avatar
                if old_avatar and old_avatar != '/media/avatars/default-avatar.png':
                    old_file_path = settings.MEDIA_ROOT + old_avatar.replace(settings.MEDIA_URL, '')
                    if os.path.exists(old_file_path):
                        os.remove(old_file_path)
                
                # Atualiza o avatar do usuário
                user.avatar = new_avatar_path
                
            except Exception as e:
                # Se houve erro, remove o arquivo salvo
                if 'filename' in locals():
                    file_path = fs.path(filename)
                    if os.path.exists(file_path):
                        os.remove(file_path)
                raise ValidationError('Erro ao fazer upload do avatar')
        
        # Salva as alterações
        user.save()
        
        # Serializa e retorna o usuário atualizado
        serializer = UserSerializer(user)
        return Response(serializer.data)
