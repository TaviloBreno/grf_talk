# Implementação temporária para substituir o socket que tem incompatibilidade com Python 3.13
# Esta é apenas uma solução temporária para focar no sistema de autenticação

class TemporarySocket:
    """Socket temporário que não faz nada para evitar erros de compatibilidade"""
    
    def emit_to_user(self, user_id, event, data):
        """Método temporário que apenas registra a tentativa de emissão"""
        print(f"[SOCKET TEMP] Emitindo evento '{event}' para usuário {user_id}: {data}")
        # No futuro, implementar a lógica real do socket aqui
        pass
    
    def emit(self, event, data):
        """Método temporário para emissão geral"""
        print(f"[SOCKET TEMP] Emitindo evento '{event}': {data}")
        pass

# Instância temporária do socket
socket = TemporarySocket()