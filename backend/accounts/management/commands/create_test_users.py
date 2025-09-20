from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = 'Cria usuários de teste para o sistema GRF Talk'

    def handle(self, *args, **options):
        self.stdout.write('Criando usuários de teste...')
        
        users_data = [
            {
                'email': 'admin@grftalk.com',
                'name': 'Super Admin',
                'password': 'admin123',
                'is_superuser': True
            },
            {
                'email': 'user1@grftalk.com',
                'name': 'João Silva',
                'password': 'user123',
                'is_superuser': False
            },
            {
                'email': 'user2@grftalk.com',
                'name': 'Maria Santos',
                'password': 'user123',
                'is_superuser': False
            },
            {
                'email': 'user3@grftalk.com',
                'name': 'Pedro Oliveira',
                'password': 'user123',
                'is_superuser': False
            },
            {
                'email': 'teste@grftalk.com',
                'name': 'Usuário Teste',
                'password': 'teste123',
                'is_superuser': False
            }
        ]
        
        created_count = 0
        
        for user_data in users_data:
            try:
                # Verifica se o usuário já existe
                if User.objects.filter(email=user_data['email']).exists():
                    self.stdout.write(
                        self.style.WARNING(f'Usuário {user_data["email"]} já existe')
                    )
                    continue
                
                # Cria o usuário
                user = User.objects.create(
                    email=user_data['email'],
                    name=user_data['name'],
                    is_superuser=user_data['is_superuser']
                )
                user.set_password(user_data['password'])
                user.save()
                
                created_count += 1
                user_type = 'Super Admin' if user.is_superuser else 'Usuário comum'
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ {user_type} criado: {user.name} ({user.email})'
                    )
                )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Erro ao criar usuário {user_data["email"]}: {str(e)}')
                )
        
        if created_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f'\n{created_count} usuários criados com sucesso!')
            )
            self.stdout.write('\n' + '='*50)
            self.stdout.write('CREDENCIAIS DE LOGIN:')
            self.stdout.write('='*50)
            
            for user_data in users_data:
                user_type = '👑 SUPER ADMIN' if user_data['is_superuser'] else '👤 USUÁRIO'
                self.stdout.write(f'{user_type}')
                self.stdout.write(f'  Email: {user_data["email"]}')
                self.stdout.write(f'  Senha: {user_data["password"]}')
                self.stdout.write(f'  Nome: {user_data["name"]}')
                self.stdout.write('-' * 30)
        else:
            self.stdout.write(
                self.style.WARNING('Nenhum usuário foi criado (todos já existem)')
            )