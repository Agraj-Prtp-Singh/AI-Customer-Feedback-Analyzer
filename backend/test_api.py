import requests
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")

response = requests.post(
    "https://openrouter.ai/api/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    },
    json={
        "model": "openrouter/free",
        "messages": [
            {
                "role": "user",
                "content": """
Analyze this customer feedback:

"The delivery was two weeks late and nobody from our account
team responded to my emails."

Tell me:

1. Sentiment
2. Main theme
3. Root cause
4. Priority
"""
            }
        ]
    }
)

data = response.json()

print(data["choices"][0]["message"]["content"])