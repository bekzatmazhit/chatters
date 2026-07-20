import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, CreditCard, Users, Key, LogOut, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CombinedSettingsView() {
  const [activeTab, setActiveTab] = useState('profile');
  const [userEmail, setUserEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserEmail(session.user.email);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText('sk_test_51Nx...8aZq');
    toast({ title: 'API ключ скопирован', description: 'Текст успешно помещён в буфер обмена.' });
  };

  return (
    <div className="flex flex-col gap-4 relative max-w-5xl mx-auto w-full">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-semibold text-content-primary tracking-tight">Настройки системы</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">

        {/* Navigation Sidebar */}
        <div className="w-full md:w-56 shrink-0 flex flex-col gap-0.5 panel p-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <User size={15} /> Профиль
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`nav-link ${activeTab === 'team' ? 'active' : ''}`}
          >
            <Users size={15} /> Команда
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`nav-link ${activeTab === 'billing' ? 'active' : ''}`}
          >
            <CreditCard size={15} /> Биллинг
          </button>
          <button
            onClick={() => setActiveTab('api')}
            class
