from rest_framework.exceptions import APIException


class UserNotFound(APIException):
    """Exception para usuário não encontrado."""
    status_code = 404
    default_detail = 'Usuário não encontrado'
    default_code = 'user_not_found'


class ChatNotFound(APIException):
    """Exception para chat não encontrado ou que não pertence ao usuário."""
    status_code = 404
    default_detail = 'Chat não encontrado ou não pertence ao usuário'
    default_code = 'chat_not_found'