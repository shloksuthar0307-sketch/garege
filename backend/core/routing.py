from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/advisor/$', consumers.AdvisorConsumer.as_asgi()),
    re_path(r'ws/technician/$', consumers.TechnicianConsumer.as_asgi()),
    re_path(r'ws/customer/(?P<customer_id>[0-9a-f-]+)/$', consumers.CustomerConsumer.as_asgi()),
]
