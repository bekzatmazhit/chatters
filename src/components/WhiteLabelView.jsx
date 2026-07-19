import { useState } from 'react';
import { useBrands } from '../BrandContext';
import { Upload, Palette, MonitorSmartphone, CheckCircle2, Building, Eye } from 'lucide-react';

export default function WhiteLabelView() {
  const { activeBrand } = useBrands();
  const [logo, setLogo] = useState(null);
  const [companyName, setCompanyName] = useState('Agency Pro');
  const [accentColor, setAccentColor] = useState('#8b5cf6');
  const [domain, setDomain] = useState('reports.agencypro.com');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pb-10">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Building size={20} className="text-accent" />
          <h1 className="text-[22px] font-semibold text-content-primary tracking-tight">White-label</h1>
        </div>
        <p className="text-[13px] text-content-secondary mt-1">
          Настройте дашборд под свой бренд, чтобы отправлять отчеты клиентам от имени вашего агентства.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Settings Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="panel p-6">
            <h2 className="text-[16px] font-semibold text-content-primary mb-6 border-b border-surface-border pb-4">Брендирование портала</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[12px] font-medium text-content-secondary uppercase tracking-wider mb-2">Название агентства</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={e => setCompanyName(e.target.
