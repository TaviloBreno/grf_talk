#!/bin/bash

echo "=========================================="
echo "        GRF TALK - INICIALIZAÇÃO"
echo "=========================================="
echo

echo "[1/5] Verificando dependências do Python..."
cd backend
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Erro ao instalar dependências do Python!"
    exit 1
fi

echo
echo "[2/5] Executando migrações do banco de dados..."
python manage.py migrate
if [ $? -ne 0 ]; then
    echo "Erro ao executar migrações!"
    exit 1
fi

echo
echo "[3/5] Criando usuários de teste..."
python manage.py create_test_users

echo
echo "[4/5] Instalando dependências do Node.js..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "Erro ao instalar dependências do Node.js!"
    exit 1
fi

echo
echo "[5/5] Iniciando servidores..."
echo
echo "=========================================="
echo "    SERVIDORES INICIADOS COM SUCESSO!"
echo "=========================================="
echo
echo "Backend: http://127.0.0.1:8000"
echo "Frontend: http://localhost:3000"
echo "Admin: http://127.0.0.1:8000/admin"
echo
echo "=========================================="
echo "         USUÁRIOS DE TESTE"
echo "=========================================="
echo
echo "👑 SUPER ADMIN:"
echo "Email: admin@grftalk.com"
echo "Senha: admin123"
echo
echo "👤 USUÁRIOS COMUNS:"
echo "user1@grftalk.com / user123"
echo "user2@grftalk.com / user123"
echo "user3@grftalk.com / user123"
echo "teste@grftalk.com / teste123"
echo
echo "=========================================="
echo
echo "Pressione Ctrl+C para parar os servidores"
echo

# Função para limpar processos ao sair
cleanup() {
    echo
    echo "Parando servidores..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Captura sinais de interrupção
trap cleanup SIGINT SIGTERM

# Inicia o backend em background
cd ../backend
python manage.py runserver &
BACKEND_PID=$!

# Aguarda um pouco antes de iniciar o frontend
sleep 3

# Inicia o frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Aguarda os processos
wait