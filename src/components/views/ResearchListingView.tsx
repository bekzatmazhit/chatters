import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LandingNavbar } from '../landing/LandingNavbar';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ResearchArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url?: string;
  category: string;
  author_id?: string;
  published_at: string;
  read_time_minutes: number;
  status: string;
}

const MOCK_ARTICLES: ResearchArticle[] = [
  {
    id: '1',
    slug: 'ai-brand-visibility-2026',
    title: 'Как алгоритмы ChatGPT и Perplexity изменили B2B-поиск в 2026 году',
    excerpt: 'Мы проанализировали более 10,000 запросов и выяснили, какие источники действительно влияют на упоминания брендов.',
    content: '',
    category: 'исследования',
    published_at: '2026-07-18T10:00:00Z',
    read_time_minutes: 8,
    status: 'published',
  },
  {
    id: '2',
    slug: 'source-gap-analysis-guide',
    title: 'Анализ пробелов в источниках: как заставить AI говорить о вас',
    excerpt: 'Пошаговый гайд по выявлению доменов, которые цитируются в вашей нише, и стратегии по интеграции в них.',
    content: '',
    category: 'гайды',
    published_at: '2026-07-15T10:00:00Z',
    read_time_minutes: 5,
    status: 'published',
  },
  {
    id: '3',
    slug: 'chatters-api-release',
    title: 'Релиз Chatters API: интеграция метрик видимости в ваши дашборды',
    excerpt: 'Теперь вы можете выгружать данные Share of Voice и Sentiment напрямую в Tableau, PowerBI и внутренние CRM.',
    content: '',
    category: 'апдейты продукта',
    published_at: '2026-07-10T10:00:00Z',
    read_time_minutes: 3,
    status: 'published',
  },
  {
    id: '4',
    slug: 'sentiment-analysis-models',
    title: 'Сравнение тональности: Claude 3.5 vs GPT-4o в оценке брендов',
    excerpt: 'Какая модель чаще дает негативные оценки и как они по-разному интерпретируют отзывы на G2 и Capterra.',
    content: '',
    category: 'исследования',
    published_at: '2026-07-05T10:00:00Z',
    read_time_minutes: 6,
    status: 'published',
  }
];

const CATEGORIES = ['все', 'исследования', 'гайды', 'апдейты продукта'];

export default function ResearchListingView() {
  const [articles, setArticles] = useState<ResearchArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('все');

  useEffect(() => {
    async function fetchArticles() {
      try {
        const { data, error } = await supabase
          .from('research_articles')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false });
        
        if (error) throw error;
        setArticles(data || []);
      } catch (err) {
        console.error('Failed to fetch research articles, using mock data:', err);
        setArticles(MOCK_ARTICLES);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(a => activeCategory === 'все' || a.category === activeCategory);
  
  const featuredArticle = activeCategory === 'все' && filteredArticles.length > 0 ? filteredArticles[0] : null;
  const gridArticles = featuredArticle ? filteredArticles.slice(1) : filteredArticles;

  return (
    <div className="min-h-screen bg-white font-sans text-content-primary selection:bg-accent/20">
      <LandingNavbar />
      
      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          
          <div className="mb-12 max-w-3xl">
            <div className="eyebrow mb-6 font-mono text-[11px] tracking-[0.14em] text-[#8791aa] lowercase">
              /06 · ресерч
            </div>
            <h1 className="text-[38px] font-semibold leading-[1.05] tracking-tight text-[#111827] md:text-[52px]">
              исследования и данные о видимости брендов в ai.
            </h1>
            <p className="mt-5 text-[17px] leading-8 text-content-secondary">
              Аналитика, бенчмарки и инсайты по поведению языковых моделей и их влиянию на пользовательский выбор.
            </p>
          </div>

          {/* Categories */}
          <div className="mb-12 flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full px-4 py-2 font-mono text-[12px] tracking-wide transition-colors lowercase",
                  activeCategory === cat 
                    ? "bg-[#111827] text-white" 
                    : "bg-black/5 text-content-secondary hover:bg-black/10 hover:text-content-primary"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-32 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-content-muted" />
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Featured Article */}
              {featuredArticle && (
                <Link 
                  to={`/research/${featuredArticle.slug}`}
                  className="group flex flex-col md:flex-row overflow-hidden rounded-xl border border-black/10 bg-white hover:border-black/20 transition-colors"
                >
                  <div className="md:w-[55%] lg:w-[60%] shrink-0">
                    {featuredArticle.cover_image_url ? (
                      <img 
                        src={featuredArticle.cover_image_url} 
                        alt={featuredArticle.title}
                        className="h-full w-full object-cover aspect-[16/9] md:aspect-auto"
                      />
                    ) : (
                      <div className="h-full w-full aspect-[16/9] md:aspect-auto bg-black/5 flex items-center justify-center">
                        <span className="font-mono text-[120px] font-bold text-black/10">
                          {featuredArticle.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-4 flex items-center gap-3 font-mono text-[11px] text-content-secondary lowercase">
                      <span className="rounded-full bg-accent/10 text-accent px-2.5 py-1">
                        {featuredArticle.category}
                      </span>
                      <span>
                        {new Date(featuredArticle.published_at).toLocaleDateString('ru-RU', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </span>
                    </div>
                    <h2 className="mb-4 text-[26px] md:text-[32px] font-semibold leading-tight text-[#111827] group-hover:text-accent transition-colors">
                      {featuredArticle.title}
                    </h2>
                    <p className="mb-8 text-[15px] leading-relaxed text-content-secondary line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="mt-auto font-mono text-[12px] text-content-muted">
                      {featuredArticle.read_time_minutes} мин чтения
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid Articles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {gridArticles.map(article => (
                  <Link 
                    key={article.id}
                    to={`/research/${article.slug}`}
                    className="group flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white hover:border-black/20 transition-colors"
                  >
                    <div className="aspect-[16/9] shrink-0">
                      {article.cover_image_url ? (
                        <img 
                          src={article.cover_image_url} 
                          alt={article.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-black/5 flex items-center justify-center">
                          <span className="font-mono text-[64px] font-bold text-black/10">
                            {article.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="mb-3 flex items-center gap-2 font-mono text-[10px] text-content-secondary lowercase">
                        <span className="text-accent">{article.category}</span>
                        <span className="text-black/20">•</span>
                        <span>
                          {new Date(article.published_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <h3 className="mb-3 text-[18px] font-semibold leading-tight text-[#111827] group-hover:text-accent transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="mb-5 text-[14px] leading-relaxed text-content-secondary line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="mt-auto font-mono text-[11px] text-content-muted">
                        {article.read_time_minutes} мин чтения
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {gridArticles.length === 0 && !featuredArticle && (
                <div className="py-20 text-center text-content-secondary">
                  Статей в этой категории пока нет.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="light border-t border-border bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#111827] text-[13px] font-bold text-white lowercase">
              C
            </div>
            <span className="text-[14px] font-semibold text-[#111827] lowercase">Chatters</span>
            <span className="text-[13px] text-content-secondary">© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
