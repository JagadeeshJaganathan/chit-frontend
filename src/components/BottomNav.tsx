type Tab = {
  key: string;
  label: string;
};

const TAB_ICONS: Record<string, string> = {
  dashboard: "Home",
  members: "Crew",
  shuffle: "Draw",
  settings: "Tools",
};

type Props = {
  active: string;
  setActive: (tab: string) => void;
  tabs: Tab[];
};

const BottomNav = ({ active, setActive, tabs }: Props) => {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-24px)] max-w-md -translate-x-1/2 rounded-[28px] border border-[#ffffff66] bg-[#2f2419]/90 px-2 py-2 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-around gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`flex min-w-0 flex-1 flex-col items-center rounded-[20px] px-3 py-2 text-xs font-semibold transition ${
              active === tab.key
                ? "bg-[#fff4ea] text-[#8d3413]"
                : "text-[#d9ccb8]"
          }`}
          >
            <span className="text-[0.68rem] uppercase tracking-[0.18em]">
              {TAB_ICONS[tab.key] || "Page"}
            </span>
            <span className="mt-1 text-sm">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
