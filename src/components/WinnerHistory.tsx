import { useEffect, useState } from "react";
import API from "../services/api";
type Props = {
  groupId: string;
  currentMonth: number;
  totalMonths: number;
  refreshKey: number;
  isAdmin: boolean;
  onRefresh: () => void;
};
const WinnerHistory = ({
  groupId,
  currentMonth,
  totalMonths,
  refreshKey,
  isAdmin,
  onRefresh,
}: Props) => {
  const [winners, setWinners] = useState<any[]>([]);

  useEffect(() => {
    if (!groupId) return;

    API.get(`/winners/${groupId}`)
      .then((res) => {
        const sorted = res.data.sort((a: any, b: any) => a.month - b.month);
        setWinners(sorted);
      })
      .catch(console.log);
  }, [groupId, refreshKey]);

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Delete this winner?");
    if (!ok) return;

    try {
      await API.delete(`/winners/${id}`);
      onRefresh(); // 🔥 refresh dashboard + timeline
    } catch (err) {
      console.log(err);
    }
  };

  const fullTimeline = Array.from({ length: totalMonths }, (_, i) => {
    const month = i + 1;
    const winner = winners.find((w) => w.month === month);

    return {
      month,
      winner,
    };
  });

  return (
    <div className="bg-white p-4 rounded-xl">
      <h3 className="font-semibold mb-3">📜 Timeline</h3>

      {fullTimeline.map((item) => (
        <div
          key={item.month}
          className={`flex justify-between items-center p-2 border-b ${
            item.month === currentMonth ? "bg-yellow-100" : ""
          }`}
        >
          <div>
            <p className="text-sm">Month {item.month}</p>
            <p className="font-medium">
              {item.winner?.memberId?.name || "No winner"}
            </p>
          </div>

          {/* 🔥 ADMIN DELETE */}
          {isAdmin &&
            item.winner && ( // prevent deleting current month
              <button
                onClick={() => handleDelete(item.winner._id)}
                className="text-red-500 text-xs"
              >
                Delete
              </button>
            )}
        </div>
      ))}
    </div>
  );
};

export default WinnerHistory;
