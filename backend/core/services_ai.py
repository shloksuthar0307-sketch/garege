import os
import json
import uuid
import base64
from io import BytesIO
from PIL import Image
from django.conf import settings
from .models import AIUsageLog

class AIInspectionService:
    def __init__(self, provider=None):
        self.provider = provider or os.getenv('AI_PROVIDER', 'gemini').lower()
        self.api_key = os.getenv('AI_API_KEY')
        self.model_name = os.getenv('AI_MODEL', 'gemini-3.5-flash')
        
    def _get_image_base64(self, image_field):
        image = Image.open(image_field)
        
        # Optimize image
        max_size = int(os.getenv('AI_MAX_IMAGE_SIZE', '1024'))
        image.thumbnail((max_size, max_size))
        
        buffered = BytesIO()
        image.save(buffered, format="JPEG", quality=85)
        return base64.b64encode(buffered.getvalue()).decode('utf-8')
        
    def analyze_vehicle_damage(self, photo, user=None):
        if not self.api_key:
            raise Exception("AI API Key not configured. AI_API_KEY environment variable is required.")
            
        b64_img = self._get_image_base64(photo.image)
        
        prompt = """
        Analyze this vehicle image and provide structured JSON output for damage inspection.
        Identify any scratches, dents, cracks, missing components, or other damage.
        
        Output MUST be valid JSON matching this schema:
        {
          "vehicle_area": "Name of the vehicle part (e.g. Front Bumper, Left Door)",
          "issues": [
            {
              "type": "Scratch/Dent/Crack/etc",
              "severity": "low/medium/high/critical",
              "confidence": 0.95,
              "description": "Detailed description of the issue",
              "recommended_action": "What needs to be done",
              "estimated_priority": "low/medium/high"
            }
          ],
          "overall_condition": "Needs Repair or Good Condition"
        }
        """
        
        result_json = None
        
        if self.provider == 'gemini':
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(self.model_name)
            
            try:
                # Constructing the parts
                response = model.generate_content([
                    prompt,
                    {"mime_type": "image/jpeg", "data": b64_img}
                ])
                text = response.text
                if text.startswith('```json'):
                    text = text[7:-3]
                elif text.startswith('```'):
                    text = text[3:-3]
                result_json = json.loads(text.strip())
            except Exception as e:
                raise Exception(f"AI provider failed: {str(e)}")
        
        elif self.provider == 'openai':
            import requests
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            payload = {
                "model": self.model_name,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_img}"}}
                        ]
                    }
                ],
                "response_format": { "type": "json_object" }
            }
            response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=int(os.getenv('AI_TIMEOUT', '30')))
            response.raise_for_status()
            result_json = json.loads(response.json()['choices'][0]['message']['content'])
            
        else:
            raise Exception(f"Unsupported AI provider: {self.provider}")
            
        # Log usage
        if user:
            AIUsageLog.objects.create(
                user=user,
                vehicle=photo.vehicle,
                provider=self.provider,
                model_name=self.model_name,
                processing_status='COMPLETED'
            )
            
        return result_json
