import { useEffect, useState } from "react";
import api from "../services/api";
import { X, CheckCircle } from "lucide-react";

export default function RecentFeedback({ refreshTrigger }) {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);

        const response = await api.get("/feedback");

        // Make sure feedback is always an array
        setFeedback(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setFeedback([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [refreshTrigger]);

  const handleMarkCompleted = async () => {
    if (!selectedFeedback?.id) return;

    try {
      const response = await api.patch(
        `/feedback/${selectedFeedback.id}/follow-up`,
      );

      const updatedStatus = response.data.status;

      // Update selected feedback inside modal
      setSelectedFeedback((previous) => ({
        ...previous,
        follow_up: {
          ...previous.follow_up,
          status: updatedStatus,
        },
      }));

      // Update feedback list
      setFeedback((previous) =>
        previous.map((item) =>
          item.id === selectedFeedback.id
            ? {
                ...item,
                follow_up: {
                  ...item.follow_up,
                  status: updatedStatus,
                },
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("Error updating follow-up:", err);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500 text-center">
          Loading recent feedback...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Recent Feedback Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Feedback
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Latest customer responses analyzed by AI
          </p>
        </div>

        {/* Empty State */}
        {feedback.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">
              No feedback has been submitted yet.
            </p>
          </div>
        ) : (
          /* Feedback Table */
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
                    key={item.id ?? index}
                    onClick={() => setSelectedFeedback(item)}
                    className="cursor-pointer border-b border-gray-100 transition hover:bg-gray-50 last:border-0"
                  >
                    {/* Score */}
                    <td className="py-4 pr-6 font-semibold text-gray-900">
                      {item.score ?? "-"}
                    </td>

                    {/* NPS */}
                    <td className="py-4 pr-6 text-gray-700">
                      {item.nps_category ?? "-"}
                    </td>

                    {/* Sentiment */}
                    <td className="py-4 pr-6 capitalize text-gray-700">
                      {item.sentiment ?? "-"}
                    </td>

                    {/* Theme */}
                    <td className="py-4 pr-6 capitalize text-gray-700">
                      {item.theme ?? "-"}
                    </td>

                    {/* Priority */}
                    <td className="py-4 pr-6 capitalize text-gray-700">
                      {item.priority ?? "-"}
                    </td>

                    {/* Follow-up */}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedFeedback(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Feedback Details
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Customer feedback analysis
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Feedback Details */}
            <div className="mt-6 space-y-4">
              {/* Score */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Score
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {selectedFeedback.score ?? "-"}
                </p>
              </div>

              {/* NPS */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  NPS Category
                </p>
                <p className="mt-1 capitalize text-gray-900">
                  {selectedFeedback.nps_category ?? "-"}
                </p>
              </div>

              {/* Sentiment */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Sentiment
                </p>
                <p className="mt-1 capitalize text-gray-900">
                  {selectedFeedback.sentiment ?? "-"}
                </p>
              </div>

              {/* Theme */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Theme
                </p>
                <p className="mt-1 capitalize text-gray-900">
                  {selectedFeedback.theme ?? "-"}
                </p>
              </div>

              {/* Priority */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Priority
                </p>
                <p className="mt-1 capitalize text-gray-900">
                  {selectedFeedback.priority ?? "-"}
                </p>
              </div>

              {/* Follow-up Section */}
              {selectedFeedback.follow_up?.follow_up_required && (
                <div className="rounded-lg bg-red-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-red-700">
                        Follow-up Required
                      </p>

                      {selectedFeedback.follow_up.task && (
                        <p className="mt-1 text-sm text-red-600">
                          {selectedFeedback.follow_up.task}
                        </p>
                      )}

                      {selectedFeedback.follow_up.sla && (
                        <p className="mt-1 text-xs text-red-500">
                          SLA: {selectedFeedback.follow_up.sla}
                        </p>
                      )}
                    </div>

                    {selectedFeedback.follow_up.status && (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          selectedFeedback.follow_up.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : selectedFeedback.follow_up.status === "Overdue"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {selectedFeedback.follow_up.status}
                      </span>
                    )}

                    {selectedFeedback.follow_up.status === "Overdue" && (
                      <div className="mt-4 rounded-lg bg-red-100 p-3">
                        <p className="text-sm font-semibold text-red-700">
                          Escalation Required
                        </p>

                        <p className="mt-1 text-xs text-red-600">
                          The 2-working-day SLA has been exceeded. This case
                          should be escalated to the appropriate manager.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mark Completed */}
                  {selectedFeedback.follow_up.status !== "Completed" && (
                    <button
                      type="button"
                      onClick={handleMarkCompleted}
                      className="mt-4 flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                      <CheckCircle size={16} />
                      Mark as Completed
                    </button>
                  )}

                  {/* Completed Message */}
                  {selectedFeedback.follow_up.status === "Completed" && (
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-green-600">
                      <CheckCircle size={16} />
                      Follow-up completed
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
