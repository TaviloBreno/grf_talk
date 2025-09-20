from django.contrib.auth.hashers import check_password, make_password
from .models import User


class Authentication:
    """Classe para gerenciar autenticação e registro de usuários."""
    
    @staticmethod
    def signin(email: str, password: str):
        """
        Realiza o login do usuário.
        
        Args:
            email (str): Email do usuário
            password (str): Senha do usuário
            
        Returns:
            User | bool: Retorna o usuário se a autenticação for bem-sucedida, False caso contrário
        """
        try:
            user = User.objects.get(email=email)
            if check_password(password, user.password):
                return user
            return False
        except User.DoesNotExist:
            return False
    
    @staticmethod
    def signup(name: str, email: str, password: str):
        """
        Realiza o registro de um novo usuário.
        
        Args:
            name (str): Nome do usuário
            email (str): Email do usuário
            password (str): Senha do usuário
            
        Returns:
            User | bool: Retorna o usuário criado se o registro for bem-sucedido, False se o email já existir
        """
        try:
            # Verifica se o email já existe
            if User.objects.filter(email=email).exists():
                return False
            
            # Cria o novo usuário
            user = User.objects.create(
                name=name,
                email=email,
                password=make_password(password)
            )
            return user
        except Exception:
            return False