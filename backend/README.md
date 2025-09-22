# GRF Talk Backend

Backend da aplicação GRF Talk construído com Django REST Framework.

## Tecnologias

- Django 4.2.18
- Django REST Framework
- MySQL 8.0
- JWT Authentication
- WebSockets (Django Channels)

## Instalação

```bash
# Instalar dependências
pip install -r requirements.txt

# Configurar banco de dados
python manage.py migrate

# Criar usuários de teste
python manage.py create_test_users

# Iniciar servidor
python manage.py runserver
```

## Testes

O backend utiliza o framework de testes nativo do Django.

### Executando Testes

```bash
# Executar todos os testes
python manage.py test

# Executar com verbosidade
python manage.py test --verbosity=2

# Executar testes específicos
python manage.py test accounts.tests
python manage.py test chats.tests

# Executar teste específico
python manage.py test accounts.tests.test_auth
```

### Estrutura dos Testes

```
backend/
├── accounts/
│   ├── tests.py
│   └── test_accounts.py
├── chats/
│   ├── tests.py
│   ├── test_chats.py
│   └── test_messages.py
├── attachments/
│   └── tests.py
└── test_*.py
```

### Cobertura

- ✅ **Autenticação**: JWT, login, registro
- ✅ **Usuários**: CRUD de perfis
- ✅ **Chat**: Criação e gerenciamento
- ✅ **Mensagens**: Envio e histórico
- ✅ **Anexos**: Upload de arquivos
- ✅ **WebSockets**: Comunicação em tempo real

## API Endpoints

### Autenticação
- `POST /api/v1/accounts/signin/` - Login
- `POST /api/v1/accounts/signup/` - Registro
- `GET /api/v1/accounts/me/` - Dados do usuário

### Chat
- `GET /api/v1/chats/` - Listar chats
- `POST /api/v1/chats/` - Criar chat
- `GET /api/v1/chats/{id}/messages/` - Mensagens

## Configuração

Veja o arquivo `.env` para variáveis de ambiente necessárias.