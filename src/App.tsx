import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import BottomNav from "./components/BottomNav";
import Login from "./pages/login";
import Members from "./pages/Members";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null"),
  );

  // ❌ Not logged in
  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <div className="pb-16">
      {activeTab === "dashboard" && <Dashboard />}
      {activeTab === "members" && <Members />}
      {activeTab === "winners" && <div className="p-4">Winners Page</div>}

      <BottomNav active={activeTab} setActive={setActiveTab} />
    </div>
  );
}

export default App;
