from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from services.ai_analyzer import analyze_feedback
from services.ai.errors import AIProviderError
from services.database import feedback_collection
from services.analytics import get_analytics, get_nps_trend
from services.sla import get_follow_up_status
from services.ai.insights import (
    get_feedback_for_insights,
    generate_ai_insights
)


load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FeedbackRequest(BaseModel):
    score: int = Field(..., ge=0, le=10)
    feedback: str = Field(..., min_length=5, max_length=2000)


@app.get("/")
def home():
    return {
        "message": "AI Customer Feedback Analyzer API is running"
    }


@app.post("/analyze")
def analyze(data: FeedbackRequest):

    try:
        result = analyze_feedback(
            data.score,
            data.feedback
        )

        insert_result = feedback_collection.insert_one(
            result.copy()
        )

        result_with_id = {
            **result,
            "id": str(insert_result.inserted_id)
        }

        return result_with_id

    except AIProviderError as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        )

    except Exception as e:
        print(f"Analysis error: {e}")

        raise HTTPException(
            status_code=500,
            detail="Failed to analyze feedback"
        )


@app.get("/feedback")
def get_feedback():

    feedback = list(
        feedback_collection
        .find()
        .sort("_id", -1)
        .limit(10)
    )

    for item in feedback:

        item["id"] = str(item["_id"])
        del item["_id"]

        if "follow_up" in item:
            item["follow_up"]["status"] = get_follow_up_status(
                item["follow_up"]
            )

    return feedback

@app.patch("/feedback/{feedback_id}/follow-up")
def complete_follow_up(feedback_id: str):

    try:
        object_id = ObjectId(feedback_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid feedback ID"
        )

    feedback = feedback_collection.find_one({
        "_id": object_id
    })

    if not feedback:
        raise HTTPException(
            status_code=404,
            detail="Feedback not found"
        )

    if not feedback.get("follow_up", {}).get("follow_up_required"):
        raise HTTPException(
            status_code=400,
            detail="This feedback does not require follow-up"
        )

    result = feedback_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "follow_up.status": "Completed"
            }
        }
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=400,
            detail="Follow-up could not be updated"
        )

    updated_feedback = feedback_collection.find_one({
        "_id": object_id
    })

    updated_feedback["id"] = str(updated_feedback["_id"])
    del updated_feedback["_id"]

    return updated_feedback

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

@app.get("/ai-insights")
def ai_insights():
    try:
        return generate_ai_insights()
    except AIProviderError as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        )
    except Exception as e:
        print(f"AI insights error: {e}")
        raise HTTPException(
            status_code=502,
            detail="Unable to generate AI insights. Please try again later."
        )

@app.get("/analytics/trend")
def analytics_trend():
    return get_nps_trend()


@app.delete("/feedback/{feedback_id}")
def delete_feedback(feedback_id: str):
    try:
        object_id = ObjectId(feedback_id)
    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail="Invalid feedback ID"
        )

    result = feedback_collection.delete_one(
        {"_id": object_id}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Feedback not found"
        )

    return {
        "message": "Feedback deleted successfully"
    }
