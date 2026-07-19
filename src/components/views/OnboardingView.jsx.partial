import { useState } from 'react';
import { useBrands } from '../BrandContext';
import { Cpu, Plus } from 'lucide-react';

export default function OnboardingView() {
  const { addBrand } = useBrands();
  const [name, setName] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const compArray = competitors.split(',').map(s => s.trim()).filter(Boolean);
      const kwArray = keywords.split(',').map(s => s.trim()).filter(Boolean);

      await addBrand({
        name: name.trim(),
        competitors: compArray,
        keywords: kwArray,
      });
      // The context will update, and since a brand now exists, App.jsx will automatically route away from this view.
    } catch (err) {
      setError(err.message || "Ошибка при создании бренда. Убедитесь, что таблица 'brands' создана в базе данных.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-content-primary">
      <div className="w-full max-w-md bg-panel border border-surface-border rounded-lg shadow-xl p-8 relative overflow-hidden">
        {/* Subtle grid bg */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ 
          backgroundImage: 'radial-gradient(var(--color-border) 1px, transparent 1px)', 
          backgroundSize: '16px 16px'
        }}></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center">
              <Cpu classNa
