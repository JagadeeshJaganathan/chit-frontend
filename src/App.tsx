import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import BottomNav from "./components/BottomNav";
import Login from "./pages/login";
import Members from "./pages/Members";
import Settings from "./pages/Settings";
import Shuffle from "./pages/Shuffle";
import { useLanguage } from "./context/LanguageContext";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null"),
  );
  const isAdmin = user?.role === "admin";
  const { t } = useLanguage();

  if (!user) {
    return <Login setUser={setUser} />;
  }

  const tabs = [
    { key: "dashboard", label: t("home") },
    { key: "members", label: t("members") },
    ...(isAdmin
      ? [
          { key: "shuffle", label: t("shuffle") },
          { key: "settings", label: t("settings") },
        ]
      : []),
  ];

  return (
    <div className="app-shell">
      {activeTab === "dashboard" && <Dashboard />}
      {activeTab === "members" && <Members />}
      {activeTab === "shuffle" && <Shuffle isAdmin={isAdmin} />}
      {activeTab === "settings" && <Settings isAdmin={isAdmin} />}

      <BottomNav active={activeTab} setActive={setActiveTab} tabs={tabs} />
    </div>
  );
}

export default App;
