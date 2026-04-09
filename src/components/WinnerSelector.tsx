import { useState } from "react";
import API from "../services/api";

type Props = {
  members: any[];
  groupId: string;
  month: number;
  onSuccess: () => void;
  currentWinner: any;
  winners: any[];
  disabled?: boolean;
};

const WinnerSelector = ({
  members,
  groupId,
  month,
  onSuccess,
  currentWinner,
  winners,
  disabled,
}: Props) => {
  const [selectedMember, setSelectedMember] = useState("");

  const winnerIds = (winners || []).map((winner) => String(winner.memberId));
  const availableMembers = members.filter(
    (member) => !winnerIds.includes(String(member._id)),
  );

  if (currentWinner) {
    return (
      <div className="rounded-[22px] bg-[#ecf7f1] p-4 text-center">
        <p className="text-sm text-[#5f7a6b]">Winner already selected for this month</p>
        <p className="mt-1 text-lg font-semibold text-[#2f8f62]">
          {currentWinner.name}
        </p>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="rounded-[22px] bg-[#f3eee5] p-4 text-sm text-[#7b6a56]">
        This chit is ended. Winner selection is locked.
      </div>
    );
  }

  const handleSelectWinner = async () => {
    if (!selectedMember) return;

    try {
      await API.post("/winners", {
        groupId,
        memberId: selectedMember,
        month,
      });

      setSelectedMember("");
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error selecting winner");
    }
  };

  return (
    <div className="space-y-3">
      <select
        className="input-surface"
        value={selectedMember}
        onChange={(e) => setSelectedMember(e.target.value)}
      >
        <option value="">Select Winner</option>
        {availableMembers.length === 0 ? (
          <option disabled>All members already won</option>
        ) : (
          availableMembers.map((member: any) => (
            <option key={member._id} value={member._id}>
              {member.name}
            </option>
          ))
        )}
      </select>

      <button
        onClick={handleSelectWinner}
        disabled={!selectedMember}
        className={`pill-button w-full text-white ${
          selectedMember ? "bg-[#c75c2a]" : "cursor-not-allowed bg-[#d8cabc]"
        }`}
      >
        Confirm Winner
      </button>
    </div>
  );
};

export default WinnerSelector;
