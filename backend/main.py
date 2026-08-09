from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from services.ai_analyzer import analyze_feedback
from services.database import feedback_collection
from services.analytics import get_analytics

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    feedback = list(
        feedback_collection
        .find({}, {"_id": 0})
        .sort("_id", -1)
        .limit(10)
    )

    return feedback

@app.get("/analytics")
def analytics():

    return get_analytics()

@app.patch("/feedback/{feedback_id}/follow-up")
def update_follow_up(feedback_id: str):
    from bson import ObjectId

    feedback = feedback_collection.find_one(
        {"_id": ObjectId(feedback_id)}
    )

    if not feedback:
        return {"error": "Feedback not found"}

    current_status = feedback.get("follow_up", {}).get(
        "status",
        "Pending"
    )

    new_status = (
        "Completed"
        if current_status == "Pending"
        else "Pending"
    )

    feedback_collection.update_one(
        {"_id": ObjectId(feedback_id)},
        {
            "$set": {
                "follow_up.status": new_status
            }
        }
    )

    return {
        "message": "Follow-up status updated",
        "status": new_status
    }