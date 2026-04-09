import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../services/api";
import Breadcrumbs from "../components/Breadcrumbs";
import {
  DEFAULT_START_MONTH,
  formatMonthLabel,
  getMonthNumberForDate,
  getMonthOptions,
  getMonthStartDate,
} from "../utils/group";

type Props = {
  isAdmin: boolean;
};

const Settings = ({ isAdmin }: Props) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [startMonthInput, setStartMonthInput] = useState(DEFAULT_START_MONTH);
  const [isSaving, setIsSaving] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
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

  const currentMonthNumber = selectedGroupData
    ? getMonthNumberForDate(selectedGroupData.startDate, selectedGroupData.duration)
    : 1;
  const currentMonthLabel = selectedGroupData
    ? getMonthOptions(selectedGroupData.startDate, selectedGroupData.duration).find(
        (option) => option.value === currentMonthNumber,
      )?.label
    : "";

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

  const handleExportPdf = async () => {
    if (!selectedGroupData) return;

    try {
      setIsExporting(true);

      const res = await API.get(
        `/dashboard/${selectedGroupData._id}/${currentMonthNumber}`,
      );

      const paidMembers = res.data.paidMembers || [];
      const pendingMembers = res.data.pendingMembers || [];
      const winnerName = res.data.winner?.name || "No winner selected";
      const reportWindow = window.open("", "_blank", "width=900,height=1200");

      if (!reportWindow) {
        alert("Unable to open print window. Please allow popups for this site.");
        return;
      }

      const renderList = (title: string, members: any[]) => `
        <section class="section">
          <h2>${title}</h2>
          ${
            members.length === 0
              ? `<p class="empty">No members in this section.</p>`
              : `<ul>${members
                  .map(
                    (member: any) =>
                      `<li><span>${member.name}</span><span>${member.phone ?? ""}</span></li>`,
                  )
                  .join("")}</ul>`
          }
        </section>
      `;

      reportWindow.document.write(`
        <html>
          <head>
            <title>${selectedGroupData.name} - ${currentMonthLabel || "Current Month"} Report</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 24px;
                color: #2f2419;
              }
              .header {
                border-bottom: 2px solid #c75c2a;
                padding-bottom: 16px;
                margin-bottom: 24px;
              }
              h1 {
                margin: 0 0 8px;
                font-size: 28px;
              }
              h2 {
                margin: 0 0 12px;
                font-size: 18px;
              }
              .meta {
                color: #6f604c;
                font-size: 14px;
                margin: 4px 0;
              }
              .winner {
                margin: 20px 0;
                padding: 16px;
                background: #fff4e8;
                border-radius: 12px;
              }
              .section {
                margin-top: 24px;
              }
              ul {
                list-style: none;
                padding: 0;
                margin: 0;
              }
              li {
                display: flex;
                justify-content: space-between;
                padding: 10px 12px;
                border-bottom: 1px solid #eadfcf;
                font-size: 14px;
              }
              .empty {
                color: #7b6a56;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${selectedGroupData.name}</h1>
              <p class="meta">Month: ${currentMonthLabel || `M${currentMonthNumber}`}</p>
              <p class="meta">Exported on: ${new Date().toLocaleString()}</p>
            </div>
            <div class="winner">
              <h2>Current Month Winner</h2>
              <div>${winnerName}</div>
            </div>
            ${renderList("Paid Members", paidMembers)}
            ${renderList("Pending Members", pendingMembers)}
          </body>
        </html>
      `);
      reportWindow.document.close();
      reportWindow.focus();
      reportWindow.print();
    } catch (err: any) {
      alert(err.response?.data?.message || "Unable to export report");
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareToWhatsApp = async () => {
    if (!selectedGroupData) return;

    try {
      setIsSharing(true);

      const res = await API.get(
        `/dashboard/${selectedGroupData._id}/${currentMonthNumber}`,
      );

      const paidMembers = (res.data.paidMembers || []).map(
        (member: any, index: number) => `${index + 1}. ${member.name} (${member.phone ?? "-"})`,
      );
      const pendingMembers = (res.data.pendingMembers || []).map(
        (member: any, index: number) => `${index + 1}. ${member.name} (${member.phone ?? "-"})`,
      );
      const winnerName = res.data.winner?.name || "No winner selected";

      const message = [
        `*${selectedGroupData.name}*`,
        `${currentMonthLabel || `M${currentMonthNumber}`}`,
        "",
        `*Winner:* ${winnerName}`,
        "",
        "*Paid Members:*",
        ...(paidMembers.length > 0 ? paidMembers : ["No paid members"]),
        "",
        "*Pending Members:*",
        ...(pendingMembers.length > 0 ? pendingMembers : ["No pending members"]),
      ].join("\n");

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      alert(err.response?.data?.message || "Unable to prepare WhatsApp share");
    } finally {
      setIsSharing(false);
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

          <div className="soft-card rounded-[26px] p-5">
            <p className="section-title">Export</p>
            <h3 className="mt-2 text-lg font-extrabold">Current month PDF report</h3>
            <p className="mt-2 text-sm text-[#7b6a56]">
              Export paid, pending, and the current month winner as a print-ready PDF.
            </p>
            <div className="mt-3 rounded-2xl bg-[#f8f3eb] p-3 text-sm text-[#6f604c]">
              {currentMonthLabel || `M${currentMonthNumber}`}
            </div>
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="pill-button mt-4 w-full bg-[#3558a8] text-white disabled:opacity-50"
            >
              {isExporting ? "Preparing PDF..." : "Export PDF"}
            </button>
            <button
              onClick={handleShareToWhatsApp}
              disabled={isSharing}
              className="pill-button mt-3 w-full bg-[#2f8f62] text-white disabled:opacity-50"
            >
              {isSharing ? "Preparing WhatsApp..." : "Share to WhatsApp"}
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
