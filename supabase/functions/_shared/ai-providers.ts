/**
 * AI Provider Abstraction Layer
 * 
 * Unified interface for all AI model providers (OpenAI, Anthropic, Google, Perplexity)
 * API keys MUST be stored in environment variables only, never in code or database
 * 
 * Environment variables required:
 * - OPENAI_API_KEY
 * - ANTHROPIC_API_KEY
 * - GOOGLE_AI_API_KEY
 * - PERPLEXITY_API_KEY
 */

export interface ProviderResponse {
  rawText: string;
  sources?: Array<{
    domain: string;
    url?: string;
    title?: string;
  }>;
  model?: string; // Actual model used (e.g., "gpt-4o", "claude-3-sonnet")
  tokensUsed?: number;
}

export interface ProviderError {
  code: 'rate_limit' | 'auth_error' | 'model_unavailable' | 'timeout' | 'server_error' | 'invalid_request' | 'unknown';
  message: string;
  retryable: boolean;
  originalError?: unknown;
}

const SCAN_MODE = Deno.env.get('SCAN_MODE')?.toLowerCase() ?? 'live';

function buildMockProviderResponse(model: string, prompt: string): ProviderResponse {
  const safeModel = model.toLowerCase();
  const rawText = [
    `Mock ответ от ${safeModel} для тестовой проверки.`,
    `Этот ответ создан в mock режиме и не использует внешние API.`,
    `Ответ иллюстрирует упоминание бренда и конкурентов в тексте.`,
    `По данным example.com, бренд показан в позитивном контексте.`,
  ].join(' ');

  const sources = safeModel === 'perplexity'
    ? [{ domain: 'example.com', url: 'https://example.com', title: 'Mock citation' }]
    : undefined;

  return {
    rawText,
    sources,
    model: `mock-${safeModel}`,
    tokensUsed: 0,
  };
}

// =====================================================
// OpenAI (ChatGPT)
// =====================================================
export async function runOpenAI(prompt: string): Promise<ProviderResponse> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw createProviderError('auth_error', 'OPENAI_API_KEY not configured', false);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Latest GPT-4 Optimized model
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    if (!response.ok) {
      return handleOpenAIError(response);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw createProviderError('invalid_request', 'Empty response from OpenAI', false);
    }

    return {
      rawText: data.choices[0].message.content.trim(),
      model: data.model,
      tokensUsed: data.usage?.total_tokens,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw createProviderError('timeout', 'OpenAI API timeout after 30s', true);
    }
    if ((error as ProviderError).code) {
      throw error; // Already a ProviderError
    }
    throw createProviderError('unknown', `OpenAI error: ${error}`, false, error);
  }
}

async function handleOpenAIError(response: Response): Promise<never> {
  const status = response.status;
  let errorData: any;
  
  try {
    errorData = await response.json();
  } catch {
    errorData = { error: { message: await response.text() } };
  }

  const errorMessage = errorData?.error?.message || 'Unknown OpenAI error';

  if (status === 429) {
    throw createProviderError('rate_limit', `OpenAI rate limit: ${errorMessage}`, true);
  }
  if (status === 401 || status === 403) {
    throw createProviderError('auth_error', `OpenAI auth failed: ${errorMessage}`, false);
  }
  if (status === 503 || status === 502) {
    throw createProviderError('server_error', `OpenAI server error: ${errorMessage}`, true);
  }
  if (status >= 500) {
    throw createProviderError('server_error', `OpenAI error ${status}: ${errorMessage}`, true);
  }
  
  throw createProviderError('invalid_request', `OpenAI error ${status}: ${errorMessage}`, false);
}

// =====================================================
// Anthropic (Claude)
// =====================================================
export async function runAnthropic(prompt: string): Promise<ProviderResponse> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw createProviderError('auth_error', 'ANTHROPIC_API_KEY not configured', false);
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', // Latest Claude 3.5 Sonnet
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return handleAnthropicError(response);
    }

    const data = await response.json();
    
    if (!data.content?.[0]?.text) {
      throw createProviderError('invalid_request', 'Empty response from Anthropic', false);
    }

    return {
      rawText: data.content[0].text.trim(),
      model: data.model,
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw createProviderError('timeout', 'Anthropic API timeout after 30s', true);
    }
    if ((error as ProviderError).code) {
      throw error;
    }
    throw createProviderError('unknown', `Anthropic error: ${error}`, false, error);
  }
}

async function handleAnthropicError(response: Response): Promise<never> {
  const status = response.status;
  let errorData: any;
  
  try {
    errorData = await response.json();
  } catch {
    errorData = { error: { message: await response.text() } };
  }

  const errorMessage = errorData?.error?.message || 'Unknown Anthropic error';

  if (status === 429) {
    throw createProviderError('rate_limit', `Anthropic rate limit: ${errorMessage}`, true);
  }
  if (status === 401 || status === 403) {
    throw createProviderError('auth_error', `Anthropic auth failed: ${errorMessage}`, false);
  }
  if (status >= 500) {
    throw createProviderError('server_error', `Anthropic error ${status}: ${errorMessage}`, true);
  }
  
  throw createProviderError('invalid_request', `Anthropic error ${status}: ${errorMessage}`, false);
}

// =====================================================
// Google Gemini
// =====================================================
export async function runGemini(prompt: string): Promise<ProviderResponse> {
  const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
  if (!apiKey) {
    throw createProviderError('auth_error', 'GOOGLE_AI_API_KEY not configured', false);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          },
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!response.ok) {
      return handleGeminiError(response);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw createProviderError('invalid_request', 'Empty response from Gemini', false);
    }

    return {
      rawText: data.candidates[0].content.parts[0].text.trim(),
      model: 'gemini-1.5-pro',
      tokensUsed: data.usageMetadata?.totalTokenCount,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw createProviderError('timeout', 'Gemini API timeout after 30s', true);
    }
    if ((error as ProviderError).code) {
      throw error;
    }
    throw createProviderError('unknown', `Gemini error: ${error}`, false, error);
  }
}

async function handleGeminiError(response: Response): Promise<never> {
  const status = response.status;
  let errorData: any;
  
  try {
    errorData = await response.json();
  } catch {
    errorData = { error: { message: await response.text() } };
  }

  const errorMessage = errorData?.error?.message || 'Unknown Gemini error';

  if (status === 429) {
    throw createProviderError('rate_limit', `Gemini rate limit: ${errorMessage}`, true);
  }
  if (status === 401 || status === 403) {
    throw createProviderError('auth_error', `Gemini auth failed: ${errorMessage}`, false);
  }
  if (status >= 500) {
    throw createProviderError('server_error', `Gemini error ${status}: ${errorMessage}`, true);
  }
  
  throw createProviderError('invalid_request', `Gemini error ${status}: ${errorMessage}`, false);
}

// =====================================================
// Perplexity (with native citations)
// =====================================================
export async function runPerplexity(prompt: string): Promise<ProviderResponse> {
  const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
  if (!apiKey) {
    throw createProviderError('auth_error', 'PERPLEXITY_API_KEY not configured', false);
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'sonar-pro', // Latest Perplexity model with citations
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        return_citations: true, // Enable native citations
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return handlePerplexityError(response);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw createProviderError('invalid_request', 'Empty response from Perplexity', false);
    }

    // Extract native citations if available
    const sources = data.citations?.map((citation: any) => ({
      domain: extractDomain(citation.url || ''),
      url: citation.url,
      title: citation.title,
    })) || [];

    return {
      rawText: data.choices[0].message.content.trim(),
      sources: sources.length > 0 ? sources : undefined,
      model: data.model,
      tokensUsed: data.usage?.total_tokens,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw createProviderError('timeout', 'Perplexity API timeout after 30s', true);
    }
    if ((error as ProviderError).code) {
      throw error;
    }
    throw createProviderError('unknown', `Perplexity error: ${error}`, false, error);
  }
}

async function handlePerplexityError(response: Response): Promise<never> {
  const status = response.status;
  let errorData: any;
  
  try {
    errorData = await response.json();
  } catch {
    errorData = { error: { message: await response.text() } };
  }

  const errorMessage = errorData?.error?.message || 'Unknown Perplexity error';

  if (status === 429) {
    throw createProviderError('rate_limit', `Perplexity rate limit: ${errorMessage}`, true);
  }
  if (status === 401 || status === 403) {
    throw createProviderError('auth_error', `Perplexity auth failed: ${errorMessage}`, false);
  }
  if (status >= 500) {
    throw createProviderError('server_error', `Perplexity error ${status}: ${errorMessage}`, true);
  }
  
  throw createProviderError('invalid_request', `Perplexity error ${status}: ${errorMessage}`, false);
}

// =====================================================
// Provider Map & Utilities
// =====================================================

export const PROVIDER_MAP: Record<string, (prompt: string) => Promise<ProviderResponse>> = {
  chatgpt: runOpenAI,
  claude: runAnthropic,
  gemini: runGemini,
  perplexity: runPerplexity,
};

export function isValidProvider(model: string): model is keyof typeof PROVIDER_MAP {
  return model in PROVIDER_MAP;
}

export async function runProvider(model: string, prompt: string): Promise<ProviderResponse> {
  if (!isValidProvider(model)) {
    throw createProviderError('invalid_request', `Unknown AI model: ${model}`, false);
  }

  if (SCAN_MODE === 'mock') {
    return buildMockProviderResponse(model, prompt);
  }
  
  return PROVIDER_MAP[model](prompt);
}

// Helper: Extract domain from URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// Helper: Create standardized error
function createProviderError(
  code: ProviderError['code'],
  message: string,
  retryable: boolean,
  originalError?: unknown
): ProviderError {
  return {
    code,
    message,
    retryable,
    originalError,
  };
}

// Helper: Check if error is retryable
export function isRetryableError(error: unknown): boolean {
  if ((error as ProviderError).code) {
    return (error as ProviderError).retryable;
  }
  return false;
}
