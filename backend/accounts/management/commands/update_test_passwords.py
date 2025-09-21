from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = 'Atualiza as senhas dos usuários de teste para 123456'

    def handle(self, *args, **options):
        self.stdout.write('Atualizando senhas dos usuários de teste...')
        
        # Lista de emails para atualizar
        emails_to_update = [
            'admin@grftalk.com',
            'user1@grftalk.com', 
            'user2@grftalk.com',
            'user3@grftalk.com',
            'teste@grftalk.com'
        ]
        
        updated_count = 0
        
        for email in emails_to_update:
            try:
                user = User.objects.get(email=email)
                user.set_password('123456')
                user.save()
                updated_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Senha atualizada para: {user.name} ({user.email})')
                )
                
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f'Usuário não encontrado: {email}')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Erro ao atualizar senha para {email}: {str(e)}')
                )
        
        if updated_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f'\n{updated_count} senhas atualizadas com sucesso!')
            )
            self.stdout.write('\n' + '='*50)
            self.stdout.write('NOVAS CREDENCIAIS DE LOGIN:')
            self.stdout.write('='*50)
            self.stdout.write('Email: user1@grftalk.com')
            self.stdout.write('Senha: 123456')
            self.stdout.write('='*50)
        else:
            self.stdout.write(
                self.style.WARNING('Nenhuma senha foi atualizada')
            )