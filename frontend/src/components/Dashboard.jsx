import { useEffect, useState } from "react";
import { BarChart3, AlertCircle } from "lucide-react";
import api from "../services/api";
import StatCard from "./StatCard";
import FeedbackForm from "./FeedbackForm";
import RecentFeedback from "./RecentFeedback";
import AIInsights from "./AiInsight";
import PageHeader from "./PageHeader";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [npsTrend, setNpsTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [recentFeedback, setRecentFeedback] = useState([]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/analytics");
      setAnalytics(response.data);

      const trendResponse = await api.get("/analytics/trend");
      setNpsTrend(trendResponse.data);

      const feedbackResponse = await api.get("/feedback");

      setRecentFeedback(feedbackResponse.data.slice(0, 5));
    } catch (err) {
      console.error(err);
      setError("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // The request resolves asynchronously; state is not updated during this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle size={20} />
          {error}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Customer Feedback Analytics"
          description="AI-powered NPS feedback analysis"
          icon={BarChart3}
        />

        {/* Feedback Form */}
        <div className="mb-8">
          <FeedbackForm
            onAnalysisComplete={() => {
              fetchAnalytics();
              setRefreshTrigger((prev) => prev + 1);
            }}
          />
        </div>

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Responses"
            value={analytics.total_responses}
            type="total"
          />

          <StatCard title="NPS Score" value={analytics.nps} type="nps" />

          <StatCard
            title="Promoters"
            value={analytics.promoters}
            type="promoters"
          />

          <StatCard
            title="Passives"
            value={analytics.passives}
            type="passives"
          />

          <StatCard
            title="Detractors"
            value={analytics.detractors}
            type="detractors"
          />
        </div>

        {/* Charts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Sentiment */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Sentiment Distribution
            </h2>

            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Positive",
                        value: analytics.sentiment.positive,
                      },
                      {
                        name: "Neutral",
                        value: analytics.sentiment.neutral,
                      },
                      {
                        name: "Negative",
                        value: analytics.sentiment.negative,
                      },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    <Cell />
                    <Cell />
                    <Cell />
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Themes */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Common Themes
            </h2>

            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(analytics.themes).map(
                    ([name, value]) => ({
                      name,
                      value,
                    }),
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="name" />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Feedback
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Latest customer responses
              </p>
            </div>
          </div>

          <div className="mt-6 divide-y divide-gray-100">
            {recentFeedback.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-6 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {item.feedback || "No feedback provided."}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">{item.theme}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold">{item.score}/10</span>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize">
                    {item.sentiment}
                  </span>
                </div>
              </div>
            ))}

            {recentFeedback.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-500">
                No feedback available.
              </p>
            )}
          </div>
        </div>

        {/* Follow-up */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Follow-up Required
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Detractor responses requiring account manager action
              </p>
            </div>

            <div className="rounded-lg bg-red-50 px-4 py-2">
              <span className="text-2xl font-bold text-red-600">
                {analytics.follow_ups_required}
              </span>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Contact customer
              </span>

              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                SLA: 2 working days
              </span>
            </div>
          </div>
        </div>
        <RecentFeedback refreshTrigger={refreshTrigger} />
      </div>
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">NPS Trend</h2>

          <p className="mt-1 text-sm text-gray-500">
            Monthly Net Promoter Score
          </p>
        </div>

        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={npsTrend}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Line type="monotone" dataKey="nps" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-7">
        <AIInsights />
      </div>
    </main>
  );
}
