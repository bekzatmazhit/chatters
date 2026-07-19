import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Smile, Frown, ShieldAlert, Cpu, RefreshCw, BarChart2, Minus } from 'lucide-react';
import { useBrands } from '../BrandContext';

export default function CombinedAnalyticsView() {
  const { activeBrand } = useBrands();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [sentimentData, setSentimentData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [stats, setStats] = useState({ total: 0, pos: 0, neg: 0, neutral: 0, facts: 0 });
  const [modelFilter, setModelFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [activeBrand, modelFilter]);

  const fetchData = async () => {
    if (!activeBrand) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_visibility_logs')
        .select('*')
        .eq('brand_id', activeBrand.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      let filteredData = data || [];
      if (modelFilter !== 'all') {
        filteredData = filteredData.filter(l => l.model === modelFilter);
      }
      setLogs(filteredData);

      // We need to generate fixed dates ending TODAY
      const today = new Date();
      
      // Generate last 14 days for trend
      const trendDays = Array.from({ length: 14 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (13 - i));
        return {
          dateObj: d,
          name: d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
          brand: 0,
          comp: 0,
          hasData: false
        };
      });

      // Generate last 30 days for heatmap
      const heatmapDays = Array.fr
