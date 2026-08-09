import requests
import os
import json
from datetime import datetime, timedelta
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
            "sla": "2 working days"
        }

    return {
        "follow_up_required": False,
        "status": "Not Required",
        "task": None,
        "created_at": None,
        "due_at": None,
        "sla": None
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
        raise Exception("OPENROUTER_API_KEY is not configured")

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
                    Write the language name in English, such as "English", "French", "German", "Spanish", etc.

                    Analyze the feedback regardless of which language it is written in.

                    Do not include any explanation outside the JSON.   
                    """
                }
            ]
        }
    )

    try:
        data = response.json()
    except ValueError:
        raise Exception(
            f"OpenRouter returned non-JSON response (status {response.status_code}): {response.text!r}"
        )

    if response.status_code != 200:
        raise Exception(
            f"OpenRouter API error ({response.status_code}): {data.get('error', {}).get('message', response.text)}"
        )

    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
    cleaned_content = _extract_json_payload(content)

    print("AI RESPONSE:")
    print(repr(content))

    if not cleaned_content:
        raise Exception(
            f"AI returned empty JSON response; raw content: {repr(content)}"
        )

    try:
        analysis = json.loads(cleaned_content)
    except json.JSONDecodeError:
        print("INVALID JSON FROM AI:")
        print(repr(content))
        print("CLEANED JSON ATTEMPT:")
        print(repr(cleaned_content))
        raise Exception(f"AI returned invalid JSON: {repr(cleaned_content)}")

    follow_up = create_follow_up_task(score, feedback)

    result = {
        "score": score,
        "nps_category": nps_category,
        "language": analysis["language"],
        "sentiment": analysis["sentiment"],
        "theme": analysis["theme"],
        "root_cause": analysis["root_cause"],
        "priority": analysis["priority"],
        "follow_up": follow_up
    }
    return result