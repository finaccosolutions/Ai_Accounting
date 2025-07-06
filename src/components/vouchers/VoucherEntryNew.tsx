import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { GeminiAI } from '../../lib/gemini';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  Banknote,
  FileText,
  ArrowLeftRight,
  Package,
  Settings,
  Plus,
  Trash2,
  Calendar,
  Hash,
  User,
  MapPin,
  Bot,
  Upload,
  Edit3,
  Save,
  X,
  ChevronRight,
  ChevronLeft,
  Building2,
  Calculator,
  Percent,
  DollarSign,
  MessageSquare,
  Eye,
  Copy,
  RotateCcw,
  Sparkles,
  FileImage,
  Zap,
  Target,
  Warehouse,
  Factory,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// Voucher Types Configuration
const voucherTypes = [
  { 
    value: 'sales', 
    label: 'Sales', 
    icon: ShoppingCart, 
    color: 'from-green-500 to-green-600',
    hasInventory: true,
    hasParty: true,
    hasTax: true
  },
  { 
    value: 'purchase', 
    label: 'Purchase', 
    icon: ShoppingBag, 
    color: 'from-blue-500 to-blue-600',
    hasInventory: true,
    hasParty: true,
    hasTax: true
  },
  { 
    value: 'debit_note', 
    label: 'Debit Note', 
    icon: FileText, 
    color: 'from-red-500 to-red-600',
    hasInventory: true,
    hasParty: true,
    hasTax: true
  },
  { 
    value: 'credit_note', 
    label: 'Credit Note', 
    icon: FileText, 
    color: 'from-emerald-500 to-emerald-600',
    hasInventory: true,
    hasParty: true,
    hasTax: true
  },
  { 
    value: 'receipt', 
    label: 'Receipt', 
    icon: CreditCard, 
    color: 'from-purple-500 to-purple-600',
    hasInventory: false,
    hasParty: true,
    hasTax: false
  },
  { 
    value: 'payment', 
    label: 'Payment', 
    icon: Banknote, 
    color: 'from-orange-500 to-orange-600',
    hasInventory: false,
    hasParty: true,
    hasTax: false
  },
  { 
    value: 'journal', 
    label: 'Journal', 
    icon: Calculator, 
    color: 'from-indigo-500 to-indigo-600',
    hasInventory: false,
    hasParty: false,
    hasTax: false
  },
  { 
    value: 'contra', 
    label: 'Contra', 
    icon: ArrowLeftRight, 
    color: 'from-teal-500 to-teal-600',
    hasInventory: false,
    hasParty: false,
    hasTax: false
  },
  { 
    value: 'stock_transfer', 
    label: 'Stock Transfer', 
    icon: Package, 
    color: 'from-cyan-500 to-cyan-600',
    hasInventory: true,
    hasParty: false,
    hasTax: false
  },
  { 
    value: 'manufacturing_journal', 
    label: 'Manufacturing', 
    icon: Factory, 
    color: 'from-amber-500 to-amber-600',
    hasInventory: true,
    hasParty: false,
    hasTax: false
  }
];

// Entry Modes
const entryModes = [
  { 
    value: 'manual', 
    label: 'Manual Entry', 
    icon: Edit3, 
    description: 'Enter voucher details manually',
    color: 'from-blue-500 to-blue-600'
  },
  { 
    value: 'ai', 
    label: 'AI Assistant', 
    icon: Bot, 
    description: 'Describe in natural language',
    color: 'from-purple-500 to-purple-600'
  },
  { 
    value: 'upload', 
    label: 'Upload Invoice', 
    icon: Upload, 
    description: 'Extract from PDF/Image',
    color: 'from-green-500 to-green-600'
  }
];

// Invoice Modes (for inventory vouchers)
const invoiceModes = [
  {
    value: 'accounts_only',
    label: 'Accounts Only',
    description: 'Simple accounting entries without inventory',
    icon: Calculator
  },
  {
    value: 'accounts_inventory',
    label: 'Accounts + Inventory',
    description: 'Full invoice with stock management',
    icon: Package
  }
];

interface VoucherEntry {
  id?: string;
  ledger_id: string;
  ledger_name?: string;
  debit_amount: number;
  credit_amount: number;
  narration?: string;
  cost_center_id?: string;
}

interface StockEntry {
  id?: string;
  stock_item_id: string;
  stock_item_name?: string;
  quantity: number;
  unit: string;
  rate: number;
  discount_percent: number;
  amount: number;
  tax_percent: number;
  tax_amount: number;
  godown_id?: string;
  batch_number?: string;
  ledger_id?: string; // Per-item ledger
}

interface LedgerAllocation {
  id?: string;
  ledger_id: string;
  ledger_name?: string;
  amount: number;
  type: 'debit' | 'credit';
  cost_center_id?: string;
  narration?: string;
}

interface Voucher {
  voucher_type: string;
  voucher_number: string;
  date: string;
  reference?: string;
  order_number?: string;
  order_date?: string;
  party_ledger_id?: string;
  party_name?: string;
  place_of_supply?: string;
  country: string;
  narration?: string;
  due_date?: string;
  terms_of_payment?: string;
  
  // For Receipt/Payment
  mode_of_payment?: string;
  bank_ledger_id?: string;
  instrument_number?: string;
  bank_name?: string;
  branch_name?: string;
  
  // For Contra
  from_ledger_id?: string;
  to_ledger_id?: string;
  transfer_mode?: string;
  
  // For Stock Transfer
  from_godown_id?: string;
  to_godown_id?: string;
  
  // For Manufacturing
  finished_goods_item_id?: string;
  quantity_produced?: number;
  
  entries: VoucherEntry[];
  stock_entries: StockEntry[];
  ledger_allocations: LedgerAllocation[];
  raw_materials?: StockEntry[]; // For manufacturing
}

interface VoucherSettings {
  enable_godown: boolean;
  enable_batch: boolean;
  enable_cost_center: boolean;
  enable_due_date: boolean;
  enable_per_item_ledger: boolean;
  enable_terms_of_payment: boolean;
  enable_einvoice: boolean;
  tax_inclusive: boolean;
  auto_round_off: boolean;
}

export const VoucherEntryNew: React.FC = () => {
  const { selectedCompany } = useApp();
  const [currentVoucherType, setCurrentVoucherType] = useState('sales');
  const [entryMode, setEntryMode] = useState('manual');
  const [invoiceMode, setInvoiceMode] = useState('accounts_inventory');
  const [rightPanelVisible, setRightPanelVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Data states
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [godowns, setGodowns] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  
  // Form state
  const [voucher, setVoucher] = useState<Voucher>({
    voucher_type: 'sales',
    voucher_number: '',
    date: new Date().toISOString().split('T')[0],
    country: 'IN',
    entries: [],
    stock_entries: [],
    ledger_allocations: []
  });
  
  // Settings state
  const [settings, setSettings] = useState<VoucherSettings>({
    enable_godown: false,
    enable_batch: false,
    enable_cost_center: false,
    enable_due_date: false,
    enable_per_item_ledger: false,
    enable_terms_of_payment: false,
    enable_einvoice: false,
    tax_inclusive: false,
    auto_round_off: true
  });
  
  // AI state
  const [aiCommand, setAiCommand] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  
  const [loading, setLoading] = useState(false);

  const gemini = new GeminiAI(import.meta.env.VITE_GEMINI_API_KEY);

  useEffect(() => {
    if (selectedCompany) {
      fetchMasterData();
      generateVoucherNumber();
    }
  }, [selectedCompany, currentVoucherType]);

  useEffect(() => {
    setVoucher(prev => ({ 
      ...prev, 
      voucher_type: currentVoucherType,
      entries: getDefaultEntries(),
      stock_entries: [],
      ledger_allocations: []
    }));
    generateVoucherNumber();
  }, [currentVoucherType]);

  const fetchMasterData = async () => {
    try {
      // Fetch ledgers
      const { data: ledgersData } = await supabase
        .from('ledgers')
        .select('id, name, group_id')
        .eq('company_id', selectedCompany?.id)
        .eq('is_active', true)
        .order('name');
      setLedgers(ledgersData || []);

      // Fetch stock items
      const { data: stockData } = await supabase
        .from('stock_items')
        .select(`
          id, name, rate, current_stock, hsn_code,
          units(name, symbol),
          stock_groups(name)
        `)
        .eq('company_id', selectedCompany?.id)
        .eq('is_active', true)
        .order('name');
      setStockItems(stockData || []);

      // Fetch godowns
      const { data: godownsData } = await supabase
        .from('godowns')
        .select('id, name, address')
        .eq('company_id', selectedCompany?.id)
        .eq('is_active', true)
        .order('name');
      setGodowns(godownsData || []);

      // Fetch cost centers
      const { data: costCentersData } = await supabase
        .from('cost_centers')
        .select('id, name')
        .eq('company_id', selectedCompany?.id)
        .eq('is_active', true)
        .order('name');
      setCostCenters(costCentersData || []);

      // Fetch units
      const { data: unitsData } = await supabase
        .from('units')
        .select('id, name, symbol')
        .eq('company_id', selectedCompany?.id)
        .order('name');
      setUnits(unitsData || []);

    } catch (error) {
      console.error('Error fetching master data:', error);
      toast.error('Failed to fetch master data');
    }
  };

  const generateVoucherNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('voucher_number')
        .eq('company_id', selectedCompany?.id)
        .eq('voucher_type', currentVoucherType)
        .order('voucher_number', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastNumber = parseInt(data[0].voucher_number.replace(/\D/g, ''));
        nextNumber = lastNumber + 1;
      }

      const prefix = currentVoucherType.toUpperCase().substring(0, 2);
      const newVoucherNumber = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
      
      setVoucher(prev => ({ ...prev, voucher_number: newVoucherNumber }));
    } catch (error) {
      console.error('Error generating voucher number:', error);
    }
  };

  const getDefaultEntries = () => {
    const voucherTypeConfig = voucherTypes.find(vt => vt.value === currentVoucherType);
    
    if (['receipt', 'payment'].includes(currentVoucherType)) {
      return [
        { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' }
      ];
    } else if (currentVoucherType === 'journal') {
      return [
        { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' },
        { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' }
      ];
    } else if (currentVoucherType === 'contra') {
      return [];
    } else {
      return [];
    }
  };

  const getCurrentVoucherConfig = () => {
    return voucherTypes.find(vt => vt.value === currentVoucherType);
  };

  const addStockEntry = () => {
    setVoucher(prev => ({
      ...prev,
      stock_entries: [...prev.stock_entries, {
        stock_item_id: '',
        quantity: 0,
        unit: '',
        rate: 0,
        discount_percent: 0,
        amount: 0,
        tax_percent: 18,
        tax_amount: 0
      }]
    }));
  };

  const removeStockEntry = (index: number) => {
    setVoucher(prev => ({
      ...prev,
      stock_entries: prev.stock_entries.filter((_, i) => i !== index)
    }));
  };

  const updateStockEntry = (index: number, field: string, value: any) => {
    setVoucher(prev => ({
      ...prev,
      stock_entries: prev.stock_entries.map((entry, i) => {
        if (i === index) {
          const updatedEntry = { ...entry, [field]: value };
          
          // Auto-calculate amount and tax
          if (['quantity', 'rate', 'discount_percent', 'tax_percent'].includes(field)) {
            const qty = field === 'quantity' ? value : updatedEntry.quantity;
            const rate = field === 'rate' ? value : updatedEntry.rate;
            const discount = field === 'discount_percent' ? value : updatedEntry.discount_percent;
            const taxPercent = field === 'tax_percent' ? value : updatedEntry.tax_percent;
            
            const grossAmount = qty * rate;
            const discountAmount = grossAmount * (discount / 100);
            const netAmount = grossAmount - discountAmount;
            const taxAmount = netAmount * (taxPercent / 100);
            
            updatedEntry.amount = netAmount;
            updatedEntry.tax_amount = taxAmount;
          }
          
          return updatedEntry;
        }
        return entry;
      })
    }));
  };

  const addLedgerAllocation = () => {
    setVoucher(prev => ({
      ...prev,
      ledger_allocations: [...prev.ledger_allocations, {
        ledger_id: '',
        amount: 0,
        type: 'debit',
        narration: ''
      }]
    }));
  };

  const removeLedgerAllocation = (index: number) => {
    setVoucher(prev => ({
      ...prev,
      ledger_allocations: prev.ledger_allocations.filter((_, i) => i !== index)
    }));
  };

  const updateLedgerAllocation = (index: number, field: string, value: any) => {
    setVoucher(prev => ({
      ...prev,
      ledger_allocations: prev.ledger_allocations.map((allocation, i) => 
        i === index ? { ...allocation, [field]: value } : allocation
      )
    }));
  };

  const addAccountEntry = () => {
    setVoucher(prev => ({
      ...prev,
      entries: [...prev.entries, {
        ledger_id: '',
        debit_amount: 0,
        credit_amount: 0,
        narration: ''
      }]
    }));
  };

  const removeAccountEntry = (index: number) => {
    if (voucher.entries.length > 1) {
      setVoucher(prev => ({
        ...prev,
        entries: prev.entries.filter((_, i) => i !== index)
      }));
    }
  };

  const updateAccountEntry = (index: number, field: string, value: any) => {
    setVoucher(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const calculateTotals = () => {
    const stockTotal = voucher.stock_entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
    const taxTotal = voucher.stock_entries.reduce((sum, entry) => sum + (entry.tax_amount || 0), 0);
    const ledgerTotal = voucher.ledger_allocations.reduce((sum, allocation) => sum + (allocation.amount || 0), 0);
    const totalDebit = voucher.entries.reduce((sum, entry) => sum + (entry.debit_amount || 0), 0);
    const totalCredit = voucher.entries.reduce((sum, entry) => sum + (entry.credit_amount || 0), 0);
    
    return { stockTotal, taxTotal, ledgerTotal, totalDebit, totalCredit };
  };

  const handleAiCommand = async () => {
    if (!aiCommand.trim()) return;

    setAiProcessing(true);
    try {
      const result = await gemini.parseVoucherCommand(aiCommand);
      
      if (result.needs_clarification) {
        toast.error(result.questions[0]);
      } else {
        // Apply AI result to form
        setVoucher(prev => ({
          ...prev,
          voucher_type: result.voucher_type,
          party_name: result.party_name || prev.party_name,
          narration: result.narration || prev.narration,
          entries: result.ledger_entries || prev.entries,
          stock_entries: result.items?.map((item: any) => ({
            stock_item_name: item.name,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            discount_percent: 0,
            tax_percent: 18,
            tax_amount: item.amount * 0.18,
            unit: 'Nos'
          })) || prev.stock_entries
        }));
        
        setCurrentVoucherType(result.voucher_type);
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

  const saveVoucher = async () => {
    setLoading(true);
    try {
      const { stockTotal, taxTotal } = calculateTotals();
      const totalAmount = stockTotal + taxTotal;

      // Save voucher
      const { data: voucherData, error: voucherError } = await supabase
        .from('vouchers')
        .insert([{
          company_id: selectedCompany?.id,
          voucher_type: voucher.voucher_type,
          voucher_number: voucher.voucher_number,
          date: voucher.date,
          reference: voucher.reference,
          narration: voucher.narration,
          total_amount: totalAmount
        }])
        .select()
        .single();

      if (voucherError) throw voucherError;

      // Save voucher entries if any
      if (voucher.entries.length > 0) {
        const entries = voucher.entries
          .filter(entry => entry.ledger_id && (entry.debit_amount > 0 || entry.credit_amount > 0))
          .map(entry => ({
            voucher_id: voucherData.id,
            ledger_id: entry.ledger_id,
            debit_amount: entry.debit_amount || 0,
            credit_amount: entry.credit_amount || 0,
            narration: entry.narration
          }));

        if (entries.length > 0) {
          const { error: entriesError } = await supabase
            .from('voucher_entries')
            .insert(entries);

          if (entriesError) throw entriesError;
        }
      }

      toast.success('Voucher saved successfully!');
      
      // Reset form
      setVoucher({
        voucher_type: currentVoucherType,
        voucher_number: '',
        date: new Date().toISOString().split('T')[0],
        country: 'IN',
        entries: getDefaultEntries(),
        stock_entries: [],
        ledger_allocations: []
      });
      
      generateVoucherNumber();
    } catch (error) {
      console.error('Error saving voucher:', error);
      toast.error('Failed to save voucher');
    } finally {
      setLoading(false);
    }
  };

  const renderVoucherForm = () => {
    const voucherConfig = getCurrentVoucherConfig();
    
    switch (currentVoucherType) {
      case 'sales':
      case 'purchase':
      case 'debit_note':
      case 'credit_note':
        return renderInventoryVoucherForm();
      case 'receipt':
      case 'payment':
        return renderReceiptPaymentForm();
      case 'journal':
        return renderJournalForm();
      case 'contra':
        return renderContraForm();
      case 'stock_transfer':
        return renderStockTransferForm();
      case 'manufacturing_journal':
        return renderManufacturingForm();
      default:
        return renderInventoryVoucherForm();
    }
  };

  const renderInventoryVoucherForm = () => {
    const voucherConfig = getCurrentVoucherConfig();
    const { stockTotal, taxTotal } = calculateTotals();
    
    return (
      <div className="space-y-6">
        {/* Voucher Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            Voucher Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voucher Type
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                <span className="font-medium capitalize">{currentVoucherType.replace('_', ' ')}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voucher No.
              </label>
              <Input
                value={voucher.voucher_number}
                onChange={(e) => setVoucher(prev => ({ ...prev, voucher_number: e.target.value }))}
                placeholder="Auto-generated"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <Input
                type="date"
                value={voucher.date}
                onChange={(e) => setVoucher(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference No.
              </label>
              <Input
                value={voucher.reference || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="External reference"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order No.
              </label>
              <Input
                value={voucher.order_number || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, order_number: e.target.value }))}
                placeholder="Order number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Date
              </label>
              <Input
                type="date"
                value={voucher.order_date || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, order_date: e.target.value }))}
              />
            </div>
          </div>
        </Card>

        {/* Party Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Party Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Party Ledger *
              </label>
              <select
                value={voucher.party_ledger_id || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, party_ledger_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Party</option>
                {ledgers.map((ledger) => (
                  <option key={ledger.id} value={ledger.id}>
                    {ledger.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Place of Supply *
              </label>
              <select
                value={voucher.place_of_supply || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, place_of_supply: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select State</option>
                <option value="01">Jammu and Kashmir</option>
                <option value="02">Himachal Pradesh</option>
                <option value="03">Punjab</option>
                <option value="04">Chandigarh</option>
                <option value="05">Uttarakhand</option>
                <option value="06">Haryana</option>
                <option value="07">Delhi</option>
                <option value="08">Rajasthan</option>
                <option value="09">Uttar Pradesh</option>
                <option value="10">Bihar</option>
                <option value="11">Sikkim</option>
                <option value="12">Arunachal Pradesh</option>
                <option value="13">Nagaland</option>
                <option value="14">Manipur</option>
                <option value="15">Mizoram</option>
                <option value="16">Tripura</option>
                <option value="17">Meghalaya</option>
                <option value="18">Assam</option>
                <option value="19">West Bengal</option>
                <option value="20">Jharkhand</option>
                <option value="21">Odisha</option>
                <option value="22">Chhattisgarh</option>
                <option value="23">Madhya Pradesh</option>
                <option value="24">Gujarat</option>
                <option value="25">Daman and Diu</option>
                <option value="26">Dadra and Nagar Haveli</option>
                <option value="27">Maharashtra</option>
                <option value="28">Andhra Pradesh</option>
                <option value="29">Karnataka</option>
                <option value="30">Goa</option>
                <option value="31">Lakshadweep</option>
                <option value="32">Kerala</option>
                <option value="33">Tamil Nadu</option>
                <option value="34">Puducherry</option>
                <option value="35">Andaman and Nicobar Islands</option>
                <option value="36">Telangana</option>
                <option value="37">Andhra Pradesh (New)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                <span>🇮🇳 India</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Item Details - Only show if inventory mode is enabled */}
        {invoiceMode === 'accounts_inventory' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Item Details
              </h3>
              <Button size="sm" onClick={addStockEntry}>
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Item Name</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">Qty</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Unit</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">Rate</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">Disc %</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">Amount</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">Tax %</th>
                    {settings.enable_per_item_ledger && (
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Ledger</th>
                    )}
                    {settings.enable_godown && (
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Godown</th>
                    )}
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {voucher.stock_entries.map((entry, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 px-3">
                        <select
                          value={entry.stock_item_id}
                          onChange={(e) => {
                            const selectedItem = stockItems.find(item => item.id === e.target.value);
                            updateStockEntry(index, 'stock_item_id', e.target.value);
                            if (selectedItem) {
                              updateStockEntry(index, 'rate', selectedItem.rate);
                              updateStockEntry(index, 'unit', selectedItem.units?.symbol || 'Nos');
                              updateStockEntry(index, 'stock_item_name', selectedItem.name);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Item</option>
                          {stockItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} ({item.current_stock} {item.units?.symbol})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          step="0.001"
                          value={entry.quantity || ''}
                          onChange={(e) => updateStockEntry(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="text-right"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          value={entry.unit || ''}
                          onChange={(e) => updateStockEntry(index, 'unit', e.target.value)}
                          className="w-20"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          step="0.01"
                          value={entry.rate || ''}
                          onChange={(e) => updateStockEntry(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="text-right"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          step="0.01"
                          value={entry.discount_percent || ''}
                          onChange={(e) => updateStockEntry(index, 'discount_percent', parseFloat(e.target.value) || 0)}
                          className="text-right w-20"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          step="0.01"
                          value={entry.amount || ''}
                          readOnly
                          className="text-right bg-gray-50"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={entry.tax_percent || 18}
                          onChange={(e) => updateStockEntry(index, 'tax_percent', parseFloat(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      </td>
                      {settings.enable_per_item_ledger && (
                        <td className="py-2 px-3">
                          <select
                            value={entry.ledger_id || ''}
                            onChange={(e) => updateStockEntry(index, 'ledger_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select Ledger</option>
                            {ledgers.map((ledger) => (
                              <option key={ledger.id} value={ledger.id}>
                                {ledger.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      )}
                      {settings.enable_godown && (
                        <td className="py-2 px-3">
                          <select
                            value={entry.godown_id || ''}
                            onChange={(e) => updateStockEntry(index, 'godown_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select Godown</option>
                            {godowns.map((godown) => (
                              <option key={godown.id} value={godown.id}>
                                {godown.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      )}
                      <td className="py-2 px-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeStockEntry(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 font-semibold">
                    <td className="py-3 px-3" colSpan={5}>Total</td>
                    <td className="py-3 px-3 text-right">₹{stockTotal.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right">₹{taxTotal.toFixed(2)}</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {voucher.stock_entries.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No items added yet</p>
                <Button onClick={addStockEntry}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Ledger Allocations */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Ledger Allocations
            </h3>
            <Button size="sm" onClick={addLedgerAllocation}>
              <Plus className="w-4 h-4 mr-1" />
              Add Ledger
            </Button>
          </div>

          <div className="space-y-3">
            {/* Sales/Purchase Ledger */}
            <div className="grid grid-cols-4 gap-4 p-3 bg-blue-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {currentVoucherType === 'sales' ? 'Sales' : 'Purchase'} Ledger
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Ledger</option>
                  {ledgers.map((ledger) => (
                    <option key={ledger.id} value={ledger.id}>
                      {ledger.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  value={stockTotal.toFixed(2)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  <span className="text-sm">
                    {['sales', 'credit_note'].includes(currentVoucherType) ? 'Credit' : 'Debit'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
                <div className="py-2">
                  <span className="text-sm text-gray-500">Auto-calculated</span>
                </div>
              </div>
            </div>

            {/* Tax Ledgers */}
            {voucher.country === 'IN' && taxTotal > 0 && (
              <>
                <div className="grid grid-cols-4 gap-4 p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CGST</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">CGST @ 9%</option>
                    </select>
                  </div>
                  <div>
                    <Input
                      type="number"
                      step="0.01"
                      value={(taxTotal / 2).toFixed(2)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      <span className="text-sm">
                        {['sales', 'credit_note'].includes(currentVoucherType) ? 'Credit' : 'Debit'}
                      </span>
                    </div>
                  </div>
                  <div></div>
                </div>

                <div className="grid grid-cols-4 gap-4 p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SGST</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">SGST @ 9%</option>
                    </select>
                  </div>
                  <div>
                    <Input
                      type="number"
                      step="0.01"
                      value={(taxTotal / 2).toFixed(2)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      <span className="text-sm">
                        {['sales', 'credit_note'].includes(currentVoucherType) ? 'Credit' : 'Debit'}
                      </span>
                    </div>
                  </div>
                  <div></div>
                </div>
              </>
            )}

            {/* Additional Ledger Allocations */}
            {voucher.ledger_allocations.map((allocation, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <select
                    value={allocation.ledger_id}
                    onChange={(e) => updateLedgerAllocation(index, 'ledger_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Ledger</option>
                    {ledgers.map((ledger) => (
                      <option key={ledger.id} value={ledger.id}>
                        {ledger.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Input
                    type="number"
                    step="0.01"
                    value={allocation.amount || ''}
                    onChange={(e) => updateLedgerAllocation(index, 'amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <select
                    value={allocation.type}
                    onChange={(e) => updateLedgerAllocation(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
                <div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeLedgerAllocation(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Optional Fields */}
        {(settings.enable_due_date || settings.enable_terms_of_payment) && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings.enable_due_date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={voucher.due_date || ''}
                    onChange={(e) => setVoucher(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
              )}
              {settings.enable_terms_of_payment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms of Payment
                  </label>
                  <textarea
                    value={voucher.terms_of_payment || ''}
                    onChange={(e) => setVoucher(prev => ({ ...prev, terms_of_payment: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Payment terms and conditions"
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Narration */}
        <Card className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Narration
          </label>
          <textarea
            value={voucher.narration || ''}
            onChange={(e) => setVoucher(prev => ({ ...prev, narration: e.target.value }))}
            placeholder="Enter voucher narration..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Card>
      </div>
    );
  };

  const renderReceiptPaymentForm = () => {
    return (
      <div className="space-y-6">
        {/* Voucher Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            Voucher Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voucher Type
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                <span className="font-medium capitalize">{currentVoucherType}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voucher No.
              </label>
              <Input
                value={voucher.voucher_number}
                onChange={(e) => setVoucher(prev => ({ ...prev, voucher_number: e.target.value }))}
                placeholder="Auto-generated"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <Input
                type="date"
                value={voucher.date}
                onChange={(e) => setVoucher(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>
        </Card>

        {/* Account Ledger Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Account Ledgers
            </h3>
            <Button size="sm" onClick={addAccountEntry}>
              <Plus className="w-4 h-4 mr-1" />
              Add Entry
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Ledger Name</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-700">Type</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">Amount</th>
                  {settings.enable_cost_center && (
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Cost Centre</th>
                  )}
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Narration</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {voucher.entries.map((entry, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 px-3">
                      <select
                        value={entry.ledger_id}
                        onChange={(e) => updateAccountEntry(index, 'ledger_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Ledger</option>
                        {ledgers.map((ledger) => (
                          <option key={ledger.id} value={ledger.id}>
                            {ledger.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={entry.debit_amount > 0 ? 'debit' : 'credit'}
                        onChange={(e) => {
                          const amount = entry.debit_amount || entry.credit_amount || 0;
                          if (e.target.value === 'debit') {
                            updateAccountEntry(index, 'debit_amount', amount);
                            updateAccountEntry(index, 'credit_amount', 0);
                          } else {
                            updateAccountEntry(index, 'credit_amount', amount);
                            updateAccountEntry(index, 'debit_amount', 0);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="debit">Dr</option>
                        <option value="credit">Cr</option>
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        step="0.01"
                        value={entry.debit_amount || entry.credit_amount || ''}
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0;
                          if (entry.debit_amount > 0) {
                            updateAccountEntry(index, 'debit_amount', amount);
                          } else {
                            updateAccountEntry(index, 'credit_amount', amount);
                          }
                        }}
                        className="text-right"
                      />
                    </td>
                    {settings.enable_cost_center && (
                      <td className="py-2 px-3">
                        <select
                          value={entry.cost_center_id || ''}
                          onChange={(e) => updateAccountEntry(index, 'cost_center_id', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Cost Centre</option>
                          {costCenters.map((cc) => (
                            <option key={cc.id} value={cc.id}>
                              {cc.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    <td className="py-2 px-3">
                      <Input
                        value={entry.narration || ''}
                        onChange={(e) => updateAccountEntry(index, 'narration', e.target.value)}
                        placeholder="Entry narration"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAccountEntry(index)}
                        className="text-red-600 hover:text-red-700"
                        disabled={voucher.entries.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Bank/Cash Ledger Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Bank / Cash Ledger
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode of Payment *
              </label>
              <select
                value={voucher.mode_of_payment || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, mode_of_payment: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Mode</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="upi">UPI</option>
                <option value="cheque">Cheque</option>
                <option value="neft">NEFT</option>
                <option value="rtgs">RTGS</option>
                <option value="imps">IMPS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ledger *
              </label>
              <select
                value={voucher.bank_ledger_id || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, bank_ledger_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Ledger</option>
                {ledgers.map((ledger) => (
                  <option key={ledger.id} value={ledger.id}>
                    {ledger.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Bank Details */}
          {voucher.mode_of_payment && voucher.mode_of_payment !== 'cash' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instrument No.
                </label>
                <Input
                  value={voucher.instrument_number || ''}
                  onChange={(e) => setVoucher(prev => ({ ...prev, instrument_number: e.target.value }))}
                  placeholder="Cheque/Transaction number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <Input
                  value={voucher.bank_name || ''}
                  onChange={(e) => setVoucher(prev => ({ ...prev, bank_name: e.target.value }))}
                  placeholder="Bank name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Name
                </label>
                <Input
                  value={voucher.branch_name || ''}
                  onChange={(e) => setVoucher(prev => ({ ...prev, branch_name: e.target.value }))}
                  placeholder="Branch name"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Narration */}
        <Card className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Overall Narration
          </label>
          <textarea
            value={voucher.narration || ''}
            onChange={(e) => setVoucher(prev => ({ ...prev, narration: e.target.value }))}
            placeholder="Enter voucher narration..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Card>
      </div>
    );
  };

  const renderJournalForm = () => {
    const { totalDebit, totalCredit } = calculateTotals();
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    return (
      <div className="space-y-6">
        {/* Voucher Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            Journal Voucher Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voucher No.
              </label>
              <Input
                value={voucher.voucher_number}
                onChange={(e) => setVoucher(prev => ({ ...prev, voucher_number: e.target.value }))}
                placeholder="Auto-generated"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <Input
                type="date"
                value={voucher.date}
                onChange={(e) => setVoucher(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference No.
              </label>
              <Input
                value={voucher.reference || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Reference number"
              />
            </div>
          </div>
        </Card>

        {/* Journal Entries */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Journal Entries
            </h3>
            <Button size="sm" onClick={addAccountEntry}>
              <Plus className="w-4 h-4 mr-1" />
              Add Entry
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Ledger Name</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">Debit</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">Credit</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Narration</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {voucher.entries.map((entry, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 px-3">
                      <select
                        value={entry.ledger_id}
                        onChange={(e) => updateAccountEntry(index, 'ledger_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Ledger</option>
                        {ledgers.map((ledger) => (
                          <option key={ledger.id} value={ledger.id}>
                            {ledger.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        step="0.01"
                        value={entry.debit_amount || ''}
                        onChange={(e) => updateAccountEntry(index, 'debit_amount', parseFloat(e.target.value) || 0)}
                        className="text-right"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        step="0.01"
                        value={entry.credit_amount || ''}
                        onChange={(e) => updateAccountEntry(index, 'credit_amount', parseFloat(e.target.value) || 0)}
                        className="text-right"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        value={entry.narration || ''}
                        onChange={(e) => updateAccountEntry(index, 'narration', e.target.value)}
                        placeholder="Entry narration"
                      />
                    </td>
                    <td className="py-2 px-3">
                      {voucher.entries.length > 2 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeAccountEntry(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 font-semibold">
                  <td className="py-3 px-3">Total</td>
                  <td className="py-3 px-3 text-right">₹{totalDebit.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right">₹{totalCredit.toFixed(2)}</td>
                  <td className="py-3 px-3"></td>
                  <td className="py-3 px-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {!isBalanced && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-600 text-sm">
                Difference: ₹{Math.abs(totalDebit - totalCredit).toFixed(2)} - Debit and Credit must be equal
              </p>
            </div>
          )}

          {isBalanced && totalDebit > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-600 text-sm">
                Journal entry is balanced - Ready to save
              </p>
            </div>
          )}
        </Card>

        {/* Narration */}
        <Card className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Narration
          </label>
          <textarea
            value={voucher.narration || ''}
            onChange={(e) => setVoucher(prev => ({ ...prev, narration: e.target.value }))}
            placeholder="Enter journal entry narration..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Card>
      </div>
    );
  };

  const renderContraForm = () => {
    return (
      <div className="space-y-6">
        {/* Voucher Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            Contra Voucher Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voucher No.
              </label>
              <Input
                value={voucher.voucher_number}
                onChange={(e) => setVoucher(prev => ({ ...prev, voucher_number: e.target.value }))}
                placeholder="Auto-generated"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <Input
                type="date"
                value={voucher.date}
                onChange={(e) => setVoucher(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference No.
              </label>
              <Input
                value={voucher.reference || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Reference number"
              />
            </div>
          </div>
        </Card>

        {/* Transfer Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ArrowLeftRight className="w-5 h-5 mr-2" />
            Transfer Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Ledger *
              </label>
              <select
                value={voucher.from_ledger_id || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, from_ledger_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select From Ledger</option>
                {ledgers.map((ledger) => (
                  <option key={ledger.id} value={ledger.id}>
                    {ledger.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Ledger *
              </label>
              <select
                value={voucher.to_ledger_id || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, to_ledger_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select To Ledger</option>
                {ledgers.map((ledger) => (
                  <option key={ledger.id} value={ledger.id}>
                    {ledger.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <Input
                type="number"
                step="0.01"
                value={voucher.entries[0]?.debit_amount || ''}
                onChange={(e) => {
                  const amount = parseFloat(e.target.value) || 0;
                  setVoucher(prev => ({
                    ...prev,
                    entries: [
                      { ledger_id: prev.from_ledger_id || '', debit_amount: 0, credit_amount: amount, narration: '' },
                      { ledger_id: prev.to_ledger_id || '', debit_amount: amount, credit_amount: 0, narration: '' }
                    ]
                  }));
                }}
                placeholder="Transfer amount"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Mode
              </label>
              <select
                value={voucher.transfer_mode || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, transfer_mode: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Mode</option>
                <option value="neft">NEFT</option>
                <option value="rtgs">RTGS</option>
                <option value="imps">IMPS</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Narration */}
        <Card className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Narration
          </label>
          <textarea
            value={voucher.narration || ''}
            onChange={(e) => setVoucher(prev => ({ ...prev, narration: e.target.value }))}
            placeholder="Enter transfer narration..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Card>
      </div>
    );
  };

  const renderStockTransferForm = () => {
    return (
      <div className="space-y-6">
        {/* Voucher Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            Stock Transfer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voucher No.
              </label>
              <Input
                value={voucher.voucher_number}
                onChange={(e) => setVoucher(prev => ({ ...prev, voucher_number: e.target.value }))}
                placeholder="Auto-generated"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <Input
                type="date"
                value={voucher.date}
                onChange={(e) => setVoucher(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference No.
              </label>
              <Input
                value={voucher.reference || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Reference number"
              />
            </div>
          </div>
        </Card>

        {/* Godown Selection */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Warehouse className="w-5 h-5 mr-2" />
            Godown Transfer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Godown *
              </label>
              <select
                value={voucher.from_godown_id || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, from_godown_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select From Godown</option>
                {godowns.map((godown) => (
                  <option key={godown.id} value={godown.id}>
                    {godown.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Godown *
              </label>
              <select
                value={voucher.to_godown_id || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, to_godown_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select To Godown</option>
                {godowns.map((godown) => (
                  <option key={godown.id} value={godown.id}>
                    {godown.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Stock Items */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Items to Transfer
            </h3>
            <Button size="sm" onClick={addStockEntry}>
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Item Name</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">Quantity</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Unit</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Narration</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {voucher.stock_entries.map((entry, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 px-3">
                      <select
                        value={entry.stock_item_id}
                        onChange={(e) => {
                          const selectedItem = stockItems.find(item => item.id === e.target.value);
                          updateStockEntry(index, 'stock_item_id', e.target.value);
                          if (selectedItem) {
                            updateStockEntry(index, 'unit', selectedItem.units?.symbol || 'Nos');
                            updateStockEntry(index, 'stock_item_name', selectedItem.name);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Item</option>
                        {stockItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.current_stock} {item.units?.symbol})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        step="0.001"
                        value={entry.quantity || ''}
                        onChange={(e) => updateStockEntry(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="text-right"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        value={entry.unit || ''}
                        onChange={(e) => updateStockEntry(index, 'unit', e.target.value)}
                        className="w-20"
                        readOnly
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        value={entry.narration || ''}
                        onChange={(e) => updateStockEntry(index, 'narration', e.target.value)}
                        placeholder="Item narration"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeStockEntry(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {voucher.stock_entries.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No items added yet</p>
              <Button onClick={addStockEntry}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            </div>
          )}
        </Card>

        {/* Narration */}
        <Card className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Narration
          </label>
          <textarea
            value={voucher.narration || ''}
            onChange={(e) => setVoucher(prev => ({ ...prev, narration: e.target.value }))}
            placeholder="Enter transfer narration..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Card>
      </div>
    );
  };

  const renderManufacturingForm = () => {
    return (
      <div className="space-y-6">
        {/* Voucher Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            Manufacturing Journal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voucher No.
              </label>
              <Input
                value={voucher.voucher_number}
                onChange={(e) => setVoucher(prev => ({ ...prev, voucher_number: e.target.value }))}
                placeholder="Auto-generated"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <Input
                type="date"
                value={voucher.date}
                onChange={(e) => setVoucher(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference No.
              </label>
              <Input
                value={voucher.reference || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Reference number"
              />
            </div>
          </div>
        </Card>

        {/* Finished Goods */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Factory className="w-5 h-5 mr-2" />
            Finished Goods Production
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finished Goods Item *
              </label>
              <select
                value={voucher.finished_goods_item_id || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, finished_goods_item_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Finished Goods</option>
                {stockItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Produced *
              </label>
              <Input
                type="number"
                step="0.001"
                value={voucher.quantity_produced || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, quantity_produced: parseFloat(e.target.value) || 0 }))}
                placeholder="Quantity produced"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Godown
              </label>
              <select
                value={voucher.to_godown_id || ''}
                onChange={(e) => setVoucher(prev => ({ ...prev, to_godown_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Godown</option>
                {godowns.map((godown) => (
                  <option key={godown.id} value={godown.id}>
                    {godown.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Raw Materials Used */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Raw Materials Used
            </h3>
            <Button size="sm" onClick={addStockEntry}>
              <Plus className="w-4 h-4 mr-1" />
              Add Material
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Raw Material</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">Qty Used</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Unit</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">Rate</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">Value</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Godown</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {voucher.stock_entries.map((entry, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 px-3">
                      <select
                        value={entry.stock_item_id}
                        onChange={(e) => {
                          const selectedItem = stockItems.find(item => item.id === e.target.value);
                          updateStockEntry(index, 'stock_item_id', e.target.value);
                          if (selectedItem) {
                            updateStockEntry(index, 'rate', selectedItem.rate);
                            updateStockEntry(index, 'unit', selectedItem.units?.symbol || 'Nos');
                            updateStockEntry(index, 'stock_item_name', selectedItem.name);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Material</option>
                        {stockItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.current_stock} {item.units?.symbol})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        step="0.001"
                        value={entry.quantity || ''}
                        onChange={(e) => updateStockEntry(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="text-right"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        value={entry.unit || ''}
                        onChange={(e) => updateStockEntry(index, 'unit', e.target.value)}
                        className="w-20"
                        readOnly
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        step="0.01"
                        value={entry.rate || ''}
                        onChange={(e) => updateStockEntry(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="text-right"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        step="0.01"
                        value={entry.amount || ''}
                        readOnly
                        className="text-right bg-gray-50"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={entry.godown_id || ''}
                        onChange={(e) => updateStockEntry(index, 'godown_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Godown</option>
                        {godowns.map((godown) => (
                          <option key={godown.id} value={godown.id}>
                            {godown.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeStockEntry(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {voucher.stock_entries.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No raw materials added yet</p>
              <Button onClick={addStockEntry}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Material
              </Button>
            </div>
          )}
        </Card>

        {/* Narration */}
        <Card className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Narration
          </label>
          <textarea
            value={voucher.narration || ''}
            onChange={(e) => setVoucher(prev => ({ ...prev, narration: e.target.value }))}
            placeholder="Enter manufacturing narration..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Card>
      </div>
    );
  };

  const renderSettingsModal = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="w-6 h-6 mr-2" />
              Voucher Settings
            </h2>
            <Button
              onClick={() => setShowSettings(false)}
              variant="ghost"
              size="sm"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Field Toggles */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Field Visibility
              </h3>
              <div className="space-y-4">
                {[
                  { key: 'enable_godown', label: 'Godown Selection', description: 'Show godown field for stock items' },
                  { key: 'enable_batch', label: 'Batch Numbers', description: 'Enable batch tracking for items' },
                  { key: 'enable_cost_center', label: 'Cost Centers', description: 'Show cost center allocation' },
                  { key: 'enable_due_date', label: 'Due Date', description: 'Show due date for credit transactions' },
                  { key: 'enable_per_item_ledger', label: 'Per-Item Ledger', description: 'Allow different ledger per item' },
                  { key: 'enable_terms_of_payment', label: 'Payment Terms', description: 'Show payment terms field' },
                  { key: 'enable_einvoice', label: 'E-Invoice Fields', description: 'Show e-invoice related fields' }
                ].map((setting) => (
                  <label key={setting.key} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[setting.key as keyof VoucherSettings]}
                      onChange={(e) => setSettings(prev => ({ ...prev, [setting.key]: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 rounded mt-0.5"
                    />
                    <div>
                      <span className="font-medium text-gray-900">{setting.label}</span>
                      <p className="text-sm text-gray-600">{setting.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

            {/* Calculation Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Calculation Settings
              </h3>
              <div className="space-y-4">
                {[
                  { key: 'tax_inclusive', label: 'Tax Inclusive Pricing', description: 'Prices include tax by default' },
                  { key: 'auto_round_off', label: 'Auto Round Off', description: 'Automatically round final amounts' }
                ].map((setting) => (
                  <label key={setting.key} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[setting.key as keyof VoucherSettings]}
                      onChange={(e) => setSettings(prev => ({ ...prev, [setting.key]: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 rounded mt-0.5"
                    />
                    <div>
                      <span className="font-medium text-gray-900">{setting.label}</span>
                      <p className="text-sm text-gray-600">{setting.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <Button
              onClick={() => setShowSettings(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowSettings(false);
                toast.success('Settings saved successfully!');
              }}
            >
              Save Settings
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const currentVoucherConfig = getCurrentVoucherConfig();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Entry Mode */}
      <div className="w-80 bg-white border-r border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Entry Mode
        </h2>
        <div className="space-y-3">
          {entryModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <motion.button
                key={mode.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEntryMode(mode.value)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  entryMode === mode.value
                    ? `bg-gradient-to-r ${mode.color} text-white shadow-lg`
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-6 h-6" />
                  <div>
                    <p className="font-medium">{mode.label}</p>
                    <p className={`text-sm ${
                      entryMode === mode.value ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {mode.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* AI Command Input */}
        {entryMode === 'ai' && (
          <div className="mt-6 p-4 bg-purple-50 rounded-xl">
            <h3 className="font-medium text-purple-900 mb-3 flex items-center">
              <Bot className="w-4 h-4 mr-2" />
              AI Assistant
            </h3>
            <textarea
              value={aiCommand}
              onChange={(e) => setAiCommand(e.target.value)}
              placeholder="Describe your transaction in natural language..."
              rows={4}
              className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <Button
              onClick={handleAiCommand}
              disabled={aiProcessing || !aiCommand.trim()}
              size="sm"
              className="w-full mt-3 bg-gradient-to-r from-purple-500 to-purple-600"
            >
              {aiProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Process Command
            </Button>
          </div>
        )}

        {/* Upload Section */}
        {entryMode === 'upload' && (
          <div className="mt-6 p-4 bg-green-50 rounded-xl">
            <h3 className="font-medium text-green-900 mb-3 flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Upload Invoice
            </h3>
            <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center">
              <FileImage className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700 mb-2">Drop files here or click to upload</p>
              <p className="text-xs text-green-600">Supports PDF, JPG, PNG</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Voucher Entry</h1>
              <p className="text-gray-600">Create and manage accounting vouchers</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                size="sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Voucher Form */}
          {renderVoucherForm()}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8">
            <Button variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button 
              onClick={saveVoucher}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-green-600"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Voucher
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Auto Show/Hide */}
      <div 
        className="relative"
        onMouseEnter={() => setRightPanelVisible(true)}
        onMouseLeave={() => setRightPanelVisible(false)}
      >
        {/* Panel Trigger */}
        {!rightPanelVisible && (
          <div className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-l-lg shadow-lg z-40">
            <ChevronLeft className="w-5 h-5" />
          </div>
        )}

        {/* Right Panel */}
        <AnimatePresence>
          {rightPanelVisible && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white border-l border-gray-200 shadow-xl z-30 overflow-y-auto"
            >
              <div className="p-6">
                {/* Voucher Types */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Voucher Types
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {voucherTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <motion.button
                          key={type.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setCurrentVoucherType(type.value)}
                          className={`p-3 rounded-xl text-left transition-all ${
                            currentVoucherType === type.value
                              ? `bg-gradient-to-r ${type.color} text-white shadow-lg`
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Icon className="w-5 h-5 mb-2" />
                          <p className="text-sm font-medium">{type.label}</p>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Invoice Mode - Only for inventory vouchers */}
                {currentVoucherConfig?.hasInventory && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Invoice Mode
                    </h3>
                    <div className="space-y-2">
                      {invoiceModes.map((mode) => {
                        const Icon = mode.icon;
                        return (
                          <motion.button
                            key={mode.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setInvoiceMode(mode.value)}
                            className={`w-full p-3 rounded-xl text-left transition-all ${
                              invoiceMode === mode.value
                                ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-2 border-transparent'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className="w-5 h-5" />
                              <div>
                                <p className="font-medium text-sm">{mode.label}</p>
                                <p className="text-xs opacity-75">{mode.description}</p>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Quick Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-700 font-medium">Today's Vouchers</span>
                      <span className="text-blue-900 font-bold">12</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-green-700 font-medium">This Month</span>
                      <span className="text-green-900 font-bold">156</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-orange-700 font-medium">Pending</span>
                      <span className="text-orange-900 font-bold">3</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && renderSettingsModal()}
      </AnimatePresence>
    </div>
  );
};