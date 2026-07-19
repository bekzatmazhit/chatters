import { useState } from 'react';
import { CalendarClock, Plus, Play, Pause, Trash2, Clock, Settings } from 'lucide-react';

const SCHEDULES = [
  { id: 1, name: 'Еженедельный скан (Основной)', frequency: 'Еженедельно (Пн, 09:00)', nextRun: '19 Июля, 09:00', status: 'active', models: ['GPT-4o', 'Claude 3.5'] },
  { id: 2, name: 'Мониторинг конкурентов', frequency: 'Ежедневно (20:00)', nextRun: 'Сегодня, 20:00', status: 'active', models: ['Gemini 1.5'] },
  { id: 3, name: 'Глубокий анализ ниши', frequency: 'Ежемесячно (1 число)', nextRun: '1 Авг, 12:00', status: 'paused', models: ['All Models'] },
];

export default function ScheduledView() {
  const [schedules, setSchedules] = useState(SCHEDULES);

  const toggleStatus = (id) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'paused' : 'active' } : s));
  };

  return (
    <div className="flex flex-col gap-6 fade-up pb-10">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">Регулярные проверки</h1>
          <p className="text-gray-500 text-[13px] mt-1">Настройте автоматическое сканирование нейросетей по расписанию</p>
        </div>
        <button className="blue-btn"><Plus size={14} fill="white"/> Новое расписание</button>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-6">
        
        {/* Schedules List */}
        <div className="flex flex-col gap-4">
          {schedules.map(s => (
            <div key={s.id} className={`card p-5 transition-all ${s.status === 'paused' ? 'opacity-60 grayscale-[50%]' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
       
