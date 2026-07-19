import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Smile, Meh, Frown, MessageCircle } from 'lucide-react';

const SENTIMENT_DATA = [
  { name: 'Позитив', value: 65, color: '#22c55e' },
  { name: 'Нейтрал', value: 25, color: '#cbd5e1' },
  { name: 'Негатив', value: 10, color: '#ef4444' },
];

const TAGS = [
  { word: 'Инновационный', weight: 5, color: 'text-blue-600', bg: 'bg-blue-50' },
  { word: 'Дорогой', weight: 3, color: 'text-red-600', bg: 'bg-red-50' },
  { word: 'Надежный', weight: 4, color: 'text-green-600', bg: 'bg-green-50' },
  { word: 'Популярный', weight: 4, color: 'text-purple-600', bg: 'bg-purple-50' },
  { word: 'Удобно', weight: 2, color: 'text-gray-600', bg: 'bg-gray-100' },
  { word: 'Экспертиза', weight: 5, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { word: 'Сложно', weight: 2, color: 'text-orange-600', bg: 'bg-orange-50' },
];

export default function SentimentView() {
  return (
    <div className="flex flex-col gap-6 fade-up pb-10">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">Тональность и имидж</h1>
          <p className="text-gray-500 text-[13px] mt-1">Анализ эмоциональной окраски ответов нейросетей</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_2fr] gap-6">
        {/* Sentiment Pie */}
        <div className="card p-6 flex flex-col items-center">
          <h3 className="text-[16px] font-bold text-gray-900 mb-6 w-full text-left">Общая тональность</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SENTIMENT_DATA}
                  innerRadius={70}
             
