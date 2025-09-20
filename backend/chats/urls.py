from django.urls import path
from .views import ChatsView, ChatView, ChatMessagesView, ChatMessageView

urlpatterns = [
    path('', ChatsView.as_view(), name='chats'),
    path('<int:pk>/', ChatView.as_view(), name='chat-detail'),
    path('<int:chat_id>/messages/', ChatMessagesView.as_view(), name='chat-messages'),
    path('<int:chat_id>/messages/<int:message_id>/', ChatMessageView.as_view(), name='chat-message'),
]