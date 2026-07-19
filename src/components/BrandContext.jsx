import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const BrandContext = createContext();

export function BrandProvider({ children }) {
  const [brands, setBrands] = useState([]);
  const [activeBrandId, setActiveBrandId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBrands(data || []);
      if (data && data.length > 0 && !activeBrandId) {
        setActiveBrandId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      // fallback for UI testing without supabase
      setBrands([
        { id: '1', name: 'Kaspi', color: '#f87171' },
        { id: '2', name: 'Halyk', color: '#34d399' }
      ]);
      if (!activeBrandId) setActiveBrandId('1');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return (
    <BrandContext.Provider value={{ brands, activeBrandId, setActiveBrandId, refreshBrands: fetchBrands, loading }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrands() {
  return useContext(BrandContext);
}
