from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """Configuração do admin para o modelo User."""
    
    list_display = ('email', 'name', 'is_superuser', 'last_access')
    list_filter = ('is_superuser', 'last_access')
    search_fields = ('email', 'name')
    ordering = ('-last_access',)
    readonly_fields = ('last_access',)
    
    fieldsets = (
        (None, {
            'fields': ('email', 'password')
        }),
        ('Informações Pessoais', {
            'fields': ('name', 'avatar')
        }),
        ('Permissões', {
            'fields': ('is_superuser',)
        }),
        ('Informações Importantes', {
            'fields': ('last_access',)
        }),
    )
