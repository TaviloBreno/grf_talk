from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


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
