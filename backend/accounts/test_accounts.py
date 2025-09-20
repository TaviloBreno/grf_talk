import os
import tempfile
from django.test import TestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch, MagicMock
from PIL import Image
import io

from accounts.models import User
from accounts.serializers import UserSerializer
from accounts.auth import Authentication


class UserModelTest(TestCase):
    """Testes para o modelo User."""
    
    def setUp(self):
        self.user_data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'testpass123'
        }
    
    def test_create_user(self):
        """Testa criação de usuário."""
        user = User.objects.create(
            name=self.user_data['name'],
            email=self.user_data['email']
        )
        user.set_password(self.user_data['password'])
        user.save()
        
        self.assertEqual(user.name, self.user_data['name'])
        self.assertEqual(user.email, self.user_data['email'])
        self.assertTrue(user.check_password(self.user_data['password']))
        self.assertFalse(user.is_superuser)
    
    def test_create_superuser(self):
        """Testa criação de superusuário."""
        user = User.objects.create_superuser(
            email=self.user_data['email'],
            password=self.user_data['password'],
            name=self.user_data['name']
        )
        
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)
        self.assertTrue(user.has_perm('any_permission'))
        self.assertTrue(user.has_module_perms('any_app'))
    
    def test_get_initials_full_name(self):
        """Testa obtenção de iniciais com nome completo."""
        user = User.objects.create(
            name='John Doe',
            email='john@example.com'
        )
        
        self.assertEqual(user.get_initials(), 'JD')
    
    def test_get_initials_single_name(self):
        """Testa obtenção de iniciais com nome único."""
        user = User.objects.create(
            name='John',
            email='john@example.com'
        )
        
        self.assertEqual(user.get_initials(), 'JO')
    
    def test_get_initials_no_name(self):
        """Testa obtenção de iniciais sem nome."""
        user = User.objects.create(
            name='',
            email='john@example.com'
        )
        
        self.assertEqual(user.get_initials(), 'JO')
    
    def test_get_default_avatar(self):
        """Testa geração de avatar padrão."""
        user = User.objects.create(
            name='John Doe',
            email='john@example.com'
        )
        
        avatar_url = user.get_default_avatar()
        
        self.assertIn('ui-avatars.com', avatar_url)
        self.assertIn('name=JD', avatar_url)
        self.assertIn('size=200', avatar_url)
    
    def test_get_avatar_url_default(self):
        """Testa URL de avatar padrão."""
        user = User.objects.create(
            name='John Doe',
            email='john@example.com',
            avatar='/media/avatars/default-avatar.png'
        )
        
        avatar_url = user.get_avatar_url()
        
        self.assertIn('ui-avatars.com', avatar_url)
    
    def test_get_avatar_url_custom(self):
        """Testa URL de avatar customizado."""
        user = User.objects.create(
            name='John Doe',
            email='john@example.com',
            avatar='/media/avatars/custom.jpg'
        )
        
        avatar_url = user.get_avatar_url()
        
        self.assertEqual(avatar_url, '/media/avatars/custom.jpg')


class AuthenticationTest(TestCase):
    """Testes para a classe Authentication."""
    
    def setUp(self):
        self.user = User.objects.create(
            name='Test User',
            email='test@example.com'
        )
        self.user.set_password('testpass123')
        self.user.save()
    
    def test_signin_success(self):
        """Testa login bem-sucedido."""
        user = Authentication.signin('test@example.com', 'testpass123')
        
        self.assertEqual(user, self.user)
    
    def test_signin_wrong_password(self):
        """Testa login com senha incorreta."""
        user = Authentication.signin('test@example.com', 'wrongpass')
        
        self.assertFalse(user)
    
    def test_signin_nonexistent_user(self):
        """Testa login com usuário inexistente."""
        user = Authentication.signin('nonexistent@example.com', 'testpass123')
        
        self.assertFalse(user)
    
    def test_signup_success(self):
        """Testa registro bem-sucedido."""
        user = Authentication.signup('New User', 'new@example.com', 'newpass123')
        
        self.assertIsInstance(user, User)
        self.assertEqual(user.name, 'New User')
        self.assertEqual(user.email, 'new@example.com')
        self.assertTrue(user.check_password('newpass123'))
    
    def test_signup_existing_email(self):
        """Testa registro com email existente."""
        user = Authentication.signup('Another User', 'test@example.com', 'anotherpass')
        
        self.assertFalse(user)


class UserSerializerTest(TestCase):
    """Testes para o UserSerializer."""
    
    def setUp(self):
        self.user = User.objects.create(
            name='Test User',
            email='test@example.com',
            avatar='/media/avatars/default-avatar.png'
        )
    
    def test_serializer_fields(self):
        """Testa campos do serializer."""
        serializer = UserSerializer(self.user)
        data = serializer.data
        
        expected_fields = ['id', 'avatar', 'avatar_url', 'initials', 'name', 'email', 'last_access']
        
        for field in expected_fields:
            self.assertIn(field, data)
    
    def test_serializer_avatar_url(self):
        """Testa geração de avatar_url."""
        serializer = UserSerializer(self.user)
        data = serializer.data
        
        self.assertIn('ui-avatars.com', data['avatar_url'])
        self.assertEqual(data['initials'], 'TU')
    
    def test_serializer_custom_avatar(self):
        """Testa serializer com avatar customizado."""
        self.user.avatar = '/media/avatars/custom.jpg'
        self.user.save()
        
        serializer = UserSerializer(self.user)
        data = serializer.data
        
        # Deve manter o avatar customizado
        self.assertIn('custom.jpg', data['avatar'])


class SignInViewTest(APITestCase):
    """Testes para a view de login."""
    
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('signin')
        self.user = User.objects.create(
            name='Test User',
            email='test@example.com'
        )
        self.user.set_password('testpass123')
        self.user.save()
    
    def test_signin_success(self):
        """Testa login bem-sucedido."""
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)
    
    def test_signin_invalid_credentials(self):
        """Testa login com credenciais inválidas."""
        data = {
            'email': 'test@example.com',
            'password': 'wrongpass'
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_signin_missing_fields(self):
        """Testa login com campos obrigatórios ausentes."""
        data = {
            'email': 'test@example.com'
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class SignUpViewTest(APITestCase):
    """Testes para a view de registro."""
    
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('signup')
    
    def test_signup_success(self):
        """Testa registro bem-sucedido."""
        data = {
            'name': 'New User',
            'email': 'new@example.com',
            'password': 'newpass123'
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('token', response.data)
        
        # Verificar se usuário foi criado
        user = User.objects.get(email='new@example.com')
        self.assertEqual(user.name, 'New User')
    
    def test_signup_existing_email(self):
        """Testa registro com email existente."""
        User.objects.create(
            name='Existing User',
            email='existing@example.com'
        )
        
        data = {
            'name': 'New User',
            'email': 'existing@example.com',
            'password': 'newpass123'
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_signup_missing_fields(self):
        """Testa registro com campos obrigatórios ausentes."""
        data = {
            'name': 'New User',
            'email': 'new@example.com'
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserViewTest(APITestCase):
    """Testes para a view de usuário."""
    
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('user')
        self.user = User.objects.create(
            name='Test User',
            email='test@example.com'
        )
        self.user.set_password('testpass123')
        self.user.save()
        
        # Autenticar usuário
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
    
    def test_get_user_info(self):
        """Testa obtenção de informações do usuário."""
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')
        self.assertEqual(response.data['name'], 'Test User')
        self.assertIn('avatar_url', response.data)
    
    def test_update_user_info(self):
        """Testa atualização de informações do usuário."""
        data = {
            'name': 'Updated User',
            'email': 'updated@example.com'
        }
        
        response = self.client.put(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar se usuário foi atualizado
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, 'Updated User')
        self.assertEqual(self.user.email, 'updated@example.com')
    
    def test_update_user_missing_fields(self):
        """Testa atualização com campos obrigatórios ausentes."""
        data = {
            'name': 'Updated User'
        }
        
        response = self.client.put(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_unauthorized_access(self):
        """Testa acesso não autorizado."""
        self.client.credentials()  # Remove autenticação
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class AvatarViewTest(APITestCase):
    """Testes para a view de avatar."""
    
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('avatar')
        self.user = User.objects.create(
            name='Test User',
            email='test@example.com'
        )
        self.user.set_password('testpass123')
        self.user.save()
        
        # Autenticar usuário
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
    
    def test_get_avatar_info(self):
        """Testa obtenção de informações do avatar."""
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user_id'], self.user.id)
        self.assertEqual(response.data['name'], 'Test User')
        self.assertEqual(response.data['initials'], 'TU')
        self.assertIn('avatar_url', response.data)
        self.assertIn('default_avatar_url', response.data)
        self.assertFalse(response.data['has_custom_avatar'])
    
    def create_test_image(self):
        """Cria uma imagem de teste."""
        image = Image.new('RGB', (100, 100), color='red')
        file = io.BytesIO()
        image.save(file, 'JPEG')
        file.seek(0)
        return SimpleUploadedFile(
            "test.jpg",
            file.getvalue(),
            content_type="image/jpeg"
        )
    
    def test_upload_avatar_success(self):
        """Testa upload de avatar bem-sucedido."""
        image_file = self.create_test_image()
        
        response = self.client.post(self.url, {'avatar': image_file})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Avatar atualizado com sucesso')
        self.assertTrue(response.data['has_custom_avatar'])
        
        # Verificar se usuário foi atualizado
        self.user.refresh_from_db()
        self.assertNotEqual(self.user.avatar, '/media/avatars/default-avatar.png')
    
    def test_upload_avatar_invalid_type(self):
        """Testa upload de arquivo inválido."""
        text_file = SimpleUploadedFile(
            "test.txt",
            b"file_content",
            content_type="text/plain"
        )
        
        response = self.client.post(self.url, {'avatar': text_file})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_upload_avatar_missing_file(self):
        """Testa upload sem arquivo."""
        response = self.client.post(self.url, {})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_delete_avatar(self):
        """Testa remoção do avatar."""
        # Primeiro, definir um avatar customizado
        self.user.avatar = '/media/avatars/custom.jpg'
        self.user.save()
        
        response = self.client.delete(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Avatar resetado para padrão')
        self.assertFalse(response.data['has_custom_avatar'])
        
        # Verificar se foi resetado
        self.user.refresh_from_db()
        self.assertEqual(self.user.avatar, '/media/avatars/default-avatar.png')
    
    def test_unauthorized_access(self):
        """Testa acesso não autorizado ao avatar."""
        self.client.credentials()  # Remove autenticação
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)