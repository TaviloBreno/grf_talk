"""
Sistema de eventos em tempo real usando Server-Sent Events (SSE)
"""
import json
import time
from threading import Lock
from django.http import StreamingHttpResponse
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

# Store para eventos pendentes por usuário
user_events = {}
user_events_lock = Lock()

# Rate limiting - track last poll time per user
user_last_poll = {}
user_poll_lock = Lock()

# Minimum interval between polls (in seconds)
MIN_POLL_INTERVAL = 1.0

def add_user_event(user_id, event_type, data):
    """Adiciona um evento para um usuário específico"""
    with user_events_lock:
        if user_id not in user_events:
            user_events[user_id] = []
        
        event = {
            'type': event_type,
            'data': data,
            'timestamp': time.time()
        }
        
        user_events[user_id].append(event)
        
        # Limitar a 50 eventos por usuário para evitar memory leak
        if len(user_events[user_id]) > 50:
            user_events[user_id] = user_events[user_id][-50:]

def get_user_events(user_id, since_timestamp=None):
    """Retorna eventos para um usuário desde um timestamp específico"""
    with user_events_lock:
        if user_id not in user_events:
            return []
        
        events = user_events[user_id]
        
        if since_timestamp:
            events = [e for e in events if e['timestamp'] > since_timestamp]
        
        return events

def clear_user_events(user_id, before_timestamp):
    """Limpa eventos antigos para um usuário"""
    with user_events_lock:
        if user_id in user_events:
            user_events[user_id] = [
                e for e in user_events[user_id] 
                if e['timestamp'] >= before_timestamp
            ]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def poll_events(request):
    """Endpoint para polling de eventos com rate limiting"""
    user_id = request.user.id
    current_time = time.time()
    
    # Rate limiting check
    with user_poll_lock:
        last_poll = user_last_poll.get(user_id, 0)
        time_since_last_poll = current_time - last_poll
        
        if time_since_last_poll < MIN_POLL_INTERVAL:
            # Too frequent - return rate limit error
            return Response({
                'error': 'Rate limit exceeded',
                'message': f'Please wait {MIN_POLL_INTERVAL - time_since_last_poll:.1f} seconds',
                'retry_after': MIN_POLL_INTERVAL - time_since_last_poll
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Update last poll time
        user_last_poll[user_id] = current_time
    
    since = request.GET.get('since')
    since_timestamp = float(since) if since else None
    
    events = get_user_events(user_id, since_timestamp)
    
    # Limpar eventos mais antigos que 5 minutos
    cutoff_time = current_time - 300
    clear_user_events(user_id, cutoff_time)
    
    return Response({
        'events': events,
        'timestamp': current_time
    })

# Funções de conveniência para emitir eventos
def emit_new_message(user_id, message_data, chat_id):
    """Emite evento de nova mensagem"""
    add_user_event(user_id, 'new_message', {
        'message': message_data,
        'chat_id': chat_id
    })

def emit_message_updated(user_id, message_data, chat_id):
    """Emite evento de mensagem atualizada"""
    add_user_event(user_id, 'message_updated', {
        'message': message_data,
        'chat_id': chat_id
    })

def emit_message_deleted(user_id, message_id, chat_id):
    """Emite evento de mensagem deletada"""
    add_user_event(user_id, 'message_deleted', {
        'message_id': message_id,
        'chat_id': chat_id
    })

def emit_chat_updated(user_id, chat_data):
    """Emite evento de chat atualizado"""
    add_user_event(user_id, 'chat_updated', {
        'chat': chat_data
    })