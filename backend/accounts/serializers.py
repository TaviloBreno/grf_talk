from rest_framework import serializers
from django.conf import settings
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer para o modelo User."""
    
    class Meta:
        model = User
        fields = ['id', 'avatar', 'name', 'email', 'last_access']
    
    def to_representation(self, instance):
        """Sobrescreve o método para concatenar CURRENT_URL ao avatar."""
        representation = super().to_representation(instance)
        
        # Concatena settings.CURRENT_URL com o avatar para criar a URL completa
        if representation['avatar']:
            representation['avatar'] = settings.CURRENT_URL + representation['avatar']
        
        return representation