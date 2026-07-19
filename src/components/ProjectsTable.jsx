import { Check, X, AlertTriangle, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import Modal from './Modal';

const PROJECTS = [
  {
    id: 1,
    name: 'Учебный центр TODAY',
    type: 'Образование / ЕНТ',
    avatar: 'УЦ',
    avatarColor: 'from-indigo-400 to-violet-500',
    visibility: 12,
    competitor_share: 40,
    queries: 3,
    scans: 5,
    status: 'active',
    lastScan: '16.07.2026',
    trend: 'down',
  },
  {
    id: 2,
    name: 'Infclub EHT platform',
    type: 'EdTech / Онлайн-курсы',
    avatar: 'IN',
    avatarColor: 'from-emerald-400 to-teal-500',
    visibility: 34,
    competitor_share: 22,
    queries: 5,
    scans: 12,
    status: 'active',
    lastScan: '15.07.2026',
    trend: 'up',
  },
];

function MiniBar({ value, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs font-bold text-slate-700 w-8 text-right">{value}%</span>
    </div>
  );
}

export default function ProjectsTable() {
  const [modal, setModal] = useState(null);

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-lg shadow-slate-200/60 fade-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-400">Проекты</p>
          <p className="text-lg font-bold text-slate-900 mt-0.5">Мои проекты</p>
        </div>
        <button className="text-xs font-semibold bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
          + Добавить проект
        </button>
      </div>

   
