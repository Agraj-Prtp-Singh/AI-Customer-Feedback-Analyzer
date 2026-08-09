from services.database import feedback_collection


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