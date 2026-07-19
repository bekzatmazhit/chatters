import { useState } from 'react';
import { BellRing, Plus, MoreVertical, AlertTriangle, Zap, ArrowDownRight, Bot, Target } from 'lucide-react';

const ALERTS = [
  {
    id: 1,
    name: 'Падение SOV > 5%',
    description: 'Срабатывает, если доля видимости бренда падает больше чем на 5% за неделю в любой модели.',
    trigger: 'SOV Drop',
    action: 'Slack Notification',
    status: 'active',
    icon: ArrowDownRight,
    color: 'text-negative',
    bg: 'bg-negative/10',
  },
  {
    id: 2,
    name: 'Новая галлюцинация',
    description: 'Модель выдает фактически неверную информацию о продукте или ценах.',
    trigger: 'Fact-Check Failed',
    action: 'Email & Jira',
    status: 'active',
    icon: AlertTriangle,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    id: 3,
    name: 'Потеря позиции #1',
    description: 'Конкурент обходит наш бренд по ключевым коммерческим запросам в ChatGPT-4o.',
    trigger: 'Rank Changed',
    action: 'Telegram Alert',
    status: 'paused',
    icon: Target,
    color: 'text-content-primary',
    bg: 'bg-surface-border',
  },
  {
    id: 4,
    name: 'Новый конкурент в выдаче',
    description: 'Неизвестный бренд появляется в топ-3 рекомендаций Claude 3.5 Sonnet.',
    trigger: 'Competitor Mentioned',
    action: 'Slack Notification',
    status: 'active',
    icon: Bot,
    color: 'text-accent',
    bg: 'bg-accent/10',
  }
];

export default function AlertsView() {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-medium text-content-primary tracking-tight mb
