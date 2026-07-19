import AILogo from './AILogo';
import { useState } from 'react';
import { X, Play, UserCircle2, Plus, BrainCircuit, CheckCircle2, Globe, Clock, Zap } from 'lucide-react';
import { useBrands } from './BrandContext';

const DEFAULT_PERSONAS = [
  {
    id: 'default_1',
    name: 'Базовый юзер',
    age: '25-35',
    country: 'США',
    city: 'Нью-Йорк',
    role: 'Менеджер',
    hobbies: 'Технологии, бизнес',
    systemPrompt: 'Ты - обычный интернет-пользователь, ищешь лучшее решение для своей задачи.'
  },
  {
    id: 'default_2',
    name: 'CTO Стартапа',
    age: '30-40',
    country: 'Великобритания',
    city: 'Лондон',
    role: 'Технический директор',
    hobbies: 'Программирование, AI, инвестиции',
    systemPrompt: 'Ты технический директор (CTO) B2B стартапа. Ищешь надежные инструменты для масштабирования, обращаешь внимание на цены, документацию и интеграции.'
  },
  {
    id: 'default_3',
    name: 'Студент',
    age: '18-22',
    country: 'Казахстан',
    city: 'Алматы',
    role: 'Студент',
    hobbies: 'Игры, учеба, гаджеты',
    systemPrompt: 'Ты студент ВУЗа. Ищешь дешевые или бесплатные решения, обращаешь внимание на отзывы и удобство интерфейса.'
  }
];

const MODELS = [
  { 
    id: 'gpt4', 
    name: 'GPT-4o', 
    enabled: true, 
    desc: 'Флагман OpenAI',
    cost: 2,
    logo: (
      <AILogo model="GPT-4o" className="w-5 h-5 object-contain" />
    )
  },
  { 
    id: 'claude', 
    name: 'Claude 3.5 Sonnet', 
    enabled: true, 
    desc: 'Anthropic AI',
    cost: 2,
    logo: (
      <AILogo model="C
