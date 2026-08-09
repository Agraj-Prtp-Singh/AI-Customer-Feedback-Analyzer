import { useEffect, useState } from "react";
import { AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";
import api from "../services/api";

export default function AIInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await api.get("/ai-insights");
        setInsights(response.data);
      } catch (error) {
        console.error("Error fetching AI insights:", error);
        setError("Failed to load AI insights.");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          AI is analyzing customer feedback...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-gray-100 p-2">
          <TrendingUp size={20} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            AI Customer Insights
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            AI-generated analysis of recurring customer problems
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <div className="flex items-start gap-3">
          <Lightbulb size={18} className="mt-0.5 shrink-0 text-gray-600" />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Overall Summary
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-800">
              {insights.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Key Issues */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-900">
          Key Customer Issues
        </h3>

        <div className="mt-4 space-y-4">
          {insights.key_issues?.map((issue, index) => (
            <div key={index} className="rounded-lg border border-gray-200 p-5">
              {/* Issue Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{issue.theme}</h4>

                  <p className="mt-1 text-sm text-gray-500">
                    {issue.complaint_count} customer complaint
                    {issue.complaint_count !== 1 ? "s" : ""}
                  </p>
                </div>

                <AlertTriangle size={18} className="shrink-0 text-gray-500" />
              </div>

              {/* Root Cause */}
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Root Cause
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-800">
                  {issue.root_cause}
                </p>
              </div>

              {/* Impact */}
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Business Impact
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-800">
                  {issue.impact}
                </p>
              </div>

              {/* Recommendation */}
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb
                    size={16}
                    className="mt-0.5 shrink-0 text-gray-600"
                  />

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Recommended Action
                    </p>

                    <p className="mt-1 text-sm leading-6 text-gray-800">
                      {issue.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
