import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import BottomNav from "./components/BottomNav";
import Login from "./pages/login";
import Members from "./pages/Members";
import Settings from "./pages/Settings";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null"),
  );
  const isAdmin = user?.role === "admin";

  if (!user) {
    return <Login setUser={setUser} />;
  }

  const tabs = [
    { key: "dashboard", label: "Home" },
    { key: "members", label: "Members" },
    ...(isAdmin ? [{ key: "settings", label: "Settings" }] : []),
  ];

  return (
    <div className="app-shell">
      {activeTab === "dashboard" && <Dashboard />}
      {activeTab === "members" && <Members />}
      {activeTab === "settings" && <Settings isAdmin={isAdmin} />}

      <BottomNav active={activeTab} setActive={setActiveTab} tabs={tabs} />
    </div>
  );
}

export default App;
