import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { useCompany } from './useCompany';
import toast from 'react-hot-toast';

type FinancialYear = Database['public']['Tables']['financial_years']['Row'];

export const useFinancialYears = () => {
  const { currentCompany } = useCompany();
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [currentFinancialYear, setCurrentFinancialYear] = useState<FinancialYear | null>(null);
  const [selectedFinancialYears, setSelectedFinancialYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentCompany) {
      loadFinancialYears();
    } else {
      // Reset state when no company is selected
      setFinancialYears([]);
      setCurrentFinancialYear(null);
      setSelectedFinancialYears([]);
      setLoading(false);
    }
  }, [currentCompany]);

  const loadFinancialYears = async () => {
    try {
      if (!currentCompany) return;

      setLoading(true);

      const { data, error } = await supabase
        .from('financial_years')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('start_date', { ascending: false });

      if (error) throw error;

      setFinancialYears(data || []);
      
      // Set current financial year
      const current = data?.find(fy => fy.is_current);
      if (current) {
        setCurrentFinancialYear(current);
        // Don't auto-select any financial years - let user choose
      } else if (data && data.length > 0) {
        // If no current FY is set, mark the latest one as current
        setCurrentFinancialYear(data[0]);
      }

      // If there's only one financial year, auto-select it
      if (data && data.length === 1) {
        setSelectedFinancialYears([data[0].id]);
      } else {
        // Don't auto-select any financial years
        setSelectedFinancialYears([]);
      }
    } catch (error: any) {
      console.error('Error loading financial years:', error);
      toast.error('Error loading financial years');
    } finally {
      setLoading(false);
    }
  };

  const createFinancialYear = async (fyData: Database['public']['Tables']['financial_years']['Insert']) => {
    try {
      if (!currentCompany) throw new Error('No company selected');

      setLoading(true);

      // If this is set as current, unset other current FYs first
      if (fyData.is_current) {
        await supabase
          .from('financial_years')
          .update({ is_current: false })
          .eq('company_id', currentCompany.id);
      }

      const { data, error } = await supabase
        .from('financial_years')
        .insert({
          ...fyData,
          company_id: currentCompany.id,
        })
        .select()
        .single();

      if (error) throw error;

      await loadFinancialYears();
      toast.success('Financial year created successfully');
      return { data, error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const setCurrentFY = async (fyId: string) => {
    try {
      if (!currentCompany) throw new Error('No company selected');

      // First, unset current flag from all FYs
      await supabase
        .from('financial_years')
        .update({ is_current: false })
        .eq('company_id', currentCompany.id);

      // Then set the selected FY as current
      const { data, error } = await supabase
        .from('financial_years')
        .update({ is_current: true })
        .eq('id', fyId)
        .select()
        .single();

      if (error) throw error;

      setCurrentFinancialYear(data);
      toast.success('Current financial year updated');
      return { data, error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { data: null, error };
    }
  };

  const toggleFinancialYearSelection = (fyId: string) => {
    setSelectedFinancialYears(prev => {
      if (prev.includes(fyId)) {
        return prev.filter(id => id !== fyId);
      } else {
        return [...prev, fyId];
      }
    });
  };

  const selectAllFinancialYears = () => {
    setSelectedFinancialYears(financialYears.map(fy => fy.id));
  };

  const clearFinancialYearSelection = () => {
    setSelectedFinancialYears([]);
  };

  return {
    financialYears,
    currentFinancialYear,
    selectedFinancialYears,
    loading,
    createFinancialYear,
    setCurrentFY,
    toggleFinancialYearSelection,
    selectAllFinancialYears,
    clearFinancialYearSelection,
    refreshFinancialYears: loadFinancialYears,
  };
};