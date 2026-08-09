import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Clock, X } from "lucide-react";
import api from "../services/api";

export default function FollowUpManagement() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sentimentFilter, setSentimentFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [completing, setCompleting] = useState(false);

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
    const matchesStatus = filter === "All" || item.follow_up?.status === filter;

    const matchesPriority =
      priorityFilter === "All" || item.priority === priorityFilter;

    const matchesSentiment =
      sentimentFilter === "All" || item.sentiment === sentimentFilter;

    const matchesSearch =
      search.trim() === "" ||
      item.feedback?.toLowerCase().includes(search.toLowerCase()) ||
      item.theme?.toLowerCase().includes(search.toLowerCase()) ||
      item.root_cause?.toLowerCase().includes(search.toLowerCase());

    return (
      matchesStatus && matchesPriority && matchesSentiment && matchesSearch
    );
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
        <div className="mt-8 space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search feedback, themes, or root causes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400"
            />
          </div>

          {/* Filter controls */}
          <div className="flex flex-wrap gap-3">
            {/* Status */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Sentiment */}
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none"
            >
              <option value="All">All Sentiments</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
              <option value="positive">Positive</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearch("");
                setFilter("All");
                setPriorityFilter("All");
                setSentimentFilter("All");
              }}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
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
                    <button
                      onClick={() => setSelectedFeedback(item)}
                      className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
                    >
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
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Follow-up Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Customer feedback analysis
                </p>
              </div>

              <button
                onClick={() => setSelectedFeedback(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6 p-6">
              {/* Customer Feedback */}
              <section>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Customer Feedback
                </p>

                <div className="mt-2 rounded-lg bg-gray-50 p-4">
                  <p className="text-sm leading-6 text-gray-800">
                    {selectedFeedback.feedback}
                  </p>
                </div>
              </section>

              {/* NPS */}
              <section>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  NPS Information
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Score</p>

                    <p className="mt-1 text-2xl font-bold">
                      {selectedFeedback.score}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Category</p>

                    <p className="mt-1 font-semibold text-red-600">
                      {selectedFeedback.nps_category}
                    </p>
                  </div>
                </div>
              </section>

              {/* AI Analysis */}
              <section>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  AI Analysis
                </p>

                <div className="mt-3 space-y-3">
                  <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                    <span className="text-sm text-gray-500">Sentiment</span>

                    <span className="text-sm font-medium capitalize">
                      {selectedFeedback.sentiment}
                    </span>
                  </div>

                  <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                    <span className="text-sm text-gray-500">Theme</span>

                    <span className="text-sm font-medium capitalize">
                      {selectedFeedback.theme}
                    </span>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <span className="text-sm text-gray-500">Root Cause</span>

                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {selectedFeedback.root_cause}
                    </p>
                  </div>

                  <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                    <span className="text-sm text-gray-500">Priority</span>

                    <span className="text-sm font-semibold capitalize text-red-600">
                      {selectedFeedback.priority}
                    </span>
                  </div>
                </div>
              </section>

              {/* Follow-up */}
              <section>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Follow-up
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Account manager action
                    </p>
                  </div>

                  {selectedFeedback.follow_up.status === "Overdue" ? (
                    <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      <AlertTriangle size={14} />
                      Overdue
                    </span>
                  ) : selectedFeedback.follow_up.status === "Completed" ? (
                    <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      <CheckCircle size={14} />
                      Completed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                      <Clock size={14} />
                      Pending
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Task</p>

                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {selectedFeedback.follow_up.task}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-xs text-gray-500">SLA</p>

                      <p className="mt-1 text-sm font-semibold">
                        {selectedFeedback.follow_up.sla}
                      </p>
                    </div>

                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-xs text-gray-500">Due</p>

                      <p className="mt-1 text-sm font-semibold">
                        {selectedFeedback.follow_up.due_at
                          ? new Date(
                              selectedFeedback.follow_up.due_at,
                            ).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Escalation */}
              {selectedFeedback.follow_up.status === "Overdue" && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="mt-0.5 text-red-600" />

                    <div>
                      <p className="text-sm font-semibold text-red-700">
                        Escalation Required
                      </p>

                      <p className="mt-1 text-sm text-red-600">
                        The 2-working-day SLA has been exceeded. This case
                        should be escalated to the appropriate manager.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Complete button */}
              {selectedFeedback.follow_up.status !== "Completed" && (
                <button
                  onClick={async () => {
                    try {
                      setCompleting(true);

                      const response = await api.patch(
                        `/feedback/${selectedFeedback.id}/follow-up`,
                      );

                      const updatedFeedback = response.data;

                      setSelectedFeedback(updatedFeedback);

                      setFeedback((prev) =>
                        prev.map((item) =>
                          item.id === updatedFeedback.id
                            ? updatedFeedback
                            : item,
                        ),
                      );
                    } catch (error) {
                      console.error("Error completing follow-up:", error);
                    } finally {
                      setCompleting(false);
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800"
                >
                  <CheckCircle size={17} />
                  {completing ? "Completing..." : "Mark as Completed"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
