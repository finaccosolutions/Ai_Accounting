import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { useAuth } from './useAuth';
import { useCompany } from './useCompany';
import toast from 'react-hot-toast';

type Voucher = Database['public']['Tables']['vouchers']['Row'];
type VoucherEntry = Database['public']['Tables']['voucher_entries']['Row'];
type VoucherType = Database['public']['Tables']['voucher_types']['Row'];

export interface VoucherWithDetails extends Voucher {
  voucher_types?: VoucherType;
  voucher_entries?: (VoucherEntry & {
    ledgers?: any;
    stock_items?: any;
  })[];
}

export const useVouchers = () => {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [vouchers, setVouchers] = useState<VoucherWithDetails[]>([]);
  const [voucherTypes, setVoucherTypes] = useState<VoucherType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentCompany) {
      loadVouchers();
      loadVoucherTypes();
    }
  }, [currentCompany]);

  const loadVouchers = async () => {
    try {
      if (!currentCompany) return;

      const { data, error } = await supabase
        .from('vouchers')
        .select(`
          *,
          voucher_types (*),
          voucher_entries (
            *,
            ledgers (name),
            stock_items (name)
          )
        `)
        .eq('company_id', currentCompany.id)
        .order('voucher_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVouchers(data || []);
    } catch (error: any) {
      console.error('Error loading vouchers:', error);
      toast.error('Error loading vouchers');
    } finally {
      setLoading(false);
    }
  };

  const loadVoucherTypes = async () => {
    try {
      if (!currentCompany) return;

      const { data, error } = await supabase
        .from('voucher_types')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setVoucherTypes(data || []);
    } catch (error: any) {
      console.error('Error loading voucher types:', error);
    }
  };

  const createVoucher = async (
    voucherData: Database['public']['Tables']['vouchers']['Insert'],
    entries: Database['public']['Tables']['voucher_entries']['Insert'][]
  ) => {
    try {
      if (!currentCompany || !user) throw new Error('Missing company or user');

      // Create voucher
      const { data: voucher, error: voucherError } = await supabase
        .from('vouchers')
        .insert({
          ...voucherData,
          company_id: currentCompany.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (voucherError) throw voucherError;

      // Create voucher entries
      const entriesWithVoucherId = entries.map(entry => ({
        ...entry,
        voucher_id: voucher.id,
      }));

      const { error: entriesError } = await supabase
        .from('voucher_entries')
        .insert(entriesWithVoucherId);

      if (entriesError) throw entriesError;

      await loadVouchers();
      toast.success('Voucher created successfully');
      return { data: voucher, error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { data: null, error };
    }
  };

  const updateVoucher = async (
    voucherId: string,
    voucherData: Database['public']['Tables']['vouchers']['Update'],
    entries?: Database['public']['Tables']['voucher_entries']['Insert'][]
  ) => {
    try {
      // Update voucher
      const { data: voucher, error: voucherError } = await supabase
        .from('vouchers')
        .update(voucherData)
        .eq('id', voucherId)
        .select()
        .single();

      if (voucherError) throw voucherError;

      // Update entries if provided
      if (entries) {
        // Delete existing entries
        const { error: deleteError } = await supabase
          .from('voucher_entries')
          .delete()
          .eq('voucher_id', voucherId);

        if (deleteError) throw deleteError;

        // Insert new entries
        const entriesWithVoucherId = entries.map(entry => ({
          ...entry,
          voucher_id: voucherId,
        }));

        const { error: entriesError } = await supabase
          .from('voucher_entries')
          .insert(entriesWithVoucherId);

        if (entriesError) throw entriesError;
      }

      await loadVouchers();
      toast.success('Voucher updated successfully');
      return { data: voucher, error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { data: null, error };
    }
  };

  const deleteVoucher = async (voucherId: string) => {
    try {
      const { error } = await supabase
        .from('vouchers')
        .delete()
        .eq('id', voucherId);

      if (error) throw error;

      await loadVouchers();
      toast.success('Voucher deleted successfully');
      return { error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { error };
    }
  };

  const postVoucher = async (voucherId: string) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('vouchers')
        .update({
          status: 'posted',
          posted_by: user.id,
          posted_at: new Date().toISOString(),
        })
        .eq('id', voucherId)
        .select()
        .single();

      if (error) throw error;

      await loadVouchers();
      toast.success('Voucher posted successfully');
      return { data, error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { data: null, error };
    }
  };

  const generateVoucherNumber = async (voucherTypeId: string): Promise<string> => {
    try {
      if (!currentCompany) throw new Error('No company selected');

      const voucherType = voucherTypes.find(vt => vt.id === voucherTypeId);
      if (!voucherType) throw new Error('Voucher type not found');

      // Get the last voucher number for this type
      const { data: lastVoucher } = await supabase
        .from('vouchers')
        .select('voucher_number')
        .eq('company_id', currentCompany.id)
        .eq('voucher_type_id', voucherTypeId)
        .order('voucher_number', { ascending: false })
        .limit(1)
        .single();

      let nextNumber = 1;
      if (lastVoucher?.voucher_number) {
        // Extract number from voucher number (assuming format like "SV-001")
        const match = lastVoucher.voucher_number.match(/(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      const prefix = voucherType.prefix || voucherType.code;
      return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating voucher number:', error);
      return 'AUTO-001';
    }
  };

  return {
    vouchers,
    voucherTypes,
    loading,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    postVoucher,
    generateVoucherNumber,
    refreshVouchers: loadVouchers,
  };
};