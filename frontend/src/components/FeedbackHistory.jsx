import { useEffect, useState } from "react";
import { Eye, X, Trash2 } from "lucide-react";
import api from "../services/api";

export default function FeedbackHistory() {
  const [feedback, setFeedback] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sentimentFilter, setSentimentFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this feedback?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/feedback/${id}`);

      setFeedback((prev) => prev.filter((item) => item.id !== id));

      if (selectedFeedback?.id === id) {
        setSelectedFeedback(null);
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);

      const message =
        error.response?.data?.detail || "Failed to delete feedback.";

      alert(message);
    }
  };

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

  const filteredFeedback = feedback.filter((item) => {
    const matchesSearch = (item.feedback || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || item.nps_category === categoryFilter;

    const matchesSentiment =
      sentimentFilter === "All" || item.sentiment === sentimentFilter;

    const matchesPriority =
      priorityFilter === "All" || item.priority === priorityFilter;

    return (
      matchesSearch && matchesCategory && matchesSentiment && matchesPriority
    );
  });

  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedFeedback = filteredFeedback.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  if (loading) {
    return <div className="p-8">Loading feedback...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback History</h1>

          <p className="mt-1 text-gray-500">
            View and analyze all customer feedback
          </p>
        </div>
        {/* Search Feedback */}
        <div className="mt-8 grid gap-3 md:grid-cols-4">
          <input
            type="text"
            placeholder="Search feedback..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-black"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none"
          >
            <option value="All">All NPS Categories</option>
            <option value="Promoter">Promoter</option>
            <option value="Passive">Passive</option>
            <option value="Detractor">Detractor</option>
          </select>

          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none"
          >
            <option value="All">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Table */}
        <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Feedback
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Score
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  NPS Category
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Sentiment
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Priority
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedFeedback.map((item) => (
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
                    <span className="text-sm">{item.nps_category}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm capitalize">{item.sentiment}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm font-medium capitalize">
                      {item.priority}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedFeedback(item)}
                        className="flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
                      >
                        <Eye size={16} />
                        View
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        title="Delete feedback"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredFeedback.length === 0 && (
            <div className="p-10 text-center text-sm text-gray-500">
              No feedback matches your filters.
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Feedback Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Complete AI analysis
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
                    {selectedFeedback.feedback || "No feedback provided."}
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

                    <p className="mt-1 font-semibold">
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

                    <span className="text-sm font-semibold capitalize">
                      {selectedFeedback.priority}
                    </span>
                  </div>

                  {selectedFeedback.language && (
                    <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                      <span className="text-sm text-gray-500">Language</span>

                      <span className="text-sm font-medium">
                        {selectedFeedback.language}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              {/* Follow-up */}
              {selectedFeedback.follow_up && (
                <section>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Follow-up
                  </p>

                  <div className="mt-3 space-y-3">
                    <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                      <span className="text-sm text-gray-500">Status</span>

                      <span className="text-sm font-medium">
                        {selectedFeedback.follow_up.status}
                      </span>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3">
                      <span className="text-sm text-gray-500">Task</span>

                      <p className="mt-1 text-sm font-medium">
                        {selectedFeedback.follow_up.task}
                      </p>
                    </div>

                    <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                      <span className="text-sm text-gray-500">SLA</span>

                      <span className="text-sm font-medium">
                        {selectedFeedback.follow_up.sla}
                      </span>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
