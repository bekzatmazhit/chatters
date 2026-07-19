import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LandingNavbar } from '../landing/LandingNavbar';
import { Check, Copy, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ResearchArticle } from './ResearchListingView';
import { cn } from '@/lib/utils';

const MOCK_ARTICLE: ResearchArticle = {
  id: '1',
  slug: 'ai-brand-visibility-2026',
  title: 'Как алгоритмы ChatGPT и Perplexity изменили B2B-поиск в 2026 году',
  excerpt: 'Мы проанализировали более 10,000 запросов и выяснили, какие источники действительно влияют на упоминания брендов.',
  content: `
За последний год поведение B2B-покупателей кардинально изменилось. Вместо того чтобы вбивать запросы в классический поисковик и просматривать десятки страниц, они все чаще обращаются к AI-ассистентам.

## Ключевые изменения в алгоритмах

ChatGPT и Perplexity стали использовать более сложные механизмы оценки авторитетности источников. Теперь недостаточно просто иметь SEO-оптимизированный блог.

> "AI-модели отдают предпочтение платформам с пользовательским контентом (G2, Capterra) и независимым обзорам, а не корпоративным блогам." — из отчета Chatters Research.

### Что делать брендам?

1. **Мониторинг упоминаний:** Регулярно проверяйте, как ваш бренд отображается в ответах AI.
2. **Анализ пробелов:** Выявляйте источники, которые цитируют модели, и интегрируйтесь в них.
3. **Работа с тональностью:** AI учитывает контекст упоминаний, поэтому важно не только присутствовать, но и иметь положительный сентимент.

\`\`\`json
{
  "model": "gpt-4o",
  "query": "лучшие CRM для малого бизнеса",
  "top_brands": ["HubSpot", "Salesforce", "Pipedrive"]
}
\`\`\`

Внедрение этих стратегий позволит вашему бренду оставаться на виду у потенциальных клиентов в эпоху AI-поиска.
  `,
  category: 'исследования',
  published_at: '2026-07-18T10:00:00Z',
  read_time_minutes: 8,
  status: 'published',
};

export default function ResearchArticleView() {
  const { slug } = useParams();
  const [article, setArticle] = useState<ResearchArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const { data, error } = await supabase
          .from('research_articles')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (error) throw error;
        setArticle(data);
      } catch (err) {
        console.error('Failed to fetch article, using mock data:', err);
        // Fallback to mock only if the slug matches or just return the mock for demo
        setArticle(MOCK_ARTICLE);
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [slug]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <LandingNavbar />
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-content-muted" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <LandingNavbar />
        <div className="flex h-screen flex-col items-center justify-center px-5 text-center">
          <h1 className="mb-4 text-3xl font-semibold">Статья не найдена</h1>
          <Link to="/research" className="text-accent hover:underline">Вернуться к исследованиям</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-content-primary selection:bg-accent/20">
      <LandingNavbar />
      
      <main className="pt-32 pb-24">
        <article className="mx-auto max-w-[680px] px-5">
          
          {/* Breadcrumbs */}
          <div className="mb-10 font-mono text-[11px] tracking-wide text-content-muted">
            <Link to="/research" className="hover:text-content-primary transition-colors lowercase">ресерч</Link>
            <span className="mx-2">/</span>
            <span>{article.title}</span>
          </div>

          {/* Header */}
          <h1 className="mb-6 text-[36px] md:text-[44px] font-semibold leading-[1.1] tracking-tight text-[#111827]">
            {article.title}
          </h1>

          <div className="mb-10 flex flex-wrap items-center gap-y-3 gap-x-4 font-mono text-[12px] text-content-secondary">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-black/10 flex items-center justify-center font-semibold text-[#111827] text-[10px]">
                A
              </div>
              <span className="lowercase">alexa team</span>
            </div>
            <span className="text-black/20">•</span>
            <span>
              {new Date(article.published_at).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </span>
            <span className="text-black/20">•</span>
            <span>{article.read_time_minutes} мин чтения</span>
            <span className="text-black/20">•</span>
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-accent lowercase">
              {article.category}
            </span>
          </div>

          {/* Cover Image */}
          {article.cover_image_url && (
            <figure className="mb-14 overflow-hidden rounded-xl bg-black/5">
              <img 
                src={article.cover_image_url} 
                alt={article.title}
                className="w-full aspect-[16/9] object-cover"
              />
            </figure>
          )}

          {/* Content */}
          <div className="prose prose-lg prose-slate max-w-none 
            prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-[#111827]
            prose-p:text-[18px] prose-p:leading-[1.75] prose-p:text-[#374151]
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-accent/5 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:not-italic prose-blockquote:text-[#111827] prose-blockquote:font-medium
            prose-pre:bg-[#0b0d12] prose-pre:border prose-pre:border-black/10
            prose-code:font-mono prose-code:text-[14px]
            prose-img:rounded-xl prose-img:border prose-img:border-black/10"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>

          {/* Share Action */}
          <div className="mt-16 border-t border-black/10 pt-10">
            <button
              onClick={copyLink}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-mono text-[13px] font-medium transition-colors",
                copied 
                  ? "bg-positive/10 text-positive" 
                  : "bg-black/5 text-content-primary hover:bg-black/10"
              )}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Ссылка скопирована
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Поделиться статьей
                </>
              )}
            </button>
          </div>
        </article>
      </main>
    </div>
  );
}
