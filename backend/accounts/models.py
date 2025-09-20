from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
import hashlib
from urllib.parse import urlencode


class UserManager(BaseUserManager):
    """Manager customizado para o modelo User."""
    
    def create_superuser(self, email, password, **extra_fields):
        """Cria e retorna um superusuário com email e senha."""
        if not email:
            raise ValueError('O email deve ser fornecido')
        
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            is_superuser=True,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    """Modelo de usuário customizado."""
    
    avatar = models.TextField(default='/media/avatars/default-avatar.png')
    name = models.CharField(max_length=80)
    email = models.EmailField(unique=True)
    is_superuser = models.BooleanField(default=False)
    last_access = models.DateTimeField(auto_now_add=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return self.email
    
    def has_perm(self, perm, obj=None):
        """Verifica se o usuário tem uma permissão específica."""
        return self.is_superuser
    
    def has_module_perms(self, app_label):
        """Verifica se o usuário tem permissões para um módulo específico."""
        return self.is_superuser
    
    @property
    def is_staff(self):
        """Propriedade que vincula is_staff ao is_superuser."""
        return self.is_superuser
    
    def get_initials(self):
        """Retorna as iniciais do nome do usuário."""
        if self.name:
            parts = self.name.strip().split()
            if len(parts) >= 2:
                return f"{parts[0][0].upper()}{parts[-1][0].upper()}"
            elif len(parts) == 1:
                return parts[0][:2].upper()
        return self.email[:2].upper()
    
    def get_avatar_url(self, request=None):
        """
        Retorna URL do avatar do usuário.
        Se não tiver avatar customizado, gera um avatar padrão.
        """
        # Se tem avatar customizado e não é o padrão
        if (self.avatar and 
            self.avatar != '/media/avatars/default-avatar.png' and
            not self.avatar.startswith('https://ui-avatars.com')):
            if request:
                return request.build_absolute_uri(self.avatar)
            return self.avatar
        
        # Gerar avatar padrão usando UI Avatars
        return self.get_default_avatar()
    
    def get_default_avatar(self):
        """Gera URL do avatar padrão usando iniciais."""
        initials = self.get_initials()
        
        # Gerar cor baseada no hash do email
        hash_object = hashlib.md5(self.email.encode())
        hex_dig = hash_object.hexdigest()
        
        # Extrair cores RGB do hash
        r = int(hex_dig[0:2], 16)
        g = int(hex_dig[2:4], 16) 
        b = int(hex_dig[4:6], 16)
        
        # Garantir que as cores não sejam muito escuras
        r = max(r, 100)
        g = max(g, 100)  
        b = max(b, 100)
        
        background_color = f"{r:02x}{g:02x}{b:02x}"
        
        params = {
            'name': initials,
            'size': 200,
            'background': background_color,
            'color': 'ffffff',
            'bold': 'true',
            'format': 'png'
        }
        
        return f"https://ui-avatars.com/api/?{urlencode(params)}"
    
    @property
    def avatar_url(self):
        """Propriedade computada para facilitar acesso ao avatar."""
        return self.get_avatar_url()
