import requests
import json

def test_avatar_functionality():
    base_url = 'http://127.0.0.1:8000/api/v1'
    
    # Login primeiro
    login_data = {
        'email': 'admin@test.com', 
        'password': 'admin123'
    }
    
    try:
        # Login
        response = requests.post(f'{base_url}/accounts/signin/', json=login_data)
        print('=== LOGIN ===')
        print(f'Status: {response.status_code}')
        
        if response.status_code == 200:
            token = response.json()['access']
            headers = {'Authorization': f'Bearer {token}'}
            
            print('\n=== AVATAR INFO ===')
            avatar_response = requests.get(f'{base_url}/accounts/avatar/', headers=headers)
            print(f'Status: {avatar_response.status_code}')
            print(f'Response: {json.dumps(avatar_response.json(), indent=2)}')
            
            print('\n=== USER INFO (com avatar) ===')
            user_response = requests.get(f'{base_url}/accounts/me/', headers=headers)
            print(f'Status: {user_response.status_code}')
            print(f'Response: {json.dumps(user_response.json(), indent=2)}')
            
            print('\n=== RESET AVATAR ===')
            reset_response = requests.delete(f'{base_url}/accounts/avatar/', headers=headers)
            print(f'Status: {reset_response.status_code}')
            print(f'Response: {json.dumps(reset_response.json(), indent=2)}')
            
        else:
            print(f'Erro no login: {response.text}')
            
    except Exception as e:
        print(f'Erro na conexão: {e}')

if __name__ == '__main__':
    test_avatar_functionality()