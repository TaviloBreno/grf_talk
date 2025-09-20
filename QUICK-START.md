# ⚡ Guia de Instalação Rápida - GRF Talk

## 🚀 Opção 1: Instalação Automática (Recomendado)

### Windows
```bash
# 1. Clone o projeto
git clone https://github.com/TaviloBreno/grf_talk.git
cd grf_talk

# 2. Execute o script de inicialização
start-project.bat
```

### Linux/Mac
```bash
# 1. Clone o projeto
git clone https://github.com/TaviloBreno/grf_talk.git
cd grf_talk

# 2. Torne o script executável e execute
chmod +x start-project.sh
./start-project.sh
```

## 🔧 Opção 2: Instalação Manual

### Pré-requisitos
- Python 3.8+
- Node.js 18+
- MySQL 8.0+

### Passo 1: Configurar Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py create_test_users
```

### Passo 2: Configurar Frontend
```bash
cd ../frontend
npm install
```

### Passo 3: Iniciar Servidores
```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## ✅ Verificação do Ambiente

Execute o script de verificação para garantir que tudo está funcionando:

```bash
python check-environment.py
```

## 🌐 Acessos

Após a instalação, acesse:

- **Frontend**: http://localhost:3000
- **Backend Admin**: http://127.0.0.1:8000/admin
- **API**: http://127.0.0.1:8000/api/v1

## 👥 Credenciais de Login

### Super Admin
- **Email**: admin@grftalk.com
- **Senha**: admin123

### Usuários de Teste
- **user1@grftalk.com** / user123
- **user2@grftalk.com** / user123  
- **user3@grftalk.com** / user123
- **teste@grftalk.com** / teste123

## 🐛 Problemas Comuns

### Erro de MySQL
```bash
# Verifique se o MySQL está rodando
# Windows: Services > MySQL
# Linux: sudo systemctl start mysql
# Mac: brew services start mysql
```

### Erro de Porta
```bash
# Se a porta estiver ocupada:
# Backend: python manage.py runserver 8001
# Frontend: npm run dev -- -p 3001
```

### Erro de Dependências
```bash
# Backend
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall

# Frontend
rm -rf node_modules package-lock.json
npm install
```

## 📞 Suporte

Se encontrar problemas:

1. Consulte o [README.md](README.md) completo
2. Verifique o [DEVELOPMENT.md](DEVELOPMENT.md)
3. Execute `python check-environment.py`
4. Abra uma issue no GitHub

---

**🎉 Pronto! Seu ambiente GRF Talk está configurado!**