import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { VoucherHeader } from './components/VoucherHeader';
import { PartyDetails } from './components/PartyDetails';
import { StockItemsEntry } from './components/StockItemsEntry';
import { AccountingEntries } from './components/AccountingEntries';
import { VoucherNarration } from './components/VoucherNarration';
import { EntryMethodSelector } from './components/EntryMethodSelector';
import { EnhancedRightSidebar } from './components/EnhancedRightSidebar';
import { 
  Save, 
  Search,
  Copy,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

interface VoucherEntry {
  id?: string;
  ledger_id: string;
  ledger_name?: string;
  debit_amount: number;
  credit_amount: number;
  narration?: string;
}

interface StockEntry {
  id?: string;
  stock_item_id: string;
  stock_item_name?: string;
  quantity: number;
  rate: number;
  amount: number;
  godown_id?: string;
  batch_number?: string;
  serial_number?: string;
}

interface Voucher {
  voucher_type: string;
  voucher_number: string;
  date: string;
  reference?: string;
  narration?: string;
  party_ledger_id?: string;
  party_name?: string;
  sales_ledger_id?: string;
  place_of_supply?: string;
  entries: VoucherEntry[];
  stock_entries?: StockEntry[];
  tax_details?: {
    cgst: number;
    sgst: number;
    igst: number;
    total_tax: number;
  };
  cost_center_id?: string;
  mode?: 'item_invoice' | 'voucher_mode' | 'accounting_mode';
  entry_method?: 'manual' | 'ai_assisted' | 'pdf_upload';
}

const voucherTypeLabels = {
  sales: 'Sales Invoice',
  purchase: 'Purchase Bill',
  receipt: 'Receipt Voucher',
  payment: 'Payment Voucher',
  journal: 'Journal Entry',
  contra: 'Contra Entry',
  debit_note: 'Debit Note',
  credit_note: 'Credit Note'
};

export const VoucherEntryNew: React.FC = () => {
  const { selectedCompany } = useApp();
  const [voucher, setVoucher] = useState<Voucher>({
    voucher_type: 'sales',
    voucher_number: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    narration: '',
    party_name: '',
    entries: [],
    stock_entries: [],
    mode: 'item_invoice',
    entry_method: 'manual'
  });
  
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [godowns, setGodowns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentVouchers, setRecentVouchers] = useState<any[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    if (selectedCompany) {
      fetchLedgers();
      fetchStockItems();
      fetchCostCenters();
      fetchGodowns();
      fetchRecentVouchers();
      generateVoucherNumber();
    }
  }, [selectedCompany, voucher.voucher_type]);

  const fetchLedgers = async () => {
    try {
      const { data, error } = await supabase
        .from('ledgers')
        .select(`
          id, name, group_id, current_balance,
          ledger_groups(name, group_type)
        `)
        .eq('company_id', selectedCompany?.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setLedgers(data || []);
    } catch (error) {
      console.error('Error fetching ledgers:', error);
      toast.error('Failed to fetch ledgers');
    }
  };

  const fetchStockItems = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_items')
        .select(`
          id, name, rate, current_stock, hsn_code,
          units(name, symbol),
          stock_groups(name)
        `)
        .eq('company_id', selectedCompany?.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setStockItems(data || []);
    } catch (error) {
      console.error('Error fetching stock items:', error);
    }
  };

  const fetchCostCenters = async () => {
    try {
      const { data, error } = await supabase
        .from('cost_centers')
        .select('id, name')
        .eq('company_id', selectedCompany?.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCostCenters(data || []);
    } catch (error) {
      console.error('Error fetching cost centers:', error);
    }
  };

  const fetchGodowns = async () => {
    try {
      const { data, error } = await supabase
        .from('godowns')
        .select('id, name, address')
        .eq('company_id', selectedCompany?.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setGodowns(data || []);
    } catch (error) {
      console.error('Error fetching godowns:', error);
    }
  };

  const fetchRecentVouchers = async () => {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('company_id', selectedCompany?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentVouchers(data || []);
    } catch (error) {
      console.error('Error fetching recent vouchers:', error);
    }
  };

  const generateVoucherNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('voucher_number')
        .eq('company_id', selectedCompany?.id)
        .eq('voucher_type', voucher.voucher_type)
        .order('voucher_number', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastNumber = parseInt(data[0].voucher_number.replace(/\D/g, ''));
        nextNumber = lastNumber + 1;
      }

      const prefix = voucher.voucher_type.toUpperCase().substring(0, 2);
      const newVoucherNumber = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
      
      setVoucher(prev => ({ ...prev, voucher_number: newVoucherNumber }));
    } catch (error) {
      console.error('Error generating voucher number:', error);
    }
  };

  const calculateTotals = () => {
    const totalDebit = voucher.entries.reduce((sum, entry) => sum + (entry.debit_amount || 0), 0);
    const totalCredit = voucher.entries.reduce((sum, entry) => sum + (entry.credit_amount || 0), 0);
    const stockTotal = voucher.stock_entries?.reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0;
    return { totalDebit, totalCredit, stockTotal };
  };

  const saveVoucher = async () => {
    const { totalDebit, totalCredit } = calculateTotals();
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast.error('Debit and Credit amounts must be equal');
      return;
    }

    if (!selectedCompany) {
      toast.error('Please select a company');
      return;
    }

    setLoading(true);
    try {
      // Save voucher
      const { data: voucherData, error: voucherError } = await supabase
        .from('vouchers')
        .insert([{
          company_id: selectedCompany.id,
          voucher_type: voucher.voucher_type,
          voucher_number: voucher.voucher_number,
          date: voucher.date,
          reference: voucher.reference,
          narration: voucher.narration,
          total_amount: totalDebit
        }])
        .select()
        .single();

      if (voucherError) throw voucherError;

      // Save voucher entries
      const entries = voucher.entries
        .filter(entry => entry.ledger_id && (entry.debit_amount > 0 || entry.credit_amount > 0))
        .map(entry => ({
          voucher_id: voucherData.id,
          ledger_id: entry.ledger_id,
          debit_amount: entry.debit_amount || 0,
          credit_amount: entry.credit_amount || 0,
          narration: entry.narration
        }));

      const { error: entriesError } = await supabase
        .from('voucher_entries')
        .insert(entries);

      if (entriesError) throw entriesError;

      toast.success('Voucher saved successfully!');
      
      // Reset form
      setVoucher({
        voucher_type: voucher.voucher_type,
        voucher_number: '',
        date: new Date().toISOString().split('T')[0],
        reference: '',
        narration: '',
        party_name: '',
        entries: [],
        stock_entries: [],
        mode: voucher.mode,
        entry_method: voucher.entry_method
      });
      
      generateVoucherNumber();
      fetchRecentVouchers();
    } catch (error) {
      console.error('Error saving voucher:', error);
      toast.error('Failed to save voucher');
    } finally {
      setLoading(false);
    }
  };

  const { totalDebit, totalCredit, stockTotal } = calculateTotals();
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gradient-to-br from-slate-50/90 via-blue-50/90 to-indigo-50/90 relative">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header with Voucher Type */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {voucherTypeLabels[voucher.voucher_type as keyof typeof voucherTypeLabels] || 'Voucher Entry'}
              </h1>
              <p className="text-slate-600 text-lg">Create and manage accounting vouchers with AI assistance</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-200/50">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-200/50">
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Assist
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Entry Method Selector - Now at the top */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <EntryMethodSelector
            currentMethod={voucher.entry_method || 'manual'}
            onMethodChange={(method) => setVoucher(prev => ({ ...prev, entry_method: method as any }))}
            voucher={voucher}
            onVoucherChange={setVoucher}
          />
        </motion.div>

        {/* Voucher Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <VoucherHeader
            voucher={voucher}
            onVoucherChange={setVoucher}
          />
        </motion.div>

        {/* Party Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <PartyDetails
            voucher={voucher}
            onVoucherChange={setVoucher}
            voucherType={voucher.voucher_type}
          />
        </motion.div>

        {/* Stock Items Entry */}
        {voucher.mode === 'item_invoice' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <StockItemsEntry
              voucher={voucher}
              onVoucherChange={setVoucher}
              stockItems={stockItems}
              godowns={godowns}
              selectedCompany={selectedCompany}
            />
          </motion.div>
        )}

        {/* Accounting Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <AccountingEntries
            voucher={voucher}
            onVoucherChange={setVoucher}
            ledgers={ledgers}
            totalDebit={totalDebit}
            totalCredit={totalCredit}
            isBalanced={isBalanced}
          />
        </motion.div>

        {/* Voucher Narration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <VoucherNarration
            narration={voucher.narration || ''}
            onNarrationChange={(narration) => setVoucher(prev => ({ ...prev, narration }))}
          />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex justify-end space-x-3 mb-6"
        >
          <Button variant="outline" className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-200/50">
            Cancel
          </Button>
          <Button 
            onClick={saveVoucher}
            disabled={!isBalanced || loading}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Voucher
          </Button>
        </motion.div>
      </div>

      {/* Enhanced Auto-Hide Right Sidebar */}
      <EnhancedRightSidebar
        visible={sidebarVisible}
        onVisibilityChange={setSidebarVisible}
        voucher={voucher}
        onVoucherChange={setVoucher}
        recentVouchers={recentVouchers}
        totalAmount={totalDebit}
      />
    </div>
  );
};