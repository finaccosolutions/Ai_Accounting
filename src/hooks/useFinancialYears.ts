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
      console.log('🗓️ Loading financial years for company:', currentCompany.name);
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

      console.log('🗓️ Financial years loaded:', data?.length || 0);
      setFinancialYears(data || []);
      
      // Set current financial year
      const current = data?.find(fy => fy.is_current);
      if (current) {
        setCurrentFinancialYear(current);
        // Don't auto-select - let user choose
        setSelectedFinancialYears([]);
      } else if (data && data.length > 0) {
        // If no current FY is set, mark the latest one as current
        setCurrentFinancialYear(data[0]);
        setSelectedFinancialYears([]);
      } else {
        // No financial years exist, create one
        await createDefaultFinancialYear();
        return; // Exit early as createDefaultFinancialYear will reload
      }
    } catch (error: any) {
      console.error('Error loading financial years:', error);
      toast.error('Error loading financial years');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultFinancialYear = async () => {
    try {
      if (!currentCompany) return;

      console.log('🗓️ Creating default financial year for company:', currentCompany.name);

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const startDate = `${currentYear}-04-01`;
      const endDate = `${currentYear + 1}-03-31`;
      const yearName = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;

      const { data, error } = await supabase
        .from('financial_years')
        .insert({
          company_id: currentCompany.id,
          year_name: yearName,
          start_date: startDate,
          end_date: endDate,
          is_current: true,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('🗓️ Default financial year created:', data);
      setFinancialYears([data]);
      setCurrentFinancialYear(data);
      setSelectedFinancialYears([]); // Don't auto-select
      
      toast.success('Default financial year created');
    } catch (error: any) {
      console.error('Error creating default financial year:', error);
      toast.error('Error creating financial year');
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