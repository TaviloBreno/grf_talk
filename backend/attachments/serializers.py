from rest_framework import serializers
from django.conf import settings
from .models import FileAttachment, AudioAttachment
from .utils.format import Format


class FileAttachmentSerializer(serializers.ModelSerializer):
    """Serializer para o modelo FileAttachment."""
    
    class Meta:
        model = FileAttachment
        fields = "__all__"
    
    def to_representation(self, instance):
        """Sobrescreve o método para formatar size e concatenar URL ao src."""
        representation = super().to_representation(instance)
        
        # Converter size usando Format.format_bytes
        representation['size'] = Format.format_bytes(int(instance.size))
        
        # Concatenar settings.CURRENT_URL com instance.src
        if representation['src']:
            representation['src'] = settings.CURRENT_URL + representation['src']
        
        return representation


class AudioAttachmentSerializer(serializers.ModelSerializer):
    """Serializer para o modelo AudioAttachment."""
    
    class Meta:
        model = AudioAttachment
        fields = "__all__"
    
    def to_representation(self, instance):
        """Sobrescreve o método para concatenar URL ao src."""
        representation = super().to_representation(instance)
        
        # Concatenar settings.CURRENT_URL com instance.src
        if representation['src']:
            representation['src'] = settings.CURRENT_URL + representation['src']
        
        return representation