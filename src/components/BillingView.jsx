import { CreditCard, Zap, CheckCircle2 } from 'lucide-react';

export default function BillingView() {
  const creditsUsed = 450;
  const creditsTotal = 1000;
  const progress = (creditsUsed / creditsTotal) * 100;

  return (
    <div className="flex flex-col gap-6 fade-up pb-10">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">Биллинг и Подписка</h1>
          <p className="text-content-muted text-[13px] mt-1">Управляйте своим тарифом и лимитами токенов.</p>
        </div>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-6">
        
        {/* Current Plan */}
        <div className="card p-8 bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-20 blur-[80px] rounded-full"></div>
          
          <div className="relative z-10 flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-[24px] font-extrabold tracking-tight">Enterprise</h2>
                <span className="bg-blue-600 text-white px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider">Текущий тариф</span>
              </div>
              <p className="text-content-muted text-[13px]">Следующее списание: 15 Января 2026</p>
            </div>
            <div className="text-right">
              <span className="text-[32px] font-extrabold tracking-tight">$299</span>
              <span className="text-content-muted text-[14px]">/ мес</span>
            </div>
          </div>

          <div className="relative z-10 mb-2 flex items-center justify-between text-[13px] font-semibold">
            <span className="text-gray-300">Использовано AI-токенов (GPT-4o, Claude 
