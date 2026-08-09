from fastapi import FastAPI
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from services.ai_analyzer import analyze_feedback
from services.database import feedback_collection

load_dotenv()

app = FastAPI()


class FeedbackRequest(BaseModel):
    score: int = Field(..., ge=0, le=10)
    feedback: str = Field(..., min_length=5)


@app.get("/")
def home():
    return {
        "message": "AI Customer Feedback Analyzer API is running"
    }


@app.post("/analyze")
def analyze(data: FeedbackRequest):

    result = analyze_feedback(
        data.score,
        data.feedback
    )

    db_result = feedback_collection.insert_one(result.copy())

    result_with_id = {
        **result,
        "id": str(db_result.inserted_id)
    }

    return result_with_id


@app.get("/feedback")
def get_feedback():

    feedback = list(feedback_collection.find().sort("created_at", -1))

    for item in feedback:
        item["id"] = str(item["_id"])
        del item["_id"]

    return feedback

@app.get("/analytics")
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
        if item["sentiment"] == "positive":
            positive += 1

        elif item["sentiment"] == "neutral":
            neutral += 1

        elif item["sentiment"] == "negative":
            negative += 1

        # Follow-up
        if item["follow_up"]["follow_up_required"]:
            follow_ups += 1

        # Themes
        theme = item["theme"]

        if theme in themes:
            themes[theme] += 1
        else:
            themes[theme] = 1

    if total_responses > 0:
        promoter_percentage = (promoters / total_responses) * 100
        detractor_percentage = (detractors / total_responses) * 100

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