import { useState } from 'react';
import { Slack, Send, Search, Trello, Database, Check, Plus, Lock } from 'lucide-react';

const INTEGRATIONS = [
  {
    id: 'slack',
    name: 'Slack',
    category: 'ALERTS',
    description: 'Получайте уведомления об изменениях SOV и новых галлюцинациях в реальном времени.',
    status: 'connected',
    icon: Slack,
    color: 'text-content-primary',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    category: 'ALERTS',
    description: 'Мгновенные оповещения в выбранный Telegram чат или канал.',
    status: 'available',
    icon: Send,
    color: 'text-blue-500',
  },
  {
    id: 'gsc',
    name: 'Google Search Console',
    category: 'DATA',
    description: 'Импорт поисковых запросов для сравнения видимости в классическом поиске и ИИ.',
    status: 'connected',
    icon: Search,
    color: 'text-content-primary',
  },
  {
    id: 'jira',
    name: 'Jira',
    category: 'WORKFLOW',
    description: 'Автоматическое создание тикетов для PR-команды при падении видимости бренда.',
    status: 'soon',
    icon: Trello, // Placeholder
    color: 'text-content-primary',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'CRM',
    description: 'Обогащение данных лидов информацией об их интересе к ИИ-выдаче.',
    status: 'soon',
    icon: Database, // Placeholder
    color: 'text-orange-500',
  }
];

export default function IntegrationsView() {
  const [filter, setFilter] = useState('ALL');

  const categories = ['ALL', ...Array.from(new Set(INTEGRATIONS.map(i => i.category)))];
  
  const filteredIntegrations = filter === 'ALL' 
    ? INTEGRATIONS 
    : INTEGRATIONS.filter(i => i.category === filter);

  return (
    
