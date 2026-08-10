# AI Customer Feedback Analyzer

A full-stack dashboard for collecting customer NPS feedback, using AI to identify themes and sentiment, and tracking the follow-up work created from negative responses.

## Features

- Submit NPS scores and customer feedback for AI analysis.
- Classify feedback by language, sentiment, theme, root cause, and priority.
- View response totals, NPS, sentiment distribution, themes, and NPS trends.
- Browse, filter, view, and delete saved feedback.
- Track follow-up tasks for detractor feedback, including SLA status.
- Generate AI summaries of recurring customer issues.
- Navigate between the dashboard, feedback history, and follow-up management from a responsive sidebar.

## Tech stack

- Frontend: React, Vite, Tailwind CSS, Axios, Recharts, Lucide React
- Backend: FastAPI, PyMongo, Requests, python-dotenv
- Database: MongoDB
- AI provider: OpenRouter

## Prerequisites

- Node.js 18 or later
- Python 3.10 or later
- A MongoDB connection string
- An OpenRouter API key with available model quota or credits

## Setup

### 1. Configure the backend

Create `backend/.env` with your credentials:

```env
MONGODB_URI=mongodb://localhost:27017
OPENROUTER_API_KEY=your_openrouter_api_key
```

Install the Python dependencies and start the API:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install fastapi "uvicorn[standard]" pymongo python-dotenv requests
uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

### 2. Start the frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | API health message |
| `POST` | `/analyze` | Analyze and save customer feedback |
| `GET` | `/feedback` | Return the most recent feedback items |
| `DELETE` | `/feedback/{feedback_id}` | Delete a feedback item |
| `PATCH` | `/feedback/{feedback_id}/follow-up` | Update a feedback follow-up |
| `GET` | `/analytics` | Return dashboard metrics |
| `GET` | `/analytics/trend` | Return NPS trend data |
| `GET` | `/ai-insights` | Generate recurring-issue insights |

## AI provider limits

The app uses OpenRouter's free-model route. If its quota is exhausted, the API returns HTTP `429` with a clear message. Add OpenRouter credits or wait for the quota to reset before making new AI analysis or insight requests.

## Verification

Build the frontend for production:

```powershell
cd frontend
npm run build
```

## Project structure

```text
backend/
  main.py                    # FastAPI routes
  services/                  # Database, analytics, SLA, and AI services
frontend/
  src/components/            # Dashboard and reusable React components
  src/services/api.js        # Axios API client
```
