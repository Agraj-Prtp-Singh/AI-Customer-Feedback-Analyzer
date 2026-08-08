from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "AI Customer Feedback Analyzer API is running."}
