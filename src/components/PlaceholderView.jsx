import { Construction } from 'lucide-react';

export default function PlaceholderView({ label }) {
  return (
    <div className="flex items-center justify-center h-full fade-up">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-14 flex flex-col items-center gap-4 max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
          <Construction size={24} className="text-teal-400" />
        </div>
        <div>
          <p className="font-bold text-slate-800 text-base">{label}</p>
          <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
            Этот раздел находится в разработке. Скоро здесь появится полный функционал.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 border border-teal-200 text-xs font-semibold px-4 py-2 rounded-xl">
          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
          В разработке
        </span>
      </div>
    </div>
  );
}
