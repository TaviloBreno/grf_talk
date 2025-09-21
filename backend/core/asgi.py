"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
import django
from django.core.asgi import get_asgi_application

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# Import after Django setup
import socketio
from .socket import socket

# Get Django ASGI application
django_asgi_app = get_asgi_application()

# Combine Django ASGI application with Socket.IO
application = socketio.ASGIApp(socket, django_asgi_app)
