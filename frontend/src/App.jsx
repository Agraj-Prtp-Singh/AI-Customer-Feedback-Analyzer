import { useState } from "react";
import Dashboard from "./components/Dashboard";
import FeedbackHistory from "./components/FeedbackHistory";
import FollowUpManagement from "./components/FollowUpManagement";
import Sidebar from "./components/Sidebar";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const pages = {
    dashboard: <Dashboard />,
    history: <FeedbackHistory />,
    "follow-ups": <FollowUpManagement />,
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="min-w-0 flex-1">{pages[activePage]}</div>
    </div>
  );
}

export default App;
