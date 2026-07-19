import { useState } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend,
  LineChart, Line, CartesianGrid
} from 'recharts';
import { Swords, CheckCircle2, XCircle, MessagesSquare, Quote, Brain, AlertCircle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useBrands } from '../BrandContext';

export default function HeadToHeadView() {
  const { activeBrand } = useBrands();
  const [competitor, setCompetitor] = useState(activeBrand?.competitors?.[0] || 'Competitor A');
  const [loading, setLoading] = useState(false);
  const [expandedQuote, setExpandedQuote] = useState(null);

  // Mock Data
  const brandName = activeBrand?.name || 'Наш Бренд';
  
  const radarData = [
    { subject: 'Цены / Тарифы', A: 85, B: 65, fullMark: 100 },
    { subject: 'Интеграции', A: 90, B: 85, fullMark: 100 },
    { subject: 'Поддержка', A: 70, B: 95, fullMark: 100 },
    { subject: 'Функционал', A: 80, B: 80, fullMark: 100 },
    { subject: 'UX/UI', A: 95, B: 60, fullMark: 100 },
    { subject: 'Надежность', A: 60, B: 85, fullMark: 100 },
  ];

  const llmData = [
    { name: 'ChatGPT-4o', [brandName]: 65, [competitor]: 35 },
    { name: 'Claude 3.5', [brandName]: 40, [competitor]: 60 },
    { name: 'Gemini 1.5', [brandName]: 75, [competitor]: 25 },
    { name: 'Perplexity', [brandName]: 50, [competitor]: 50 },
  ];

  const sovHistoryData = [
    { date: 'Июн 01', brand: 40, comp: 55 },
    { date: 'Июн 08', brand: 42, comp: 53 },
    { date: 'Июн 15', brand: 46, comp: 48 },
    { date: 'Июн 22', brand: 48, comp: 45 },
    { date: 'Июн 29', brand: 52, comp: 43 },
    { date: 'Июл 06', brand: 53, comp: 45 },
    { date: 'Июл 13', brand: 55, comp: 45 },
  ];

  const quotes = [
    {
      id: 1,
      model: 'ChatGPT-4o',
      date: '17 Июля 2026',
      prompt: `
