# 🚀 GRF Talk - Chat Application

![GRF Talk](https://img.shields.io/badge/GRF-Talk-blue)
![Django](https://img.shields.io/badge/Django-4.2.18-green)
![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

Uma aplicação de chat moderna e completa construída com Django REST Framework no backend e Next.js no frontend, oferecendo comunicação em tempo real, sistema de autenticação JWT e interface responsiva.

## 📋 Índice

- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Usuários de Teste](#-usuários-de-teste)
- [Executando o Projeto](#-executando-o-projeto)
- [API Endpoints](#-api-endpoints)
- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)

## ✨ Características

- 💬 **Chat em Tempo Real**: Comunicação instantânea via WebSockets
- 🔐 **Autenticação JWT**: Sistema seguro de login e registro
- 👥 **Sistema de Usuários**: Gerenciamento completo de perfis
- 📎 **Anexos**: Suporte a envio de arquivos e áudios
- 🎨 **Interface Moderna**: UI responsiva com Tailwind CSS e Shadcn/UI
- 🌙 **Tema Escuro/Claro**: Suporte a múltiplos temas
- 📱 **Mobile First**: Design responsivo para todos os dispositivos
- 🔍 **Busca de Mensagens**: Sistema de busca avançado
- 🖼️ **Avatares Personalizados**: Upload e gerenciamento de avatares
- ⚡ **Performance**: Otimizado para alta performance

## 🛠 Tecnologias

### Backend
- **Django 4.2.18** - Framework web Python
- **Django REST Framework** - API REST
- **Django Simple JWT** - Autenticação JWT
- **MySQL** - Banco de dados
- **Channels** - WebSockets para tempo real
- **Pillow** - Processamento de imagens

### Frontend
- **Next.js 15.5.3** - Framework React
- **TypeScript** - Linguagem tipada
- **Tailwind CSS** - Framework CSS
- **Shadcn/UI** - Componentes UI
- **Socket.IO** - Cliente WebSocket
- **Zustand** - Gerenciamento de estado
- **React Hook Form** - Formulários
- **Axios** - Cliente HTTP

## 📋 Pré-requisitos

- Python 3.8+ 
- Node.js 18+
- MySQL 8.0+
- Git

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/TaviloBreno/grf_talk.git
cd grf_talk
```

### 2. Configuração do Backend

```bash
# Navegue para o diretório do backend
cd backend

# Crie um ambiente virtual (opcional, mas recomendado)
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt
```

### 3. Configuração do Frontend

```bash
# Navegue para o diretório do frontend
cd ../frontend

# Instale as dependências
npm install
```

## ⚙️ Configuração

### 1. Banco de Dados MySQL

Crie um banco de dados MySQL:

```sql
CREATE DATABASE grf_talk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configuração do Backend

O arquivo `.env` já está configurado no backend com as seguintes variáveis:

```env
# Django Settings
SECRET_KEY=django-insecure-6!^h7n-j7(2isd$0lhfx600tsd6%eg8&n4i5bfn48%s_*vr42f
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_ENGINE=django.db.backends.mysql
DB_NAME=grf_talk
DB_USER=root
DB_PASSWORD=root
DB_HOST=localhost
DB_PORT=3306

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# JWT
ACCESS_TOKEN_LIFETIME_DAYS=7

# Media
MEDIA_ROOT=media
CURRENT_URL=http://127.0.0.1:8000
```

**⚠️ Importante**: Ajuste as credenciais do banco de dados (`DB_USER`, `DB_PASSWORD`) conforme sua configuração MySQL.

### 3. Configuração do Frontend

O arquivo `.env.local` já está configurado no frontend:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://127.0.0.1:8000

# JWT Configuration
JWT_SECRET=django-insecure-6!^h7n-j7(2isd$0lhfx600tsd6%eg8&n4i5bfn48%s_*vr42f

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# App Configuration
NEXT_PUBLIC_APP_NAME=GRF Talk
NEXT_PUBLIC_APP_DESCRIPTION=Modern chat application built with Next.js and Django
```

### 4. Inicialização do Banco de Dados

```bash
# No diretório backend/
cd backend

# Execute as migrações
python manage.py migrate

# Crie os usuários de teste
python manage.py create_test_users
```

## 👥 Usuários de Teste

O sistema vem pré-configurado com os seguintes usuários para teste:

### 👑 SUPER ADMIN
- **Email**: `admin@grftalk.com`
- **Senha**: `admin123`
- **Nome**: Super Admin
- **Privilégios**: Acesso administrativo completo

### 👤 USUÁRIOS COMUNS

#### Usuário 1
- **Email**: `user1@grftalk.com`
- **Senha**: `user123`
- **Nome**: João Silva

#### Usuário 2
- **Email**: `user2@grftalk.com`
- **Senha**: `user123`
- **Nome**: Maria Santos

#### Usuário 3
- **Email**: `user3@grftalk.com`
- **Senha**: `user123`
- **Nome**: Pedro Oliveira

#### Usuário Teste
- **Email**: `teste@grftalk.com`
- **Senha**: `teste123`
- **Nome**: Usuário Teste

## 🏃 Executando o Projeto

### Opção 1: Execução Manual

#### 1. Inicie o Backend
```bash
cd backend
python manage.py runserver
```
O backend estará disponível em: http://127.0.0.1:8000

#### 2. Inicie o Frontend (em outro terminal)
```bash
cd frontend
npm run dev
```
O frontend estará disponível em: http://localhost:3000

### Opção 2: Script de Inicialização (Windows)

```bash
# Execute o script de inicialização
.\start-project.bat
```

### Opção 3: Script de Inicialização (Linux/Mac)

```bash
# Torne o script executável
chmod +x start-project.sh

# Execute o script
./start-project.sh
```

## 🔗 API Endpoints

### Autenticação
- `POST /api/v1/accounts/signin/` - Login do usuário
- `POST /api/v1/accounts/signup/` - Registro de usuário
- `GET /api/v1/accounts/me/` - Dados do usuário logado
- `PUT /api/v1/accounts/me/` - Atualizar dados do usuário

### Avatar
- `GET /api/v1/accounts/avatar/` - Informações do avatar
- `POST /api/v1/accounts/avatar/` - Upload de avatar
- `DELETE /api/v1/accounts/avatar/` - Remover avatar customizado

### Chat
- `GET /api/v1/chats/` - Listar conversas
- `POST /api/v1/chats/` - Criar nova conversa
- `GET /api/v1/chats/{id}/messages/` - Mensagens de uma conversa
- `POST /api/v1/chats/{id}/messages/` - Enviar mensagem

### WebSocket
- `GET /api/v1/socket/test/` - Teste de conexão WebSocket
- `GET /api/v1/socket/online-users/` - Usuários online
- `GET /api/v1/socket/status/` - Status do WebSocket

## 🎯 Funcionalidades

### ✅ Autenticação e Usuários
- [x] Sistema de login/registro
- [x] Autenticação JWT
- [x] Gerenciamento de perfil
- [x] Upload de avatares
- [x] Avatares gerados automaticamente

### ✅ Chat em Tempo Real
- [x] Envio de mensagens instantâneo
- [x] WebSocket para tempo real
- [x] Indicadores de usuários online
- [x] Histórico de mensagens
- [x] Status de visualização

### ✅ Interface do Usuário
- [x] Design responsivo
- [x] Tema claro/escuro
- [x] Scrollbars customizadas
- [x] Componentes reutilizáveis
- [x] Animações suaves

### ✅ Funcionalidades Avançadas
- [x] Busca de mensagens
- [x] Filtros de conversa
- [x] Configurações de chat
- [x] Gravação de áudio
- [x] Anexos de arquivo
- [x] Emoji picker

## 📁 Estrutura do Projeto

```
grf_talk/
├── backend/                 # Django REST Framework
│   ├── accounts/           # App de usuários
│   │   ├── management/     # Comandos personalizados
│   │   ├── migrations/     # Migrações do banco
│   │   ├── models.py       # Modelos de usuário
│   │   ├── views.py        # Views da API
│   │   ├── serializers.py  # Serializers DRF
│   │   └── urls.py         # URLs do app
│   ├── chats/              # App de chat
│   │   ├── models.py       # Modelos de chat
│   │   ├── views/          # Views do chat
│   │   └── utils/          # Utilitários
│   ├── attachments/        # App de anexos
│   ├── core/               # Configurações principais
│   │   ├── settings.py     # Configurações Django
│   │   ├── urls.py         # URLs principais
│   │   └── wsgi.py         # WSGI application
│   ├── media/              # Arquivos de mídia
│   ├── requirements.txt    # Dependências Python
│   └── .env                # Variáveis de ambiente
├── frontend/               # Next.js Application
│   ├── src/
│   │   ├── app/            # App Router (Next.js 13+)
│   │   │   ├── auth/       # Páginas de autenticação
│   │   │   ├── dashboard/  # Dashboard principal
│   │   │   ├── chat/       # Página de chat
│   │   │   └── account/    # Página de conta
│   │   ├── components/     # Componentes React
│   │   │   ├── ui/         # Componentes base (Shadcn)
│   │   │   ├── chat/       # Componentes de chat
│   │   │   └── auth/       # Componentes de auth
│   │   ├── lib/            # Utilitários
│   │   │   ├── api-client.ts # Cliente da API
│   │   │   └── utils.ts    # Funções utilitárias
│   │   ├── stores/         # Gerenciamento de estado
│   │   ├── providers/      # Providers React
│   │   └── types/          # Definições TypeScript
│   ├── public/             # Arquivos estáticos
│   ├── package.json        # Dependências Node.js
│   └── .env.local          # Variáveis de ambiente
└── README.md               # Esta documentação
```

## 🔧 Comandos Úteis

### Backend
```bash
# Criar migrações
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Criar usuários de teste
python manage.py create_test_users

# Executar testes
python manage.py test

# Coletar arquivos estáticos
python manage.py collectstatic
```

### Frontend
```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start

# Linting
npm run lint

# Verificar tipos TypeScript
npx tsc --noEmit
```

## 🐛 Solução de Problemas

### Erro de Conexão com MySQL
```bash
# Verificar se o MySQL está rodando
sudo systemctl status mysql

# Iniciar MySQL
sudo systemctl start mysql
```

### Erro de CORS
- Verifique se as URLs em `CORS_ALLOWED_ORIGINS` estão corretas
- Confirme se o frontend está rodando na porta 3000

### Erro 404 na API
- Confirme se o backend está rodando na porta 8000
- Verifique se a URL da API no frontend está correta

### Problemas com Dependências
```bash
# Backend - atualizar pip e reinstalar
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall

# Frontend - limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📚 Links Úteis

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/UI](https://ui.shadcn.com/)

## 👥 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Tavilo Breno**
- GitHub: [@TaviloBreno](https://github.com/TaviloBreno)

---

⭐ **Se este projeto foi útil para você, não esqueça de dar uma estrela!**