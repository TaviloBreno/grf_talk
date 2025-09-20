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
        serializer = UserSerializer(user, context={'request': request})
        
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
        serializer = UserSerializer(user, context={'request': request})
        
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
        serializer = UserSerializer(user, context={'request': request})
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
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data)


class AvatarView(APIView):
    """View para gerenciar avatar do usuário."""
    
    def get(self, request):
        """Retorna informações do avatar do usuário atual."""
        user = request.user
        
        return Response({
            'user_id': user.id,
            'name': user.name,
            'initials': user.get_initials(),
            'avatar_url': user.get_avatar_url(request),
            'default_avatar_url': user.get_default_avatar(),
            'has_custom_avatar': (user.avatar and 
                                user.avatar != '/media/avatars/default-avatar.png' and
                                not user.avatar.startswith('https://ui-avatars.com'))
        })
    
    def post(self, request):
        """Upload de novo avatar."""
        user = request.user
        
        avatar_file = request.FILES.get('avatar')
        if not avatar_file:
            raise ValidationError('Arquivo de avatar é obrigatório')
        
        # Validar tipo de arquivo
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if avatar_file.content_type not in allowed_types:
            raise ValidationError('Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou WebP')
        
        # Validar tamanho (max 5MB)
        if avatar_file.size > 5 * 1024 * 1024:
            raise ValidationError('Arquivo muito grande. Máximo 5MB')
        
        # Configurar storage
        fs = FileSystemStorage(location=os.path.join(settings.MEDIA_ROOT, 'avatars'))
        
        # Gerar nome único
        file_extension = avatar_file.name.split('.')[-1].lower()
        filename = f"user_{user.id}_{int(now().timestamp())}.{file_extension}"
        
        try:
            # Remover avatar anterior se existir
            if (user.avatar and 
                user.avatar != '/media/avatars/default-avatar.png' and
                not user.avatar.startswith('https://ui-avatars.com')):
                old_path = user.avatar.replace('/media/', '')
                old_file_path = os.path.join(settings.MEDIA_ROOT, old_path)
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)
            
            # Salvar novo arquivo
            fs.save(filename, avatar_file)
            new_avatar_path = f'/media/avatars/{filename}'
            
            # Atualizar usuário
            user.avatar = new_avatar_path
            user.save()
            
            return Response({
                'message': 'Avatar atualizado com sucesso',
                'avatar_url': user.get_avatar_url(request),
                'has_custom_avatar': True
            })
            
        except Exception as e:
            # Cleanup em caso de erro
            if 'filename' in locals():
                file_path = fs.path(filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
            raise ValidationError('Erro ao fazer upload do avatar')
    
    def delete(self, request):
        """Remove avatar customizado e volta ao padrão."""
        user = request.user
        
        # Remover arquivo anterior se existir
        if (user.avatar and 
            user.avatar != '/media/avatars/default-avatar.png' and
            not user.avatar.startswith('https://ui-avatars.com')):
            old_path = user.avatar.replace('/media/', '')
            old_file_path = os.path.join(settings.MEDIA_ROOT, old_path)
            if os.path.exists(old_file_path):
                os.remove(old_file_path)
        
        # Resetar para padrão
        user.avatar = '/media/avatars/default-avatar.png'
        user.save()
        
        return Response({
            'message': 'Avatar resetado para padrão',
            'avatar_url': user.get_avatar_url(request),
            'has_custom_avatar': False
        })
