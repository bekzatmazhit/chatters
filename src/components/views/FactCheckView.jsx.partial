import { useState } from 'react';
import { AlertTriangle, Database, ShieldCheck, Search, Plus, Filter, ArrowRight } from 'lucide-react';

const FACTS = [
  {
    id: 1,
    topic: 'Ценообразование',
    fact: 'Базовый тариф начинается от $49/мес. Включает 10,000 проверок.',
    lastUpdated: '12 Окт 2023',
    status: 'verified'
  },
  {
    id: 2,
    topic: 'Интеграции',
    fact: 'Мы официально поддерживаем интеграции с Slack, Telegram и Google Search Console.',
    lastUpdated: '05 Ноя 2023',
    status: 'verified'
  },
  {
    id: 3,
    topic: 'Технологии',
    fact: 'Мы не используем GPT-3.5. Все вычисления производятся на приватных кластерах Llama 3.',
    lastUpdated: '20 Дек 2023',
    status: 'verified'
  }
];

const HALLUCINATIONS = [
  {
    id: 1,
    model: 'ChatGPT-4o',
    date: 'Вчера, 14:30',
    prompt: 'Какие тарифы у Binar Club?',
    hallucination: 'Binar Club предлагает бесплатный тариф для стартапов и платный от $99/мес.',
    severity: 'high',
    matchedFact: 'Базовый тариф начинается от $49/мес.'
  },
  {
    id: 2,
    model: 'Claude 3.5',
    date: 'Вчера, 09:15',
    prompt: 'С какими сервисами интегрируется Binar?',
    hallucination: 'Binar интегрируется с Discord, Jira и Asana.',
    severity: 'medium',
    matchedFact: 'Мы официально поддерживаем интеграции с Slack, Telegram...'
  },
  {
    id: 3,
    model: 'Gemini 1.5',
    date: '2 дня назад',
    prompt: 'На каких технологиях построен Binar Club?',
    hallucination: 'Сервис использует OpenAI API (GPT-3.5) для всех проверок.',
    severity: 'high',
    ma
