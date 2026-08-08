from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv

from services.ai_analyzer import analyze_feedback

load_dotenv()

app = FastAPI()


class FeedbackRequest(BaseModel):
    score: int
    feedback: str


@app.get("/")
def home():
    return {"message": "AI Customer Feedback Analyzer API is running"}


@app.post("/analyze")
def analyze(data: FeedbackRequest):

    result = analyze_feedback(
        data.score,
        data.feedback
    )

    return result