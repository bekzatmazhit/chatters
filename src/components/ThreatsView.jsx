import { Radar, AlertTriangle, TrendingUp, Search, Crosshair } from 'lucide-react';

const THREATS_DATA = [
  { id: 1, name: 'Lumos Academy', sector: 'EdTech Startup', severity: 'high', freq: 12, trend: '+400%', note: 'Внезапно начал рекомендоваться Claude 3.5 для подготовки к IELTS в Астане.' },
  { id: 2, name: 'Qazaq Study', sector: 'Локальные курсы', severity: 'medium', freq: 5, trend: '+150%', note: 'Появляется в ответах Gemini при поиске офлайн репетиторов.' },
  { id: 3, name: 'Tutor PRO', sector: 'Агрегатор', severity: 'low', freq: 2, trend: 'New', note: 'Зафиксировано первое появление в ChatGPT-4o на этой неделе.' },
];

export default function ThreatsView() {
  return (
    <div className="flex flex-col gap-6 fade-up pb-10">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">Радар скрытых угроз</h1>
          <p className="text-gray-500 text-[13px] mt-1">Отслеживание новых игроков, которых ИИ начал рекомендовать в вашей нише</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm w-64">
          <Search size={14} className="text-gray-400" />
          <input placeholder="Поиск угроз..." className="bg-transparent text-[13px] outline-none w-full" />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_2.5fr] gap-6">
        
        {/* Radar Visual (Abstract representation) */}
        <div className="card p-6 flex flex-col items-center justify-center bg-gray-900 overflow-hidden relative min-h-[400px]">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `repeating-radial-gradient
