import { useState, useEffect } from 'react';
import { Plus, Search, Globe, ChevronRight, ArrowLeft, Check } from 'lucide-react';
import { useBrands } from './BrandContext';

// Default mock data
const INDUSTRIES = ['SaaS', 'E-commerce', 'FinTech', 'EdTech', 'HealthTech', 'Media'];
const DEFAULT_MODELS = [
  { id: 'gpt4', name: 'GPT-4o' },
  { id: 'claude', name: 'Claude 3.5' },
  { id: 'gemini', name: 'Gemini 1.5' },
  { id: 'perplexity', name: 'Perplexity' }
];

export default function CreateProjectModal({ onClose }) {
  const { addBrand } = useBrands();
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [domain, setDomain] = useState('');
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('ru');
  const [competitors, setCompetitors] = useState([]);
  
  // Step 2 State
  const [industry, setIndustry] = useState('');
  const [models, setModels] = useState(['gpt4', 'claude']);
  const [persona, setPersona] = useState('b2b');
  const [schedule, setSchedule] = useState('weekly');

  const [competitorInput, setCompetitorInput] = useState('');

  // Domain parsing simulation
  useEffect(() => {
    if (domain && domain.includes('.')) {
      const parts = domain.replace(/^https?:\\/\\//, '').split('.');
      if (parts.length > 0 && !name) {
        // Auto-fill name based on domain
        const autoName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        setName(autoName);
      }
      if (!logo) {
        setLogo(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
      }
      if (!description && domain.includes('nike')) {
        setDescription('Спортивная одежда и обувь');
      }
    }
  }, [domain]);

  const handleAddCompetitor = () => {
    if (competitorInput.trim() && !competitors.includes(competitorInput.trim())) {\
