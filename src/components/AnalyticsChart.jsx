import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const data = [
  { day: 'Пн', brand: 0, competitor: 18 },
  { day: 'Вт', brand: 0, competitor: 22 },
  { day: 'Ср', brand: 5, competitor: 20 },
  { day: 'Чт', brand: 0, competitor: 28 },
  { day: 'Пт', brand: 8, competitor: 25 },
  { day: 'Сб', brand: 0, competitor: 15 },
  { day: 'Вс', brand: 0, competitor: 12 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-xl shadow-slate-200/60 text-xs">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">
            {p.dataKey === 'brand' ? 'Ваш бренд' : 'Конкуренты'}:
          </span>
          <span className="font-bold text-slate-800">{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsChart() {
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-lg shadow-slate-200/60 fade-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-400">Аналитика</p>
          <p className="text-lg font-bold text-slate-900 mt-0.5">Динамика видимости за неделю</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            Ваш бренд
          </span>
          <span className="flex items-center gap-1.5">
    
