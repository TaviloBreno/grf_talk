import requests
import json
import sys

def test_socket_endpoints():
    base_url = 'http://127.0.0.1:8000/api/v1'
    
    # Teste sem autenticação primeiro
    print('=== SOCKET STATUS (sem auth) ===')
    try:
        status_response = requests.get(f'{base_url}/socket/status/')
        print(f'Status: {status_response.status_code}')
        print(f'Response: {json.dumps(status_response.json(), indent=2)}')
    except Exception as e:
        print(f'Erro: {e}')
        return
    
    # Agora teste com autenticação
    login_data = {
        'email': 'admin@test.com',
        'password': 'admin123'
    }
    
    try:
        # Login
        response = requests.post(f'{base_url}/accounts/login/', json=login_data)
        print('\n=== LOGIN ===')
        print(f'Status: {response.status_code}')
        
        if response.status_code == 200:
            token = response.json()['access']
            headers = {'Authorization': f'Bearer {token}'}
            
            print('\n=== SOCKET TEST ===')
            test_response = requests.get(f'{base_url}/socket/test/', headers=headers)
            print(f'Status: {test_response.status_code}')
            print(f'Response: {json.dumps(test_response.json(), indent=2)}')
            
            print('\n=== ONLINE USERS ===')
            users_response = requests.get(f'{base_url}/socket/online-users/', headers=headers)
            print(f'Status: {users_response.status_code}')
            print(f'Response: {json.dumps(users_response.json(), indent=2)}')
            
            print('\n=== ENVIAR EVENTO DE TESTE ===')
            event_data = {
                'event_type': 'notification',
                'message': 'Este é um teste do sistema de socket!'
            }
            event_response = requests.post(f'{base_url}/socket/test/', headers=headers, json=event_data)
            print(f'Status: {event_response.status_code}')
            print(f'Response: {json.dumps(event_response.json(), indent=2)}')
        else:
            print(f'Erro no login: {response.text}')
            
    except Exception as e:
        print(f'Erro na conexão: {e}')

if __name__ == '__main__':
    test_socket_endpoints()