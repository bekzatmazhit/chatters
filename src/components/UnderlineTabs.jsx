export default function UnderlineTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex items-center gap-0 border-b border-gray-200">
      {tabs.map(({ id, label, count }) => {
        const isActive = id === activeTab;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium cursor-pointer transition-colors relative
              ${isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            {label}
            {count !== undefined && (
              <span className={`text-xs font-semibold ${isActive ? 'text-indigo-500' : 'text-gray-400'}`}>
                {count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-sm" />
            )}
          </button>
        );
      })}
    </div>
  );
}
