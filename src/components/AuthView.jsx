import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Cpu, Lock, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthView({ onBack }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast({ title: 'Регистрация успешна!', description: 'Теперь вы можете войти.' });
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-gray-900 font-sans">
      
      {/* LEFT SIDE - Form */}
      <div className="w-full lg:w-[45%] flex flex-col relative h-full">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
            <Cpu size={24} className="text-[#0EA5E9]" />
            <span className="text-[20px] font-bold tracking-tight uppercase text-[#0EA5E9]">Chatters <span className="text-gray-900">Analytics</span></span>
          </div>
          
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[14px] font-medium text-[#0EA5E9] hover:underline"
          >
            {isLogin ? 'Зарегистрироваться' : 'Уже есть аккаунт?
