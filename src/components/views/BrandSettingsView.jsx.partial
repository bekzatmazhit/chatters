import React, { useState, useEffect } from 'react';
import { useBrands } from '../BrandContext';
import { Building2, Palette, Target, Key, Bot, Save, AlertCircle, Plus, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function BrandSettingsView() {
  const { brands, activeBrandId, updateBrand } = useBrands();
  const activeBrand = brands.find(b => b.id === activeBrandId);

  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    accent_color: '#4C5FD5',
    competitors: '',
    keywords: '',
    tracked_ai_models: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (activeBrand) {
      setFormData({
        name: activeBrand.name || '',
        logo_url: activeBrand.logo_url || '',
        accent_color: activeBrand.accent_color || '#4C5FD5',
        competitors: Array.isArray(activeBrand.competitors) ? activeBrand.competitors.join(', ') : '',
        keywords: Array.isArray(activeBrand.keywords) ? activeBrand.keywords.join(', ') : '',
        tracked_ai_models: Array.isArray(activeBrand.tracked_ai_models) ? activeBrand.tracked_ai_models : ['chatgpt', 'claude']
      });
    }
  }, [activeBrand]);

  const handleSave = async () => {
    if (!activeBrand) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        name: formData.name,
        logo_url: formData.logo_url,
        accent_color: formData.accent_color,
        competitors: formData.competitors.split(',').map(s => s.trim()).filter(Boolean),
        keywords: formData.keywords.split(',').map(s => s.trim()).filter(Boolean),
        tracked_ai_models: formData.tracked_ai_models
      };

      await updateBrand(activeBrand.id, payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving brand:', error);
    
