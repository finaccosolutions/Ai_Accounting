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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('🗓️ useFinancialYears: useEffect triggered');
    console.log('🗓️ useFinancialYears: currentCompany:', currentCompany);
    console.log('🗓️ useFinancialYears: currentCompany?.id:', currentCompany?.id);
    
    if (currentCompany?.id) {
      console.log('🗓️ useFinancialYears: Company found, loading financial years for:', currentCompany.name);
      loadFinancialYears();
    } else {
      // Reset state when no company is selected
      console.log('🗓️ useFinancialYears: No company selected, resetting state');
      setFinancialYears([]);
      setCurrentFinancialYear(null);
      setSelectedFinancialYears([]);
      setLoading(false);
    }
  }, [currentCompany?.id]); // Use currentCompany.id to ensure effect runs when company changes

  const loadFinancialYears = async () => {
    try {
      if (!currentCompany?.id) {
        console.log('🗓️ loadFinancialYears: No current company ID, returning early');
        return;
      }

      console.log('🗓️ loadFinancialYears: Starting to load for company:', currentCompany.name);
      console.log('🗓️ loadFinancialYears: Company ID:', currentCompany.id);
      setLoading(true);

      const { data, error } = await supabase
        .from('financial_years')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('start_date', { ascending: false });

      console.log('🗓️ loadFinancialYears: Supabase query completed');
      console.log('🗓️ loadFinancialYears: Data received:', data);
      console.log('🗓️ loadFinancialYears: Error (if any):', error);

      if (error) {
        console.error('🗓️ loadFinancialYears: Error loading financial years:', error);
        throw error;
      }

      console.log('🗓️ loadFinancialYears: Successfully loaded', data?.length || 0, 'financial years');
      setFinancialYears(data || []);
      
      // Set current financial year
      const current = data?.find(fy => fy.is_current);
      if (current) {
        console.log('🗓️ loadFinancialYears: Found current financial year:', current.year_name);
        setCurrentFinancialYear(current);
      } else if (data && data.length > 0) {
        // If no current FY is set, use the latest one
        console.log('🗓️ loadFinancialYears: No current FY set, using latest:', data[0].year_name);
        setCurrentFinancialYear(data[0]);
      } else {
        // No financial years exist, create one
        console.log('🗓️ loadFinancialYears: No financial years found, creating default one...');
        await createDefaultFinancialYear();
        return; // Exit early as createDefaultFinancialYear will reload
      }

      // Clear selected financial years to force user selection
      setSelectedFinancialYears([]);
    } catch (error: any) {
      console.error('🗓️ loadFinancialYears: Error:', error);
      toast.error('Error loading financial years: ' + error.message);
      setFinancialYears([]);
      setCurrentFinancialYear(null);
      setSelectedFinancialYears([]);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultFinancialYear = async () => {
    try {
      if (!currentCompany?.id) {
        console.log('🗓️ createDefaultFinancialYear: No current company');
        return;
      }

      console.log('🗓️ createDefaultFinancialYear: Creating default financial year for company:', currentCompany.name);

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const startDate = `${currentYear}-04-01`;
      const endDate = `${currentYear + 1}-03-31`;
      const yearName = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;

      console.log('🗓️ createDefaultFinancialYear: Creating FY with data:', {
        yearName,
        startDate,
        endDate,
        companyId: currentCompany.id
      });

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

      if (error) {
        console.error('🗓️ createDefaultFinancialYear: Error creating default FY:', error);
        throw error;
      }

      console.log('🗓️ createDefaultFinancialYear: Successfully created:', data);
      setFinancialYears([data]);
      setCurrentFinancialYear(data);
      setSelectedFinancialYears([]); // Don't auto-select
      
      toast.success('Default financial year created');
    } catch (error: any) {
      console.error('🗓️ createDefaultFinancialYear: Error:', error);
      toast.error('Error creating financial year: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const createFinancialYear = async (fyData: Database['public']['Tables']['financial_years']['Insert']) => {
    try {
      if (!currentCompany?.id) throw new Error('No company selected');

      console.log('🗓️ createFinancialYear: Creating new FY:', fyData.year_name);
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

      if (error) {
        console.error('🗓️ createFinancialYear: Error:', error);
        throw error;
      }

      console.log('🗓️ createFinancialYear: Successfully created:', data);
      await loadFinancialYears();
      toast.success('Financial year created successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('🗓️ createFinancialYear: Error:', error);
      toast.error(error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const setCurrentFY = async (fyId: string) => {
    try {
      if (!currentCompany?.id) throw new Error('No company selected');

      console.log('🗓️ setCurrentFY: Setting current FY to:', fyId);

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
      console.error('🗓️ setCurrentFY: Error:', error);
      toast.error(error.message);
      return { data: null, error };
    }
  };

  const toggleFinancialYearSelection = (fyId: string) => {
    console.log('🗓️ toggleFinancialYearSelection: Toggling FY:', fyId);
    setSelectedFinancialYears(prev => {
      const newSelection = prev.includes(fyId) 
        ? prev.filter(id => id !== fyId)
        : [...prev, fyId];
      
      console.log('🗓️ toggleFinancialYearSelection: New selection:', newSelection);
      return newSelection;
    });
  };

  const selectAllFinancialYears = () => {
    console.log('🗓️ selectAllFinancialYears: Selecting all FYs');
    setSelectedFinancialYears(financialYears.map(fy => fy.id));
  };

  const clearFinancialYearSelection = () => {
    console.log('🗓️ clearFinancialYearSelection: Clearing all selections');
    setSelectedFinancialYears([]);
  };

  console.log('🗓️ useFinancialYears: Current state:', {
    currentCompany: currentCompany?.name || 'None',
    currentCompanyId: currentCompany?.id || 'None',
    financialYearsCount: financialYears.length,
    currentFinancialYear: currentFinancialYear?.year_name || 'None',
    selectedCount: selectedFinancialYears.length,
    loading
  });

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