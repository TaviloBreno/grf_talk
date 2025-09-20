from rest_framework import serializers
from django.conf import settings
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer para o modelo User."""
    
    avatar_url = serializers.SerializerMethodField()
    initials = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'avatar', 'avatar_url', 'initials', 'name', 'email', 'last_access']
    
    def get_avatar_url(self, obj):
        """Retorna URL completa do avatar."""
        request = self.context.get('request')
        return obj.get_avatar_url(request)
    
    def get_initials(self, obj):
        """Retorna iniciais do usuário."""
        return obj.get_initials()
    
    def to_representation(self, instance):
        """Sobrescreve o método para incluir informações de avatar."""
        representation = super().to_representation(instance)
        
        # Manter compatibilidade - avatar padrão
        if representation['avatar'] == '/media/avatars/default-avatar.png':
            representation['avatar'] = representation['avatar_url']
        else:
            # Concatena settings.CURRENT_URL com o avatar customizado
            if representation['avatar'] and not representation['avatar'].startswith('http'):
                representation['avatar'] = settings.CURRENT_URL + representation['avatar']
        
        return representation