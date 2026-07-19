import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Cpu, X, Zap, RefreshCw, ChevronRight, Check } from 'lucide-react';
import { useBrands } from '../BrandContext';

const MODEL_LABELS = {
  'gpt-4o': 'GPT-4o',
  'gpt-4': 'GPT-4',
  'claude': 'Claude 3.5',
  'gemini': 'Gemini 1.5',
  'perplexity': 'Perplexity',
};

function StatusBadge({ log }) {
  const isHallucination = log.brand_mentioned === false && log.competitor_mentioned === true;
  if (log.brand_mentioned)
    return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-positive bg-positive/10 border border-positive/20 px-2 py-0.5 rounded-full">Успех</span>;
  if (isHallucination)
    return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-negative bg-negative/10 border border-negative/20 px-2 py-0.5 rounded-full">Упущен</span>;
  return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-content-muted bg-surface border border-surface-border px-2 py-0.5 rounded-full">Нейтрально</span>;
}

export default function LogsView() {
  const { activeBrand } = useBrands();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState({});

  useEffect(() => {
    fetchLogs();
  }, [activeBrand]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('ai_visibility_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeBrand?.id) {
        query = query.eq('brand_id', activeBrand.id);
      }

      const { data,
