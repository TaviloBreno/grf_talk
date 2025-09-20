# 🛠️ Guia de Desenvolvimento - GRF Talk

## 🚀 Configuração Rápida

### 1. Primeiro Setup
```bash
# Clone o projeto
git clone https://github.com/TaviloBreno/grf_talk.git
cd grf_talk

# Execute o script de inicialização
# Windows:
start-project.bat

# Linux/Mac:
chmod +x start-project.sh
./start-project.sh
```

### 2. Configuração Manual

#### Backend (Django)
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py create_test_users
python manage.py runserver
```

#### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

## 🔗 URLs Importantes

- **Frontend**: http://localhost:3000
- **Backend API**: http://127.0.0.1:8000/api/v1
- **Django Admin**: http://127.0.0.1:8000/admin
- **API Documentation**: http://127.0.0.1:8000/api/v1/ (DRF Browsable API)

## 👥 Credenciais de Teste

### Super Admin
- **Email**: admin@grftalk.com
- **Senha**: admin123
- **Acesso**: Django Admin + Frontend

### Usuários Comuns
| Email | Senha | Nome |
|-------|-------|------|
| user1@grftalk.com | user123 | João Silva |
| user2@grftalk.com | user123 | Maria Santos |
| user3@grftalk.com | user123 | Pedro Oliveira |
| teste@grftalk.com | teste123 | Usuário Teste |

## 🔧 Comandos Úteis

### Backend
```bash
# Criar novo app Django
python manage.py startapp nome_do_app

# Migrations
python manage.py makemigrations
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Shell Django
python manage.py shell

# Testes
python manage.py test

# Listar usuários
python manage.py shell -c "from accounts.models import User; [print(f'{u.name} - {u.email}') for u in User.objects.all()]"
```

### Frontend
```bash
# Adicionar nova dependência
npm install nome-da-biblioteca

# Verificar tipos TypeScript
npx tsc --noEmit

# Build de produção
npm run build

# Analisar bundle
npm run build && npx @next/bundle-analyzer
```

## 📋 Estrutura de Desenvolvimento

### Backend (Django)
```
backend/
├── accounts/           # Autenticação e usuários
├── chats/             # Sistema de chat
├── attachments/       # Gerenciamento de arquivos
├── core/              # Configurações principais
└── media/             # Arquivos uploadados
```

### Frontend (Next.js)
```
frontend/src/
├── app/               # App Router (páginas)
├── components/        # Componentes React
├── lib/              # Utilitários e configurações
├── stores/           # Estado global (Zustand)
├── providers/        # Context providers
└── types/            # Definições TypeScript
```

## 🔄 Workflow de Desenvolvimento

### 1. Desenvolvimento de Features
1. Backend: Criar models, serializers, views
2. Frontend: Criar páginas, componentes, stores
3. Integração: Conectar frontend com backend
4. Testes: Validar funcionalidade

### 2. Banco de Dados
- **Produção**: MySQL
- **Desenvolvimento**: MySQL (local)
- **Migrações**: Django migrations

### 3. API Design
- RESTful endpoints
- Autenticação JWT
- Serializers DRF
- Filtros e paginação

## 🌐 Integração Frontend/Backend

### Autenticação
```typescript
// Login
POST /api/v1/accounts/signin/
{
  "email": "user@example.com",
  "password": "password"
}

// Response
{
  "user": { ... },
  "token": "jwt_token_here"
}
```

### Chat em Tempo Real
```typescript
// WebSocket connection
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL)

// Enviar mensagem
socket.emit('send_message', {
  chat_id: 1,
  message: 'Hello!'
})

// Receber mensagem
socket.on('new_message', (data) => {
  // Handle new message
})
```

## 🛡️ Segurança

### Backend
- CORS configurado para frontend
- JWT tokens com expiração
- Validação de dados
- Sanitização de uploads

### Frontend
- Middleware de autenticação
- Validação de formulários
- Proteção de rotas
- Sanitização de dados

## 📱 Responsividade

- **Mobile First**: Design pensado para mobile
- **Breakpoints**: Tailwind CSS padrão
- **Componentes**: Adaptáveis a diferentes telas
- **Testes**: Testado em diferentes dispositivos

## ⚡ Performance

### Backend
- Queries otimizadas
- Cache quando necessário
- Compressão de media
- Paginação de resultados

### Frontend
- Next.js App Router
- Code splitting automático
- Lazy loading de componentes
- Otimização de imagens

## 🧪 Testes

### Backend
```bash
# Todos os testes
python manage.py test

# Testes específicos
python manage.py test accounts.tests
python manage.py test chats.tests
```

### Frontend
```bash
# Jest (se configurado)
npm test

# Cypress (se configurado)
npm run cypress
```

## 🐛 Debug

### Backend
```python
# settings.py
DEBUG = True
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
    },
}
```

### Frontend
```typescript
// Development mode
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data)
}

// React DevTools
// Redux DevTools (se usando Redux)
```

## 📦 Deploy

### Backend (Django)
```bash
# Produção
pip install gunicorn
gunicorn core.wsgi:application

# Docker
docker build -t grf-talk-backend .
docker run -p 8000:8000 grf-talk-backend
```

### Frontend (Next.js)
```bash
# Build
npm run build

# Start
npm start

# Docker
docker build -t grf-talk-frontend .
docker run -p 3000:3000 grf-talk-frontend
```

## 🎯 Próximas Features

- [ ] Notificações push
- [ ] Chamadas de vídeo
- [ ] Grupos de chat
- [ ] Moderação de conteúdo
- [ ] Themes personalizados
- [ ] App mobile (React Native)

## 📚 Recursos de Aprendizado

- [Django Tutorial](https://docs.djangoproject.com/en/4.2/intro/tutorial01/)
- [Next.js Learn](https://nextjs.org/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Happy Coding! 🚀**