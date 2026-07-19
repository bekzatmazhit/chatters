import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconChevronDown } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface FAQAccordionProps {
  question: string;
  answer: React.ReactNode;
  defaultOpen?: boolean;
}

export function FAQAccordion({ question, answer, defaultOpen = false }: FAQAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-accent group outline-none"
      >
        <span className="text-[15px] font-medium text-content-primary group-hover:text-accent transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="text-content-muted group-hover:text-accent ml-4 shrink-0"
        >
          <IconChevronDown size={18} stroke={2} />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-[14px] leading-relaxed text-content-secondary">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
