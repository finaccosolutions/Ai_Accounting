import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { geminiAI } from '../../lib/gemini';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  FileText, 
  Plus, 
  Bot, 
  Save, 
  Trash2, 
  Calculator,
  Calendar,
  Hash,
  DollarSign,
  MessageSquare,
  Sparkles,
  Search,
  Upload,
  FileImage,
  Eye,
  CheckCircle,
  AlertCircle,
  Wand2,
  ChevronDown,
  ChevronUp,
  User,
  Package,
  Percent,
  MapPin,
  Building2,
  Receipt,
  CreditCard,
  Banknote,
  ArrowUpDown,
  Settings,
  X,
  Copy,
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Maximize2,
  PlusCircle,
  MinusCircle,
  RotateCcw,
  Download,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Archive,
  Clipboard,
  FileCheck,
  Zap,
  Globe,
  ChevronsLeft,
  ChevronsRight,
  Keyboard,
  MousePointer,
  ArrowDown,
  ArrowRight,
  Target,
  Layers
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
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  godown_id?: string;
  batch_number?: string;
  serial_number?: string;
}

interface TaxEntry {
  id?: string;
  tax_type: string;
  tax_name: string;
  rate: number;
  amount: number;
  ledger_id?: string;
}

interface AdditionalLedger {
  id?: string;
  ledger_name: string;
  amount: number;
  type: 'debit' | 'credit';
}

interface Voucher {
  voucher_type: string;
  voucher_number: string;
  date: string;
  reference?: string;
  narration?: string;
  party_ledger_id?: string;
  party_name?: string;
  party_gstin?: string;
  place_of_supply?: string;
  entries: VoucherEntry[];
  stock_entries: StockEntry[];
  tax_entries: TaxEntry[];
  additional_ledgers: AdditionalLedger[];
  entry_mode: 'manual' | 'ai' | 'upload';
  country_code: string;
}

const voucherTypes = [
  { 
    value: 'sales', 
    label: 'Sales', 
    icon: ShoppingCart,
    color: 'from-emerald-500 via-emerald-600 to-teal-600',
    description: 'Sales invoices and receipts',
    hasParty: true,
    hasStock: true,
    hasTax: true
  },
  { 
    value: 'purchase', 
    label: 'Purchase', 
    icon: Package,
    color: 'from-blue-500 via-blue-600 to-indigo-600',
    description: 'Purchase bills and expenses',
    hasParty: true,
    hasStock: true,
    hasTax: true
  },
  { 
    value: 'payment', 
    label: 'Payment', 
    icon: TrendingDown,
    color: 'from-red-500 via-red-600 to-pink-600',
    description: 'Money paid out',
    hasParty: true,
    hasStock: false,
    hasTax: false
  },
  { 
    value: 'receipt', 
    label: 'Receipt', 
    icon: TrendingUp,
    color: 'from-green-500 via-green-600 to-emerald-600',
    description: 'Money received',
    hasParty: true,
    hasStock: false,
    hasTax: false
  },
  { 
    value: 'contra', 
    label: 'Contra', 
    icon: RefreshCw,
    color: 'from-orange-500 via-orange-600 to-red-600',
    description: 'Bank to cash transfers',
    hasParty: false,
    hasStock: false,
    hasTax: false
  },
  { 
    value: 'journal', 
    label: 'Journal', 
    icon: FileText,
    color: 'from-purple-500 via-purple-600 to-indigo-600',
    description: 'General journal entries',
    hasParty: false,
    hasStock: false,
    hasTax: false
  },
  { 
    value: 'debit_note', 
    label: 'Debit Note', 
    icon: FileCheck,
    color: 'from-indigo-500 via-indigo-600 to-purple-600',
    description: 'Debit note to parties',
    hasParty: true,
    hasStock: true,
    hasTax: true
  },
  { 
    value: 'credit_note', 
    label: 'Credit Note', 
    icon: Clipboard,
    color: 'from-pink-500 via-pink-600 to-rose-600',
    description: 'Credit note to parties',
    hasParty: true,
    hasStock: true,
    hasTax: true
  },
  { 
    value: 'manufacturing_journal', 
    label: 'Manufacturing', 
    icon: Settings,
    color: 'from-teal-500 via-teal-600 to-cyan-600',
    description: 'Manufacturing entries',
    hasParty: false,
    hasStock: true,
    hasTax: false
  },
  { 
    value: 'stock_transfer', 
    label: 'Stock Transfer', 
    icon: Archive,
    color: 'from-gray-500 via-gray-600 to-slate-600',
    description: 'Stock movement between locations',
    hasParty: false,
    hasStock: true,
    hasTax: false
  }
];

const entryModes = [
  { 
    value: 'manual', 
    label: 'Manual Entry', 
    icon: Calculator, 
    description: 'Traditional form entry',
    color: 'from-blue-500 via-blue-600 to-indigo-600'
  },
  { 
    value: 'ai', 
    label: 'AI Entry', 
    icon: Bot, 
    description: 'Describe in plain English',
    color: 'from-purple-500 via-purple-600 to-indigo-600'
  },
  { 
    value: 'upload', 
    label: 'Upload & Parse', 
    icon: Upload, 
    description: 'PDF/Bank statement upload',
    color: 'from-green-500 via-green-600 to-emerald-600'
  }
];

const countryTaxConfig = {
  'IN': {
    name: 'India',
    taxes: [
      { type: 'cgst', name: 'CGST', rate: 9 },
      { type: 'sgst', name: 'SGST', rate: 9 },
      { type: 'igst', name: 'IGST', rate: 18 }
    ],
    currency: 'INR',
    symbol: '₹'
  },
  'AE': {
    name: 'UAE',
    taxes: [
      { type: 'vat', name: 'VAT', rate: 5 }
    ],
    currency: 'AED',
    symbol: 'د.إ'
  },
  'US': {
    name: 'USA',
    taxes: [
      { type: 'sales_tax', name: 'Sales Tax', rate: 8.5 }
    ],
    currency: 'USD',
    symbol: '$'
  },
  'GB': {
    name: 'United Kingdom',
    taxes: [
      { type: 'vat', name: 'VAT', rate: 20 }
    ],
    currency: 'GBP',
    symbol: '£'
  }
};

export const VoucherEntryNew: React.FC = () => {
  const { selectedCompany } = useApp();
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(true);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(true);
  
  // Refs for keyboard navigation
  const itemNameRefs = useRef<(HTMLInputElement | null)[]>([]);
  const quantityRefs = useRef<(HTMLInputElement | null)[]>([]);
  const rateRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const [voucher, setVoucher] = useState<Voucher>({
    voucher_type: 'sales',
    voucher_number: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    narration: '',
    party_ledger_id: '',
    party_name: '',
    party_gstin: '',
    place_of_supply: '',
    entries: [],
    stock_entries: [
      { stock_item_id: '', stock_item_name: '', quantity: 0, rate: 0, amount: 0, tax_rate: 18, tax_amount: 0, total_amount: 0 }
    ],
    tax_entries: [],
    additional_ledgers: [],
    entry_mode: 'manual',
    country_code: selectedCompany?.country || 'IN'
  });

  const [ledgers, setLedgers] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiCommand, setAiCommand] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [additionalLedgersExpanded, setAdditionalLedgersExpanded] = useState(false);
  const [aiConversation, setAiConversation] = useState<any[]>([]);
  const [showAiChat, setShowAiChat] = useState(false);

  useEffect(() => {
    if (selectedCompany) {
      fetchLedgers();
      fetchStockItems();
      generateVoucherNumber();
    }
  }, [selectedCompany, voucher.voucher_type]);

  useEffect(() => {
    calculateTaxes();
  }, [voucher.stock_entries, voucher.country_code]);

  // Keyboard navigation handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setShowAiChat(true);
      } else if (e.key === 'F3') {
        e.preventDefault();
        addStockEntry();
      } else if (e.key === 'F9') {
        e.preventDefault();
        saveVoucher();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowPreview(false);
        setShowAiChat(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchLedgers = async () => {
    try {
      const { data, error } = await supabase
        .from('ledgers')
        .select('id, name, group_id')
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

      const prefix = voucher.voucher_type.toUpperCase().substring(0, 3);
      const newVoucherNumber = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
      
      setVoucher(prev => ({ ...prev, voucher_number: newVoucherNumber }));
    } catch (error) {
      console.error('Error generating voucher number:', error);
    }
  };

  const calculateTaxes = () => {
    const countryConfig = countryTaxConfig[voucher.country_code as keyof typeof countryTaxConfig];
    if (!countryConfig) return;

    const stockTotal = voucher.stock_entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
    
    // Update stock entries with tax calculations
    const updatedStockEntries = voucher.stock_entries.map(entry => {
      const taxAmount = (entry.amount * entry.tax_rate) / 100;
      return {
        ...entry,
        tax_amount: taxAmount,
        total_amount: entry.amount + taxAmount
      };
    });

    // Calculate tax entries based on country
    const taxEntries: TaxEntry[] = [];
    
    if (voucher.country_code === 'IN') {
      // For India, determine CGST+SGST vs IGST based on place of supply
      const isInterState = voucher.place_of_supply && voucher.place_of_supply !== selectedCompany?.state;
      
      if (isInterState) {
        // Inter-state: IGST
        const igstAmount = updatedStockEntries.reduce((sum, entry) => sum + entry.tax_amount, 0);
        if (igstAmount > 0) {
          taxEntries.push({
            tax_type: 'igst',
            tax_name: 'IGST',
            rate: 18,
            amount: igstAmount
          });
        }
      } else {
        // Intra-state: CGST + SGST
        const totalTaxAmount = updatedStockEntries.reduce((sum, entry) => sum + entry.tax_amount, 0);
        if (totalTaxAmount > 0) {
          taxEntries.push({
            tax_type: 'cgst',
            tax_name: 'CGST',
            rate: 9,
            amount: totalTaxAmount / 2
          });
          taxEntries.push({
            tax_type: 'sgst',
            tax_name: 'SGST',
            rate: 9,
            amount: totalTaxAmount / 2
          });
        }
      }
    } else {
      // For other countries, use their standard tax
      const totalTaxAmount = updatedStockEntries.reduce((sum, entry) => sum + entry.tax_amount, 0);
      if (totalTaxAmount > 0 && countryConfig.taxes.length > 0) {
        const tax = countryConfig.taxes[0];
        taxEntries.push({
          tax_type: tax.type,
          tax_name: tax.name,
          rate: tax.rate,
          amount: totalTaxAmount
        });
      }
    }

    setVoucher(prev => ({
      ...prev,
      stock_entries: updatedStockEntries,
      tax_entries: taxEntries
    }));
  };

  const addStockEntry = () => {
    setVoucher(prev => ({
      ...prev,
      stock_entries: [...prev.stock_entries, { 
        stock_item_id: '', 
        stock_item_name: '',
        quantity: 0, 
        rate: 0, 
        amount: 0,
        tax_rate: 18,
        tax_amount: 0,
        total_amount: 0
      }]
    }));
  };

  const removeStockEntry = (index: number) => {
    if (voucher.stock_entries.length > 1) {
      setVoucher(prev => ({
        ...prev,
        stock_entries: prev.stock_entries.filter((_, i) => i !== index)
      }));
    }
  };

  const updateStockEntry = (index: number, field: string, value: any) => {
    setVoucher(prev => ({
      ...prev,
      stock_entries: prev.stock_entries.map((entry, i) => {
        if (i === index) {
          const updatedEntry = { ...entry, [field]: value };
          
          // Auto-calculate amount when quantity or rate changes
          if (field === 'quantity' || field === 'rate') {
            updatedEntry.amount = updatedEntry.quantity * updatedEntry.rate;
          }
          
          // Auto-calculate tax amount
          if (field === 'amount' || field === 'tax_rate') {
            updatedEntry.tax_amount = (updatedEntry.amount * updatedEntry.tax_rate) / 100;
            updatedEntry.total_amount = updatedEntry.amount + updatedEntry.tax_amount;
          }
          
          return updatedEntry;
        }
        return entry;
      })
    }));
  };

  const handleKeyNavigation = (e: React.KeyboardEvent, rowIndex: number, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (field === 'item_name') {
        // Move to quantity field
        quantityRefs.current[rowIndex]?.focus();
      } else if (field === 'quantity') {
        // Move to rate field
        rateRefs.current[rowIndex]?.focus();
      } else if (field === 'rate') {
        // Move to next row's item name or add new row
        if (rowIndex === voucher.stock_entries.length - 1) {
          addStockEntry();
          setTimeout(() => {
            itemNameRefs.current[rowIndex + 1]?.focus();
          }, 100);
        } else {
          itemNameRefs.current[rowIndex + 1]?.focus();
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (rowIndex < voucher.stock_entries.length - 1) {
        if (field === 'item_name') itemNameRefs.current[rowIndex + 1]?.focus();
        else if (field === 'quantity') quantityRefs.current[rowIndex + 1]?.focus();
        else if (field === 'rate') rateRefs.current[rowIndex + 1]?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIndex > 0) {
        if (field === 'item_name') itemNameRefs.current[rowIndex - 1]?.focus();
        else if (field === 'quantity') quantityRefs.current[rowIndex - 1]?.focus();
        else if (field === 'rate') rateRefs.current[rowIndex - 1]?.focus();
      }
    }
  };

  const handleAiCommand = async () => {
    if (!aiCommand.trim()) return;

    setAiProcessing(true);
    try {
      const result = await geminiAI.parseVoucherCommand(aiCommand);
      
      if (result?.needs_clarification) {
        // Add to conversation
        setAiConversation(prev => [
          ...prev,
          { type: 'user', message: aiCommand },
          { type: 'ai', message: result.questions[0], suggestions: result.questions }
        ]);
        setShowAiChat(true);
      } else if (result) {
        // Apply AI parsed data to voucher
        setVoucher(prev => ({
          ...prev,
          voucher_type: result.voucher_type || prev.voucher_type,
          party_name: result.party_name || prev.party_name,
          narration: result.narration || prev.narration,
          reference: result.reference_number || prev.reference,
          stock_entries: result.items ? result.items.map((item: any) => ({
            stock_item_name: item.name,
            quantity: item.quantity || 0,
            rate: item.rate || 0,
            amount: item.amount || (item.quantity * item.rate),
            tax_rate: 18,
            tax_amount: 0,
            total_amount: 0,
            stock_item_id: ''
          })) : prev.stock_entries
        }));
        
        toast.success('AI parsed your command successfully!');
      }
      
      setAiCommand('');
    } catch (error) {
      console.error('AI processing error:', error);
      toast.error('Could not process AI command. Please try again.');
    } finally {
      setAiProcessing(false);
    }
  };

  const addAdditionalLedger = (ledgerName: string, amount: number = 0, type: 'debit' | 'credit' = 'debit') => {
    setVoucher(prev => ({
      ...prev,
      additional_ledgers: [...prev.additional_ledgers, {
        ledger_name: ledgerName,
        amount,
        type
      }]
    }));
  };

  const removeAdditionalLedger = (index: number) => {
    setVoucher(prev => ({
      ...prev,
      additional_ledgers: prev.additional_ledgers.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const stockTotal = voucher.stock_entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
    const taxTotal = voucher.tax_entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
    const additionalTotal = voucher.additional_ledgers.reduce((sum, ledger) => sum + (ledger.amount || 0), 0);
    const grandTotal = stockTotal + taxTotal + additionalTotal;
    
    return { stockTotal, taxTotal, additionalTotal, grandTotal };
  };

  const saveVoucher = async () => {
    if (!selectedCompany) {
      toast.error('Please select a company');
      return;
    }

    const { grandTotal } = calculateTotals();
    
    setLoading(true);
    try {
      // Save voucher logic here
      toast.success('Voucher saved successfully!');
      
      // Reset form
      setVoucher(prev => ({
        ...prev,
        voucher_number: '',
        reference: '',
        narration: '',
        party_name: '',
        stock_entries: [{ stock_item_id: '', stock_item_name: '', quantity: 0, rate: 0, amount: 0, tax_rate: 18, tax_amount: 0, total_amount: 0 }],
        tax_entries: [],
        additional_ledgers: []
      }));
      
      generateVoucherNumber();
    } catch (error) {
      console.error('Error saving voucher:', error);
      toast.error('Failed to save voucher');
    } finally {
      setLoading(false);
    }
  };

  const currentVoucherType = voucherTypes.find(vt => vt.value === voucher.voucher_type);
  const countryConfig = countryTaxConfig[voucher.country_code as keyof typeof countryTaxConfig];
  const { stockTotal, taxTotal, additionalTotal, grandTotal } = calculateTotals();

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Right Panel - Voucher Types */}
      <motion.div
        initial={false}
        animate={{ width: rightPanelCollapsed ? 60 : 280 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="bg-white border-r border-gray-200 shadow-xl flex flex-col slide-in-right"
        onMouseEnter={() => setRightPanelCollapsed(false)}
        onMouseLeave={() => setRightPanelCollapsed(true)}
      >
        {/* Right Panel Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            {!rightPanelCollapsed && (
              <h3 className="font-bold text-gray-900 text-primary-gradient">Voucher Types</h3>
            )}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ${rightPanelCollapsed ? 'mx-auto' : ''}`}>
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Voucher Types List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {voucherTypes.map((type, index) => {
            const Icon = type.icon;
            const isActive = voucher.voucher_type === type.value;
            
            return (
              <motion.button
                key={type.value}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, x: 4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setVoucher(prev => ({ ...prev, voucher_type: type.value }));
                  generateVoucherNumber();
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all duration-300 focus-enhanced ${
                  isActive
                    ? `border-blue-500 bg-gradient-to-r ${type.color} text-white shadow-xl transform scale-105`
                    : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-lg hover-lift'
                }`}
                title={rightPanelCollapsed ? type.label : undefined}
              >
                <div className={`flex items-center ${rightPanelCollapsed ? 'justify-center' : 'space-x-3'}`}>
                  <Icon className="w-6 h-6" />
                  {!rightPanelCollapsed && (
                    <div className="text-left flex-1">
                      <div className="font-semibold text-sm">{type.label}</div>
                      <div className={`text-xs mt-1 ${
                        isActive ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {type.description}
                      </div>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Quick Stats */}
        {!rightPanelCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50"
          >
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Today's Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                <span className="text-gray-600">Vouchers</span>
                <span className="font-bold text-blue-600">12</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold text-green-600">{countryConfig?.symbol}45,230</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                <span className="text-gray-600">Pending</span>
                <span className="font-bold text-orange-600">3</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Center Panel - Main Form */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Entry Mode Selection - Above Form */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentVoucherType && (
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${currentVoucherType.color} flex items-center justify-center shadow-xl bounce-in`}>
                  <currentVoucherType.icon className="w-7 h-7 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-primary-gradient">
                  {currentVoucherType?.label} Entry
                </h1>
                <p className="text-gray-600">{currentVoucherType?.description}</p>
              </div>
            </div>

            {/* Entry Mode Tabs */}
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-xl">
              {entryModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.value}
                    onClick={() => setVoucher(prev => ({ ...prev, entry_mode: mode.value as any }))}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 focus-enhanced ${
                      voucher.entry_mode === mode.value
                        ? `bg-gradient-to-r ${mode.color} text-white shadow-lg transform scale-105`
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{mode.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(true)}
                className="hover-lift"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button 
                onClick={saveVoucher}
                disabled={loading}
                className="btn-secondary"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save (F9)
              </Button>
            </div>
          </div>

          {/* AI Entry Section */}
          {voucher.entry_mode === 'ai' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 rounded-xl border border-purple-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={aiCommand}
                    onChange={(e) => setAiCommand(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAiCommand()}
                    placeholder="Describe your voucher in plain English... (e.g., 'Sold 5 laptops at $800 each to John Doe with 18% tax')"
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white placeholder-gray-500"
                  />
                </div>
                <Button
                  onClick={handleAiCommand}
                  disabled={aiProcessing || !aiCommand.trim()}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300"
                >
                  {aiProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Parse (F2)
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 fade-in-up">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 card-enhanced">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Voucher Details
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">{countryConfig?.name} ({countryConfig?.symbol})</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    Voucher Number
                  </label>
                  <Input
                    value={voucher.voucher_number}
                    onChange={(e) => setVoucher(prev => ({ ...prev, voucher_number: e.target.value }))}
                    placeholder="Auto-generated"
                    className="input-enhanced bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date
                  </label>
                  <Input
                    type="date"
                    value={voucher.date}
                    onChange={(e) => setVoucher(prev => ({ ...prev, date: e.target.value }))}
                    className="input-enhanced"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reference
                  </label>
                  <Input
                    value={voucher.reference}
                    onChange={(e) => setVoucher(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Invoice/Bill number"
                    className="input-enhanced"
                  />
                </div>
                {currentVoucherType?.hasParty && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Party Name
                    </label>
                    <Input
                      value={voucher.party_name}
                      onChange={(e) => setVoucher(prev => ({ ...prev, party_name: e.target.value }))}
                      placeholder="Customer/Vendor name"
                      className="input-enhanced"
                    />
                  </div>
                )}
              </div>

              {/* Tax Information for India */}
              {currentVoucherType?.hasTax && voucher.country_code === 'IN' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Party GSTIN
                    </label>
                    <Input
                      value={voucher.party_gstin}
                      onChange={(e) => setVoucher(prev => ({ ...prev, party_gstin: e.target.value }))}
                      placeholder="22AAAAA0000A1Z5"
                      className="input-enhanced"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Place of Supply
                    </label>
                    <select 
                      value={voucher.place_of_supply}
                      onChange={(e) => setVoucher(prev => ({ ...prev, place_of_supply: e.target.value }))}
                      className="dropdown-enhanced w-full px-4 py-3 focus-enhanced"
                    >
                      <option value="">Select State</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>

          {/* Item Details Section */}
          {currentVoucherType?.hasStock && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 card-enhanced">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-green-600" />
                    Item Details
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                      <Keyboard className="w-4 h-4 inline mr-1" />
                      Press Enter to navigate, F3 to add item
                    </div>
                    <Button 
                      size="sm" 
                      onClick={addStockEntry}
                      className="btn-secondary"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Item (F3)
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="table-enhanced">
                    <thead>
                      <tr>
                        <th className="min-w-[250px]">Item Name</th>
                        <th className="w-24 text-right">Qty</th>
                        <th className="w-32 text-right">Rate</th>
                        <th className="w-32 text-right">Amount</th>
                        <th className="w-24 text-right">Tax %</th>
                        <th className="w-32 text-right">Tax Amount</th>
                        <th className="w-32 text-right">Total</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {voucher.stock_entries.map((entry, index) => (
                        <tr key={index} className="group">
                          <td>
                            <Input
                              ref={(el) => itemNameRefs.current[index] = el}
                              value={entry.stock_item_name || ''}
                              onChange={(e) => updateStockEntry(index, 'stock_item_name', e.target.value)}
                              onKeyDown={(e) => handleKeyNavigation(e, index, 'item_name')}
                              placeholder="Enter item name"
                              className="input-enhanced w-full focus-enhanced"
                            />
                          </td>
                          <td>
                            <Input
                              ref={(el) => quantityRefs.current[index] = el}
                              type="number"
                              step="0.001"
                              value={entry.quantity || ''}
                              onChange={(e) => updateStockEntry(index, 'quantity', parseFloat(e.target.value) || 0)}
                              onKeyDown={(e) => handleKeyNavigation(e, index, 'quantity')}
                              className="input-enhanced text-right w-full focus-enhanced"
                            />
                          </td>
                          <td>
                            <Input
                              ref={(el) => rateRefs.current[index] = el}
                              type="number"
                              step="0.01"
                              value={entry.rate || ''}
                              onChange={(e) => updateStockEntry(index, 'rate', parseFloat(e.target.value) || 0)}
                              onKeyDown={(e) => handleKeyNavigation(e, index, 'rate')}
                              className="input-enhanced text-right w-full focus-enhanced"
                            />
                          </td>
                          <td>
                            <Input
                              type="number"
                              step="0.01"
                              value={entry.amount || ''}
                              readOnly
                              className="input-enhanced text-right bg-gray-50 w-full"
                            />
                          </td>
                          <td>
                            <Input
                              type="number"
                              step="0.01"
                              value={entry.tax_rate || ''}
                              onChange={(e) => updateStockEntry(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                              className="input-enhanced text-right w-full focus-enhanced"
                            />
                          </td>
                          <td>
                            <Input
                              type="number"
                              step="0.01"
                              value={entry.tax_amount || ''}
                              readOnly
                              className="input-enhanced text-right bg-yellow-50 w-full"
                            />
                          </td>
                          <td>
                            <Input
                              type="number"
                              step="0.01"
                              value={entry.total_amount || ''}
                              readOnly
                              className="input-enhanced text-right bg-green-50 font-bold w-full"
                            />
                          </td>
                          <td>
                            {voucher.stock_entries.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeStockEntry(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 font-bold text-lg">
                        <td colSpan={3} className="py-4">Subtotal</td>
                        <td className="text-right py-4">{countryConfig?.symbol}{stockTotal.toFixed(2)}</td>
                        <td></td>
                        <td className="text-right py-4">{countryConfig?.symbol}{taxTotal.toFixed(2)}</td>
                        <td className="text-right py-4 text-green-600 text-xl font-bold">
                          {countryConfig?.symbol}{grandTotal.toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Tax Summary */}
          {currentVoucherType?.hasTax && voucher.tax_entries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 card-enhanced">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Percent className="w-5 h-5 mr-2 text-yellow-600" />
                  Tax Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {voucher.tax_entries.map((tax, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="text-sm font-medium text-gray-600">{tax.tax_name} ({tax.rate}%)</div>
                      <div className="text-xl font-bold text-gray-900">
                        {countryConfig?.symbol}{tax.amount.toFixed(2)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Additional Ledgers Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 card-enhanced">
              <button
                onClick={() => setAdditionalLedgersExpanded(!additionalLedgersExpanded)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:from-gray-100 hover:to-blue-100 transition-all duration-300 mb-4 focus-enhanced"
              >
                <span className="font-bold text-gray-900 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                  Additional Ledgers & Charges
                </span>
                <motion.div
                  animate={{ rotate: additionalLedgersExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {additionalLedgersExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start hover-lift"
                        onClick={() => addAdditionalLedger('Freight Charges', 0, 'debit')}
                      >
                        <PlusCircle className="w-4 h-4 mr-2 text-green-600" />
                        Add Freight
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start hover-lift"
                        onClick={() => addAdditionalLedger('Discount', 0, 'credit')}
                      >
                        <PlusCircle className="w-4 h-4 mr-2 text-red-600" />
                        Add Discount
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start hover-lift"
                        onClick={() => addAdditionalLedger('Other Charges', 0, 'debit')}
                      >
                        <PlusCircle className="w-4 h-4 mr-2 text-blue-600" />
                        Add Other Charges
                      </Button>
                    </div>
                    
                    {/* Additional Ledgers List */}
                    {voucher.additional_ledgers.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Added Charges:</h4>
                        {voucher.additional_ledgers.map((ledger, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                          >
                            <Input
                              value={ledger.ledger_name}
                              onChange={(e) => {
                                const updated = [...voucher.additional_ledgers];
                                updated[index].ledger_name = e.target.value;
                                setVoucher(prev => ({ ...prev, additional_ledgers: updated }));
                              }}
                              placeholder="Ledger name"
                              className="flex-1 input-enhanced"
                            />
                            <Input
                              type="number"
                              step="0.01"
                              value={ledger.amount}
                              onChange={(e) => {
                                const updated = [...voucher.additional_ledgers];
                                updated[index].amount = parseFloat(e.target.value) || 0;
                                setVoucher(prev => ({ ...prev, additional_ledgers: updated }));
                              }}
                              placeholder="Amount"
                              className="w-32 input-enhanced text-right"
                            />
                            <select
                              value={ledger.type}
                              onChange={(e) => {
                                const updated = [...voucher.additional_ledgers];
                                updated[index].type = e.target.value as 'debit' | 'credit';
                                setVoucher(prev => ({ ...prev, additional_ledgers: updated }));
                              }}
                              className="dropdown-enhanced w-24"
                            >
                              <option value="debit">Debit</option>
                              <option value="credit">Credit</option>
                            </select>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeAdditionalLedger(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <MinusCircle className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <p className="flex items-center">
                        <Layers className="w-4 h-4 mr-2" />
                        Add custom ledger entries for freight, discount, packing charges, etc.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Narration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 card-enhanced">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Narration
              </label>
              <textarea
                value={voucher.narration}
                onChange={(e) => setVoucher(prev => ({ ...prev, narration: e.target.value }))}
                placeholder="Enter voucher narration or description..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 resize-none bg-white placeholder-gray-500 focus-enhanced"
              />
            </Card>
          </motion.div>
        </div>
      </div>

      {/* AI Chat Modal */}
      <AnimatePresence>
        {showAiChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Bot className="w-6 h-6 mr-2 text-purple-600" />
                  AI Assistant
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowAiChat(false)}
                  className="hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4 mb-6">
                {aiConversation.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl ${
                      msg.type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Continue the conversation..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
                />
                <Button className="bg-gradient-to-r from-purple-500 to-blue-600">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Eye className="w-6 h-6 mr-2 text-blue-600" />
                  Voucher Preview
                </h3>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="hover-lift">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowPreview(false)}
                    className="hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl">
                  <div className="space-y-2">
                    <div><span className="text-gray-600">Voucher Type:</span> <span className="ml-2 font-semibold">{currentVoucherType?.label}</span></div>
                    <div><span className="text-gray-600">Number:</span> <span className="ml-2 font-semibold">{voucher.voucher_number}</span></div>
                  </div>
                  <div className="space-y-2">
                    <div><span className="text-gray-600">Date:</span> <span className="ml-2 font-semibold">{voucher.date}</span></div>
                    <div><span className="text-gray-600">Party:</span> <span className="ml-2 font-semibold">{voucher.party_name || 'N/A'}</span></div>
                  </div>
                </div>
                
                {voucher.stock_entries.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      Items
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="table-enhanced">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th className="text-right">Qty</th>
                            <th className="text-right">Rate</th>
                            <th className="text-right">Amount</th>
                            <th className="text-right">Tax</th>
                            <th className="text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {voucher.stock_entries.map((entry, index) => (
                            <tr key={index}>
                              <td className="font-medium">{entry.stock_item_name}</td>
                              <td className="text-right">{entry.quantity}</td>
                              <td className="text-right">{countryConfig?.symbol}{entry.rate}</td>
                              <td className="text-right">{countryConfig?.symbol}{entry.amount}</td>
                              <td className="text-right">{countryConfig?.symbol}{entry.tax_amount.toFixed(2)}</td>
                              <td className="text-right font-bold">{countryConfig?.symbol}{entry.total_amount.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Grand Total:</span>
                    <span className="text-2xl font-bold text-green-600">{countryConfig?.symbol}{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-3 text-xs text-gray-600 max-w-xs">
        <div className="font-semibold mb-2 flex items-center">
          <Keyboard className="w-4 h-4 mr-1" />
          Keyboard Shortcuts
        </div>
        <div className="space-y-1">
          <div><kbd className="bg-gray-100 px-1 rounded">F2</kbd> - AI Assistant</div>
          <div><kbd className="bg-gray-100 px-1 rounded">F3</kbd> - Add Item</div>
          <div><kbd className="bg-gray-100 px-1 rounded">F9</kbd> - Save Voucher</div>
          <div><kbd className="bg-gray-100 px-1 rounded">Enter</kbd> - Navigate Fields</div>
          <div><kbd className="bg-gray-100 px-1 rounded">Esc</kbd> - Close Modals</div>
        </div>
      </div>
    </div>
  );
};