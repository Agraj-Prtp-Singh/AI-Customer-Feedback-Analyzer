import requests
import os
import json

from services.database import feedback_collection


def get_feedback_for_insights():
    feedback = list(
        feedback_collection.find(
            {},
            {
                "_id": 0,
                "feedback": 1,
                "theme": 1,
                "root_cause": 1,
                "sentiment": 1,
                "priority": 1,
                "score": 1,
            }
        )
    )

    return feedback


def generate_ai_insights():
    feedback = get_feedback_for_insights()

    if not feedback:
        return {
            "summary": "There is not enough customer feedback to generate insights.",
            "key_issues": []
        }

    feedback_text = json.dumps(feedback, indent=2)

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
                    "content": f"""
Analyze the following customer feedback data.

{feedback_text}

Identify the most important recurring customer problems.

Return ONLY valid JSON using exactly this structure:

{{
    "summary": "A short overall summary of customer sentiment and major problems.",
    "key_issues": [
        {{
            "theme": "Main issue",
            "complaint_count": 0,
            "root_cause": "Likely underlying cause",
            "impact": "Business impact of this issue",
            "recommendation": "Recommended action"
        }}
    ]
}}

Include the 3 most important issues at most.

Do not include any explanation outside the JSON.
"""
                }
            ]
        }
    )

    data = response.json()

    if response.status_code != 200:
        raise Exception(
            f"OpenRouter API error: "
            f"{data.get('error', {}).get('message', 'Unknown error')}"
        )

    content = data["choices"][0]["message"]["content"]

    return json.loads(content)