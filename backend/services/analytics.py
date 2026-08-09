from services.database import feedback_collection
from collections import defaultdict
from datetime import datetime



def get_analytics():

    feedback = list(feedback_collection.find())

    total_responses = len(feedback)

    promoters = 0
    passives = 0
    detractors = 0

    positive = 0
    neutral = 0
    negative = 0

    follow_ups = 0

    themes = {}

    for item in feedback:

        # NPS categories
        if item["nps_category"] == "Promoter":
            promoters += 1

        elif item["nps_category"] == "Passive":
            passives += 1

        elif item["nps_category"] == "Detractor":
            detractors += 1

        # Sentiment
        sentiment = item["sentiment"].strip().lower()

        if sentiment == "positive":
            positive += 1

        elif sentiment == "neutral":
            neutral += 1

        elif sentiment == "negative":
            negative += 1

        # Follow-up
        if item["follow_up"]["follow_up_required"]:
            follow_ups += 1

        # Themes
        theme = item["theme"].strip().lower()

        if theme in themes:
            themes[theme] += 1
        else:
            themes[theme] = 1

    if total_responses > 0:

        promoter_percentage = (
            promoters / total_responses
        ) * 100

        detractor_percentage = (
            detractors / total_responses
        ) * 100

        nps = promoter_percentage - detractor_percentage

    else:
        nps = 0

    return {
        "total_responses": total_responses,
        "promoters": promoters,
        "passives": passives,
        "detractors": detractors,
        "nps": round(nps, 2),
        "sentiment": {
            "positive": positive,
            "neutral": neutral,
            "negative": negative
        },
        "themes": themes,
        "follow_ups_required": follow_ups
    }




def get_nps_trend():

    feedback = list(
        feedback_collection.find(
            {},
            {
                "_id": 0,
                "score": 1,
                "created_at": 1
            }
        )
    )

    monthly_data = defaultdict(list)

    for item in feedback:

        score = item.get("score")
        created_at = item.get("created_at")

        if score is None or created_at is None:
            continue

        # Convert string dates into datetime objects
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(
                created_at.replace("Z", "+00:00")
            )

        month = created_at.strftime("%Y-%m")

        monthly_data[month].append(score)

    trend = []

    for month, scores in sorted(monthly_data.items()):

        total = len(scores)

        promoters = sum(score >= 9 for score in scores)
        detractors = sum(score <= 6 for score in scores)

        nps = round(
            ((promoters / total) * 100)
            -
            ((detractors / total) * 100)
        )

        trend.append({
            "month": month,
            "nps": nps,
            "responses": total
        })

    return trend