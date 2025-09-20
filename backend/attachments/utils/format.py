class Format:
    """Classe utilitária para formatação de dados."""
    
    @staticmethod
    def format_bytes(bytes: int) -> str:
        """
        Formata bytes para uma representação legível (B, KB, MB, GB, TB).
        
        Args:
            bytes (int): Número de bytes a serem formatados
            
        Returns:
            str: String formatada (ex.: "12.5 MB")
        """
        if bytes == 0:
            return "0 B"
        
        suffixes = ["B", "KB", "MB", "GB", "TB"]
        suffix_index = 0
        size = float(bytes)
        
        while size >= 1024 and suffix_index < len(suffixes) - 1:
            size /= 1024
            suffix_index += 1
        
        # Formatar com 1 casa decimal se necessário
        if size == int(size):
            return f"{int(size)} {suffixes[suffix_index]}"
        else:
            return f"{size:.1f} {suffixes[suffix_index]}"