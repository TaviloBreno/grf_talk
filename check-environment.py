#!/usr/bin/env python3
"""
Script de verificação do ambiente GRF Talk
Verifica se todas as dependências e configurações estão corretas
"""

import os
import sys
import subprocess
import json
from pathlib import Path


def check_python_version():
    """Verifica a versão do Python"""
    print("🐍 Verificando versão do Python...")
    version = sys.version_info
    if version.major == 3 and version.minor >= 8:
        print(f"   ✅ Python {version.major}.{version.minor}.{version.micro} (OK)")
        return True
    else:
        print(f"   ❌ Python {version.major}.{version.minor}.{version.micro} (Necessário Python 3.8+)")
        return False


def check_node_version():
    """Verifica a versão do Node.js"""
    print("🟢 Verificando versão do Node.js...")
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"   ✅ Node.js {version} (OK)")
            return True
        else:
            print("   ❌ Node.js não encontrado")
            return False
    except FileNotFoundError:
        print("   ❌ Node.js não instalado")
        return False


def check_pip_packages():
    """Verifica se os pacotes Python estão instalados"""
    print("📦 Verificando pacotes Python...")
    
    required_packages = [
        'django',
        'djangorestframework', 
        'djangorestframework-simplejwt',
        'django-cors-headers',
        'python-decouple'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package} (não instalado)")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n📥 Para instalar os pacotes faltantes:")
        print(f"   pip install {' '.join(missing_packages)}")
        return False
    
    return True


def check_npm_packages():
    """Verifica se os pacotes Node.js estão instalados"""
    print("📦 Verificando pacotes Node.js...")
    
    frontend_path = Path(__file__).parent / 'frontend'
    package_json_path = frontend_path / 'package.json'
    node_modules_path = frontend_path / 'node_modules'
    
    if not package_json_path.exists():
        print("   ❌ package.json não encontrado")
        return False
    
    if not node_modules_path.exists():
        print("   ❌ node_modules não encontrado")
        print("   💡 Execute: cd frontend && npm install")
        return False
    
    print("   ✅ Pacotes Node.js instalados")
    return True


def check_env_files():
    """Verifica se os arquivos .env existem"""
    print("⚙️ Verificando arquivos de configuração...")
    
    backend_env = Path(__file__).parent / 'backend' / '.env'
    frontend_env = Path(__file__).parent / 'frontend' / '.env.local'
    
    backend_ok = backend_env.exists()
    frontend_ok = frontend_env.exists()
    
    if backend_ok:
        print("   ✅ backend/.env encontrado")
    else:
        print("   ❌ backend/.env não encontrado")
    
    if frontend_ok:
        print("   ✅ frontend/.env.local encontrado")
    else:
        print("   ❌ frontend/.env.local não encontrado")
    
    return backend_ok and frontend_ok


def check_database():
    """Verifica se o banco de dados está configurado"""
    print("🗃️ Verificando banco de dados...")
    
    # Muda para o diretório backend
    backend_path = Path(__file__).parent / 'backend'
    original_cwd = os.getcwd()
    
    try:
        os.chdir(backend_path)
        
        # Verifica se consegue conectar ao banco
        result = subprocess.run([
            sys.executable, 'manage.py', 'check', '--database', 'default'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("   ✅ Conexão com banco de dados OK")
            return True
        else:
            print("   ❌ Erro na conexão com banco de dados")
            print(f"   {result.stderr}")
            return False
            
    except Exception as e:
        print(f"   ❌ Erro ao verificar banco: {e}")
        return False
    finally:
        os.chdir(original_cwd)


def check_migrations():
    """Verifica se as migrações foram aplicadas"""
    print("🔄 Verificando migrações...")
    
    backend_path = Path(__file__).parent / 'backend'
    original_cwd = os.getcwd()
    
    try:
        os.chdir(backend_path)
        
        result = subprocess.run([
            sys.executable, 'manage.py', 'showmigrations', '--plan'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            output = result.stdout
            if '[X]' in output:
                print("   ✅ Migrações aplicadas")
                return True
            else:
                print("   ⚠️ Migrações pendentes")
                print("   💡 Execute: python manage.py migrate")
                return False
        else:
            print("   ❌ Erro ao verificar migrações")
            return False
            
    except Exception as e:
        print(f"   ❌ Erro ao verificar migrações: {e}")
        return False
    finally:
        os.chdir(original_cwd)


def check_test_users():
    """Verifica se os usuários de teste existem"""
    print("👥 Verificando usuários de teste...")
    
    backend_path = Path(__file__).parent / 'backend'
    original_cwd = os.getcwd()
    
    try:
        os.chdir(backend_path)
        
        result = subprocess.run([
            sys.executable, 'manage.py', 'shell', '-c',
            'from accounts.models import User; print(User.objects.count())'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            count = int(result.stdout.strip())
            if count >= 5:
                print(f"   ✅ {count} usuários encontrados")
                return True
            else:
                print(f"   ⚠️ Apenas {count} usuários encontrados")
                print("   💡 Execute: python manage.py create_test_users")
                return False
        else:
            print("   ❌ Erro ao verificar usuários")
            return False
            
    except Exception as e:
        print(f"   ❌ Erro ao verificar usuários: {e}")
        return False
    finally:
        os.chdir(original_cwd)


def main():
    """Função principal"""
    print("🔍 GRF TALK - VERIFICAÇÃO DE AMBIENTE")
    print("=" * 50)
    print()
    
    checks = [
        check_python_version,
        check_node_version,
        check_env_files,
        check_pip_packages,
        check_npm_packages,
        check_database,
        check_migrations,
        check_test_users
    ]
    
    results = []
    
    for check in checks:
        result = check()
        results.append(result)
        print()
    
    # Resumo
    passed = sum(results)
    total = len(results)
    
    print("=" * 50)
    print("📊 RESUMO DA VERIFICAÇÃO")
    print("=" * 50)
    
    if passed == total:
        print("🎉 AMBIENTE CONFIGURADO CORRETAMENTE!")
        print("✅ Todas as verificações passaram")
        print()
        print("🚀 Você pode executar o projeto com:")
        print("   Windows: start-project.bat")
        print("   Linux/Mac: ./start-project.sh")
    else:
        print(f"⚠️ {total - passed} problema(s) encontrado(s)")
        print(f"✅ {passed}/{total} verificações passaram")
        print()
        print("🔧 Corrija os problemas acima antes de executar o projeto")
    
    print()
    print("📚 Para mais informações, consulte:")
    print("   - README.md")
    print("   - DEVELOPMENT.md")


if __name__ == '__main__':
    main()