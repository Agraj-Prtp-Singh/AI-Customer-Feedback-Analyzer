import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import api from "../services/api";

export default function FollowUpManagement() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await api.get("/feedback");
        setFeedback(response.data);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const followUps = feedback.filter(
    (item) => item.follow_up?.follow_up_required && item.feedback?.trim(),
  );

  const filteredFollowUps = followUps.filter((item) => {
    if (filter === "All") return true;

    return item.follow_up?.status === filter;
  });

  if (loading) {
    return <div className="p-8">Loading follow-ups...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Follow-up Management
          </h1>

          <p className="mt-1 text-gray-500">
            Manage customer issues requiring account manager action
          </p>
        </div>

        {/* Filters */}
        <div className="mt-8 flex gap-2">
          {["All", "Pending", "Overdue", "Completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                filter === status
                  ? "bg-black text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Follow-up table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Customer Feedback
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Score
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Priority
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredFollowUps.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-6 py-4">
                    <p className="max-w-md truncate text-sm text-gray-800">
                      {item.feedback || "No feedback provided."}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-semibold">{item.score}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="capitalize">{item.priority}</span>
                  </td>

                  <td className="px-6 py-4">
                    {item.follow_up?.status === "Overdue" ? (
                      <span className="flex items-center gap-1 text-sm font-medium text-red-600">
                        <AlertTriangle size={16} />
                        Overdue
                      </span>
                    ) : item.follow_up?.status === "Completed" ? (
                      <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                        <CheckCircle size={16} />
                        Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                        <Clock size={16} />
                        Pending
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <button className="rounded-lg bg-black px-3 py-2 text-sm text-white">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredFollowUps.length === 0 && (
            <div className="p-10 text-center text-sm text-gray-500">
              No follow-ups found.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
