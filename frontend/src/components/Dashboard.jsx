import { useEffect, useState } from "react";
import { BarChart3, AlertCircle } from "lucide-react";
import api from "../services/api";
import StatCard from "./StatCard";
import FeedbackForm from "./FeedbackForm";
import RecentFeedback from "./RecentFeedback";

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
} from "recharts";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/analytics");
      setAnalytics(response.data);
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-black p-3">
              <BarChart3 className="text-white" size={24} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Customer Feedback Analytics
              </h1>

              <p className="mt-1 text-gray-500">
                AI-powered NPS feedback analysis
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="mb-8">
          <FeedbackForm
            onAnalysisComplete={() => {
              fetchAnalytics();
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
        <RecentFeedback />
      </div>
    </main>
  );
}
