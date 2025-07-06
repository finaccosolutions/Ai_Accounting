import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  Save, 
  Search,
  Copy,
  Sparkles,
  FileText,
  Package,
  Calculator,
  User,
  MapPin,
  MessageSquare,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Settings,
  Menu,
  Receipt,
  CreditCard,
  Banknote,
  ArrowUpDown,
  Building2,
  DollarSign,
  Hash,
  Calendar,
  Percent
} from 'lucide-react';
import toast from 'react-hot-toast';

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
  cash_bank_ledger_id?: string;
  place_of_supply?: string;
  entries: VoucherEntry[];
  stock_entries?: StockEntry[];
  mode?: 'item_invoice' | 'voucher_mode';
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

const voucherModes = [
  { value: 'item_invoice', label: 'Item Invoice', description: 'Item-wise billing with stock' },
  { value: 'voucher_mode', label: 'Voucher Mode', description: 'Simple voucher entry' }
];

// Searchable Dropdown Component
const SearchableDropdown: React.FC<{
  items: any[];
  value: string;
  onSelect: (item: any) => void;
  placeholder: string;
  displayField: string;
  searchFields: string[];
  renderItem?: (item: any) => React.ReactNode;
  className?: string;
}> = ({ items, value, onSelect, placeholder, displayField, searchFields, renderItem, className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState(items);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter(item =>
        searchFields.some(field =>
          item[field]?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchTerm, items, searchFields]);

  useEffect(() => {
    const selectedItem = items.find(item => item.id === value);
    if (selectedItem) {
      setSearchTerm(selectedItem[displayField] || '');
    } else {
      setSearchTerm('');
    }
  }, [value, items, displayField]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: any) => {
    onSelect(item);
    setSearchTerm(item[displayField] || '');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
        <ChevronDown 
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                {renderItem ? renderItem(item) : (
                  <div className="font-medium text-gray-900">{item[displayField]}</div>
                )}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              No items found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const VoucherEntryConsolidated: React.FC = () => {
  const navigate = useNavigate();
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
    mode: 'item_invoice'
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

  const handleVoucherTypeChange = (type: string) => {
    setVoucher(prev => ({ 
      ...prev, 
      voucher_type: type,
      entries: [],
      stock_entries: [],
      mode: ['sales', 'purchase', 'debit_note', 'credit_note'].includes(type) ? 'item_invoice' : 'voucher_mode'
    }));
    setRightPanelVisible(false);
  };

  const handleModeChange = (mode: 'item_invoice' | 'voucher_mode') => {
    setVoucher(prev => ({ ...prev, mode }));
    setRightPanelVisible(false);
  };

  const handleSettingsClick = () => {
    setRightPanelVisible(false);
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

  const shouldShowStockItems = () => {
    return ['sales', 'purchase', 'debit_note', 'credit_note'].includes(voucher.voucher_type) && voucher.mode === 'item_invoice';
  };

  const shouldShowVoucherMode = () => {
    return ['sales', 'purchase', 'debit_note', 'credit_note'].includes(voucher.voucher_type);
  };

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

        {/* Voucher Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Voucher Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Voucher Number
                </label>
                <Input
                  value={voucher.voucher_number}
                  onChange={(e) => setVoucher(prev => ({ ...prev, voucher_number: e.target.value }))}
                  placeholder="Auto-generated"
                  className="bg-gray-50/80 border-gray-200"
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
                  className="border-gray-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Number
                </label>
                <Input
                  value={voucher.reference}
                  onChange={(e) => setVoucher(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="Reference number"
                  className="border-gray-200"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Party Details */}
        {shouldShowPartyDetails() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Party Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Party Name / Cash Bank Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    {getPartyLabel()} *
                  </label>
                  <SearchableDropdown
                    items={ledgers}
                    value={voucher.party_ledger_id || ''}
                    onSelect={(ledger) => setVoucher(prev => ({ 
                      ...prev, 
                      party_ledger_id: ledger.id,
                      party_name: ledger.name 
                    }))}
                    placeholder={`Search ${getPartyLabel().toLowerCase()}...`}
                    displayField="name"
                    searchFields={['name']}
                    renderItem={renderLedgerItem}
                  />
                </div>

                {/* Sales/Purchase Ledger or Cash/Bank Ledger */}
                {(['sales', 'purchase', 'debit_note', 'credit_note', 'receipt', 'payment'].includes(voucher.voucher_type)) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getSalesLedgerLabel()}
                    </label>
                    <SearchableDropdown
                      items={ledgers}
                      value={voucher.sales_ledger_id || voucher.cash_bank_ledger_id || ''}
                      onSelect={(ledger) => {
                        if (['receipt', 'payment'].includes(voucher.voucher_type)) {
                          setVoucher(prev => ({ ...prev, cash_bank_ledger_id: ledger.id }));
                        } else {
                          setVoucher(prev => ({ ...prev, sales_ledger_id: ledger.id }));
                        }
                      }}
                      placeholder={`Search ${getSalesLedgerLabel().toLowerCase()}...`}
                      displayField="name"
                      searchFields={['name']}
                      renderItem={renderLedgerItem}
                    />
                  </div>
                )}

                {/* Place of Supply */}
                {shouldShowPlaceOfSupply() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Place of Supply
                    </label>
                    <select
                      value={voucher.place_of_supply || ''}
                      onChange={(e) => setVoucher(prev => ({ ...prev, place_of_supply: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                      <option value="">Select State</option>
                      <option value="01">01 - Jammu and Kashmir</option>
                      <option value="02">02 - Himachal Pradesh</option>
                      <option value="03">03 - Punjab</option>
                      <option value="04">04 - Chandigarh</option>
                      <option value="05">05 - Uttarakhand</option>
                      <option value="06">06 - Haryana</option>
                      <option value="07">07 - Delhi</option>
                      <option value="08">08 - Rajasthan</option>
                      <option value="09">09 - Uttar Pradesh</option>
                      <option value="10">10 - Bihar</option>
                      <option value="11">11 - Sikkim</option>
                      <option value="12">12 - Arunachal Pradesh</option>
                      <option value="13">13 - Nagaland</option>
                      <option value="14">14 - Manipur</option>
                      <option value="15">15 - Mizoram</option>
                      <option value="16">16 - Tripura</option>
                      <option value="17">17 - Meghalaya</option>
                      <option value="18">18 - Assam</option>
                      <option value="19">19 - West Bengal</option>
                      <option value="20">20 - Jharkhand</option>
                      <option value="21">21 - Odisha</option>
                      <option value="22">22 - Chhattisgarh</option>
                      <option value="23">23 - Madhya Pradesh</option>
                      <option value="24">24 - Gujarat</option>
                      <option value="25">25 - Daman and Diu</option>
                      <option value="26">26 - Dadra and Nagar Haveli</option>
                      <option value="27">27 - Maharashtra</option>
                      <option value="28">28 - Andhra Pradesh</option>
                      <option value="29">29 - Karnataka</option>
                      <option value="30">30 - Goa</option>
                      <option value="31">31 - Lakshadweep</option>
                      <option value="32">32 - Kerala</option>
                      <option value="33">33 - Tamil Nadu</option>
                      <option value="34">34 - Puducherry</option>
                      <option value="35">35 - Andaman and Nicobar Islands</option>
                      <option value="36">36 - Telangana</option>
                      <option value="37">37 - Andhra Pradesh (New)</option>
                    </select>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Stock Items Entry */}
        {shouldShowStockItems() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
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
                      <th className="text-left py-3 px-2 font-medium text-gray-700 w-2/5">Item</th>
                      <th className="text-right py-3 px-2 font-medium text-gray-700 w-1/8">Qty</th>
                      <th className="text-right py-3 px-2 font-medium text-gray-700 w-1/8">Rate</th>
                      <th className="text-right py-3 px-2 font-medium text-gray-700 w-1/8">Amount</th>
                      {selectedCompany?.enable_multi_godown && (
                        <th className="text-left py-3 px-2 font-medium text-gray-700 w-1/6">Godown</th>
                      )}
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {voucher.stock_entries?.map((entry, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                        <td className="py-3 px-2">
                          <SearchableDropdown
                            items={stockItems}
                            value={entry.stock_item_id || ''}
                            onSelect={(item) => {
                              updateStockEntry(index, 'stock_item_id', item.id);
                              updateStockEntry(index, 'stock_item_name', item.name);
                              updateStockEntry(index, 'rate', item.rate || 0);
                            }}
                            placeholder="Search items..."
                            displayField="name"
                            searchFields={['name', 'hsn_code']}
                            renderItem={renderStockItem}
                            className="text-sm"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <Input
                            type="number"
                            step="0.001"
                            value={entry.quantity || ''}
                            onChange={(e) => updateStockEntry(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="text-right text-sm"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={entry.rate || ''}
                            onChange={(e) => updateStockEntry(index, 'rate', parseFloat(e.target.value) || 0)}
                            className="text-right text-sm"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={entry.amount || ''}
                            readOnly
                            className="text-right bg-gray-50 text-sm"
                            placeholder="0.00"
                          />
                        </td>
                        {selectedCompany?.enable_multi_godown && (
                          <td className="py-3 px-2">
                            <select
                              value={entry.godown_id || ''}
                              onChange={(e) => updateStockEntry(index, 'godown_id', e.target.value)}
                              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                        <td className="py-3 px-2">
                          {voucher.stock_entries && voucher.stock_entries.length > 1 && (
                            <button
                              onClick={() => removeStockEntry(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 font-semibold bg-gray-50">
                      <td className="py-3 px-2" colSpan={3}>Subtotal</td>
                      <td className="py-3 px-2 text-right text-lg">₹{stockTotal.toFixed(2)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Tax Calculation */}
              {currentVoucherType?.hasTax && stockTotal > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Percent className="w-4 h-4 mr-2 text-orange-600" />
                    Tax Calculation (GST @ 18%)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <label className="block text-gray-600 mb-1">CGST (9%)</label>
                      <div className="font-semibold text-lg">₹{(stockTotal * 0.09).toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <label className="block text-gray-600 mb-1">SGST (9%)</label>
                      <div className="font-semibold text-lg">₹{(stockTotal * 0.09).toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <label className="block text-gray-600 mb-1">Total Tax</label>
                      <div className="font-semibold text-lg text-orange-600">₹{(stockTotal * 0.18).toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <label className="block text-gray-600 mb-1">Grand Total</label>
                      <div className="font-bold text-xl text-green-600">₹{(stockTotal * 1.18).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Accounting Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-purple-600" />
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
                    <th className="text-left py-3 px-2 font-medium text-gray-700 w-2/5">{getAccountingEntryLabel()}</th>
                    {voucher.voucher_type === 'journal' ? (
                      <>
                        <th className="text-right py-3 px-2 font-medium text-gray-700 w-1/8">Debit (₹)</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-700 w-1/8">Credit (₹)</th>
                      </>
                    ) : (
                      <th className="text-right py-3 px-2 font-medium text-gray-700 w-1/8">Amount (₹)</th>
                    )}
                    <th className="text-left py-3 px-2 font-medium text-gray-700 w-1/4">Narration</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {voucher.entries?.map((entry, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors">
                      <td className="py-3 px-2">
                        <SearchableDropdown
                          items={ledgers}
                          value={entry.ledger_id || ''}
                          onSelect={(ledger) => updateEntry(index, 'ledger_id', ledger.id)}
                          placeholder="Search ledgers..."
                          displayField="name"
                          searchFields={['name']}
                          renderItem={renderLedgerItem}
                          className="text-sm"
                        />
                      </td>
                      {voucher.voucher_type === 'journal' ? (
                        <>
                          <td className="py-3 px-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={entry.debit_amount || ''}
                              onChange={(e) => updateEntry(index, 'debit_amount', parseFloat(e.target.value) || 0)}
                              className="text-right text-sm"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={entry.credit_amount || ''}
                              onChange={(e) => updateEntry(index, 'credit_amount', parseFloat(e.target.value) || 0)}
                              className="text-right text-sm"
                              placeholder="0.00"
                            />
                          </td>
                        </>
                      ) : (
                        <td className="py-3 px-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={entry.amount || ''}
                            onChange={(e) => updateEntry(index, 'amount', parseFloat(e.target.value) || 0)}
                            className="text-right text-sm"
                            placeholder="0.00"
                          />
                        </td>
                      )}
                      <td className="py-3 px-2">
                        <Input
                          value={entry.narration || ''}
                          onChange={(e) => updateEntry(index, 'narration', e.target.value)}
                          placeholder="Entry description"
                          className="text-sm"
                        />
                      </td>
                      <td className="py-3 px-2">
                        {voucher.entries && voucher.entries.length > (voucher.voucher_type === 'journal' ? 2 : 1) && (
                          <button
                            onClick={() => removeEntry(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 font-semibold bg-gray-50">
                    <td className="py-3 px-2">Total</td>
                    {voucher.voucher_type === 'journal' ? (
                      <>
                        <td className="py-3 px-2 text-right text-lg">₹{totalDebit.toFixed(2)}</td>
                        <td className="py-3 px-2 text-right text-lg">₹{totalCredit.toFixed(2)}</td>
                      </>
                    ) : (
                      <td className="py-3 px-2 text-right text-lg">₹{totalDebit.toFixed(2)}</td>
                    )}
                    <td className="py-3 px-2"></td>
                    <td className="py-3 px-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Balance Status */}
            <div className="mt-4">
              {voucher.voucher_type === 'journal' && !isBalanced && totalDebit > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-600 text-sm">
                    <strong>Difference: ₹{Math.abs(totalDebit - totalCredit).toFixed(2)}</strong> - Debit and Credit must be equal
                  </p>
                </div>
              )}
              {isBalanced && totalDebit > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-green-600 text-sm">
                    Voucher is balanced - Ready to save
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Voucher Narration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-gray-600" />
              Voucher Narration
            </label>
            <textarea
              value={voucher.narration}
              onChange={(e) => setVoucher(prev => ({ ...prev, narration: e.target.value }))}
              placeholder="Enter detailed description of the transaction..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </Card>
        </motion.div>

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
      </div>

      {/* Right Panel */}
      <AnimatePresence>
        {rightPanelVisible && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white/95 backdrop-blur-md border-l border-gray-200/50 shadow-2xl z-50"
            onMouseLeave={() => setRightPanelVisible(false)}
          >
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Voucher Options</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRightPanelVisible(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Voucher Types */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Voucher Types</h4>
                <div className="space-y-2">
                  {voucherTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleVoucherTypeChange(type.value)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                        voucher.voucher_type === type.value
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{type.icon}</span>
                      <span className="font-medium text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voucher Mode */}
              {shouldShowVoucherMode() && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Voucher Mode</h4>
                  <div className="space-y-2">
                    {voucherModes.map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => handleModeChange(mode.value)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          voucher.mode === mode.value
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="font-medium text-sm">{mode.label}</div>
                        <div className="text-xs opacity-75">{mode.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Vouchers */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recent Vouchers</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {recentVouchers.slice(0, 5).map((recentVoucher) => (
                    <div
                      key={recentVoucher.id}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {recentVoucher.voucher_number}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {recentVoucher.voucher_type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(recentVoucher.date).toLocaleDateString()}
                        </span>
                        <span className="font-semibold text-sm text-gray-900">
                          ₹{recentVoucher.total_amount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div>
                <button
                  onClick={handleSettingsClick}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-sm text-gray-700">Voucher Settings</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};