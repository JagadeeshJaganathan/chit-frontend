import { useState } from "react";
import API from "../services/api";

type Props = {
  members: any[];
  groupId: string;
  month: number;
  onSuccess: () => void;
  currentWinner: any;
  winners: any[];
};

const WinnerSelector = ({
  members,
  groupId,
  month,
  onSuccess,
  currentWinner,
  winners,
}: Props) => {
  const [selectedMember, setSelectedMember] = useState("");

  // 🔥 FILTER MEMBERS (REMOVE ALREADY WON)
  const winnerIds = (winners || []).map((w) => String(w.memberId));

  const availableMembers = members.filter(
    (m) => !winnerIds.includes(String(m._id)),
  );

  // ✅ IF WINNER EXISTS → SHOW ONLY RESULT
  if (currentWinner) {
    return (
      <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-center">
        <p className="text-sm text-gray-600">
          Winner already selected for this month
        </p>
        <p className="font-semibold text-green-700 text-lg mt-1">
          🏆 {currentWinner.name}
        </p>
      </div>
    );
  }

  // 🔹 SELECT WINNER
  const handleSelectWinner = async () => {
    if (!selectedMember) return;

    try {
      await API.post("/winners", {
        groupId,
        memberId: selectedMember,
        month,
      });

      setSelectedMember("");
      onSuccess(); // 🔥 refresh
    } catch (err: any) {
      alert(err.response?.data?.message || "Error selecting winner");
    }
  };

  return (
    <div className="space-y-3">
      {/* Dropdown */}
      <select
        className="w-full border p-3 rounded-xl bg-white shadow-sm"
        value={selectedMember}
        onChange={(e) => setSelectedMember(e.target.value)}
      >
        <option value="">Select Winner</option>

        {availableMembers.length === 0 ? (
          <option disabled>All members already won</option>
        ) : (
          availableMembers.map((m: any) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))
        )}
      </select>

      {/* Button */}
      <button
        onClick={handleSelectWinner}
        disabled={!selectedMember}
        className={`w-full py-2 rounded-xl text-white font-medium transition ${
          selectedMember
            ? "bg-blue-500 active:scale-95"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        Confirm Winner
      </button>
    </div>
  );
};

export default WinnerSelector;
