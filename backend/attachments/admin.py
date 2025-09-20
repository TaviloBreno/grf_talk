from django.contrib import admin
from .models import FileAttachment, AudioAttachment

# Register your models here.
admin.site.register(FileAttachment)
admin.site.register(AudioAttachment)
