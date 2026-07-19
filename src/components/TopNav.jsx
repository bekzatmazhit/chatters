import { Bell, Settings, TrendingUp, TrendingDown, Minus, Bot } from 'lucide-react';

const PRIMARY_TABS = [
  'Сводка',
  'Аналитика ИИ',
  'Разведка рынка',
  'Оптимизация (AIO)',
  'Автоматизация',
  'Настройки',
];

export default function TopNav({ activeTab, onTabChange }) {
  return (
    <header className="flex justify-between items-center py-4 px-10 bg-transparent shrink-0 relative z-20">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
          <Bot size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-2xl font-bold text-slate-800 tracking-tight">
          chatters
        </span>
      </div>

      {/* Primary pill tabs */}
      <nav className="flex items-center gap-1.5 bg-slate-100/70 rounded-full p-1.5">
        {PRIMARY_TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`
                px-5 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-200
                ${isActive
                  ? 'bg-white text-indigo-700 font-semibold shadow-sm border border-indigo-100/80'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                }
              `}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
          <Settings size={16} />
        </button>
     
