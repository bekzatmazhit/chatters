import { useState, useEffect } from 'react';
import { X, Download, FileText, BarChart2, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { useBrands } from './BrandContext';

export default function ReportExportModal({ isOpen, onClose }) {
  const { activeBrand } = useBrands();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [options, setOptions] = useState({
    overview: true,
    head2head: true,
    logs: false,
    market: true,
  });

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handleExport = async () => {
    setLoading(true);
    // Simulate generation time
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setSuccess(true);
    
    // Simulate native print dialog
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-panel border border-surface-border w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-surface-border flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent border border-accent/20">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-content-prim
