import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import api from "../services/api";

export default function FeedbackForm({ onAnalysisComplete }) {
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!score || !feedback) {
      setError("Please provide both an NPS score and feedback.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/analyze", {
        score: Number(score),
        feedback,
      });

      console.log("Analysis result:", response.data);

      onAnalysisComplete(response.data);

      setScore("");
      setFeedback("");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Something went wrong while analyzing the feedback.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Analyze Customer Feedback
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Enter an NPS score and customer feedback to analyze it with AI.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* NPS Score */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            NPS Score
          </label>

          <input
            type="number"
            min="0"
            max="10"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="0 - 10"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />

          <p className="mt-2 text-xs text-gray-500">
            0–6: Detractor · 7–8: Passive · 9–10: Promoter
          </p>
        </div>

        {/* Feedback */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Customer Feedback
          </label>

          <textarea
            rows="5"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter the customer's feedback..."
            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send size={18} />
              Analyze Feedback
            </>
          )}
        </button>
      </form>
    </div>
  );
}
