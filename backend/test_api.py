import requests
from dotenv import load_dotenv
import os
import json

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
                Analyze the following customer feedback:

                "The delivery was two weeks late and nobody from our account
                team responded to my emails."

                Return ONLY valid JSON.

                Use exactly these fields:

                {
                    "sentiment": "positive, neutral, or negative",
                    "theme": "main issue category",
                    "root_cause": "underlying reason for the problem",
                    "priority": "low, medium, or high"
                }

                Do not include any explanation outside the JSON.
                """
            }
        ]
    }
)

data = response.json()

content = data["choices"][0]["message"]["content"]

analysis = json.loads(content)

print(analysis)