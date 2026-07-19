export default function SubNav({ subTabs, activeSubTab, onSubTabChange }) {
  return (
    <div className="flex items-center gap-2 px-10 py-3 bg-white border-b border-slate-100/80 shadow-sm">
      {subTabs.map((tab) => {
        const isActive = tab === activeSubTab;
        return (
          <button
            key={tab}
            onClick={() => onSubTabChange(tab)}
            className={`
              px-5 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-200
              ${isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }
            `}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
