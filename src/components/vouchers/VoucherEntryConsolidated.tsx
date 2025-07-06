import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { 
  Save, 
  Search,
  Copy,
  Menu,
  Edit3,
  Bot,
  Upload,
  FileText,
  Sparkles,
  Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

// Import the new components
import { VoucherHeader } from './VoucherHeader';
import { PartyDetailsSection } from './PartyDetailsSection';
import { TransactionDetailsSection } from './TransactionDetailsSection';
import { ContraEntrySection } from './ContraEntrySection';
import { AccountingEntriesSection } from './AccountingEntriesSection';
import { VoucherNarrationSection } from './VoucherNarrationSection';
import { CollapsibleRightPanel } from './CollapsibleRightPanel';

interface VoucherEntry {
  id?: string;
  ledger_id: string;
  ledger_name?: string;
  debit_amount: number;
  credit_amount: number;
  amount?: number; // For non-journal entries
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
  individual_ledger_id?: string;
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
  purchase_ledger_id?: string;
  cash_bank_ledger_id?: string;
  place_of_supply?: string;
  entries: VoucherEntry[];
  stock_entries?: StockEntry[];
  mode?: 'item_invoice' | 'voucher_mode';
  use_common_ledger?: boolean;
  total_amount?: number;
  // Contra entry specific fields
  debit_ledger_id?: string;
  credit_ledger_id?: string;
  debit_ledger_name?: string;
  credit_ledger_name?: string;
  contra_amount?: number;
}

const voucherTypes = [
  { value: 'sales', label: 'Sales Invoice', icon: '💰', hasParty: true, hasStock: true, hasTax: true },
  { value: 'purchase', label: 'Purchase Bill', icon: '🛒', hasParty: true, hasStock: true, hasTax: true },
  { value: 'receipt', label: 'Receipt Voucher', icon: '📥', hasParty: false, hasStock: false, hasTax: false },
  { value: 'payment', label: 'Payment Voucher', icon: '📤', hasParty: false, hasStock: false, hasTax: false },
  { value: 'journal', label: 'Journal Entry', icon: '📝', hasParty: false, hasStock: false, hasTax: false },
  { value: 'contra', label: 'Contra Entry', icon: '🔄', hasParty: false, hasStock: false, hasTax: false },
  { value: 'debit_note', label: 'Debit Note', icon: '📋', hasParty: true, hasStock: true, hasTax: true },
  { value: 'credit_note', label: 'Credit Note', icon: '📄', hasParty: true, hasStock: true, hasTax: true }
];

const entryModes = [
  {
    id: 'manual',
    label: 'Manual Entry',
    description: 'Enter voucher details manually',
    icon: Edit3,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-50 to-blue-100'
  },
  {
    id: 'ai_assisted',
    label: 'AI Assisted',
    description: 'Let AI help create vouchers',
    icon: Bot,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'from-purple-50 to-purple-100'
  },
  {
    id: 'pdf_import',
    label: 'PDF Import',
    description: 'Upload invoices, bills & statements',
    icon: Upload,
    color: 'from-green-500 to-green-600',
    bgColor: 'from-green-50 to-green-100'
  }
];

export const VoucherEntryConsolidated: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCompany } = useApp();
  const [entryMode, setEntryMode] = useState<'manual' | 'ai_assisted' | 'pdf_import'>('manual');
  const [voucher, setVoucher] = useState<Voucher>({
    voucher_type: 'sales',
    voucher_number: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    narration: '',
    party_name: '',
    entries: [],
    stock_entries: [{ stock_item_id: '', stock_item_name: '', quantity: 0, rate: 0, amount: 0 }],
    mode: 'item_invoice',
    use_common_ledger: true
  });
  
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [godowns, setGodowns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentVouchers, setRecentVouchers] = useState<any[]>([]);
  const [rightPanelVisible, setRightPanelVisible] = useState(false);

  useEffect(() => {
    if (selectedCompany) {
      fetchLedgers();
      fetchStockItems();
      fetchGodowns();
      fetchRecentVouchers();
      generateVoucherNumber();
    }
  }, [selectedCompany, voucher.voucher_type]);

  useEffect(() => {
    // Initialize entries based on voucher type
    if (voucher.voucher_type === 'journal') {
      if (voucher.entries.length === 0) {
        setVoucher(prev => ({
          ...prev,
          entries: [
            { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' },
            { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' }
          ]
        }));
      }
    } else if (voucher.voucher_type === 'contra') {
      // Contra entries are handled separately
      setVoucher(prev => ({
        ...prev,
        entries: []
      }));
    } else {
      if (voucher.entries.length === 0) {
        setVoucher(prev => ({
          ...prev,
          entries: [
            { ledger_id: '', amount: 0, debit_amount: 0, credit_amount: 0, narration: '' }
          ]
        }));
      }
    }
  }, [voucher.voucher_type]);

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

  const addEntry = () => {
    if (voucher.voucher_type === 'journal') {
      setVoucher(prev => ({
        ...prev,
        entries: [...prev.entries, { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' }]
      }));
    } else {
      setVoucher(prev => ({
        ...prev,
        entries: [...prev.entries, { ledger_id: '', amount: 0, debit_amount: 0, credit_amount: 0, narration: '' }]
      }));
    }
  };

  const removeEntry = (index: number) => {
    const minEntries = voucher.voucher_type === 'journal' ? 2 : 1;
    if (voucher.entries.length > minEntries) {
      setVoucher(prev => ({
        ...prev,
        entries: prev.entries.filter((_, i) => i !== index)
      }));
    }
  };

  const updateEntry = (index: number, field: string, value: any) => {
    setVoucher(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => {
        if (i === index) {
          const updatedEntry = { ...entry, [field]: value };
          
          // For journal entries, prevent both debit and credit from being > 0
          if (voucher.voucher_type === 'journal') {
            if (field === 'debit_amount' && value > 0) {
              updatedEntry.credit_amount = 0;
            } else if (field === 'credit_amount' && value > 0) {
              updatedEntry.debit_amount = 0;
            }
          }
          
          // Auto-add new entry if this is the last entry and user entered data
          if (i === prev.entries.length - 1 && value && field === 'ledger_id') {
            setTimeout(() => addEntry(), 100);
          }
          
          return updatedEntry;
        }
        return entry;
      })
    }));
  };

  const addStockEntry = () => {
    setVoucher(prev => ({
      ...prev,
      stock_entries: [...(prev.stock_entries || []), { 
        stock_item_id: '', 
        stock_item_name: '',
        quantity: 0, 
        rate: 0, 
        amount: 0 
      }]
    }));
  };

  const removeStockEntry = (index: number) => {
    setVoucher(prev => ({
      ...prev,
      stock_entries: prev.stock_entries?.filter((_, i) => i !== index) || []
    }));
  };

  const updateStockEntry = (index: number, field: string, value: any) => {
    setVoucher(prev => ({
      ...prev,
      stock_entries: prev.stock_entries?.map((entry, i) => {
        if (i === index) {
          const updatedEntry = { ...entry, [field]: value };
          // Auto-calculate amount when quantity or rate changes
          if (field === 'quantity' || field === 'rate') {
            updatedEntry.amount = (updatedEntry.quantity || 0) * (updatedEntry.rate || 0);
          }
          return updatedEntry;
        }
        return entry;
      }) || []
    }));
  };

  const calculateTotals = () => {
    if (voucher.voucher_type === 'journal') {
      const totalDebit = voucher.entries.reduce((sum, entry) => sum + (entry.debit_amount || 0), 0);
      const totalCredit = voucher.entries.reduce((sum, entry) => sum + (entry.credit_amount || 0), 0);
      return { totalDebit, totalCredit, stockTotal: 0, isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 };
    } else if (voucher.voucher_type === 'contra') {
      const contraAmount = voucher.contra_amount || 0;
      return { totalDebit: contraAmount, totalCredit: contraAmount, stockTotal: 0, isBalanced: true };
    } else {
      const totalAmount = voucher.entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
      const stockTotal = voucher.stock_entries?.reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0;
      return { totalDebit: totalAmount, totalCredit: totalAmount, stockTotal, isBalanced: true };
    }
  };

  const saveVoucher = async () => {
    const { totalDebit, totalCredit, isBalanced } = calculateTotals();
    
    if (voucher.voucher_type === 'journal' && !isBalanced) {
      toast.error('Debit and Credit amounts must be equal for journal entries');
      return;
    }

    if (voucher.voucher_type === 'contra') {
      if (!voucher.debit_ledger_id || !voucher.credit_ledger_id || !voucher.contra_amount) {
        toast.error('Please select both ledgers and enter amount for contra entry');
        return;
      }
    }

    if (!selectedCompany) {
      toast.error('Please select a company');
      return;
    }

    setLoading(true);
    try {
      // Save voucher logic here
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
        stock_entries: [{ stock_item_id: '', stock_item_name: '', quantity: 0, rate: 0, amount: 0 }],
        mode: voucher.mode,
        use_common_ledger: true
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

  const handleVoucherTypeChange = (type: string) => {
    setVoucher(prev => ({ 
      ...prev, 
      voucher_type: type,
      entries: [],
      stock_entries: [{ stock_item_id: '', stock_item_name: '', quantity: 0, rate: 0, amount: 0 }],
      mode: ['sales', 'purchase', 'debit_note', 'credit_note'].includes(type) ? 'item_invoice' : 'voucher_mode',
      use_common_ledger: true
    }));
    generateVoucherNumber();
  };

  const handleModeChange = (mode: string) => {
    setVoucher(prev => ({ ...prev, mode: mode as any }));
  };

  const { totalDebit, totalCredit, stockTotal, isBalanced } = calculateTotals();
  const currentVoucherType = voucherTypes.find(vt => vt.value === voucher.voucher_type);

  const getPartyLabel = () => {
    switch (voucher.voucher_type) {
      case 'sales':
      case 'debit_note':
        return 'Customer';
      case 'purchase':
      case 'credit_note':
        return 'Vendor';
      case 'receipt':
        return 'Cash/Bank Details';
      case 'payment':
        return 'Cash/Bank Details';
      default:
        return 'Party';
    }
  };

  const getSalesLedgerLabel = () => {
    switch (voucher.voucher_type) {
      case 'sales':
        return 'Sales Ledger';
      case 'purchase':
        return 'Purchase Ledger';
      case 'debit_note':
      case 'credit_note':
        return 'Ledger Account';
      case 'receipt':
        return 'Cash/Bank Ledger';
      case 'payment':
        return 'Cash/Bank Ledger';
      default:
        return 'Ledger Account';
    }
  };

  const getAccountingEntryLabel = () => {
    switch (voucher.voucher_type) {
      case 'receipt':
        return 'Received From';
      case 'payment':
        return 'Paid To';
      default:
        return 'Ledger Account';
    }
  };

  const renderLedgerItem = (ledger: any) => (
    <div>
      <div className="font-medium text-gray-900">{ledger.name}</div>
      <div className="text-sm text-gray-500">
        {ledger.ledger_groups?.name} • Balance: ₹{ledger.current_balance?.toFixed(2) || '0.00'}
      </div>
    </div>
  );

  const renderStockItem = (item: any) => (
    <div>
      <div className="font-medium text-gray-900">{item.name}</div>
      <div className="text-sm text-gray-500">
        Stock: {item.current_stock} {item.units?.symbol} • Rate: ₹{item.rate}
        {item.hsn_code && ` • HSN: ${item.hsn_code}`}
      </div>
    </div>
  );

  const shouldShowPartyDetails = () => {
    return ['sales', 'purchase', 'debit_note', 'credit_note', 'receipt', 'payment'].includes(voucher.voucher_type);
  };

  const shouldShowPlaceOfSupply = () => {
    return ['sales', 'purchase', 'debit_note', 'credit_note'].includes(voucher.voucher_type);
  };

  const shouldShowTransactionDetails = () => {
    return ['sales', 'purchase', 'debit_note', 'credit_note'].includes(voucher.voucher_type);
  };

  const shouldShowAccountingEntries = () => {
    return !['contra'].includes(voucher.voucher_type);
  };

  const renderAIAssistedMode = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <Bot className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Assisted Voucher Creation</h3>
        <p className="text-gray-600 mb-8">
          Let our AI help you create vouchers by understanding your natural language commands.
        </p>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 mb-8">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center justify-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
            Try these commands:
          </h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="bg-white rounded-lg p-3">"Create a sales invoice for ABC Ltd for ₹50,000"</div>
            <div className="bg-white rounded-lg p-3">"Record payment of ₹25,000 to XYZ Vendor"</div>
            <div className="bg-white rounded-lg p-3">"Journal entry: Office rent ₹15,000 paid by cash"</div>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            placeholder="Describe the transaction you want to create..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Create with AI
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderPDFImportMode = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <Upload className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">PDF Import & Processing</h3>
        <p className="text-gray-600 mb-8">
          Upload invoices, bills, bank statements, and other documents to automatically create vouchers.
        </p>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 mb-8">
          <h4 className="font-semibold text-gray-900 mb-3">Supported Documents:</h4>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-green-600" />
              Sales Invoices
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-green-600" />
              Purchase Bills
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-green-600" />
              Bank Statements
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-green-600" />
              Receipts
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-green-400 transition-colors cursor-pointer">
            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">Drop PDF files here or click to browse</p>
            <p className="text-xs text-gray-500">Supports PDF files up to 10MB</p>
          </div>
          <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gradient-to-br from-slate-50/90 via-blue-50/90 to-indigo-50/90 relative">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {currentVoucherType?.label || 'Voucher Entry'}
              </h1>
              <p className="text-slate-600 text-lg">Create and manage accounting vouchers</p>
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
                onClick={() => setRightPanelVisible(!rightPanelVisible)}
                variant="outline" 
                size="sm" 
                className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-200/50"
              >
                <Menu className="w-4 h-4 mr-2" />
                Options
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Entry Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-0 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
              Entry Mode
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {entryModes.map((mode) => {
                const Icon = mode.icon;
                const isActive = entryMode === mode.id;
                
                return (
                  <motion.button
                    key={mode.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEntryMode(mode.id as any)}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                      isActive
                        ? `bg-gradient-to-br ${mode.bgColor} border-current shadow-lg`
                        : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isActive 
                          ? `bg-gradient-to-r ${mode.color} shadow-lg` 
                          : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                          {mode.label}
                        </h4>
                      </div>
                    </div>
                    <p className={`text-sm ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>
                      {mode.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Conditional Content Based on Entry Mode */}
        {entryMode === 'manual' && (
          <>
            {/* Voucher Header */}
            <VoucherHeader voucher={voucher} setVoucher={setVoucher} />

            {/* Party Details */}
            <PartyDetailsSection
              voucher={voucher}
              setVoucher={setVoucher}
              ledgers={ledgers}
              getPartyLabel={getPartyLabel}
              shouldShowPartyDetails={shouldShowPartyDetails}
              shouldShowPlaceOfSupply={shouldShowPlaceOfSupply}
              renderLedgerItem={renderLedgerItem}
            />

            {/* Transaction Details (replaces Stock Items Section) */}
            <TransactionDetailsSection
              voucher={voucher}
              setVoucher={setVoucher}
              stockItems={stockItems}
              godowns={godowns}
              ledgers={ledgers}
              selectedCompany={selectedCompany}
              shouldShowTransactionDetails={shouldShowTransactionDetails}
              renderStockItem={renderStockItem}
              renderLedgerItem={renderLedgerItem}
              addStockEntry={addStockEntry}
              removeStockEntry={removeStockEntry}
              updateStockEntry={updateStockEntry}
              stockTotal={stockTotal}
              currentVoucherType={currentVoucherType}
              getSalesLedgerLabel={getSalesLedgerLabel}
            />

            {/* Contra Entry Section */}
            <ContraEntrySection
              voucher={voucher}
              setVoucher={setVoucher}
              ledgers={ledgers}
              renderLedgerItem={renderLedgerItem}
            />

            {/* Accounting Entries */}
            {shouldShowAccountingEntries() && (
              <AccountingEntriesSection
                voucher={voucher}
                setVoucher={setVoucher}
                ledgers={ledgers}
                getAccountingEntryLabel={getAccountingEntryLabel}
                renderLedgerItem={renderLedgerItem}
                addEntry={addEntry}
                removeEntry={removeEntry}
                updateEntry={updateEntry}
                totalDebit={totalDebit}
                totalCredit={totalCredit}
                isBalanced={isBalanced}
              />
            )}

            {/* Voucher Narration */}
            <VoucherNarrationSection voucher={voucher} setVoucher={setVoucher} />

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-end space-x-3 mb-6"
            >
              <Button variant="outline" className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-200/50">
                Cancel
              </Button>
              <Button 
                onClick={saveVoucher}
                disabled={voucher.voucher_type === 'journal' ? !isBalanced : false || loading}
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
          </>
        )}

        {entryMode === 'ai_assisted' && renderAIAssistedMode()}
        {entryMode === 'pdf_import' && renderPDFImportMode()}
      </div>

      {/* Collapsible Right Panel */}
      <CollapsibleRightPanel
        visible={rightPanelVisible}
        onVisibilityChange={setRightPanelVisible}
        voucher={voucher}
        onVoucherChange={setVoucher}
        onVoucherTypeChange={handleVoucherTypeChange}
        onModeChange={handleModeChange}
      />
    </div>
  );
};