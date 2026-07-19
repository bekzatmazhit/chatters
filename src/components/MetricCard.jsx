import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetricCard({ icon: Icon, iconBg, iconColor, label, value, trend, trendLabel, suffix = '' }) {
  const trendConfig = {
    up: { Icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    down: { Icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-50' },
    neutral: { Icon: Minus, color: 'text-slate-400', bg: 'bg-slate-50' },
  };
  const t = trendConfig[trend] || trendConfig.neutral;

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-lg shadow-slate-200/60 flex flex-col gap-4 hover:shadow-xl hover:shadow-slate-200/80 transition-shadow duration-300 fade-up">
      {/* Icon */}
      <div className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center`}>
        <Icon size={20} className={iconColor} strokeWidth={2} />
      </div>

      {/* Value */}
      <div>
        <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-1">
          {label}
        </p>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">
          {value}
          {suffix && <span className="text-xl font-semibold text-slate-400 ml-0.5">{suffix}</span>}
        </p>
      </div>

      {/* Trend */}
      {trendLabel && (
        <div className={`inline-flex items-center gap-1.5 self-start ${t.bg} ${t.color} text-[11px] font-semibold px-3 py-1 rounded-full`}>
          <t.Icon size={11} strokeWidth={2.5} />
          {trendLabel}
        </div>
      )}
    </div>
  );
}
