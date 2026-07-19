import { Clock, CheckCircle2, AlertCircle, Circle } from 'lucide-react';

const TASKS = [
  {
    id: 1,
    title: 'Проверить упоминания TODAY в ChatGPT',
    assignee: 'Anuар',
    avatar: 'АН',
    avatarColor: 'from-violet-400 to-purple-500',
    status: 'in-progress',
    priority: 'high',
    due: 'Сегодня',
  },
  {
    id: 2,
    title: 'Составить отчёт по конкурентам Dostyk и IQ',
    assignee: 'Шнырайлим',
    avatar: 'ШН',
    avatarColor: 'from-emerald-400 to-teal-500',
    status: 'todo',
    priority: 'medium',
    due: 'Завтра',
  },
  {
    id: 3,
    title: 'Обновить целевые запросы в настройках',
    assignee: 'Anuар',
    avatar: 'АН',
    avatarColor: 'from-violet-400 to-purple-500',
    status: 'completed',
    priority: 'low',
    due: 'Выполнено',
  },
  {
    id: 4,
    title: 'Запустить скан по Gemini и Claude',
    assignee: 'Шнырайлим',
    avatar: 'ШН',
    avatarColor: 'from-emerald-400 to-teal-500',
    status: 'in-progress',
    priority: 'high',
    due: '18 июля',
  },
];

const STATUS_CONFIG = {
  'completed': {
    label: 'Выполнено',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    icon: CheckCircle2,
  },
  'in-progress': {
    label: 'В процессе',
    bg: 'bg-orange-50',
    text: 'text-orange-500',
    icon: Clock,
  },
  'todo': {
    label: 'К выполнению',
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    icon: Circle,
  },
};

const PRIORITY_CONFIG = {
  high: { label: 'Высокий', dot: 'bg-rose-500' },
  medium: { label: 'Средний', dot: 'bg-amber-400' },
  low: { label: 'Низкий', dot: 'bg-emerald-400' },
};

export default function PriorityTasks() {
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-lg shadow-slate-200/60 fade-up">
      <div className="flex items-ce
