import requests
import os
import json


def get_nps_category(score):
    if score >= 9:
        return "Promoter"
    elif score >= 7:
        return "Passive"
    else:
        return "Detractor"


def create_follow_up_task(score, feedback):
    if score <= 6:
        return {
            "follow_up_required": True,
            "task": "Contact customer regarding negative feedback",
            "sla": "2 working days"
        }

    return {
        "follow_up_required": False,
        "task": None,
        "sla": None
    }
     

def analyze_feedback(score, feedback):

    nps_category = get_nps_category(score)

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
                    Analyze the following customer feedback:

                    "{feedback}"

                    Return ONLY valid JSON.

                    Use exactly these fields:

                    {{
                        "sentiment": "positive, neutral, or negative",
                        "theme": "main issue category",
                        "root_cause": "underlying reason for the problem",
                        "priority": "low, medium, or high"
                    }}

                    Do not include any explanation outside the JSON.
                    """
                }
            ]
        }
    )

    data = response.json()

    if response.status_code != 200:
            raise Exception(
        f"OpenRouter API error: {data.get('error', {}).get('message', 'Unknown error')}"
    )

    content = data["choices"][0]["message"]["content"]

    print("AI RESPONSE:")
    print(repr(content))

    try:
        analysis = json.loads(content)
    except json.JSONDecodeError:
        print("INVALID JSON FROM AI:")
        print(repr(content))
        raise Exception("AI returned invalid JSON")

    follow_up = create_follow_up_task(score, feedback)

    result = {
        "score": score,
        "nps_category": nps_category,
        "sentiment": analysis["sentiment"],
        "theme": analysis["theme"],
        "root_cause": analysis["root_cause"],
        "priority": analysis["priority"],
        "follow_up": follow_up
    }


    return result