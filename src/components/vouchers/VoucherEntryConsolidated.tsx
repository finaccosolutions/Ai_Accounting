import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { 
  Save, 
  Copy,
  Edit3,
  Bot,
  Upload,
  FileText,
  Sparkles,
  Camera,
  Zap,
  Star,
  Layers,
  CheckCircle,
  Loader,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

// Import the new components
import { VoucherHeader } from './VoucherHeader';
import { PartyDetailsSection } from './PartyDetailsSection';
import { TransactionDetailsSection } from './TransactionDetailsSection';
import { ContraEntrySection } from './ContraEntrySection';
import { AccountingEntriesSection } from './AccountingEntriesSection';
import { VoucherNarrationSection } from './VoucherNarrationSection';
import { EnhancedRightSidebar } from './EnhancedRightSidebar';
import { Voucher, VoucherEntry, StockEntry, Ledger, StockItem, Godown } from '../../types'; // Import types

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
    description: 'Enter voucher details manually with precision',
    icon: Edit3,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-50 to-blue-100'
  },
  {
    id: 'ai_assisted',
    label: 'AI Assisted',
    description: 'Let AI help create vouchers intelligently',
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
  const [aiProcessing, setAiProcessing] = useState(false);
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [voucher, setVoucher] = useState<Voucher>({
    voucher_type: 'sales',
    voucher_number: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    narration: '',
    party_name: '',
    entries: [],
    stock_entries: [{ stock_item_id: '', stock_item_name: '', quantity: 0, rate: 0, amount: 0 }],
    mode: 'item_invoice', // Default mode for sales
    use_common_ledger: true,
    debit_entries: [{ ledger_id: '', amount: 0 }],
    credit_entries: [{ ledger_id: '', amount: 0 }]
  });
  
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentVouchers, setRecentVouchers] = useState<Voucher[]>([]);
  const [rightPanelVisible, setRightPanelVisible] = useState(true); // Always visible by default

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
            { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' } as VoucherEntry,
            { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' } as VoucherEntry
          ]
        }));
      }
    } else if (voucher.voucher_type === 'contra') {
      // Contra entries are handled separately
      setVoucher(prev => ({
        ...prev,
        entries: [],
        debit_entries: prev.debit_entries && prev.debit_entries.length > 0 ? prev.debit_entries : [{ ledger_id: '', amount: 0 }],
        credit_entries: prev.credit_entries && prev.credit_entries.length > 0 ? prev.credit_entries : [{ ledger_id: '', amount: 0 }]
      }));
    } else {
      // For other voucher types, ensure at least one entry for total amount calculation
      if (voucher.entries.length === 0) {
        setVoucher(prev => ({
          ...prev,
          entries: [
            { ledger_id: '', amount: 0, debit_amount: 0, credit_amount: 0, narration: '' } as VoucherEntry
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
        entries: [...prev.entries, { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' } as VoucherEntry]
      }));
    } else {
      setVoucher(prev => ({
        ...prev,
        entries: [...prev.entries, { ledger_id: '', amount: 0, debit_amount: 0, credit_amount: 0, narration: '' } as VoucherEntry]
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
        amount: 0,
        godown_id: '',
        individual_ledger_id: '',
        batch_number: '',
        serial_number: ''
      } as StockEntry]
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
      const debitAmount = voucher.debit_entries?.reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0;
      const creditAmount = voucher.credit_entries?.reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0;
      return { totalDebit: debitAmount, totalCredit: creditAmount, stockTotal: 0, isBalanced: Math.abs(debitAmount - creditAmount) < 0.01 };
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
      const hasValidDebitEntries = voucher.debit_entries?.some(entry => entry.ledger_id && entry.amount > 0);
      const hasValidCreditEntries = voucher.credit_entries?.some(entry => entry.ledger_id && entry.amount > 0);
      
      if (!hasValidDebitEntries || !hasValidCreditEntries) {
        toast.error('Please add at least one valid debit and credit entry');
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
        use_common_ledger: true,
        debit_entries: [{ ledger_id: '', amount: 0 }],
        credit_entries: [{ ledger_id: '', amount: 0 }]
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
      use_common_ledger: true,
      debit_entries: type === 'contra' ? [{ ledger_id: '', amount: 0 }] : [],
      credit_entries: type === 'contra' ? [{ ledger_id: '', amount: 0 }] : []
    }));
    generateVoucherNumber();
  };

  const handleModeChange = (mode: string) => {
    setVoucher(prev => ({ ...prev, mode: mode as any }));
  };

  const handleAiAssistedClick = () => {
    setAiProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      setAiProcessing(false);
    }, 3000);
  };

  const handlePdfImportClick = () => {
    setPdfProcessing(true);
    // Simulate PDF processing
    setTimeout(() => {
      setPdfProcessing(false);
    }, 2500);
  };

  const handleSettingsClick = () => {
    navigate('/voucher-settings');
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

  const renderLedgerItem = (ledger: Ledger) => (
    <div>
      <div className="font-medium text-gray-900">{ledger.name}</div>
      <div className="text-sm text-gray-500">
        {ledger.ledger_groups?.name} • Balance: ₹{ledger.current_balance?.toFixed(2) || '0.00'}
      </div>
    </div>
  );

  const renderStockItem = (item: StockItem) => (
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
      className="text-center py-16 relative"
    >
      {/* Loading Overlay */}
      <AnimatePresence>
        {aiProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-purple-700 font-semibold">AI is processing your request...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto">
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-32 h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
        >
          <Bot className="w-16 h-16 text-white" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute w-40 h-40 border-4 border-purple-300 border-t-transparent rounded-full"
          />
        </motion.div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 bg-clip-text text-transparent mb-4">
          AI-Assisted Voucher Creation
        </h3>
        <p className="text-gray-600 mb-8 text-lg">
          Let our advanced AI help you create vouchers by understanding your natural language commands.
        </p>
        
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-2xl p-6 mb-8 border border-purple-200">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center justify-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
            Try these smart commands:
          </h4>
          <div className="space-y-3 text-sm text-gray-700">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg p-3 shadow-sm border border-purple-100"
            >
              "Create a sales invoice for ABC Ltd for ₹50,000"
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg p-3 shadow-sm border border-purple-100"
            >
              "Record payment of ₹25,000 to XYZ Vendor"
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg p-3 shadow-sm border border-purple-100"
            >
              "Journal entry: Office rent ₹15,000 paid by cash"
            </motion.div>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            placeholder="Describe the transaction you want to create..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none shadow-sm"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAiAssistedClick}
            disabled={aiProcessing}
            className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            {aiProcessing ? (
              <div className="flex items-center justify-center">
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Processing with AI...
              </div>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2 inline" />
                Create with AI Magic
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  const renderPDFImportMode = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 relative"
    >
      {/* Loading Overlay */}
      <AnimatePresence>
        {pdfProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-green-700 font-semibold">Processing your document...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto">
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-32 h-32 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
        >
          <Upload className="w-16 h-16 text-white" />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute w-40 h-40 border-4 border-green-300 border-dashed rounded-full"
          />
        </motion.div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-green-800 bg-clip-text text-transparent mb-4">
          PDF Import & Processing
        </h3>
        <p className="text-gray-600 mb-8 text-lg">
          Upload invoices, bills, bank statements, and other documents to automatically create vouchers.
        </p>
        
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-2xl p-6 mb-8 border border-green-200">
          <h4 className="font-semibold text-gray-900 mb-4">Supported Documents:</h4>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
            {[
              { label: 'Sales Invoices', icon: FileText },
              { label: 'Purchase Bills', icon: FileText },
              { label: 'Bank Statements', icon: FileText },
              { label: 'Receipts', icon: FileText }
            ].map((doc, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center bg-white rounded-lg p-2 shadow-sm"
              >
                <doc.icon className="w-4 h-4 mr-2 text-green-600" />
                {doc.label}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="border-2 border-dashed border-green-300 rounded-xl p-8 hover:border-green-400 transition-colors cursor-pointer bg-green-50/50"
          >
            <Camera className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2 font-medium">Drop PDF files here or click to browse</p>
            <p className="text-xs text-gray-500">Supports PDF files up to 10MB</p>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePdfImportClick}
            disabled={pdfProcessing}
            className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            {pdfProcessing ? (
              <div className="flex items-center justify-center">
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Processing Document...
              </div>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2 inline" />
                Upload Document
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gradient-to-br from-slate-50/90 via-blue-50/90 to-indigo-50/90 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 100, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-pink-400/10 to-indigo-400/10 rounded-full blur-xl"
        />
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto p-6 transition-all duration-500 ${rightPanelVisible ? 'mr-20' : 'mr-0'}`}>
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-16 h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl"
              >
                <Layers className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {currentVoucherType?.label || 'Voucher Entry'}
                </h1>
                <p className="text-slate-600 text-lg flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  Create and manage accounting vouchers with intelligence
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl hover:shadow-xl transition-all duration-300 text-gray-700 font-medium"
              >
                <Copy className="w-4 h-4 mr-2 text-gray-600" />
                <span className="text-gray-700">Duplicate</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSettingsClick}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg rounded-xl hover:shadow-xl transition-all duration-300"
              >
                <Settings className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Entry Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Entry Mode</h3>
                <p className="text-gray-600">Choose your preferred method of voucher creation</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {entryModes.map((mode, index) => {
                const Icon = mode.icon;
                const isActive = entryMode === mode.id;
                
                return (
                  <motion.button
                    key={mode.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEntryMode(mode.id as any)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden ${
                      isActive
                        ? `bg-gradient-to-br ${mode.bgColor} border-current shadow-2xl`
                        : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                        isActive 
                          ? `bg-gradient-to-r ${mode.color}` 
                          : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-7 h-7 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold text-lg ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
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

            {/* Transaction Details */}
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

            {/* Enhanced Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-end space-x-4 mb-6"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl hover:shadow-xl transition-all duration-300 text-gray-700 font-medium"
              >
                Cancel
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveVoucher}
                disabled={voucher.voucher_type === 'journal' ? !isBalanced : false || loading}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-5 h-5 mr-2" />
                    Save Voucher
                  </div>
                )}
              </motion.button>
            </motion.div>
          </>
        )}

        {entryMode === 'ai_assisted' && renderAIAssistedMode()}
        {entryMode === 'pdf_import' && renderPDFImportMode()}
      </div>

      {/* Enhanced Right Sidebar */}
      <EnhancedRightSidebar
        visible={rightPanelVisible}
        onVisibilityChange={setRightPanelVisible}
        voucher={voucher}
        onVoucherChange={(newVoucher) => {
          setVoucher(newVoucher);
          // Only trigger type/mode change if they actually changed
          if (newVoucher.voucher_type !== voucher.voucher_type) {
            handleVoucherTypeChange(newVoucher.voucher_type);
          }
          if (newVoucher.mode !== voucher.mode) {
            handleModeChange(newVoucher.mode);
          }
        }}
        recentVouchers={recentVouchers}
        totalAmount={stockTotal}
      />
    </div>
  );
};
