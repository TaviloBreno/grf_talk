from django.db import models


class FileAttachment(models.Model):
    """Modelo para anexos de arquivos."""
    
    name = models.CharField(max_length=90)
    extension = models.CharField(max_length=15)
    size = models.FloatField()
    src = models.TextField()
    content_type = models.TextField()
    
    class Meta:
        db_table = "file_attachments"
    
    def __str__(self):
        return f"{self.name}.{self.extension}"


class AudioAttachment(models.Model):
    """Modelo para anexos de áudio."""
    
    src = models.TextField()
    
    class Meta:
        db_table = "audio_attachments"
    
    def __str__(self):
        return f"Audio: {self.src}"
