import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ExportReportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [period, setPeriod] = useState('7');
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('export-workspace-report', {
        body: { period, format }
      });
      if (invokeError) throw invokeError;
      
      // Предполагаем, что функция возвращает { signedUrl: '...' }
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
        onClose();
      } else {
        throw new Error('Функция не вернула URL файла');
      }
    } catch (err: any) {
      console.error(err);
      // Fallback if edge function fails (since it might not be deployed yet)
      setError('Функция экспорта пока не доступна (требуется деплой Edge Function).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold text-[#111827]">Экспорт отчёта</h3>
          <button onClick={onClose} className="p-1 hover:bg-surface rounded-md"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">Период</label>
            <select 
              value={period} 
              onChange={e => setPeriod(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-border bg-[#fbfbfd] text-sm focus:border-accent focus:outline-none"
            >
              <option value="7">Последние 7 дней</option>
              <option value="30">Последние 30 дней</option>
              <option value="90">Последние 90 дней</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">Формат</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="format" value="pdf" checked={format === 'pdf'} onChange={() => setFormat('pdf')} />
                <span className="text-sm">PDF</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="format" value="csv" checked={format === 'csv'} onChange={() => setFormat('csv')} />
                <span className="text-sm">CSV</span>
              </label>
            </div>
          </div>
          {error && <div className="text-[12px] text-red-500 font-medium">{error}</div>}
          <Button onClick={handleExport} disabled={loading} className="w-full h-9 rounded-md">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Сгенерировать
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AddCompetitorModal({ isOpen, onClose, brands }: { isOpen: boolean; onClose: () => void; brands: any[] }) {
  const navigate = useNavigate();
  const [selectedBrand, setSelectedBrand] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    if (!selectedBrand) return;
    const brand = brands.find(b => b.id === selectedBrand);
    if (brand) {
      onClose();
      navigate(`/workspace/${brand.name.toLowerCase()}/settings/general`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold text-[#111827]">Добавить конкурента</h3>
          <button onClick={onClose} className="p-1 hover:bg-surface rounded-md"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">Выберите проект</label>
            <select 
              value={selectedBrand} 
              onChange={e => setSelectedBrand(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-border bg-[#fbfbfd] text-sm focus:border-accent focus:outline-none"
            >
              <option value="" disabled>-- Выберите --</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleNext} disabled={!selectedBrand} className="w-full h-9 rounded-md">
            Перейти в настройки
          </Button>
        </div>
      </div>
    </div>
  );
}
