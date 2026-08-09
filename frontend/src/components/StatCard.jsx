import { TrendingUp, Users, ThumbsUp, Minus, ThumbsDown } from "lucide-react";

const icons = {
  total: Users,
  nps: TrendingUp,
  promoters: ThumbsUp,
  passives: Minus,
  detractors: ThumbsDown,
};

export default function StatCard({ title, value, type }) {
  const Icon = icons[type];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>

        <div className="rounded-lg bg-gray-100 p-2">
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}