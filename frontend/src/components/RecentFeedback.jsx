import { useEffect, useState } from "react";
import api from "../services/api";
import { X } from "lucide-react";

export default function RecentFeedback({ refreshTrigger }) {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await api.get("/feedback");
        setFeedback(response.data);
      } catch (err) {
        console.error("Error fetching feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Loading recent feedback...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Feedback
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Latest customer responses analyzed by AI
          </p>
        </div>

        {feedback.length === 0 ? (
          <p className="text-sm text-gray-500">
            No feedback has been submitted yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="pb-3 pr-6">Score</th>
                  <th className="pb-3 pr-6">NPS</th>
                  <th className="pb-3 pr-6">Sentiment</th>
                  <th className="pb-3 pr-6">Theme</th>
                  <th className="pb-3 pr-6">Priority</th>
                  <th className="pb-3">Follow-up</th>
                </tr>
              </thead>

              <tbody>
                {feedback.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() => setSelectedFeedback(item)}
                    className="cursor-pointer border-b border-gray-100 transition hover:bg-gray-50 last:border-0"
                  >
                    <td className="py-4 pr-6 font-semibold">{item.score}</td>

                    <td className="py-4 pr-6">{item.nps_category}</td>

                    <td className="py-4 pr-6 capitalize">{item.sentiment}</td>

                    <td className="py-4 pr-6 capitalize">{item.theme}</td>

                    <td className="py-4 pr-6 capitalize">{item.priority}</td>

                    <td className="py-4">
                      {item.follow_up?.follow_up_required ? (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                          Required
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                          Not Required
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Feedback Analysis
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  AI-generated customer feedback analysis
                </p>
              </div>

              <button
                onClick={() => setSelectedFeedback(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* NPS */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">NPS Score</p>

                <p className="mt-1 text-2xl font-bold">
                  {selectedFeedback.score}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Category</p>

                <p className="mt-1 font-semibold">
                  {selectedFeedback.nps_category}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Sentiment</p>

                <p className="mt-1 capitalize font-semibold">
                  {selectedFeedback.sentiment}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Priority</p>

                <p className="mt-1 capitalize font-semibold">
                  {selectedFeedback.priority}
                </p>
              </div>
            </div>

            {/* Customer Feedback */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900">
                Customer Feedback
              </h3>

              <div className="mt-2 rounded-lg bg-gray-50 p-4">
                <p className="text-sm leading-6 text-gray-700">
                  {selectedFeedback.feedback}
                </p>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900">
                AI Analysis
              </h3>

              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Theme</p>

                  <p className="mt-1 capitalize text-sm font-medium">
                    {selectedFeedback.theme}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Root Cause</p>

                  <p className="mt-1 text-sm text-gray-700">
                    {selectedFeedback.root_cause}
                  </p>
                </div>
              </div>
            </div>

            {/* Follow-up */}
            {selectedFeedback.follow_up?.follow_up_required && (
              <div className="mt-6 rounded-lg bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Follow-up Required
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {selectedFeedback.follow_up.task}
                </p>

                <p className="mt-1 text-xs text-red-500">
                  SLA: {selectedFeedback.follow_up.sla}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
