import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { IconSparkles, IconMessageCircle2, IconBrandOpenai, IconSearch } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

const QUERIES = [
  "лучшие курсы информатики",
  "best cs courses kazakhstan",
  "куда поступить после школы"
];

// Helper hook for typing effect
function useTypingEffect(text: string, speed: number = 50, start: boolean = false) {
  const [displayedText, setDisplayedText] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!start) {
      setDisplayedText("");
      setIsDone(false);
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsDone(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, start]);

  return { displayedText, isDone };
}

type Step = 'typing' | 'processing' | 'found';

export function AISearchAnimation() {
  const prefersReducedMotion = useReducedMotion();
  const [queryIndex, setQueryIndex] = useState(0);
  const [step, setStep] = useState<Step>(prefersReducedMotion ? 'found' : 'typing');
  
  const currentQuery = QUERIES[queryIndex];
  const { displayedText, isDone: isTypingDone } = useTypingEffect(currentQuery, 40, step === 'typing' && !prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) return;

    if (step === 'typing' && isTypingDone) {
      const t = setTimeout(() => setStep('processing'), 800);
      return () => clearTimeout(t);
    }
    
    if (step === 'processing') {
      const t = setTimeout(() => setStep('found'), 2000);
      return () => clearTimeout(t);
    }

    if (step === 'found') {
      const t = setTimeout(() => {
        setStep('typing');
        setQueryIndex((i) => (i + 1) % QUERIES.length);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [step, isTypingDone, prefersReducedMotion]);

  return (
    <div className="relative w-full max-w-[500px] h-[400px] flex flex-col items-center justify-center pt-8">
      
      {/* 1. Search Input Simulation */}
      <div className={cn(
        "absolute top-0 z-20 w-[90%] max-w-[400px] h-12 bg-surface-card border border-border rounded-pill flex items-center px-4 shadow-sm transition-all duration-500",
        step === 'found' ? "-translate-y-4 opacity-0 scale-95" : "translate-y-0 opacity-100 scale-100"
      )}>
        <IconSearch className="w-5 h-5 text-content-tertiary mr-3 shrink-0" />
        <div className="flex-1 text-content-primary font-medium text-[15px] truncate">
          {prefersReducedMotion ? currentQuery : displayedText}
          {step === 'typing' && !isTypingDone && (
            <span className="inline-block w-0.5 h-4 bg-accent ml-1 align-middle caret-blink" />
          )}
        </div>
      </div>

      {/* 2. Processing Wave */}
      <div className={cn(
        "absolute top-[70px] z-10 flex gap-3 transition-opacity duration-500",
        step === 'processing' ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-accent"
            animate={step === 'processing' ? { opacity: [0.2, 1, 0.2] } : { opacity: 0.2 }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* 3. Found Cards */}
      <div className="relative w-full flex-1 flex items-center justify-center mt-6">
        <AnimatePresence>
          {step === 'found' && (
            <>
              {/* ChatGPT Card */}
              <motion.div
                initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8, y: 40, x: -60, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, y: -20, x: -80, rotate: -6 }}
                exit={{ opacity: 0, scale: 0.8, y: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                className="absolute z-10 panel p-4 w-[240px] shadow-lg flex flex-col gap-3"
              >
                <div className="flex items-center gap-2 text-[12px] font-medium text-content-secondary">
                  <div className="w-5 h-5 rounded-sm bg-[#10A37F]/10 flex items-center justify-center">
                    <IconBrandOpenai className="w-3.5 h-3.5 text-[#10A37F]" />
                  </div>
                  ChatGPT
                </div>
                <div className="text-[13px] text-content-primary leading-relaxed">
                  Одни из лучших курсов можно найти в <span className="bg-accent/20 text-accent px-1 py-0.5 rounded-sm font-semibold glow inline-block">Binar Club</span>. Они предлагают отличную программу...
                </div>
              </motion.div>

              {/* Claude Card */}
              <motion.div
                initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8, y: 20, x: 60, rotate: 4 }}
                animate={{ opacity: 1, scale: 1, y: 10, x: 90, rotate: 6 }}
                exit={{ opacity: 0, scale: 0.8, y: 0, x: 20 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                className="absolute z-20 panel p-4 w-[240px] shadow-lg flex flex-col gap-3"
              >
                <div className="flex items-center gap-2 text-[12px] font-medium text-content-secondary">
                  <div className="w-5 h-5 rounded-sm bg-[#D97757]/10 flex items-center justify-center">
                    <IconSparkles className="w-3.5 h-3.5 text-[#D97757]" />
                  </div>
                  Claude
                </div>
                <div className="text-[13px] text-content-primary leading-relaxed">
                  Я бы рекомендовал обратить внимание на Binar Club. Их выпускники часто...
                </div>
              </motion.div>

              {/* Perplexity Card */}
              <motion.div
                initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8, y: 60, x: 0 }}
                animate={{ opacity: 1, scale: 1, y: 80, x: -10, rotate: -2 }}
                exit={{ opacity: 0, scale: 0.8, y: 20, x: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
                className="absolute z-30 panel p-4 w-[260px] shadow-lg flex flex-col gap-3"
              >
                <div className="flex items-center gap-2 text-[12px] font-medium text-content-secondary">
                  <div className="w-5 h-5 rounded-sm bg-accent/10 flex items-center justify-center">
                    <IconMessageCircle2 className="w-3.5 h-3.5 text-accent" />
                  </div>
                  Perplexity
                </div>
                <div className="text-[13px] text-content-primary leading-relaxed flex flex-col gap-2">
                  <span className="font-medium text-content-secondary text-[11px] uppercase tracking-wider">Sources</span>
                  <div>
                    По отзывам студентов на форумах, программа обучения в Binar Club является одной из самых сильных.
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
