import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Sparkles, Send, Loader2, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataChatWindowProps {
  projectId: string | undefined;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export function DataChatWindow({ projectId, isOpen, onClose }: DataChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && projectId && !threadId) {
      initThread();
    }
  }, [isOpen, projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initThread = async () => {
    try {
      // Try to find existing thread for this project
      const { data: existingThread, error: searchError } = await supabase
        .from('chat_threads')
        .select('id')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (existingThread) {
        setThreadId(existingThread.id);
        fetchMessages(existingThread.id);
      } else {
        // Create new thread
        const { data: newThread, error: createError } = await supabase
          .from('chat_threads')
          .insert({ project_id: projectId })
          .select('id')
          .single();
          
        if (createError) throw createError;
        setThreadId(newThread.id);
        
        // Add welcome message locally
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: 'Привет! Я ваш аналитический AI-ассистент. Задайте мне вопрос по данным вашего проекта, например: "Почему упал SOV?" или "Какие галлюцинации у ChatGPT?"',
          created_at: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.warn('Fallback to mock thread', err);
      setThreadId('mock-thread');
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Привет! Я ваш аналитический AI-ассистент (Mock Mode).',
        created_at: new Date().toISOString()
      }]);
    }
  };

  const fetchMessages = async (tId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_id', tId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      if (data && data.length > 0) {
        setMessages(data);
      } else {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: 'Привет! Я ваш аналитический AI-ассистент. Задайте мне вопрос по данным вашего проекта.',
          created_at: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.warn('Failed to fetch messages', err);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !threadId) return;

    const userMsgContent = inputValue.trim();
    setInputValue('');
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMsgContent,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // 1. Save user msg
      if (threadId !== 'mock-thread') {
        await supabase.from('chat_messages').insert({
          thread_id: threadId,
          role: 'user',
          content: userMsgContent
        });
      }

      // 2. Simulate AI processing
      await new Promise(res => setTimeout(res, 1500));

      // 3. Generate mock AI response based on query
      let aiResponse = "Я проанализировал данные. В целом показатели в норме.";
      const q = userMsgContent.toLowerCase();
      if (q.includes('sov') || q.includes('доля')) {
        aiResponse = "Ваш **SOV** сейчас находится на уровне ~40%. Мы видим небольшой спад по брендовым запросам в ChatGPT. Рекомендую добавить в базу новые факты об обновлениях продукта.";
      } else if (q.includes('галлюцинац') || q.includes('ошибк')) {
        aiResponse = "Я нашел **3 активные галлюцинации**. Чаще всего ИИ ошибается в адресах филиалов и ценах на базовый тариф. Посмотрите вкладку 'Оптимизация -> Галлюцинации' для деталей.";
      } else if (q.includes('привет')) {
        aiResponse = "Здравствуйте! Чем могу помочь по аналитике проекта сегодня?";
      }

      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, newAiMsg]);

      // 4. Save AI msg
      if (threadId !== 'mock-thread') {
        await supabase.from('chat_messages').insert({
          thread_id: threadId,
          role: 'assistant',
          content: aiResponse
        });
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: 'Произошла ошибка при обработке запроса.',
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Slide-over Window */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white shadow-2xl border-l border-border z-50 flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="h-16 px-5 border-b border-border flex items-center justify-between shrink-0 bg-[#fbfbfd]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-[#111827]">Ассистент по данным</div>
              <div className="text-[11px] text-accent font-medium flex items-center gap-1 lowercase">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span> онлайн
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-black/5 text-content-muted hover:text-[#111827] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-white">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-[#111827] text-white' : msg.role === 'system' ? 'bg-red-100 text-red-500' : 'bg-[#E1F5EE] text-[#0F6E56]'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : msg.role === 'system' ? <X className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-3.5 text-[13px] leading-relaxed ${msg.role === 'user' ? 'bg-[#f4f4f5] text-[#111827] rounded-tr-sm' : msg.role === 'system' ? 'bg-red-50 text-red-800' : 'bg-white border border-border shadow-sm text-[#374151] rounded-tl-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 shrink-0 rounded-full bg-[#E1F5EE] text-[#0F6E56] flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-border shadow-sm rounded-2xl rounded-tl-sm p-4 flex gap-1">
                <span className="w-1.5 h-1.5 bg-content-muted rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-content-muted rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                <span className="w-1.5 h-1.5 bg-content-muted rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-[#fbfbfd]">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Спросите о метриках, галлюцинациях..."
              className="w-full h-11 pl-4 pr-12 text-[13px] bg-white border border-border rounded-full focus:border-accent focus:ring-1 outline-none shadow-sm"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <button 
              className={`absolute right-1 w-9 h-9 flex items-center justify-center rounded-full transition-colors ${inputValue.trim() ? 'bg-accent text-white hover:bg-accent-hover' : 'bg-transparent text-content-muted'}`}
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
            </button>
          </div>
          <div className="text-center mt-2 text-[10px] text-content-tertiary">
            AI может ошибаться. Проверяйте данные в аналитике.
          </div>
        </div>
      </div>
    </>
  );
}
