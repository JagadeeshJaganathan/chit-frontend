import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../services/api";
import Breadcrumbs from "../components/Breadcrumbs";
import { getMonthNumberForDate, getMonthOptions } from "../utils/group";

type Props = {
  isAdmin: boolean;
};

const Shuffle = ({ isAdmin }: Props) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [month, setMonth] = useState(1);
  const [dashboardData, setDashboardData] = useState<any>({
    paidMembers: [],
    pendingMembers: [],
    winner: null,
    allWinners: [],
  });
  const [candidate, setCandidate] = useState<any>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

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
        setDashboardData({
          paidMembers: [],
          pendingMembers: [],
          winner: null,
          allWinners: [],
        });
        return;
      }

      setSelectedGroup((currentValue) => {
        const currentGroup = nextGroups.find((group: any) => group._id === currentValue);
        return currentGroup?._id || nextGroups[0]._id;
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

    setCandidate(null);
    setStatusMessage("");
    setMonth(
      getMonthNumberForDate(selectedGroupData.startDate, selectedGroupData.duration),
    );
  }, [selectedGroupData]);

  const loadDashboard = useCallback(async () => {
    if (!selectedGroup) return;

    try {
      setStatusMessage("");
      const res = await API.get(`/dashboard/${selectedGroup}/${month}`);
      setDashboardData(res.data);
      setCandidate(null);
    } catch (err) {
      console.log(err);
    }
  }, [month, selectedGroup]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const eligibleMembers = useMemo(() => {
    const allMembers = [
      ...(dashboardData.paidMembers || []),
      ...(dashboardData.pendingMembers || []),
    ];
    const wonIds = new Set(
      (dashboardData.allWinners || []).map((winner: any) =>
        String(winner.memberId?._id || winner.memberId),
      ),
    );

    return allMembers.filter((member: any) => !wonIds.has(String(member._id)));
  }, [dashboardData.allWinners, dashboardData.paidMembers, dashboardData.pendingMembers]);

  const handleShuffle = async () => {
    if (eligibleMembers.length === 0) {
      alert("No eligible members available for shuffle");
      return;
    }

    if (!selectedGroup) return;

    try {
      setStatusMessage("");
      setCandidate(null);
      setIsShuffling(true);
      await new Promise((resolve) => window.setTimeout(resolve, 700));

      const randomIndex = Math.floor(Math.random() * eligibleMembers.length);
      const selectedCandidate = eligibleMembers[randomIndex];
      setCandidate(selectedCandidate);

      setIsSaving(true);
      await API.post("/winners", {
        groupId: selectedGroup,
        memberId: selectedCandidate._id,
        month,
      });

      await loadDashboard();
      setStatusMessage(`${selectedCandidate.name} is now the winner for this month.`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Unable to save winner");
    } finally {
      setIsShuffling(false);
      setIsSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="space-y-4 fade-in-up">
        <Breadcrumbs items={["Home", "Shuffle"]} />
        <div className="glass-card rounded-[28px] p-6 text-center">
          <p className="section-title">Restricted</p>
          <h2 className="mt-2 text-xl font-extrabold">Admin access required</h2>
        </div>
      </div>
    );
  }

  if (activeGroups.length === 0) {
    return (
      <div className="space-y-4 fade-in-up">
        <Breadcrumbs items={["Home", "Shuffle"]} />
        <div className="glass-card rounded-[28px] p-6">
          <p className="section-title">No active groups</p>
          <h2 className="mt-2 text-2xl font-extrabold">Create a chit first</h2>
          <p className="mt-2 text-sm text-[#7b6a56]">
            Shuffle works only for active chit groups.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in-up">
      <Breadcrumbs items={["Home", "Admin", "Shuffle"]} />

      <div className="glass-card rounded-[30px] p-5">
        <p className="section-title">Lucky Draw</p>
        <h1 className="mt-2 text-[1.65rem] font-extrabold leading-tight">
          Shuffle a winner for the current month
        </h1>
        <p className="mt-2 text-sm text-[#7b6a56]">
          Picks from members who have not already won this chit.
        </p>

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
      </div>

      <div className="soft-card rounded-[28px] p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[22px] bg-[#f8f3eb] p-4">
            <p className="text-sm text-[#7b6a56]">Eligible members</p>
            <p className="mt-2 text-2xl font-extrabold">{eligibleMembers.length}</p>
          </div>
          <div className="rounded-[22px] bg-[#f8f3eb] p-4">
            <p className="text-sm text-[#7b6a56]">Current winner</p>
            <p className="mt-2 text-lg font-extrabold">
              {dashboardData.winner?.name || "Not selected"}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-[26px] bg-[#fff7f0] p-5 text-center">
          <p className="section-title">Shuffle Result</p>
          <div className="mt-4 min-h-[104px] rounded-[22px] bg-white/70 px-4 py-6">
            {dashboardData.winner ? (
              <>
                <p className="text-sm text-[#7b6a56]">Winner already locked for this month</p>
                <p className="mt-2 text-2xl font-extrabold text-[#2f8f62]">
                  {dashboardData.winner.name}
                </p>
              </>
            ) : isShuffling ? (
              <p className="text-xl font-extrabold text-[#c75c2a]">Shuffling...</p>
            ) : candidate ? (
              <>
                <p className="text-sm text-[#7b6a56]">Winner selected</p>
                <p className="mt-2 text-3xl font-extrabold text-[#8d3413]">
                  {candidate.name}
                </p>
              </>
            ) : (
              <p className="text-sm text-[#7b6a56]">
                Tap shuffle to draw a random eligible member.
              </p>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <button
              onClick={handleShuffle}
              disabled={isShuffling || isSaving || !!dashboardData.winner}
              className="pill-button w-full bg-[#c75c2a] text-white disabled:opacity-50"
            >
              {isShuffling || isSaving ? "Shuffling..." : "Shuffle Winner"}
            </button>
            {statusMessage && (
              <p className="text-sm font-semibold text-[#2f8f62]">{statusMessage}</p>
            )}
          </div>
        </div>
      </div>

      <div className="soft-card rounded-[28px] p-5">
        <p className="section-title">Eligible Pool</p>
        <h3 className="mt-2 text-lg font-extrabold">Members in the draw</h3>
        <div className="mt-4 space-y-3">
          {eligibleMembers.length === 0 ? (
            <p className="text-sm text-[#7b6a56]">No eligible members for this month.</p>
          ) : (
            eligibleMembers.map((member: any) => (
              <div key={member._id} className="rounded-[22px] bg-[#f8f3eb] p-4">
                <p className="font-bold">{member.name}</p>
                <p className="mt-1 text-sm text-[#7b6a56]">{member.phone}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Shuffle;
