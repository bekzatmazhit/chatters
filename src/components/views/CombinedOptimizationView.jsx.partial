import { useState } from 'react';
import { Sparkles, FileText, ArrowRight, Lightbulb, ChevronRight, CheckCircle2, TrendingUp, Search } from 'lucide-react';

const OPPORTUNITIES = [
  {
    id: 1,
    priority: 'high',
    title: 'Отсутствие информации о новых тарифах в Claude 3.5',
    description: 'Модель Claude 3.5 Sonnet до сих пор ссылается на ваши старые тарифы от 2023 года.',
    recommendation: 'Опубликуйте детальный пресс-релиз о новой ценовой политике и обновите страницу Pricing, добавив явные FAQ блоки.',
    impact: 'SOV +15% в Claude',
    models: ['Claude 3.5 Sonnet'],
  },
  {
    id: 2,
    priority: 'high',
    title: 'Слабые позиции в сравнении с конкурентом "Acme Corp"',
    description: 'В 80% запросов вида "лучшая CRM система" ChatGPT рекомендует Acme Corp вместо вас из-за недостатка независимых обзоров.',
    recommendation: 'Инициируйте публикации на платформах G2 и Capterra. Создайте страницу сравнения "Наш продукт vs Acme Corp".',
    impact: 'SOV +25% в ChatGPT',
    models: ['ChatGPT-4o', 'Perplexity'],
  },
  {
    id: 3,
    priority: 'medium',
    title: 'Технические спецификации не парсятся Perplexity',
    description: 'Perplexity игнорирует вашу документацию, так как она закрыта клиентским рендерингом (SPA) без SSR.',
    recommendation: 'Настройте SSR или пререндеринг для раздела /docs. Добавьте Schema.org разметку TechArticle.',
    impact: 'Точность ответов +40%',
    models: ['Perplexity'],
  }
];

export default function CombinedOpti
