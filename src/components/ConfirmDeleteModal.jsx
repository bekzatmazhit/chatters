import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function ConfirmDeleteModal({ projectName, onConfirm, onClose }) {
  const [confirmText, setConfirmText] = useState('');
  
  const isMatch = confirmText === projectName;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="panel w-full max-w-md rounded-2xl shadow-2xl border border-surface-border overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-negative/10 flex items-center justify-center text-negative mb-4 mx-auto">
            <AlertTriangle size={24} />
          </div>
          
          <h2 className="text-[18px] font-bold text-content-primary text-center mb-2">Удаление проекта</h2>
          <p className="text-[14px] text-content-secondary text-center mb-6">
            Вы уверены, что хотите удалить проект <strong className="text-content-primary">{projectName}</strong>? Это действие необратимо и приведет к удалению всех связанных данных, логов и аналитики.
          </p>
          
          <div className="space-y-2 mb-6">
            <label className="text-[13px] font-semibold text-content-primary">
              Введите <span className="font-mono bg-surface px-1.5 py-0.5 rounded text-negative select-all">{projectName}</span> для подтверждения:
            </label>
            <input 
              type="text" 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-[14px] text-content-primary outline-none focus:border-negative focus:ring-1 focus:ring-negativ
