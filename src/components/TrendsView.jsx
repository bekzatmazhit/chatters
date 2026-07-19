import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, Calendar, Download } from 'lucide-react';

const TRENDS_DATA = [
  { date: '1 Мар', brand: 12, comp1: 30, comp2: 15 },
  { date: '8 Мар', brand: 15, comp1: 28, comp2: 18 },
  { date: '15 Мар', brand: 14, comp1: 32, comp2: 16 },
  { date: '22 Мар', brand: 25, comp1: 30, comp2: 12 },
  { date: '29 Мар', brand: 32, comp1: 25, comp2: 10 },
  { date: '5 Апр', brand: 38, comp1: 22, comp2: 14 },
  { date: '12 Апр', brand: 45, comp1: 20, comp2: 15 },
];

export default function TrendsView() {
  return (
    <div className="flex flex-col gap-6 fade-up pb-10">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">Динамика видимости</h1>
          <p className="text-gray-500 text-[13px] mt-1">Отслеживайте изменение Share of Voice (SOV) во времени</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="white-btn"><Calendar size={14}/> За месяц</button>
          <button className="blue-btn"><Download size={14}/> Экспорт</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-gray-500 text-[13px] font-semibold mb-2">Текущий SOV бренда</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-gray-900 tracking-tight">45.0%</span>
          </div>
          <span className="text-green-500 bg-green-50 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit mt-2 text-[12px] font-bold">
            <TrendingUp size={12} /> +13.0% за месяц
          </span>
        </div>
        <div className="card p-6">
    
