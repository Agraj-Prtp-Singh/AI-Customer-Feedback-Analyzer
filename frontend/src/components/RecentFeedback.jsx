import { useEffect, useState } from "react";
import api from "../services/api";


export default function RecentFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  if (loading) {
    return (
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Loading recent feedback...</p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Feedback</h2>

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
                  className="border-b border-gray-100 last:border-0"
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
  );
}
