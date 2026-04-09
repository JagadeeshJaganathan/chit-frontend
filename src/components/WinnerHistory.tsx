import { useEffect, useState } from "react";
import API from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { formatMonthLabel, getMonthStartDate } from "../utils/group";

type Props = {
  groupId: string;
  currentMonth: number;
  totalMonths: number;
  refreshKey: number;
  isAdmin: boolean;
  onRefresh: () => void;
  startDate?: string;
  disabled?: boolean;
};

const WinnerHistory = ({
  groupId,
  currentMonth,
  totalMonths,
  refreshKey,
  isAdmin,
  onRefresh,
  startDate,
  disabled,
}: Props) => {
  const [winners, setWinners] = useState<any[]>([]);
  const { language, t } = useLanguage();

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
      onRefresh();
    } catch (err) {
      console.log(err);
    }
  };

  const fullTimeline = Array.from({ length: totalMonths }, (_, i) => {
    const month = i + 1;
    const winner = winners.find((item) => item.month === month);
    const optionDate = new Date(getMonthStartDate(startDate));
    optionDate.setMonth(optionDate.getMonth() + i);

    return {
      month,
      winner,
      label: formatMonthLabel(optionDate, language === "ta" ? "ta-IN" : "en-US"),
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-title">{t("timeline")}</p>
          <h3 className="mt-2 text-lg font-extrabold">{t("month_by_month_winners")}</h3>
        </div>
        {disabled && (
          <span className="rounded-full bg-[#f3eee5] px-3 py-1 text-xs font-bold text-[#7b6a56]">
            {t("ended")}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {fullTimeline.map((item) => (
          <div
            key={item.month}
            className={`rounded-[22px] p-4 ${
              item.month === currentMonth ? "bg-[#fff2b6]" : "bg-[#f8f3eb]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#7b6a56]">
                  M{item.month} - {item.label}
                </p>
                <p className="mt-1 font-bold">
                  {item.winner?.memberId?.name || t("no_winner")}
                </p>
              </div>

              {isAdmin && item.winner && !disabled && (
                <button
                  onClick={() => handleDelete(item.winner._id)}
                  className="pill-button bg-[#f8dfd7] px-4 py-2 text-xs text-[#b54848]"
                >
                  {t("delete")}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WinnerHistory;
