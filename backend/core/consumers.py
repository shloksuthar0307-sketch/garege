import json
from channels.generic.websocket import AsyncWebsocketConsumer

class AdvisorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        if not user or not user.is_authenticated or user.role not in ['SERVICE_ADVISOR', 'BRANCH_MANAGER', 'SUPER_ADMIN']:
            await self.close()
            return
        
        self.room_group_name = 'advisor_updates'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def send_update(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message,
            'type': event.get('update_type', 'GENERAL')
        }))

    async def chat_message(self, event):
        data = event['data']
        await self.send(text_data=json.dumps({
            'message': f"New message from {data.get('sender', {}).get('first_name', 'Customer')}",
            'type': 'NEW_MESSAGE',
            'payload': data
        }))

class TechnicianConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        if not user or not user.is_authenticated or user.role not in ['TECHNICIAN', 'BRANCH_MANAGER', 'SUPER_ADMIN']:
            await self.close()
            return
            
        self.room_group_name = 'technician_updates'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def send_update(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message,
            'type': event.get('update_type', 'GENERAL')
        }))

class CustomerConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.customer_id = self.scope['url_route']['kwargs']['customer_id']
        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.close()
            return
            
        # Verify ownership
        if user.role == 'CUSTOMER' and str(user.id) != str(self.customer_id):
            await self.close()
            return
            
        self.room_group_name = f'customer_updates_{self.customer_id}'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def send_update(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message,
            'type': event.get('update_type', 'GENERAL')
        }))

    async def chat_message(self, event):
        data = event['data']
        await self.send(text_data=json.dumps({
            'message': f"New message from {data.get('sender', {}).get('first_name', 'Advisor')}",
            'type': 'NEW_MESSAGE',
            'payload': data
        }))
