@echo off
echo ==========================================
echo        GRF TALK - INICIALIZACAO
echo ==========================================
echo.

echo [1/5] Verificando dependencias do Python...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias do Python!
    pause
    exit /b 1
)

echo.
echo [2/5] Executando migracoes do banco de dados...
python manage.py migrate
if %errorlevel% neq 0 (
    echo Erro ao executar migracoes!
    pause
    exit /b 1
)

echo.
echo [3/5] Criando usuarios de teste...
python manage.py create_test_users

echo.
echo [4/5] Instalando dependencias do Node.js...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias do Node.js!
    pause
    exit /b 1
)

echo.
echo [5/5] Iniciando servidores...
echo.
echo ==========================================
echo    SERVIDORES INICIADOS COM SUCESSO!
echo ==========================================
echo.
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo Admin: http://127.0.0.1:8000/admin
echo.
echo ==========================================
echo         USUARIOS DE TESTE
echo ==========================================
echo.
echo 👑 SUPER ADMIN:
echo Email: admin@grftalk.com
echo Senha: admin123
echo.
echo 👤 USUARIOS COMUNS:
echo user1@grftalk.com / user123
echo user2@grftalk.com / user123
echo user3@grftalk.com / user123
echo teste@grftalk.com / teste123
echo.
echo ==========================================

echo Pressione Ctrl+C para parar os servidores
echo.

rem Inicia o backend em uma nova janela
start "GRF Talk Backend" cmd /k "cd /d %~dp0backend && python manage.py runserver"

rem Aguarda um pouco antes de iniciar o frontend
timeout /t 3 /nobreak > nul

rem Inicia o frontend na janela atual
cd /d %~dp0frontend
npm run dev

pause