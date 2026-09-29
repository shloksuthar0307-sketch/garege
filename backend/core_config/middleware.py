import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_config.settings')
django.setup()

from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model
from urllib.parse import parse_qs

User = get_user_model()

@database_sync_to_async
def get_user(token_key):
    try:
        UntypedToken(token_key)
        from rest_framework_simplejwt.authentication import JWTAuthentication
        jwt_authentication = JWTAuthentication()
        validated_token = jwt_authentication.get_validated_token(token_key)
        user = jwt_authentication.get_user(validated_token)
        return user
    except (InvalidToken, TokenError, Exception):
        return AnonymousUser()

class TokenAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)

    async def __call__(self, scope, receive, send):
        try:
            query_string = scope.get('query_string', b'').decode()
            query_params = parse_qs(query_string)
            token_key = query_params.get('token')
            if token_key:
                scope['user'] = await get_user(token_key[0])
            else:
                scope['user'] = AnonymousUser()
        except Exception:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)
