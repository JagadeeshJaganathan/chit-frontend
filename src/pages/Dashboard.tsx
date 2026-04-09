import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../services/api";
import PaymentButton from "../components/PaymentButton";
import WinnerSelector from "../components/WinnerSelector";
import WinnerHistory from "../components/WinnerHistory";
import Breadcrumbs from "../components/Breadcrumbs";
import { getMonthNumberForDate, getMonthOptions } from "../utils/group";

const Dashboard = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [month, setMonth] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
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

  const activeGroups = useMemo(
    () => groups.filter((group) => !group.isEnded),
    [groups],
  );

  const selectedGroupData = activeGroups.find((group) => group._id === selectedGroup);
  const monthOptions = getMonthOptions(
    selectedGroupData?.startDate,
    selectedGroupData?.duration || 10,
  );

  const loadGroups = useCallback(async () => {
    try {
      const res = await API.get("/groups");
      const nextGroups = res.data.filter((group: any) => !group.isEnded);
      setGroups(res.data);

      if (nextGroups.length === 0) {
        setSelectedGroup("");
        return;
      }

      setSelectedGroup((currentValue) => {
        const nextGroup = nextGroups.find((group: any) => group._id === currentValue);
        return nextGroup?._id || nextGroups[0]._id;
      });
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (!selectedGroupData) return;

    setMonth(
      getMonthNumberForDate(selectedGroupData.startDate, selectedGroupData.duration),
    );
  }, [selectedGroupData]);

  const loadDashboard = useCallback(async () => {
    if (!selectedGroup) return;

    try {
      const res = await API.get(`/dashboard/${selectedGroup}/${month}`);
      setData(res.data);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.log(err);
    }
  }, [month, selectedGroup]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.reload();
  };

  if (!user?.role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Please login</p>
      </div>
    );
  }

  if (activeGroups.length === 0) {
    return (
      <div className="space-y-4 fade-in-up">
        <Breadcrumbs items={["Home", "Dashboard"]} />
        <div className="glass-card rounded-[28px] p-6">
          <p className="section-title">No active groups</p>
          <h1 className="mt-2 text-2xl font-extrabold">Nothing live right now</h1>
          <p className="mt-2 text-sm text-[#7b6a56]">
            Ended chits stay in history. Create a new group from Settings to continue.
          </p>
          {isAdmin && (
            <button
              onClick={handleLogout}
              className="pill-button mt-5 bg-[#2f2419] text-white"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in-up">
      <Breadcrumbs items={["Home", "Dashboard"]} />

      <div className="glass-card rounded-[32px] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="section-title">Live Chit</p>
            <h1 className="mt-2 text-[1.7rem] font-extrabold leading-tight">
              Track this month at a glance
            </h1>
            <p className="mt-2 text-sm text-[#7b6a56]">
              Optimized for quick mobile updates during collection.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="pill-button bg-[#2f2419] px-4 py-2 text-sm text-white"
          >
            Logout
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3">
          <select
            className="input-surface"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            {activeGroups.map((group: any) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>

          <select
            className="input-surface"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {selectedGroupData && (
          <div className="mt-5 rounded-[24px] bg-[#fff7f0] p-4">
            <p className="section-title">Now Active</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold">{selectedGroupData.name}</h2>
                <p className="text-sm text-[#7b6a56]">
                  {monthOptions.find((option) => option.value === month)?.label}
                </p>
              </div>
              <div className="rounded-full bg-[#ffe4d4] px-3 py-1 text-xs font-bold text-[#a1441e]">
                {selectedGroupData.duration} months
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="soft-card rounded-[24px] p-4 text-center">
          <p className="text-xs uppercase tracking-[0.14em] text-[#7b6a56]">Members</p>
          <p className="mt-2 text-2xl font-extrabold">{data.totalMembers}</p>
        </div>
        <div className="soft-card rounded-[24px] bg-[#ecf7f1] p-4 text-center">
          <p className="text-xs uppercase tracking-[0.14em] text-[#5c7e6c]">Paid</p>
          <p className="mt-2 text-2xl font-extrabold text-[#2f8f62]">{data.paidCount}</p>
        </div>
        <div className="soft-card rounded-[24px] bg-[#fff1ed] p-4 text-center">
          <p className="text-xs uppercase tracking-[0.14em] text-[#99685d]">Pending</p>
          <p className="mt-2 text-2xl font-extrabold text-[#c75c2a]">
            {data.pendingCount}
          </p>
        </div>
      </div>

      <div className="soft-card rounded-[28px] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="section-title">Winner</p>
            <h3 className="mt-2 text-lg font-extrabold">
              {data.winner?.name || "No winner selected yet"}
            </h3>
          </div>
          {data.winner && (
            <span className="rounded-full bg-[#fff2b6] px-3 py-1 text-xs font-bold text-[#7c5a00]">
              This month
            </span>
          )}
        </div>

        {isAdmin && selectedGroupData && (
          <div className="mt-4">
            <WinnerSelector
              members={[...data.paidMembers, ...data.pendingMembers]}
              groupId={selectedGroup}
              month={month}
              onSuccess={loadDashboard}
              currentWinner={data.winner}
              winners={data.allWinners || []}
              disabled={selectedGroupData.isEnded}
            />
          </div>
        )}
      </div>

      <div className="soft-card rounded-[28px] p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-extrabold">Paid Members</h3>
          <span className="rounded-full bg-[#ecf7f1] px-3 py-1 text-xs font-bold text-[#2f8f62]">
            {data.paidCount} paid
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {data.paidMembers.length === 0 ? (
            <p className="text-sm text-[#7b6a56]">No payments recorded for this month.</p>
          ) : (
            data.paidMembers.map((member: any) => (
              <div
                key={member._id}
                className="rounded-[22px] bg-[#f9f5ee] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold">{member.name}</p>
                    <p className="text-sm text-[#7b6a56]">Marked paid</p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={async () => {
                        const ok = window.confirm("Revert payment?");
                        if (!ok) return;

                        await API.post("/payments/revert", {
                          memberId: member._id,
                          groupId: selectedGroup,
                          month,
                        });

                        loadDashboard();
                      }}
                      className="pill-button bg-[#f8dfd7] px-4 py-2 text-sm text-[#b54848]"
                    >
                      Undo
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="soft-card rounded-[28px] p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-extrabold">Pending Members</h3>
          <span className="rounded-full bg-[#fff1ed] px-3 py-1 text-xs font-bold text-[#c75c2a]">
            {data.pendingCount} pending
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {data.pendingMembers.length === 0 ? (
            <p className="text-sm text-[#7b6a56]">Everyone is paid up for this month.</p>
          ) : (
            data.pendingMembers.map((member: any) => (
              <div
                key={member._id}
                className="rounded-[22px] bg-[#f9f5ee] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold">{member.name}</p>
                    <p className="text-sm text-[#7b6a56]">Awaiting payment</p>
                  </div>
                  {isAdmin && selectedGroupData && (
                    <PaymentButton
                      memberId={member._id}
                      groupId={selectedGroup}
                      month={month}
                      onSuccess={loadDashboard}
                      disabled={selectedGroupData.isEnded}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="soft-card rounded-[28px] p-4">
        <WinnerHistory
          groupId={selectedGroup}
          currentMonth={month}
          totalMonths={selectedGroupData?.duration || 10}
          refreshKey={refreshKey}
          isAdmin={isAdmin}
          onRefresh={loadDashboard}
          startDate={selectedGroupData?.startDate}
          disabled={selectedGroupData?.isEnded}
        />
      </div>
    </div>
  );
};

export default Dashboard;
