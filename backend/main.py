from fastapi import FastAPI
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from services.ai_analyzer import analyze_feedback
from services.database import feedback_collection
from services.analytics import get_analytics

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

    return get_analytics()