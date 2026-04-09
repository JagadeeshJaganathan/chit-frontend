import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../services/api";
import Breadcrumbs from "../components/Breadcrumbs";
import { DEFAULT_START_MONTH, formatMonthLabel, getMonthStartDate } from "../utils/group";

type Props = {
  isAdmin: boolean;
};

const Settings = ({ isAdmin }: Props) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [startMonthInput, setStartMonthInput] = useState(DEFAULT_START_MONTH);
  const [isSaving, setIsSaving] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    totalAmount: "300000",
    duration: "10",
    memberLimit: "20",
    startMonth: DEFAULT_START_MONTH,
  });
  const [isCreating, setIsCreating] = useState(false);

  const loadGroups = useCallback(async () => {
    try {
      const res = await API.get("/groups");
      setGroups(res.data);

      if (res.data.length === 0) {
        setSelectedGroup("");
        return;
      }

      setSelectedGroup((currentValue) => {
        const existing = res.data.find((group: any) => group._id === currentValue);
        return existing?._id || res.data[0]._id;
      });
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const selectedGroupData = useMemo(
    () => groups.find((group) => group._id === selectedGroup),
    [groups, selectedGroup],
  );

  useEffect(() => {
    if (!selectedGroupData) return;

    const nextMonth = selectedGroupData.startDate
      ? new Date(selectedGroupData.startDate).toISOString().slice(0, 7)
      : DEFAULT_START_MONTH;
    setStartMonthInput(nextMonth);
  }, [selectedGroupData]);

  if (!isAdmin) {
    return (
      <div className="space-y-4 fade-in-up">
        <Breadcrumbs items={["Home", "Settings"]} />
        <div className="glass-card rounded-[28px] p-6 text-center">
          <p className="section-title">Restricted</p>
          <h2 className="mt-2 text-xl font-extrabold">Admin access required</h2>
          <p className="mt-2 text-sm text-[#7b6a56]">
            Settings are only available for admins.
          </p>
        </div>
      </div>
    );
  }

  const handleSaveStartMonth = async () => {
    if (!selectedGroup) return;

    try {
      setIsSaving(true);
      await API.patch(`/groups/${selectedGroup}`, {
        startDate: `${startMonthInput}-01`,
      });
      await loadGroups();
      alert("Chit settings updated");
    } catch (err: any) {
      alert(err.response?.data?.message || "Unable to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEndGroup = async () => {
    if (!selectedGroupData || selectedGroupData.isEnded) return;
    const ok = window.confirm(
      `End ${selectedGroupData.name}? This keeps history, but the chit will be marked closed.`,
    );
    if (!ok) return;

    try {
      setIsEnding(true);
      await API.post(`/groups/${selectedGroup}/end`);
      await loadGroups();
      alert("Chit ended");
    } catch (err: any) {
      alert(err.response?.data?.message || "Unable to end chit");
    } finally {
      setIsEnding(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      setIsCreating(true);
      await API.post("/groups", {
        name: createForm.name,
        totalAmount: Number(createForm.totalAmount),
        duration: Number(createForm.duration),
        memberLimit: Number(createForm.memberLimit),
        startDate: `${createForm.startMonth}-01`,
      });
      setCreateForm({
        name: "",
        totalAmount: "300000",
        duration: "10",
        memberLimit: "20",
        startMonth: DEFAULT_START_MONTH,
      });
      await loadGroups();
      alert("New chit group created");
    } catch (err: any) {
      alert(err.response?.data?.message || "Unable to create group");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4 fade-in-up">
      <Breadcrumbs items={["Home", "Admin", "Settings"]} />

      <div className="glass-card rounded-[28px] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="section-title">Settings</p>
            <h1 className="mt-2 text-[1.6rem] font-extrabold leading-tight">
              Group controls
            </h1>
            <p className="mt-2 text-sm text-[#7b6a56]">
              Change start month, close a chit, or launch the next group.
            </p>
          </div>
          <div className="rounded-full bg-[#fff2e8] px-3 py-1 text-xs font-bold text-[#a1441e]">
            Admin
          </div>
        </div>
      </div>

      <div className="soft-card rounded-[26px] p-4">
        <label className="section-title">Select Group</label>
        <select
          className="input-surface mt-3"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          {groups.map((group: any) => (
            <option key={group._id} value={group._id}>
              {group.name} {group.isEnded ? "(Ended)" : "(Active)"}
            </option>
          ))}
        </select>
      </div>

      {selectedGroupData && (
        <div className="space-y-4">
          <div className="soft-card rounded-[26px] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-title">Lifecycle</p>
                <h2 className="mt-2 text-xl font-extrabold">{selectedGroupData.name}</h2>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  selectedGroupData.isEnded
                    ? "bg-[#fce8e6] text-[#b54848]"
                    : "bg-[#e8f6ef] text-[#2f8f62]"
                }`}
              >
                {selectedGroupData.isEnded ? "Ended" : "Active"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-[#f8f3eb] p-3">
                <p className="text-[#7b6a56]">Start Month</p>
                <p className="mt-1 font-bold">
                  {formatMonthLabel(getMonthStartDate(selectedGroupData.startDate))}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f8f3eb] p-3">
                <p className="text-[#7b6a56]">Duration</p>
                <p className="mt-1 font-bold">{selectedGroupData.duration} months</p>
              </div>
              <div className="rounded-2xl bg-[#f8f3eb] p-3">
                <p className="text-[#7b6a56]">Total Amount</p>
                <p className="mt-1 font-bold">
                  Rs. {Number(selectedGroupData.totalAmount).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f8f3eb] p-3">
                <p className="text-[#7b6a56]">Member Limit</p>
                <p className="mt-1 font-bold">{selectedGroupData.memberLimit}</p>
              </div>
            </div>
          </div>

          <div className="soft-card rounded-[26px] p-5">
            <p className="section-title">Start Month</p>
            <h3 className="mt-2 text-lg font-extrabold">Move the chit calendar</h3>
            <p className="mt-2 text-sm text-[#7b6a56]">
              Dashboard months will realign from this value.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <input
                type="month"
                className="input-surface"
                value={startMonthInput}
                onChange={(e) => setStartMonthInput(e.target.value)}
              />
            </div>

            <button
              onClick={handleSaveStartMonth}
              disabled={isSaving}
              className="pill-button mt-4 w-full bg-[#c75c2a] text-white disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Start Month"}
            </button>
          </div>

          <div className="soft-card rounded-[26px] p-5">
            <p className="section-title">Close Chit</p>
            <h3 className="mt-2 text-lg font-extrabold">End this group</h3>
            <p className="mt-2 text-sm text-[#7b6a56]">
              Use this when a chit is completed and you want to keep it as history.
            </p>
            <button
              onClick={handleEndGroup}
              disabled={isEnding || selectedGroupData.isEnded}
              className="pill-button mt-4 w-full bg-[#2f2419] text-white disabled:opacity-50"
            >
              {selectedGroupData.isEnded
                ? "This chit is already ended"
                : isEnding
                  ? "Ending..."
                  : "End This Chit"}
            </button>
          </div>
        </div>
      )}

      <div className="glass-card rounded-[28px] p-5">
        <p className="section-title">New Group</p>
        <h2 className="mt-2 text-xl font-extrabold">Start the next chit</h2>
        <p className="mt-2 text-sm text-[#7b6a56]">
          Create a fresh group with its own schedule and start month.
        </p>

        <div className="mt-4 space-y-3">
          <input
            className="input-surface"
            placeholder="Group name"
            value={createForm.name}
            onChange={(e) =>
              setCreateForm((current) => ({ ...current, name: e.target.value }))
            }
          />
          <input
            className="input-surface"
            placeholder="Total amount"
            value={createForm.totalAmount}
            onChange={(e) =>
              setCreateForm((current) => ({ ...current, totalAmount: e.target.value }))
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="input-surface"
              placeholder="Duration"
              value={createForm.duration}
              onChange={(e) =>
                setCreateForm((current) => ({ ...current, duration: e.target.value }))
              }
            />
            <input
              className="input-surface"
              placeholder="Member limit"
              value={createForm.memberLimit}
              onChange={(e) =>
                setCreateForm((current) => ({ ...current, memberLimit: e.target.value }))
              }
            />
          </div>
          <input
            type="month"
            className="input-surface"
            value={createForm.startMonth}
            onChange={(e) =>
              setCreateForm((current) => ({ ...current, startMonth: e.target.value }))
            }
          />
          <button
            onClick={handleCreateGroup}
            disabled={isCreating || !createForm.name.trim()}
            className="pill-button w-full bg-[#2f8f62] text-white disabled:opacity-60"
          >
            {isCreating ? "Creating..." : "Create New Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
