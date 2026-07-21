import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { ModelIcon } from '@/components/ui/ModelIcon';

const TYPING_SPEED = 28;
const PROMPT_TEXT = 'лучший сервис для мониторинга видимости бренда в AI';

function useTypingEffect(text: string, speed: number, start: boolean) {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!start) return;

    setDisplayedText('');
    setIsDone(false);

    let index = 0;
    const interval = window.setInterval(() => {
      setDisplayedText(text.slice(0, index + 1));
      index += 1;

      if (index >= text.length) {
        window.clearInterval(interval);
        setIsDone(true);
      }
    }, speed);

    return () => window.clearInterval(interval);
  }, [text, speed, start]);

  return { displayedText, isDone };
}

export function DemoQueryTerminal() {
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState<'typing' | 'processing' | 'done'>(prefersReducedMotion ? 'done' : 'typing');

  const { displayedText, isDone: isTypingDone } = useTypingEffect(
    PROMPT_TEXT,
    TYPING_SPEED,
    step === 'typing' && !prefersReducedMotion,
  );

  useEffect(() => {
    if (prefersReducedMotion) return;

    if (step === 'typing' && isTypingDone) {
      const timeout = window.setTimeout(() => setStep('processing'), 420);
      return () => window.clearTimeout(timeout);
    }

    if (step === 'processing') {
      const timeout = window.setTimeout(() => setStep('done'), 980);
      return () => window.clearTimeout(timeout);
    }

    if (step === 'done') {
      const timeout = window.setTimeout(() => setStep('typing'), 7200);
      return () => window.clearTimeout(timeout);
    }
  }, [step, isTypingDone, prefersReducedMotion]);

  return (
    <div className="relative w-full rounded-xl border border-white/10 bg-[#0b0d12]/80 backdrop-blur-2xl text-left shadow-[0_0_80px_rgba(109,95,232,0.15)] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      <div className="flex h-11 items-center justify-between border-b border-white/10 px-4 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50" />
          <span className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50" />
          <span className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50" />
        </div>
        <span className="font-mono text-[11px] tracking-[0.08em] text-[#8f98ad]">live-query</span>
      </div>

      <div className="min-h-[380px] p-5 md:p-7">
        <div className="rounded-md border border-white/10 bg-black/22 p-4">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#7f899d]">запрос</div>
          <div className="flex items-start gap-3">
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#8f98ad]" />
            <div className="min-h-6 font-mono text-[14px] leading-6 text-[#f5f7fb]">
              {prefersReducedMotion ? PROMPT_TEXT : displayedText}
              {step === 'typing' && !isTypingDone && (
                <span className="ml-1 inline-block h-4 w-[2px] translate-y-0.5 bg-accent caret-blink" />
              )}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 rounded-md border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[#7f899d]">
                опрос моделей
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {['ChatGPT', 'Claude', 'Gemini', 'Perplexity'].map((model, index) => (
                  <div key={model} className="flex items-center justify-between rounded-md bg-white/[0.035] px-3 py-2">
                    <div className="flex items-center gap-2">
                      <ModelIcon model={model} size={16} className="opacity-80" />
                      <span className="text-[13px] text-[#d7ddeb]">{model}</span>
                    </div>
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full bg-accent"
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 1, repeat: Infinity, delay: index * 0.14 }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div
              key="done"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-6"
            >
              <div className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#94a0b8]">
                <CheckCircle2 className="h-4 w-4 text-success" />
                найдено упоминание
              </div>

              <p className="rounded-md border border-white/10 bg-white/[0.03] p-4 text-[14px] leading-7 text-[#dce3f1] shadow-inner">
                В ответах по этому запросу чаще всего рекомендуют{' '}
                <span className="rounded bg-accent/20 px-2 py-0.5 font-bold text-white border border-accent/40 shadow-[0_0_15px_rgba(109,95,232,0.4)] relative overflow-hidden inline-block group">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></span>
                  chatters
                </span>
                . Модели связывают бренд с мониторингом AI-видимости, сравнением конкурентов
                и отчетами по источникам.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ['позиция', '#1'],
                  ['доля голоса', '34%'],
                  ['тональность', '+0.92'],
                  ['источники', '5'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-white/10 bg-black/18 p-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#7f899d]">{label}</div>
                    <div className="mt-2 font-mono text-[18px] text-white">{value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
