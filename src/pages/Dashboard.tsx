import { useEffect, useState } from "react";
import API from "../services/api";
import PaymentButton from "../components/PaymentButton";
import WinnerSelector from "../components/WinnerSelector";
import WinnerHistory from "../components/WinnerHistory";

// ✅ helper
const generateChitMonths = (startDate: string, duration: number) => {
  const months = [];
  const start = new Date(startDate);

  for (let i = 0; i < duration; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);

    const monthName = d.toLocaleString("default", { month: "short" });
    const year = d.getFullYear();

    months.push({
      label: `${monthName} ${year} - M${i + 1}`,
      value: i + 1,
    });
  }

  return months;
};

const Dashboard = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [month, setMonth] = useState(1);
  const [monthsList, setMonthsList] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [data, setData] = useState<any>({
    totalMembers: 0,
    paidCount: 0,
    pendingCount: 0,
    paidMembers: [],
    pendingMembers: [],
    winner: null,
    allWinners: [],
    currentMonth: 1,
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";

  /* ================= LOAD GROUPS ================= */
  useEffect(() => {
    API.get("/groups")
      .then((res) => {
        setGroups(res.data);

        if (res.data.length > 0) {
          const first = res.data[0];
          setSelectedGroup(first._id);

          const list = generateChitMonths(first.startDate, first.duration);
          setMonthsList(list);
        }
      })
      .catch(console.log);
  }, []);

  /* ================= LOAD DASHBOARD ================= */
  const loadDashboard = async () => {
    if (!selectedGroup) return;

    try {
      const res = await API.get(`/dashboard/${selectedGroup}/${month}`);
      const response = res.data;

      setData(response);

      // 🔥 AUTO SELECT CURRENT MONTH (ONLY FIRST TIME)
      if (month === 1) {
        setMonth(response.currentMonth);
      }

      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [selectedGroup, month]);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

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
            className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {/* Group */}
          <select
            className="flex-1 border p-2 rounded-xl bg-white"
            value={selectedGroup}
            onChange={(e) => {
              const groupId = e.target.value;
              setSelectedGroup(groupId);
              setMonth(1);

              const selected = groups.find((g) => g._id === groupId);

              if (selected) {
                const list = generateChitMonths(
                  selected.startDate,
                  selected.duration,
                );
                setMonthsList(list);
              }
            }}
          >
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Month */}
          <select
            className="flex-1 border p-2 rounded-xl bg-white"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {monthsList.map((m) => (
              <option
                key={m.value}
                value={m.value}
                disabled={m.value > data.currentMonth} // 🔥 disable future
              >
                {m.label}
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
              className="flex justify-between border-b py-1 text-sm"
            >
              <span>{m.name}</span>

              {isAdmin && (
                <button
                  onClick={async () => {
                    if (!window.confirm("Revert payment?")) return;

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
              className="flex justify-between border-b py-1 text-sm"
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

        {/* Winner */}
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
            🏆 {data.winner?.name || "No Winner"}
          </div>
        </div>

        {/* Timeline */}
        <WinnerHistory
          groupId={selectedGroup}
          currentMonth={month}
          totalMonths={monthsList.length}
          refreshKey={refreshKey}
          isAdmin={isAdmin}
          onRefresh={loadDashboard}
        />
      </div>
    </div>
  );
};

export default Dashboard;
