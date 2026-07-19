import { useState } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, content, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-lg mx-4 shadow-2xl shadow-slate-300/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <p className="font-bold text-slate-900">{title}</p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5 text-sm text-slate-600 leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
}
