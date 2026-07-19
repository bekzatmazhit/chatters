import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Target, Trophy, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const SOV_DATA = [
  { name: 'Ваш бренд (TODAY)', value: 45, color: '#3b82f6' },
  { name: 'IQ-Центр', value: 25, color: '#f43f5e' },
  { name: 'Smart Kids', value: 15, color: '#f59e0b' },
  { name: 'Dostyk', value: 10, color: '#10b981' },
  { name: 'Другие', value: 5, color: '#94a3b8' },
];

export default function SovView() {
  return (
    <div className="flex flex-col gap-6 fade-up pb-10">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">Доля голоса в ИИ (SOV)</h1>
          <p className="text-gray-500 text-[13px] mt-1">Оценка того, кого ИИ рекомендует чаще всего по вашей нише</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-6">
        
        {/* Pie Chart Card */}
        <div className="card p-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6 w-full">
            <Target size={18} className="text-blue-600" />
            <h3 className="text-[16px] font-bold text-gray-900">Распределение SOV</h3>
          </div>
          <div style={{ width: '100%', height: 320 }} className="relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SOV_DATA}
                  innerRadius={90}
                  outerRadius={130}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {SOV_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
         
