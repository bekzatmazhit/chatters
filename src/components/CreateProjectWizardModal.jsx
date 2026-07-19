import { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Hash, LayoutGrid, Slack, MessageCircle, Link2, Zap } from 'lucide-react';
import { useBrands } from './BrandContext';

export default function CreateProjectWizardModal({ onClose }) {
  const { createBrand } = useBrands();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    keywords: [],
    integrations: { slack: false, telegram: false }
  });

  const [keywordInput, setKeywordInput] = useState('');

  const STEPS = [
    { num: 1, title: 'Основное' },
    { num: 2, title: 'Слова' },
    { num: 3, title: 'Связки' }
  ];

  const handleAddKeyword = (e) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!formData.keywords.includes(keywordInput.trim())) {
        setFormData(prev => ({ ...prev, keywords: [...prev.keywords, keywordInput.trim()] }));
      }
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (kw) => {
    setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== kw) }));
  };

  const toggleIntegration = (key) => {
    setFormData(prev => ({
      ...prev,
      integrations: { ...prev.integrations, [key]: !prev.integrations[key] }
    }));
  };

  const handleFinish = async () => {
    if (!formData.name.trim()) return;
    setLoading(true);
    try {
      await createBrand(formData.name);
      // In a real app, we would also save keywords and integrations to the backend here
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      /
