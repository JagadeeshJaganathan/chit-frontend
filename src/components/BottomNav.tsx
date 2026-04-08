const BottomNav = ({ active, setActive }: any) => {
  const tabs = [
    { key: "dashboard", label: "🏠", name: "Home" },
    { key: "members", label: "👥", name: "Members" },
    { key: "winners", label: "🏆", name: "Winners" },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md flex justify-around py-2 z-50">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActive(tab.key)}
          className={`flex flex-col items-center text-sm active:scale-95 transition ${
            active === tab.key ? "text-blue-600" : "text-gray-400"
          }`}
        >
          <span className="text-xl">{tab.label}</span>
          <span>{tab.name}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNav;
