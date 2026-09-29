"""
ASGI config for core_config project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from .middleware import TokenAuthMiddleware
import core.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_config.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": TokenAuthMiddleware(AuthMiddlewareStack(
        URLRouter(
            core.routing.websocket_urlpatterns
        )
    )),
})
