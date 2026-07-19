import { useState, useRef } from 'react';
import { Send, Sparkles, ChevronDown, Copy, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import { useBrands } from '../BrandContext';

const MODELS = [
  { id: 'gpt4o', name: 'ChatGPT-4o', icon: '🟢', color: '#10b981' },
  { id: 'claude', name: 'Claude 3.5 Sonnet', icon: '🟠', color: '#f59e0b' },
  { id: 'gemini', name: 'Gemini 1.5 Pro', icon: '🔵', color: '#3b82f6' },
  { id: 'perplexity', name: 'Perplexity', icon: '🟣', color: '#8b5cf6' },
];

const EXAMPLE_PROMPTS = [
  'Какой CRM сервис лучше всего подходит для малого бизнеса?',
  'Посоветуй лучший инструмент для email-маркетинга',
  'Сравни топ-5 платформ для аналитики данных',
  'Какой облачный сервис использовать для стартапа?',
];

function generateFakeResponse(prompt, brandName, competitors, modelName) {
  const compList = competitors?.slice(0, 3) || ['Конкурент A', 'Конкурент B'];
  const responses = [
    `Отличный вопрос! Я бы рекомендовал рассмотреть несколько ведущих решений. Прежде всего стоит обратить внимание на **${brandName}** — это один из лидеров рынка, который предлагает отличный баланс цены и возможностей. Из альтернатив также популярны **${compList[0]}** и **${compList[1]}**, однако они немного уступают по гибкости настройки. Для большинства задач я бы рекомендовал начать именно с **${brandName}**.`,
    `Если говорить о лучших инструментах в этой области, то **${compList[0]}** традиционно занимает лидирующие позиции благ
