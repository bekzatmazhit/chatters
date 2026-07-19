import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/shared/MetricCard';
import { DataTable } from '@/components/shared/DataTable';
import { FilterPill } from '@/components/shared/FilterPill';
import { IconFilter, IconCalendarEvent, IconSettings } from '@tabler/icons-react';
import { useTheme } from '@/components/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function DesignSystemView() {
  const { theme, toggleTheme } = useTheme();
  
  const sampleTableData = [
    { id: 1, name: 'Kaspi.kz', sov: 42.5, mentions: 2451, status: 'stable' },
    { id: 2, name: 'Halyk Bank', sov: 28.1, mentions: 1832, status: 'growing' },
    { id: 3, name: 'Jusan Bank', sov: 15.4, mentions: 954, status: 'falling' },
  ];

  const columns = [
    { key: 'name', header: 'Бренд', cell: (item) => <span className="font-medium">{item.name}</span> },
    { key: 'sov', header: 'SOV (%)', cell: (item) => item.sov },
    { key: 'mentions', header: 'Упоминания', cell: (item) => <span className="tabular-nums">{item.mentions.toLocaleString('ru-RU')}</span> },
    { 
      key: 'status', 
      header: 'Статус', 
      cell: (item) => (
        <Badge variant={item.status === 'stable' ? 'neutral' : item.status === 'growing' ? 'success' : 'danger'}>
          {item.status === 'stable' ? 'Стабильно' : item.status === 'growing' ? 'Растет' : 'Падает'}
        </Badge>
      ) 
    },
    { 
      key: 'actions', 
      header: '', 
      cell: () => <Button variant="ghost" size="sm">Отчет</Button>,
      className: 'text-right'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-8 pb-20">
      <div className="max-w-5xl mx-auto space-y-12">
        
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-content-primary mb-2">Design System Sandbox</h1>
            <p className="text-content-secondary">Единый источник правды для UI-компонентов chatters.</p>
          </div>
          <Button variant="secondary" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </header>

        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <h2 className="text-lg font-semibold text-content-primary">Buttons (Пилюли)</h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" size="icon"><IconSettings size={18} /></Button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <h2 className="text-lg font-semibold text-content-primary">Badges (Радиус 12px)</h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="success">Успешно (+12%)</Badge>
            <Badge variant="danger">Критично (-5.2)</Badge>
            <Badge variant="neutral">В процессе</Badge>
            <Badge variant="accent">Новый проект</Badge>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <h2 className="text-lg font-semibold text-content-primary">Filter Pills</h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <FilterPill 
              icon={<IconCalendarEvent size={16} stroke={1.5} />}
              options={[
                { label: 'За 30 дней', value: '30d' },
                { label: 'За 7 дней', value: '7d' },
                { label: 'Вчера', value: '1d' },
              ]} 
            />
            <FilterPill 
              icon={<IconFilter size={16} stroke={1.5} />}
              options={[
                { label: 'Все проекты', value: 'all' },
                { label: 'Kaspi', value: 'kaspi' },
              ]} 
            />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <h2 className="text-lg font-semibold text-content-primary">Metric Cards</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard 
              label="Общий SOV" 
              value="42.5%" 
              trend={{ value: 5.2, label: 'п.п.' }}
              sparklineData={[{value: 20}, {value: 25}, {value: 30}, {value: 28}, {value: 35}, {value: 40}, {value: 42.5}]}
            />
            <MetricCard 
              label="AIO-скор" 
              value="74.1" 
              trend={{ value: -2.4, direction: 'down' }}
              sparklineData={[{value: 80}, {value: 78}, {value: 75}, {value: 76}, {value: 74}, {value: 72}, {value: 74.1}]}
            />
            <MetricCard 
              label="Упоминания" 
              value="12,482" 
              trend={{ value: 0, direction: 'neutral' }}
            />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <h2 className="text-lg font-semibold text-content-primary">Data Table (No Zebra, Hairline border)</h2>
          </div>
          <DataTable 
            data={sampleTableData}
            columns={columns}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => console.log('Clicked', item)}
          />
        </section>

      </div>
    </div>
  );
}
