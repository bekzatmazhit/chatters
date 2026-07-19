import { Cpu } from 'lucide-react';

export default function AILogo({ model, className = "w-4 h-4 object-contain rounded-sm" }) {
  if (!model) return <Cpu size={14} className="text-content-muted" />;
  
  const m = model.toLowerCase();
  if (m.includes('gpt')) return <img src="/chatgpt.png" alt="GPT" className={className} />;
  if (m.includes('claude')) return <img src="/claude.png" alt="Claude" className={className} />;
  if (m.includes('gemini')) return <img src="/gemini.png" alt="Gemini" className={className} />;
  if (m.includes('perplexity')) return <img src="/perplexity.png" alt="Perplexity" className={className} />;
  
  return <Cpu size={14} className="text-content-muted" />;
}