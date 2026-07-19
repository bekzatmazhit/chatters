import React from 'react';
import { MetricCard } from '@/components/shared/MetricCard';
import { DataTable } from '@/components/shared/DataTable';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function DemoDashboardMockup() {
  const pieData = [
    { name: 'Позитив', value: 65, color: 'var(--color-success)' },
    { name: 'Нейтрально', value: 25, color: 'var(--color-text-muted)' },
    { name: 'Негатив', value: 10, color: 'var(--color-danger)' },
  ];

  const tableData = [
    { id: 1, source: 'ChatGPT', sov: '45%', sentiment: 'Позитив' },
    { id: 2, source: 'Claude', sov: '28%', sentiment: 'Нейтрально' },
    { id: 3, source: 'Perplexity', sov: '15%', sentiment: 'Позитив' },
  ];

  const columns = [
    { key: 'source', header: 'Источник', cell: (item: any) => <span className="font-medium">{item.source}</span> },
    { key: 'sov', header: 'SOV', cell: (item: any) => item.sov },
    { 
      key: 'sentiment', 
      header: 'Тональность', 
      cell: (item: any) => (
        <span className={
          item.sentiment === 'Позитив' ? 'text-success' : 
          item.sentiment === 'Негатив' ? 'text-danger' : 'text-content-secondary'
        }>
          {item.sentiment}
        </span>
      ) 
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mt-16 rounded-xl overflow-hidden border border-border bg-surface-card shadow-2xl relative">
      {/* Browser Header Mockup */}
      <div className="h-10 bg-background border-b border-border flex items-center px-4 gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-danger/80" />
          <div className="w-3 h-3 rounded-full bg-accent/80" />
          <div className="w-3 h-3 rounded-full bg-success/80" />
        </div>
        <div className="mx-auto h-6 w-48 bg-surface-hover rounded-md border border-border/50 text-[11px] text-content-tertiary flex items-center justify-center pointer-events-none">
          chatters.ai/hub/kaspi
        </div>
      </div>

      {/* Dashboard Body */}
      <div className="p-6 bg-background space-y-6 pointer-events-none select-none">
        
        {/* Metric Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            label="Share of Voice (SOV)" 
            value="42.5%" 
            trend={{ value: 5.2, label: 'п.п.', direction: 'up' }}
            sparklineData={[{value: 30}, {value: 32}, {value: 35}, {value: 38}, {value: 40}, {value: 42.5}]}
            className="shadow-sm"
          />
          <MetricCard 
            label="AIO-скор" 
            value="74.1" 
            trend={{ value: -2.4, direction: 'down' }}
            sparklineData={[{value: 80}, {value: 78}, {value: 75}, {value: 76}, {value: 74}, {value: 74.1}]}
            className="shadow-sm"
          />
          <MetricCard 
            label="Упоминания (30 дн)" 
            value="12,482" 
            trend={{ value: 12, label: '%', direction: 'up' }}
            sparklineData={[{value: 10000}, {value: 10500}, {value: 11000}, {value: 10800}, {value: 12000}, {value: 12482}]}
            className="shadow-sm"
          />
        </div>

        {/* Charts & Table Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut Chart Mockup */}
          <div className="panel p-5 col-span-1 shadow-sm flex flex-col">
            <h3 className="text-[13px] font-medium text-content-secondary mb-4">Общая тональность</h3>
            <div className="flex-1 flex items-center justify-center relative min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    stroke="none"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[24px] font-semibold">65%</span>
                <span className="text-[11px] text-content-tertiary">позитив</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[11px] text-content-secondary">{d.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Table Mockup */}
          <div className="panel p-0 col-span-1 lg:col-span-2 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-[13px] font-medium text-content-secondary">Распределение по источникам</h3>
            </div>
            <DataTable 
              data={tableData} 
              columns={columns} 
              keyExtractor={item => item.id} 
              className="border-none shadow-none rounded-none"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
