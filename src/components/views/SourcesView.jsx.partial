import { Link, ExternalLink, Globe, Hash, BookOpen } from 'lucide-react';

const SOURCES_DATA = [
  { id: 1, domain: 'krisha.kz', type: 'Каталог', mentions: 145, trend: '+12%', lastSeen: 'Сегодня', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, domain: 'vse.kz (Форум)', type: 'Форум', mentions: 89, trend: '-5%', lastSeen: 'Вчера', icon: Hash, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 3, domain: '2gis.kz', type: 'Справочник', mentions: 76, trend: '+20%', lastSeen: 'Сегодня', icon: Globe, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 4, domain: 'forbes.kz', type: 'Медиа', mentions: 34, trend: '0%', lastSeen: '3 дня назад', icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 5, domain: 'reddit.com/r/kazakhstan', type: 'Сообщество', mentions: 12, trend: '+50%', lastSeen: 'Вчера', icon: Hash, color: 'text-orange-500', bg: 'bg-orange-50' },
];

export default function SourcesView() {
  return (
    <div className="flex flex-col gap-6 fade-up pb-10">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">Анализ источников</h1>
          <p className="text-gray-500 text-[13px] mt-1">Сайты и форумы, откуда ИИ (Perplexity, ChatGPT Search) берет информацию о вас</p>
        </div>
      </div>

      <div className="grid grid-cols-[3fr_1fr] gap-6">
        
        {/* Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-gray-900">Топ цитируемых доменов</h2>
            <button className="text-[13px] font-semibold text-blue-600 hover:text-blue-700">Скачать CSV</button>
          </div>
          <div className=
