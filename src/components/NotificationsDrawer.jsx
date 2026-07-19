import { X, Bell, ExternalLink, Activity, Info, AlertTriangle } from 'lucide-react';

export default function NotificationsDrawer({ onClose }) {
  const notifications = [
    {
      id: 1,
      type: 'alert',
      title: 'Резкое падение SOV',
      desc: 'Доля голоса бренда Nike упала на 15% за последние 2 часа.',
      time: '10 мин назад',
      icon: AlertTriangle,
      color: 'text-negative',
      bg: 'bg-negative/10',
    },
    {
      id: 2,
      type: 'info',
      title: 'Новый конкурент',
      desc: 'В вашей категории замечен всплеск упоминаний нового продукта от Puma.',
      time: '1 час назад',
      icon: Activity,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      id: 3,
      type: 'system',
      title: 'Еженедельный отчет готов',
      desc: 'Отчет об активности за прошлую неделю сгенерирован и отправлен в Slack.',
      time: '3 часа назад',
      icon: Info,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-panel border-l border-surface-border shadow-2xl flex flex-col pointer-events-auto animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-surface-border flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/
