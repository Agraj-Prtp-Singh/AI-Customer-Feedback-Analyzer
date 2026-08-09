import json
import os
from datetime import datetime

import requests

from services.ai.errors import AIProviderError
from services.sla import add_working_days


def get_nps_category(score):
    if score >= 9:
        return "Promoter"
    elif score >= 7:
        return "Passive"
    else:
        return "Detractor"


def create_follow_up_task(score, feedback):
    if score <= 6:
        created_at = datetime.utcnow()
        due_at = add_working_days(created_at, 2)

        return {
            "follow_up_required": True,
            "status": "Pending",
            "task": "Contact customer regarding negative feedback",
            "created_at": created_at,
            "due_at": due_at,
            "sla": "2 working days",
        }

    return {
        "follow_up_required": False,
        "status": "Not Required",
        "task": None,
        "created_at": None,
        "due_at": None,
        "sla": None,
    }


def _cleanup_ai_content(content):
    if not isinstance(content, str):
        return ""

    text = content.strip()

    if text.startswith("```") and text.endswith("```"):
        text = text[3:-3].strip()

        if text.lower().startswith("json"):
            text = text[text.find("\n") + 1 :].strip()

    return text


def _extract_json_payload(text):
    text = _cleanup_ai_content(text)

    if text.startswith("{") and text.endswith("}"):
        return text

    start = text.find("{")
    end = text.rfind("}")

    if start != -1 and end != -1 and end > start:
        return text[start : end + 1].strip()

    return text


def analyze_feedback(score, feedback):
    nps_category = get_nps_category(score)

    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        raise AIProviderError(
            503,
            "AI analysis is unavailable because OpenRouter is not configured.",
        )

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "openrouter/free",
                "messages": [
                    {
                        "role": "user",
                        "content": f"""
Analyze the following customer feedback:

"{feedback}"

Return ONLY valid JSON.

Use exactly these fields:

{{
    "language": "detected language of the feedback",
    "sentiment": "positive, neutral, or negative",
    "theme": "main issue category",
    "root_cause": "underlying reason for the problem",
    "priority": "low, medium, or high"
}}

Detect the language of the customer's feedback.

Write the language name in English, such as
"English", "French", "German", "Spanish", etc.

Analyze the feedback regardless of which language it is written in.

Do not include any explanation outside the JSON.
""",
                    }
                ],
            },
            timeout=30,
        )

    except requests.RequestException as e:
        raise AIProviderError(
            502,
            "The AI analysis service is unavailable. Please try again later.",
        ) from e

    try:
        data = response.json()

    except ValueError as e:
        raise AIProviderError(
            502,
            "The AI analysis service returned an invalid response.",
        ) from e

    if response.status_code != 200:
        if response.status_code == 429:
            raise AIProviderError(
                429,
                "AI request limit reached. Add OpenRouter credits or wait for the quota to reset.",
            )

        raise AIProviderError(
            502,
            "The AI analysis service could not process this request.",
        )

    content = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
    )

    cleaned_content = _extract_json_payload(content)

    print("AI RESPONSE:")
    print(repr(content))

    if not cleaned_content:
        raise Exception(
            f"AI returned empty JSON response; "
            f"raw content: {repr(content)}"
        )

    try:
        analysis = json.loads(cleaned_content)

    except json.JSONDecodeError:
        print("INVALID JSON FROM AI:")
        print(repr(content))

        print("CLEANED JSON ATTEMPT:")
        print(repr(cleaned_content))

        raise Exception(
            f"AI returned invalid JSON: {repr(cleaned_content)}"
        )

    follow_up = create_follow_up_task(score, feedback)

    result = {
        "score": score,
        "feedback": feedback,
        "nps_category": nps_category,
        "language": analysis["language"],
        "sentiment": analysis["sentiment"],
        "theme": analysis["theme"],
        "root_cause": analysis["root_cause"],
        "priority": analysis["priority"],
        "follow_up": follow_up,
    }

    return result
