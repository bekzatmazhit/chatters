import { useState } from 'react';
import { MapPin, ArrowRightLeft, Search, Globe, ChevronDown } from 'lucide-react';
import { useBrands } from '../BrandContext';

export default function GeoView() {
  const { activeBrand } = useBrands();
  
  // Fake geo data
  const countries = [
    { name: 'United States', code: 'US', percent: 45, mentions: 12400, color: 'bg-blue-500' },
    { name: 'United Kingdom', code: 'UK', percent: 20, mentions: 5500, color: 'bg-blue-400' },
    { name: 'Germany', code: 'DE', percent: 15, mentions: 4100, color: 'bg-blue-300' },
    { name: 'France', code: 'FR', percent: 10, mentions: 2700, color: 'bg-blue-200' },
    { name: 'Others', code: 'OT', percent: 10, mentions: 2700, color: 'bg-surface-border' },
  ];

  return (
    <div className="flex flex-col gap-6 fade-up pb-10">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-[26px] font-bold text-content-primary tracking-tight">География и Аудитория</h1>
          <p className="text-content-muted text-[13px] mt-1">Тепловая карта упоминаний вашего бренда в ответах ИИ по всему миру.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Heatmap Section */}
        <div className="lg:col-span-2 panel p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[15px] font-bold text-content-primary flex items-center gap-2">
              <Globe size={18} className="text-accent" />
              Глобальное присутствие
            </h2>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface border border-surface-border text-[12px] font-semibold text-content-primary">
                Все модели <ChevronDown size={14} />
 
