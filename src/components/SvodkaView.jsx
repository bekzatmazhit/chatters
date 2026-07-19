import React, { useMemo } from 'react';
import { useBrands } from '../BrandContext';
import { 
  TrendingUp, MessageCircle, BarChart2, Zap, Target, 
  ChevronUp, ChevronDown, Activity, Globe 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

export default function SvodkaView() {
  const { brands, activeBrandId } = useBrands();
  const activeBrand = brands.find(b => b.id === activeBrandId);

  // Generate fake data based on brand ID to be consistent
  const { metrics, trendData, sentimentData } = useMemo(() => {
    if (!activeBrand) return { metrics: {}, trendData: [], sentimentData: [] };
    
    const seed = activeBrand.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const baseSov = (seed % 40) + 30;
    const isGrowing = seed % 2 === 0;

    const tData = [];
    let currentSov = baseSov;
    for(let i=14; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const noise = Math.sin(i) * 3;
      currentSov = Math.max(0, Math.min(100, currentSov + noise + (isGrowing ? 0.5 : -0.2)));
      tData.push({
        date: d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        sov: Math.round(currentSov),
        mentions: Math.round(currentSov * 12 + (seed % 50))
      });
    }

    const sData = [
      { name: 'Позитив', value: 45 + (seed % 20), color: '#22c55e' },
      { name: 'Нейтрально', value: 35 + (seed % 10), color: '#94a3b8' },
      { name: 'Негатив', value: 20 - (seed % 10), color: '#ef4444' }
    ];

    return {
      metrics: {
        sov: Math.round(currentSov),
        sovChange: isGrowing ? '+4.2%' : '-1.5%',
        mentions: Math.round(currentSov * 12),
        mentionsChange: isGrowing ? '+124' : '-32',
        sentiment: sData[0].value,
        sentimentChange: '+2.1%'
      },
      trendData: tData,
      sentimentData: sData
    };
  }, [activeBrand]);
