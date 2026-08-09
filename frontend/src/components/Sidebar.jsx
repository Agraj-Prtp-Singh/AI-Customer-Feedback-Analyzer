import { BarChart3, ClipboardList, ListChecks } from "lucide-react";

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "history", label: "Feedback History", icon: ClipboardList },
  { id: "follow-ups", label: "Follow-ups", icon: ListChecks },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="border-b border-gray-200 bg-white lg:min-h-screen lg:w-64 lg:border-r lg:border-b-0">
      <div className="flex items-center gap-3 px-5 py-5 lg:px-6">
        <div className="rounded-xl bg-black p-2.5 text-white">
          <BarChart3 size={20} />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Feedback AI</p>
          <p className="text-xs text-gray-500">Customer insights</p>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-3 pb-4 lg:flex-col lg:px-4">
        {navigation.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;

          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
