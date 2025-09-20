from rest_framework.exceptions import APIException


class ValidationError(APIException):
    """Exception customizada para erros de validação."""
    status_code = 400
    default_detail = 'Parâmetros inválidos para a requisição'
    default_code = 'validation_error'