import socketio
from django.conf import settings

socket = socketio.Server(cors_allowed_origins=settings.CORS_ALLOWED_ORIGINS)

# Armazenar sessões de usuários conectados
user_sessions = {}

@socket.event
def connect(sid, environ):
    """Evento de conexão do socket."""
    print(f"Cliente conectado: {sid}")

@socket.event
def disconnect(sid):
    """Evento de desconexão do socket."""
    # Remover usuário das sessões quando desconectar
    for user_id, session_sid in list(user_sessions.items()):
        if session_sid == sid:
            del user_sessions[user_id]
            print(f"Usuário {user_id} desconectado: {sid}")
            # Emitir evento de usuário offline
            emit_user_status(user_id, 'offline')
            break
    print(f"Cliente desconectado: {sid}")

@socket.event
def authenticate(sid, data):
    """Autenticar usuário e associar ao session ID."""
    user_id = data.get('user_id')
    if user_id:
        user_sessions[user_id] = sid
        print(f"Usuário {user_id} autenticado: {sid}")
        socket.emit('authenticated', {'status': 'success'}, room=sid)
        
        # Emitir evento de usuário online para outros usuários
        emit_user_status(user_id, 'online')
    else:
        socket.emit('authenticated', {'status': 'error', 'message': 'User ID required'}, room=sid)

@socket.event
def join_chat(sid, data):
    """Usuário entra em um chat específico."""
    chat_id = data.get('chat_id')
    user_id = data.get('user_id')
    
    if chat_id and user_id:
        # Verificar se usuário está autenticado
        if user_sessions.get(user_id) == sid:
            room_name = f"chat_{chat_id}"
            socket.enter_room(sid, room_name)
            print(f"Usuário {user_id} entrou no chat {chat_id}")
            socket.emit('joined_chat', {'chat_id': chat_id, 'status': 'success'}, room=sid)
        else:
            socket.emit('joined_chat', {'status': 'error', 'message': 'User not authenticated'}, room=sid)
    else:
        socket.emit('joined_chat', {'status': 'error', 'message': 'Chat ID and User ID required'}, room=sid)

@socket.event
def leave_chat(sid, data):
    """Usuário sai de um chat específico."""
    chat_id = data.get('chat_id')
    user_id = data.get('user_id')
    
    if chat_id and user_id:
        if user_sessions.get(user_id) == sid:
            room_name = f"chat_{chat_id}"
            socket.leave_room(sid, room_name)
            print(f"Usuário {user_id} saiu do chat {chat_id}")
            socket.emit('left_chat', {'chat_id': chat_id, 'status': 'success'}, room=sid)
        else:
            socket.emit('left_chat', {'status': 'error', 'message': 'User not authenticated'}, room=sid)
    else:
        socket.emit('left_chat', {'status': 'error', 'message': 'Chat ID and User ID required'}, room=sid)

@socket.event
def typing_start(sid, data):
    """Usuário começou a digitar em um chat."""
    chat_id = data.get('chat_id')
    user_id = data.get('user_id')
    
    if chat_id and user_id:
        if user_sessions.get(user_id) == sid:
            room_name = f"chat_{chat_id}"
            # Emitir para outros usuários no chat
            socket.emit('user_typing', {
                'chat_id': chat_id,
                'user_id': user_id,
                'typing': True
            }, room=room_name, skip_sid=sid)
            print(f"Usuário {user_id} começou a digitar no chat {chat_id}")

@socket.event
def typing_stop(sid, data):
    """Usuário parou de digitar em um chat."""
    chat_id = data.get('chat_id')
    user_id = data.get('user_id')
    
    if chat_id and user_id:
        if user_sessions.get(user_id) == sid:
            room_name = f"chat_{chat_id}"
            # Emitir para outros usuários no chat
            socket.emit('user_typing', {
                'chat_id': chat_id,
                'user_id': user_id,
                'typing': False
            }, room=room_name, skip_sid=sid)
            print(f"Usuário {user_id} parou de digitar no chat {chat_id}")

@socket.event
def update_status(sid, data):
    """Atualizar status do usuário (online, ausente, ocupado)."""
    user_id = data.get('user_id')
    status = data.get('status')  # 'online', 'away', 'busy', 'offline'
    
    if user_id and status:
        if user_sessions.get(user_id) == sid:
            print(f"Usuário {user_id} atualizou status para: {status}")
            emit_user_status(user_id, status)
            socket.emit('status_updated', {'status': status}, room=sid)
        else:
            socket.emit('status_updated', {'status': 'error', 'message': 'User not authenticated'}, room=sid)

def emit_to_user(user_id, event, data):
    """
    Emite evento para um usuário específico se estiver conectado.
    
    Args:
        user_id: ID do usuário destinatário
        event: Nome do evento
        data: Dados para enviar
    """
    session_id = user_sessions.get(user_id)
    if session_id:
        socket.emit(event, data, room=session_id)
        print(f"Evento '{event}' enviado para usuário {user_id}")
    else:
        print(f"Usuário {user_id} não está conectado")

def emit_to_chat(chat_id, event, data, exclude_user_id=None):
    """
    Emite evento para todos os usuários em um chat específico.
    
    Args:
        chat_id: ID do chat
        event: Nome do evento
        data: Dados para enviar
        exclude_user_id: ID do usuário para excluir da emissão
    """
    room_name = f"chat_{chat_id}"
    skip_sid = user_sessions.get(exclude_user_id) if exclude_user_id else None
    socket.emit(event, data, room=room_name, skip_sid=skip_sid)
    print(f"Evento '{event}' enviado para chat {chat_id}")

def emit_user_status(user_id, status):
    """
    Emite status do usuário para todos os usuários conectados.
    
    Args:
        user_id: ID do usuário que mudou status
        status: Novo status ('online', 'away', 'busy', 'offline')
    """
    # Emitir para todos os usuários conectados
    for connected_user_id, session_id in user_sessions.items():
        if connected_user_id != user_id:  # Não enviar para o próprio usuário
            socket.emit('user_status_changed', {
                'user_id': user_id,
                'status': status
            }, room=session_id)
    print(f"Status '{status}' do usuário {user_id} enviado para todos os usuários conectados")

def get_online_users():
    """
    Retorna lista de usuários atualmente conectados.
    
    Returns:
        list: Lista de IDs de usuários online
    """
    return list(user_sessions.keys())

def is_user_online(user_id):
    """
    Verifica se um usuário específico está online.
    
    Args:
        user_id: ID do usuário para verificar
        
    Returns:
        bool: True se o usuário estiver online
    """
    return user_id in user_sessions

# Adicionar métodos ao objeto socket
socket.emit_to_user = emit_to_user
socket.emit_to_chat = emit_to_chat
socket.emit_user_status = emit_user_status
socket.get_online_users = get_online_users
socket.is_user_online = is_user_online