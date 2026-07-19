import React, { useState, useMemo, useEffect } from 'react';
import { useBrands } from '../BrandContext';
import { useTheme } from '../ThemeContext';
import { 
  Plus, Star, Activity, FileText, Zap, TrendingUp, ChevronRight, Download, BarChart2,
  Video, PlaySquare
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function WorkspacesHubView({ onQuickAction }) {
  const { brands, setActiveBrandId } = useBrands();
  const { theme } = useTheme();
  
  const [showCreate, setShowCreate] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [sovPeriod, setSovPeriod] = useState(30);

  // Fake SOV history generator
  const sovHistory = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const point = { date: d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }) };
      brands.forEach(b => {
        const seed = b.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const baseSov = (seed % 40) + 20;
        const noise = Math.sin(i / 3) * 5 + Math.cos(i / 7) * 3;
        point[b.id] = Math.max(0, Math.min(100, Math.round(baseSov + noise + (30 - i) * 0.5)));
      });
      data.push(point);
    }
    return data;
  }, [brands]);

  // Fake top changes
  const topChanges = useMemo(() => {
    if (brands.length === 0) return [];
    return brands.map(b => {
      const seed = b.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const isUp = seed % 2 === 0;
      const val = (seed % 15) + 1;
      return { id: b.id, name: b.name, change: isUp ? val : -val };
    }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 3);
  }, [brands]);

  // Fake feed
  const activityFeed = [
    { id: 1, type: 'scan_complete', text: 'Заверш
