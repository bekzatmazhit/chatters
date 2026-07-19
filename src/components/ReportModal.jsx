import { useState, useEffect } from 'react';
import { X, FileText, Download, CheckCircle2, PieChart, Activity } from 'lucide-react';
import { useBrands } from './BrandContext';

export default function ReportModal({ isOpen, onClose }) {
  const { activeBrand } = useBrands();
  const [status, setStatus] = useState('idle'); // idle, generating, done
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setProgress(0);
    }
  }, [isOpen]);

  const handleGenerate = () => {
    setStatus('generating');
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setStatus('done');
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-panel border border-surface-border w-full max-w-md rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <FileText size={16} />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-content-primary">Генератор отчета</h2>
              <p className="text-[11px] text-content-muted">{activeBrand?.name || 'Проект'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-content-muted hover:text-content-primary transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {status === 'id
