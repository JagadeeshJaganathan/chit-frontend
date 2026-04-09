import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import PaymentButton from "../components/PaymentButton";
import WinnerSelector from "../components/WinnerSelector";
import WinnerHistory from "../components/WinnerHistory";

const Dashboard = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [month, setMonth] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const totalMonths = 10;

  const [data, setData] = useState<any>({
    totalMembers: 0,
    paidCount: 0,
    pendingCount: 0,
    paidMembers: [],
    pendingMembers: [],
    winner: null,
    allWinners: [],
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";

  // 🔹 Load groups
  useEffect(() => {
    API.get("/groups")
      .then((res) => {
        setGroups(res.data);
        if (res.data.length > 0) {
          setSelectedGroup(res.data[0]._id);
        }
      })
      .catch(console.log);
  }, []);

  // 🔹 Load dashboard
  const loadDashboard = useCallback(async () => {
    if (!selectedGroup) return;

    try {
      const res = await API.get(`/dashboard/${selectedGroup}/${month}`);
      setData(res.data);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.log(err);
    }
  }, [selectedGroup, month]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // 🔐 Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  // 🔐 AFTER hooks (important)
  if (!user?.role) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please login</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">📊 Chit Dashboard</h1>

          <button
            onClick={handleLogout}
            className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm active:scale-95"
          >
            Logout
          </button>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <select
            className="flex-1 border p-2 rounded-xl bg-white"
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setMonth(1);
            }}
          >
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>

          <select
            className="flex-1 border p-2 rounded-xl bg-white"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {[...Array(totalMonths)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                M{i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white p-3 rounded-xl text-center shadow">
            <p className="text-xs">Total</p>
            <p className="font-bold">{data.totalMembers}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-xl text-center">
            <p className="text-xs">Paid</p>
            <p className="font-bold">{data.paidCount}</p>
          </div>
          <div className="bg-red-100 p-3 rounded-xl text-center">
            <p className="text-xs">Pending</p>
            <p className="font-bold">{data.pendingCount}</p>
          </div>
        </div>

        {/* Paid Members */}
        <div className="bg-white p-3 rounded-xl shadow">
          <h3 className="text-sm font-semibold text-green-700 mb-2">
            Paid Members
          </h3>

          {data.paidMembers.map((m: any) => (
            <div
              key={m._id}
              className="flex justify-between items-center border-b py-1 text-sm"
            >
              <span>{m.name}</span>

              <div className="flex gap-2 items-center">
                <span className="bg-green-100 px-2 rounded text-xs">Paid</span>

                {isAdmin && (
                  <button
                    onClick={async () => {
                      const ok = window.confirm("Revert payment?");
                      if (!ok) return;

                      await API.post("/payments/revert", {
                        memberId: m._id,
                        groupId: selectedGroup,
                        month,
                      });

                      loadDashboard();
                    }}
                    className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs"
                  >
                    Undo
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pending Members */}
        <div className="bg-white p-3 rounded-xl shadow">
          <h3 className="text-sm font-semibold text-red-600 mb-2">
            Pending Members
          </h3>

          {data.pendingMembers.map((m: any) => (
            <div
              key={m._id}
              className="flex justify-between items-center border-b py-1 text-sm"
            >
              <span>{m.name}</span>

              {isAdmin && (
                <PaymentButton
                  memberId={m._id}
                  groupId={selectedGroup}
                  month={month}
                  onSuccess={loadDashboard}
                />
              )}
            </div>
          ))}
        </div>

        {/* Winner Section */}
        <div className="bg-white p-4 rounded-xl shadow space-y-3">
          {isAdmin && (
            <WinnerSelector
              members={[...data.paidMembers, ...data.pendingMembers]}
              groupId={selectedGroup}
              month={month}
              onSuccess={loadDashboard}
              currentWinner={data.winner}
              winners={data.allWinners || []}
            />
          )}

          <div className="text-center">
            <span className="bg-yellow-100 px-3 py-1 rounded text-sm font-semibold">
              🏆 {data.winner?.name || "No Winner"}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white p-3 rounded-xl shadow">
          <WinnerHistory
            groupId={selectedGroup}
            currentMonth={month}
            totalMonths={totalMonths}
            refreshKey={refreshKey}
            isAdmin={isAdmin}
            onRefresh={loadDashboard}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
