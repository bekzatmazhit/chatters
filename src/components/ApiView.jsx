import { Key, Copy, RefreshCw, Terminal, ExternalLink } from 'lucide-react';

export default function ApiView() {
  return (
    <div className="flex flex-col gap-6 fade-up pb-10">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">API и Интеграции</h1>
          <p className="text-gray-500 text-[13px] mt-1">Доступ к сырым данным через REST API для ваших CRM и BI систем</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-6">
        
        {/* Keys Management */}
        <div className="card p-0 flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <Key size={18} className="text-gray-400" />
            <h3 className="text-[16px] font-bold text-gray-900">Ваши ключи доступа</h3>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Production Key</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 font-mono text-[13px] text-gray-700 flex items-center justify-between">
                  <span>sk_prod_8f92j...49fn2</span>
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Active</span>
                </div>
                <button className="white-btn !px-3" title="Копировать"><Copy size={16}/></button>
                <button className="white-btn !px-3 text-red-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50" title="Отозвать"><RefreshCw size={16}/></button>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">Последнее использ
