import { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, Tooltip as RechartsTooltip, Legend, ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Plus, Flag, Calendar } from 'lucide-react';
import { useBrands } from '../BrandContext';

// Generate fake weekly data
function generateTimelineData(brandName, competitorName) {
  const weeks = ['Янв 1', 'Янв 8', 'Янв 15', 'Янв 22', 'Фев 1', 'Фев 8', 'Фев 15', 'Фев 22', 'Мар 1', 'Мар 8', 'Мар 15', 'Мар 22'];
  let brandSov = 48, compSov = 52, brandMent = 130, compMent = 150;
  return weeks.map((week, i) => {
    brandSov = Math.max(20, Math.min(90, brandSov + (Math.random() - 0.45) * 6));
    compSov = Math.max(20, Math.min(90, compSov + (Math.random() - 0.55) * 6));
    brandMent = Math.max(50, Math.round(brandMent + (Math.random() - 0.4) * 20));
    compMent = Math.max(50, Math.round(compMent + (Math.random() - 0.5) * 20));
    return {
      week,
      [brandName]: Math.round(brandSov),
      [competitorName]: Math.round(compSov),
      [`${brandName}_mentions`]: brandMent,
      [`${competitorName}_mentions`]: compMent,
    };
  });
}

const EVENTS = [
  { week: 'Янв 22', label: 'Запуск кампании', color: '#8b5cf6' },
  { week: 'Фев 8', label: 'PR-статья в Forbes', color: '#10b981' },
  { week: 'Мар 1', label: 'Обновление продукта', color: '#f59e0b' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-panel border border-surface-border p-3 rounded-xl shadow-xl shadow-black/40 min-w-[180px]">
        <p className="text-[12px] font-semibold text-content-muted mb-2">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-4 text-[13px]">
            <div className="flex items-center gap-2">
              <span 
