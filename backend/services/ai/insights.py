import requests
import os
import json

from services.database import feedback_collection
from services.ai.errors import AIProviderError


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
def parse_ai_json(content):
    content = content.strip()

    # Remove Markdown code fences if the AI adds them
    if content.startswith("```"):
        lines = content.splitlines()

        # Remove first line: ```json or ```
        lines = lines[1:]

        # Remove final ```
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]

        content = "\n".join(lines).strip()

    try:
        return json.loads(content)

    except json.JSONDecodeError:
        raise Exception(
            f"AI returned invalid JSON:\n{content}"
        )

def generate_ai_insights():
    feedback = get_feedback_for_insights()

    if not feedback:
        return {
            "summary": "There is not enough customer feedback to generate insights.",
            "key_issues": []
        }

    feedback_text = json.dumps(feedback, indent=2)

    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        raise AIProviderError(
            503,
            "AI insights are unavailable because OpenRouter is not configured.",
        )

    try:
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
            },
            timeout=30,
        )
    except requests.RequestException as e:
        raise AIProviderError(
            502,
            "The AI insights service is unavailable. Please try again later.",
        ) from e

    try:
        data = response.json()
    except ValueError as e:
        raise AIProviderError(
            502,
            "The AI insights service returned an invalid response.",
        ) from e

    if response.status_code != 200:
        if response.status_code == 429:
            raise AIProviderError(
                429,
                "AI request limit reached. Add OpenRouter credits or wait for the quota to reset.",
            )

        raise AIProviderError(
            502,
            "The AI insights service could not process this request.",
        )

    content = data["choices"][0]["message"]["content"]
    return parse_ai_json(content)

