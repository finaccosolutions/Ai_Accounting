import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { useCompany } from './useCompany';
import toast from 'react-hot-toast';

type Ledger = Database['public']['Tables']['ledgers']['Row'];
type LedgerGroup = Database['public']['Tables']['ledger_groups']['Row'];

export interface LedgerWithGroup extends Ledger {
  ledger_groups?: LedgerGroup;
}

export const useLedgers = () => {
  const { currentCompany } = useCompany();
  const [ledgers, setLedgers] = useState<LedgerWithGroup[]>([]);
  const [ledgerGroups, setLedgerGroups] = useState<LedgerGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentCompany) {
      loadLedgers();
      loadLedgerGroups();
    }
  }, [currentCompany]);

  const loadLedgers = async () => {
    try {
      if (!currentCompany) return;

      const { data, error } = await supabase
        .from('ledgers')
        .select(`
          *,
          ledger_groups (*)
        `)
        .eq('company_id', currentCompany.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setLedgers(data || []);
    } catch (error: any) {
      console.error('Error loading ledgers:', error);
      toast.error('Error loading ledgers');
    } finally {
      setLoading(false);
    }
  };

  const loadLedgerGroups = async () => {
    try {
      if (!currentCompany) return;

      const { data, error } = await supabase
        .from('ledger_groups')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('name');

      if (error) throw error;

      setLedgerGroups(data || []);
    } catch (error: any) {
      console.error('Error loading ledger groups:', error);
    }
  };

  const createLedger = async (ledgerData: Database['public']['Tables']['ledgers']['Insert']) => {
    try {
      if (!currentCompany) throw new Error('No company selected');

      const { data, error } = await supabase
        .from('ledgers')
        .insert({
          ...ledgerData,
          company_id: currentCompany.id,
        })
        .select()
        .single();

      if (error) throw error;

      await loadLedgers();
      toast.success('Ledger created successfully');
      return { data, error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { data: null, error };
    }
  };

  const updateLedger = async (ledgerId: string, updates: Database['public']['Tables']['ledgers']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('ledgers')
        .update(updates)
        .eq('id', ledgerId)
        .select()
        .single();

      if (error) throw error;

      await loadLedgers();
      toast.success('Ledger updated successfully');
      return { data, error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { data: null, error };
    }
  };

  const deleteLedger = async (ledgerId: string) => {
    try {
      const { error } = await supabase
        .from('ledgers')
        .update({ is_active: false })
        .eq('id', ledgerId);

      if (error) throw error;

      await loadLedgers();
      toast.success('Ledger deleted successfully');
      return { error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { error };
    }
  };

  const createLedgerGroup = async (groupData: Database['public']['Tables']['ledger_groups']['Insert']) => {
    try {
      if (!currentCompany) throw new Error('No company selected');

      const { data, error } = await supabase
        .from('ledger_groups')
        .insert({
          ...groupData,
          company_id: currentCompany.id,
        })
        .select()
        .single();

      if (error) throw error;

      await loadLedgerGroups();
      toast.success('Ledger group created successfully');
      return { data, error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { data: null, error };
    }
  };

  return {
    ledgers,
    ledgerGroups,
    loading,
    createLedger,
    updateLedger,
    deleteLedger,
    createLedgerGroup,
    refreshLedgers: loadLedgers,
    refreshLedgerGroups: loadLedgerGroups,
  };
};