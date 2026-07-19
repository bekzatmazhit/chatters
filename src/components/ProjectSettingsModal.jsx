import { useState, useMemo } from 'react';
import { useBrands } from './BrandContext';
import { X, Copy, Check, Trash2, Building2, Target, Search, Cpu, AlertTriangle, Globe } from 'lucide-react';
import TagInput from './TagInput';
import ColorPicker from './ColorPicker';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const AVAILABLE_MODELS = [
  { id: 'gpt-4o', name: 'ChatGPT-4o' },
  { id: 'claude-3.5', name: 'Claude 3.5' },
  { id: 'gemini-1.5', name: 'Gemini 1.5' },
  { id: 'perplexity', name: 'Perplexity' }
];

export default function ProjectSettingsModal({ brand, onClose }) {
  const { updateBrand } = useBrands();
  const [activeTab, setActiveTab] = useState('general');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form State
  const [name, setName] = useState(brand.name || '');
  const [domain, setDomain] = useState(brand.domain || '');
  const [accentColor, setAccentColor] = useState(brand.accent_color || '#7c3aed');
  const [competitors, setCompetitors] = useState(brand.competitors || []);
  const [keywords, setKeywords] = useState(brand.keywords || []);
  const [trackedModels, setTrackedModels] = useState(brand.tracked_ai_models || brand.models || []);

  const hasUnsavedChanges = useMemo(() => {
    return (
      name !== (brand.name || '') ||
      domain !== (brand.domain || '') ||
      accentColor !== (brand.accent_color || '#7c3aed') ||
      JSON.stringify(competitors) !== JSON.stringify(brand.competitors || []) ||
      JSON.stringify(keywords) !== JSON.stringify(brand.keywords || []) ||
      JSON.stringify(trackedModels) !== JSON.stringify(brand.tracked_ai_models || brand.models || [])
    );
  }, [name, domain, accentColor, competitors, keywords, trackedModels, brand]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://chatters.app/invite/${brand.id}`);
    setCopied(true);
    setTimeout(() => se
