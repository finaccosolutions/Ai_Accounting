import React, { useState, useEffect } from 'react';
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
  Filter,
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
  Copy
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
  party_name?: string;
  party_gstin?: string;
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
}

const voucherTypes = [
  { 
    value: 'sales', 
    label: 'Sales', 
    color: 'from-green-500 to-green-600', 
    icon: '💰',
    description: 'Record sales transactions',
    hasParty: true,
    hasStock: true,
    hasTax: true,
    defaultMode: 'item_invoice'
  },
  { 
    value: 'purchase', 
    label: 'Purchase', 
    color: 'from-blue-500 to-blue-600', 
    icon: '🛒',
    description: 'Record purchase transactions',
    hasParty: true,
    hasStock: true,
    hasTax: true,
    defaultMode: 'item_invoice'
  },
  { 
    value: 'receipt', 
    label: 'Receipt', 
    color: 'from-emerald-500 to-emerald-600', 
    icon: '📥',
    description: 'Money received',
    hasParty: true,
    hasStock: false,
    hasTax: false,
    defaultMode: 'voucher_mode'
  },
  { 
    value: 'payment', 
    label: 'Payment', 
    color: 'from-red-500 to-red-600', 
    icon: '📤',
    description: 'Money paid out',
    hasParty: true,
    hasStock: false,
    hasTax: false,
    defaultMode: 'voucher_mode'
  },
  { 
    value: 'journal', 
    label: 'Journal', 
    color: 'from-purple-500 to-purple-600', 
    icon: '📝',
    description: 'General journal entries',
    hasParty: false,
    hasStock: false,
    hasTax: false,
    defaultMode: 'accounting_mode'
  },
  { 
    value: 'contra', 
    label: 'Contra', 
    color: 'from-orange-500 to-orange-600', 
    icon: '🔄',
    description: 'Bank to cash transfers',
    hasParty: false,
    hasStock: false,
    hasTax: false,
    defaultMode: 'voucher_mode'
  }
];

const entryModes = [
  { value: 'item_invoice', label: 'Item Invoice', icon: Package, description: 'Item-wise billing with stock' },
  { value: 'voucher_mode', label: 'Voucher Mode', icon: Receipt, description: 'Simple voucher entry' },
  { value: 'accounting_mode', label: 'Accounting Mode', icon: Calculator, description: 'Advanced accounting entries' }
];

export const VoucherEntry: React.FC = () => {
  const { selectedCompany } = useApp();
  const [voucher, setVoucher] = useState<Voucher>({
    voucher_type: 'sales',
    voucher_number: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    narration: '',
    party_name: '',
    entries: [
      { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' },
      { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' }
    ],
    stock_entries: [],
    mode: 'item_invoice'
  });
  
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [godowns, setGodowns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentVouchers, setRecentVouchers] = useState<any[]>([]);
  
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [quickStatsExpanded, setQuickStatsExpanded] = useState(true);
  const [recentVouchersExpanded, setRecentVouchersExpanded] = useState(true);
  const [quickActionsExpanded, setQuickActionsExpanded] = useState(true);
  
  // AI and other states
  const [aiCommand, setAiCommand] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [showAiPreview, setShowAiPreview] = useState(false);
  const [aiPreview, setAiPreview] = useState<any>(null);

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

  useEffect(() => {
    // Set default mode based on voucher type
    const voucherType = voucherTypes.find(vt => vt.value === voucher.voucher_type);
    if (voucherType) {
      setVoucher(prev => ({ ...prev, mode: voucherType.defaultMode }));
    }
  }, [voucher.voucher_type]);

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
        .limit(5);

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
    setVoucher(prev => ({
      ...prev,
      entries: [...prev.entries, { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' }]
    }));
  };

  const addStockEntry = () => {
    setVoucher(prev => ({
      ...prev,
      stock_entries: [...(prev.stock_entries || []), { 
        stock_item_id: '', 
        quantity: 0, 
        rate: 0, 
        amount: 0 
      }]
    }));
  };

  const removeEntry = (index: number) => {
    if (voucher.entries.length > 2) {
      setVoucher(prev => ({
        ...prev,
        entries: prev.entries.filter((_, i) => i !== index)
      }));
    }
  };

  const removeStockEntry = (index: number) => {
    setVoucher(prev => ({
      ...prev,
      stock_entries: prev.stock_entries?.filter((_, i) => i !== index) || []
    }));
  };

  const updateEntry = (index: number, field: string, value: any) => {
    setVoucher(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
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
            updatedEntry.amount = updatedEntry.quantity * updatedEntry.rate;
          }
          return updatedEntry;
        }
        return entry;
      }) || []
    }));
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
        entries: [
          { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' },
          { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' }
        ],
        stock_entries: [],
        mode: voucher.mode
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
  const currentVoucherType = voucherTypes.find(vt => vt.value === voucher.voucher_type);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gray-50">
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'mr-12' : 'mr-80'}`}>
        <div className="h-full overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Voucher Entry</h1>
              <p className="text-gray-600">Create and manage accounting vouchers</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
            </div>
          </div>

          {/* Voucher Type Selection */}
          <Card className="p-6 mb-6 bg-white shadow-lg border-0">
            <h3 className="font-semibold text-gray-900 mb-4">Voucher Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {voucherTypes.map((type) => (
                <motion.button
                  key={type.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setVoucher(prev => ({ ...prev, voucher_type: type.value }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    voucher.voucher_type === type.value
                      ? `border-blue-500 bg-gradient-to-r ${type.color} text-white shadow-lg`
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                  <div className={`text-xs mt-1 ${
                    voucher.voucher_type === type.value ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {type.description}
                  </div>
                </motion.button>
              ))}
            </div>
          </Card>

          {/* Mode Selection (for applicable voucher types) */}
          {currentVoucherType && (currentVoucherType.hasStock || currentVoucherType.hasParty) && (
            <Card className="p-6 mb-6 bg-white shadow-lg border-0">
              <h3 className="font-semibold text-gray-900 mb-4">Entry Mode</h3>
              <div className="grid grid-cols-3 gap-4">
                {entryModes.map((mode) => {
                  const Icon = mode.icon;
                  const isAvailable = 
                    (mode.value === 'item_invoice' && currentVoucherType.hasStock) ||
                    (mode.value === 'voucher_mode') ||
                    (mode.value === 'accounting_mode');
                  
                  if (!isAvailable) return null;
                  
                  return (
                    <motion.button
                      key={mode.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setVoucher(prev => ({ ...prev, mode: mode.value as any }))}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        voucher.mode === mode.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">{mode.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{mode.description}</div>
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Voucher Details */}
          <Card className="p-6 mb-6 bg-white shadow-lg border-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Voucher Number
                </label>
                <Input
                  value={voucher.voucher_number}
                  onChange={(e) => setVoucher(prev => ({ ...prev, voucher_number: e.target.value }))}
                  placeholder="Auto-generated"
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
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
                  Reference
                </label>
                <Input
                  value={voucher.reference}
                  onChange={(e) => setVoucher(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="Reference number"
                />
              </div>
              {currentVoucherType?.hasParty && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Party Name
                  </label>
                  <Input
                    value={voucher.party_name}
                    onChange={(e) => setVoucher(prev => ({ ...prev, party_name: e.target.value }))}
                    placeholder="Customer/Vendor name"
                  />
                </div>
              )}
            </div>

            {/* Additional fields for specific voucher types */}
            {currentVoucherType?.hasTax && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Party GSTIN
                  </label>
                  <Input
                    value={voucher.party_gstin}
                    onChange={(e) => setVoucher(prev => ({ ...prev, party_gstin: e.target.value }))}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Place of Supply
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select State</option>
                    <option value="01">Jammu and Kashmir</option>
                    <option value="02">Himachal Pradesh</option>
                    <option value="03">Punjab</option>
                    {/* Add more states */}
                  </select>
                </div>
              </div>
            )}
          </Card>

          {/* Stock Items (for item invoice mode) */}
          {voucher.mode === 'item_invoice' && currentVoucherType?.hasStock && (
            <Card className="p-6 mb-6 bg-white shadow-lg border-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Stock Items
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
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Item</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-700">Qty</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-700">Rate</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-700">Amount</th>
                      {selectedCompany?.enable_multi_godown && (
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Godown</th>
                      )}
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {voucher.stock_entries?.map((entry, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 px-3">
                          <select
                            value={entry.stock_item_id}
                            onChange={(e) => {
                              const selectedItem = stockItems.find(item => item.id === e.target.value);
                              updateStockEntry(index, 'stock_item_id', e.target.value);
                              if (selectedItem) {
                                updateStockEntry(index, 'rate', selectedItem.rate);
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
                        {selectedCompany?.enable_multi_godown && (
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
                      <td className="py-3 px-3" colSpan={3}>Total</td>
                      <td className="py-3 px-3 text-right">₹{stockTotal.toFixed(2)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Tax Calculation */}
              {currentVoucherType?.hasTax && stockTotal > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Percent className="w-4 h-4 mr-2" />
                    Tax Calculation
                  </h4>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <label className="block text-gray-600">CGST (9%)</label>
                      <div className="font-medium">₹{(stockTotal * 0.09).toFixed(2)}</div>
                    </div>
                    <div>
                      <label className="block text-gray-600">SGST (9%)</label>
                      <div className="font-medium">₹{(stockTotal * 0.09).toFixed(2)}</div>
                    </div>
                    <div>
                      <label className="block text-gray-600">Total Tax</label>
                      <div className="font-medium">₹{(stockTotal * 0.18).toFixed(2)}</div>
                    </div>
                    <div>
                      <label className="block text-gray-600">Grand Total</label>
                      <div className="font-bold text-lg">₹{(stockTotal * 1.18).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Voucher Entries */}
          <Card className="p-6 mb-6 bg-white shadow-lg border-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Accounting Entries
              </h3>
              <Button size="sm" onClick={addEntry}>
                <Plus className="w-4 h-4 mr-1" />
                Add Entry
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Ledger</th>
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
                          onChange={(e) => updateEntry(index, 'ledger_id', e.target.value)}
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
                          onChange={(e) => updateEntry(index, 'debit_amount', parseFloat(e.target.value) || 0)}
                          className="text-right"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          step="0.01"
                          value={entry.credit_amount || ''}
                          onChange={(e) => updateEntry(index, 'credit_amount', parseFloat(e.target.value) || 0)}
                          className="text-right"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          value={entry.narration || ''}
                          onChange={(e) => updateEntry(index, 'narration', e.target.value)}
                          placeholder="Entry narration"
                        />
                      </td>
                      <td className="py-2 px-3">
                        {voucher.entries.length > 2 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeEntry(index)}
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
                  Voucher is balanced - Ready to save
                </p>
              </div>
            )}
          </Card>

          {/* Additional Options */}
          {(selectedCompany?.enable_cost_center || selectedCompany?.enable_multi_godown) && (
            <Card className="p-6 mb-6 bg-white shadow-lg border-0">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Additional Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCompany?.enable_cost_center && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost Center
                    </label>
                    <select
                      value={voucher.cost_center_id || ''}
                      onChange={(e) => setVoucher(prev => ({ ...prev, cost_center_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Cost Center</option>
                      {costCenters.map((cc) => (
                        <option key={cc.id} value={cc.id}>
                          {cc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Narration */}
          <Card className="p-6 mb-6 bg-white shadow-lg border-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Voucher Narration
            </label>
            <textarea
              value={voucher.narration}
              onChange={(e) => setVoucher(prev => ({ ...prev, narration: e.target.value }))}
              placeholder="Enter voucher narration..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mb-6">
            <Button variant="outline">
              Cancel
            </Button>
            <Button 
              onClick={saveVoucher}
              disabled={!isBalanced || loading}
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

      {/* Collapsible Sidebar */}
      <div className={`fixed right-0 top-16 h-[calc(100vh-4rem)] bg-white border-l border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'w-12' : 'w-80'
      } shadow-lg z-30`}>
        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -left-3 top-4 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
        >
          {sidebarCollapsed ? (
            <ChevronDown className="w-4 h-4 rotate-90" />
          ) : (
            <ChevronUp className="w-4 h-4 rotate-90" />
          )}
        </button>

        {!sidebarCollapsed && (
          <div className="p-4 h-full overflow-y-auto">
            {/* Quick Stats */}
            <div className="mb-6">
              <button
                onClick={() => setQuickStatsExpanded(!quickStatsExpanded)}
                className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span className="font-medium text-blue-900">Quick Stats</span>
                {quickStatsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-blue-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-blue-600" />
                )}
              </button>
              
              <AnimatePresence>
                {quickStatsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 space-y-3"
                  >
                    <div className="flex justify-between">
                      <span className="text-gray-600">Today's Vouchers</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Month</span>
                      <span className="font-semibold">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending</span>
                      <span className="font-semibold text-orange-600">3</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Recent Vouchers */}
            <div className="mb-6">
              <button
                onClick={() => setRecentVouchersExpanded(!recentVouchersExpanded)}
                className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <span className="font-medium text-green-900">Recent Vouchers</span>
                {recentVouchersExpanded ? (
                  <ChevronUp className="w-4 h-4 text-green-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-green-600" />
                )}
              </button>
              
              <AnimatePresence>
                {recentVouchersExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 space-y-3"
                  >
                    {recentVouchers.map((voucher) => (
                      <div key={voucher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{voucher.voucher_number}</p>
                          <p className="text-xs text-gray-500 capitalize">{voucher.voucher_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">₹{voucher.total_amount}</p>
                          <p className="text-xs text-gray-500">{new Date(voucher.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
              <button
                onClick={() => setQuickActionsExpanded(!quickActionsExpanded)}
                className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <span className="font-medium text-purple-900">Quick Actions</span>
                {quickActionsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-purple-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-purple-600" />
                )}
              </button>
              
              <AnimatePresence>
                {quickActionsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 space-y-2"
                  >
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      View All Vouchers
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Calculator className="w-4 h-4 mr-2" />
                      Trial Balance
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Day Book
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Bot className="w-4 h-4 mr-2" />
                      AI Assistant
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};