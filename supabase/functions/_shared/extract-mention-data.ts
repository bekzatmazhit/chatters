/**
 * Extract structured data from AI model response using LLM-as-judge
 * 
 * Uses Claude to parse raw response and extract:
 * - brand_mentioned: boolean
 * - position: number (rank among mentioned companies)
 * - sentiment_score: -1 to 1
 * - competitors_mentioned: array
 * - sources_mentioned: array
 */

import { runAnthropic } from './ai-providers.ts';

const SCAN_MODE = Deno.env.get('SCAN_MODE')?.toLowerCase() ?? 'live';

export interface ExtractedMentionData {
  brand_mentioned: boolean;
  position: number | null;
  sentiment_score: number | null;
  competitors_mentioned: Array<{ name: string; position: number }>;
  sources_mentioned: Array<{ domain: string }>;
  extraction_degraded: boolean;
}

interface ProjectContext {
  name: string;
  domain?: string;
  competitors?: string[];
  name_aliases?: string[];
}

export async function extractMentionData(
  rawResponse: string,
  projectContext: ProjectContext,
  nativeSources?: Array<{ domain: string; url?: string }>
): Promise<ExtractedMentionData> {
  if (SCAN_MODE === 'mock') {
    return mockExtractMentionData(projectContext, nativeSources);
  }

  try {
    // Build extraction prompt
    const extractionPrompt = buildExtractionPrompt(rawResponse, projectContext);
    
    // Call Claude as judge
    const judgeResponse = await runAnthropic(extractionPrompt);
    
    // Parse JSON response
    const parsed = parseJudgeResponse(judgeResponse.rawText);
    
    // Use native sources if available (Perplexity), otherwise LLM-extracted
    if (nativeSources && nativeSources.length > 0) {
      parsed.sources_mentioned = nativeSources.map(s => ({ domain: s.domain }));
    }
    
    return {
      ...parsed,
      extraction_degraded: false,
    };
  } catch (error) {
    console.error('LLM extraction failed, using regex fallback:', error);
    
    // Fallback: simple regex-based extraction
    return fallbackExtraction(rawResponse, projectContext);
  }
}

function mockExtractMentionData(
  context: ProjectContext,
  nativeSources?: Array<{ domain: string; url?: string }>
): ExtractedMentionData {
  const competitors = context.competitors || [];
  const sources = nativeSources && nativeSources.length > 0
    ? nativeSources.map((s) => ({ domain: s.domain || 'example.com' }))
    : [{ domain: 'example.com' }];

  return {
    brand_mentioned: true,
    position: 1,
    sentiment_score: 0.4,
    competitors_mentioned: competitors.slice(0, 2).map((name, idx) => ({
      name,
      position: idx + 2,
    })),
    sources_mentioned: sources,
    extraction_degraded: false,
  };
}

// =====================================================
// Build extraction prompt for LLM judge
// =====================================================
function buildExtractionPrompt(rawResponse: string, context: ProjectContext): string {
  const brandNames = [context.name, ...(context.name_aliases || [])].join(', ');
  const competitorsList = context.competitors?.join(', ') || 'Unknown competitors';

  return `Проанализируй следующий ответ AI-модели на пользовательский запрос.

**Бренд для поиска:** ${brandNames}
**Основной домен:** ${context.domain || 'не указан'}
**Известные конкуренты:** ${competitorsList}

**Текст ответа AI-модели:**
${rawResponse}

---

Верни ТОЛЬКО валидный JSON без пояснений, комментариев или markdown-форматирования:

{
  "brand_mentioned": boolean,
  "position": number | null,
  "sentiment_score": number,
  "competitors_mentioned": [{"name": string, "position": number}],
  "sources_mentioned": [{"domain": string}]
}

**Правила:**
1. brand_mentioned = true, если бренд упомянут в любой форме (включая домен, синонимы, неточные названия)
2. position = порядковая позиция бренда среди ВСЕХ упомянутых компаний/продуктов (1 = первый упомянут, 2 = второй, и т.д.). Если бренд не упомянут → null
3. sentiment_score = оценка тональности упоминания от -1.0 (негативное) до 1.0 (позитивное), 0 = нейтральное. Если не упомянут → null
4. competitors_mentioned = массив конкурентов из известного списка, которые упомянуты в ответе, с их позициями
5. sources_mentioned = массив доменов источников, если AI упоминает конкретные сайты, статьи или ссылки (например: "по данным site.com", "согласно forbes.com")

Убедись, что JSON валиден и не содержит trailing commas.`;
}

// =====================================================
// Parse JSON response from LLM judge
// =====================================================
function parseJudgeResponse(rawText: string): Omit<ExtractedMentionData, 'extraction_degraded'> {
  // Remove markdown code blocks if present
  let cleaned = rawText.trim();
  
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }
  
  // Parse JSON
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseError) {
    // Try to fix common JSON issues
    cleaned = cleaned
      .replace(/,\s*}/g, '}') // Remove trailing commas in objects
      .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
      .replace(/:\s*undefined/g, ': null') // Replace undefined with null
      .replace(/:\s*NaN/g, ': null'); // Replace NaN with null
    
    parsed = JSON.parse(cleaned);
  }
  
  // Validate and sanitize
  return {
    brand_mentioned: Boolean(parsed.brand_mentioned),
    position: parsed.position !== null && parsed.position !== undefined ? Number(parsed.position) : null,
    sentiment_score: parsed.sentiment_score !== null && parsed.sentiment_score !== undefined 
      ? Math.max(-1, Math.min(1, Number(parsed.sentiment_score))) 
      : null,
    competitors_mentioned: Array.isArray(parsed.competitors_mentioned) 
      ? parsed.competitors_mentioned.map((c: any) => ({
          name: String(c.name || ''),
          position: Number(c.position || 0),
        }))
      : [],
    sources_mentioned: Array.isArray(parsed.sources_mentioned)
      ? parsed.sources_mentioned.map((s: any) => ({
          domain: String(s.domain || ''),
        }))
      : [],
  };
}

// =====================================================
// Fallback: Regex-based extraction (degraded mode)
// =====================================================
function fallbackExtraction(rawResponse: string, context: ProjectContext): ExtractedMentionData {
  const lowerResponse = rawResponse.toLowerCase();
  const brandNames = [context.name, ...(context.name_aliases || [])];
  
  // Check if brand is mentioned
  const brandMentioned = brandNames.some(name => 
    lowerResponse.includes(name.toLowerCase())
  );
  
  // Simple position detection (count how many competitor names appear before brand)
  let position: number | null = null;
  if (brandMentioned) {
    const competitors = context.competitors || [];
    let earlierMentions = 0;
    
    const brandIndex = Math.min(
      ...brandNames
        .map(name => lowerResponse.indexOf(name.toLowerCase()))
        .filter(idx => idx >= 0)
    );
    
    for (const comp of competitors) {
      const compIndex = lowerResponse.indexOf(comp.toLowerCase());
      if (compIndex >= 0 && compIndex < brandIndex) {
        earlierMentions++;
      }
    }
    
    position = earlierMentions + 1;
  }
  
  // Basic sentiment detection (very crude)
  const positiveWords = ['лучший', 'отличный', 'рекомендую', 'хороший', 'качественный', 'надежный', 'удобный'];
  const negativeWords = ['плохой', 'худший', 'не рекомендую', 'проблемы', 'недостатки', 'не стоит'];
  
  let sentimentScore: number | null = null;
  if (brandMentioned) {
    const positiveCount = positiveWords.filter(w => lowerResponse.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lowerResponse.includes(w)).length;
    
    if (positiveCount > negativeCount) {
      sentimentScore = 0.5;
    } else if (negativeCount > positiveCount) {
      sentimentScore = -0.5;
    } else {
      sentimentScore = 0;
    }
  }
  
  // Detect mentioned competitors
  const competitorsMentioned = (context.competitors || [])
    .filter(comp => lowerResponse.includes(comp.toLowerCase()))
    .map((name, idx) => ({ name, position: idx + 1 }));
  
  // Extract domains from URLs
  const urlRegex = /https?:\/\/(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g;
  const domains = new Set<string>();
  let match;
  while ((match = urlRegex.exec(rawResponse)) !== null) {
    domains.add(match[1]);
  }
  
  return {
    brand_mentioned: brandMentioned,
    position,
    sentiment_score: sentimentScore,
    competitors_mentioned: competitorsMentioned,
    sources_mentioned: Array.from(domains).map(domain => ({ domain })),
    extraction_degraded: true, // Mark as degraded
  };
}
