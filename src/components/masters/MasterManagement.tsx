// src/components/masters/MasterManagement.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { GeminiAI } from '../../lib/gemini';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Database,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Bot,
  Sparkles,
  Building2,
  Package,
  Users,
  Calculator,
  Tag,
  Warehouse,
  Receipt,
  CheckSquare,
  Square,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Ledger, LedgerGroup, StockItem, StockGroup, Unit, Godown } from '../../types';
import { SearchableDropdown } from '../vouchers/SearchableDropdown'; // Re-using SearchableDropdown
import { LedgerForm } from './LedgerForm'; // Import LedgerForm

const masterTypes = [
  {
    id: 'ledgers',
    name: 'Ledgers',
    icon: Calculator,
    color: 'from-blue-500 to-blue-600',
    description: 'Chart of accounts and ledger management'
  },
  {
    id: 'ledger_groups',
    name: 'Ledger Groups',
    icon: Database,
    color: 'from-green-500 to-green-600',
    description: 'Organize ledgers into groups'
  },
  {
    id: 'stock_items',
    name: 'Stock Items',
    icon: Package,
    color: 'from-purple-500 to-purple-600',
    description: 'Inventory items and products'
  },
  {
    id: 'stock_groups',
    name: 'Stock Groups',
    icon: Tag,
    color: 'from-orange-500 to-orange-600',
    description: 'Categorize stock items'
  },
  {
    id: 'units',
    name: 'Units',
    icon: Receipt,
    color: 'from-teal-500 to-teal-600',
    description: 'Units of measurement'
  },
  {
    id: 'godowns',
    name: 'Godowns',
    icon: Warehouse,
    color: 'from-indigo-500 to-indigo-600',
    description: 'Storage locations'
  }
];

export const MasterManagement: React.FC = () => {
  const { selectedCompany } = useApp();
  const [selectedMaster, setSelectedMaster] = useState('ledgers');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [aiCommand, setAiCommand] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);

  // Data for dropdowns in MasterForm
  const [allLedgerGroups, setAllLedgerGroups] = useState<LedgerGroup[]>([]);
  const [allStockGroups, setAllStockGroups] = useState<StockGroup[]>([]);
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [allLedgers, setAllLedgers] = useState<Ledger[]>([]); // For parent ledger groups

  const gemini = new GeminiAI(import.meta.env.VITE_GEMINI_API_KEY);

  useEffect(() => {
    if (selectedCompany) {
      fetchMasterDataForDropdowns();
      fetchData();
    }
  }, [selectedCompany, selectedMaster]);

  const fetchMasterDataForDropdowns = async () => {
    if (!selectedCompany) return;
    try {
      const { data: lgData, error: lgError } = await supabase
        .from('ledger_groups')
        .select('*')
        .eq('company_id', selectedCompany.id);
      if (lgError) throw lgError;
      setAllLedgerGroups(lgData || []);

      const { data: sgData, error: sgError } = await supabase
        .from('stock_groups')
        .select('*')
        .eq('company_id', selectedCompany.id);
      if (sgError) throw sgError;
      setAllStockGroups(sgData || []);

      const { data: uData, error: uError } = await supabase
        .from('units')
        .select('*')
        .eq('company_id', selectedCompany.id);
      if (uError) throw uError;
      setAllUnits(uData || []);

      const { data: lData, error: lError } = await supabase
        .from('ledgers')
        .select('id, name')
        .eq('company_id', selectedCompany.id);
      if (lError) throw lError;
      setAllLedgers(lData || []);

    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      toast.error('Failed to fetch dropdown data');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let query;
      if (selectedMaster === 'ledgers') {
        query = supabase.from(selectedMaster).select(`*, ledger_groups(name, group_type)`);
      } else if (selectedMaster === 'stock_items') {
        query = supabase.from(selectedMaster).select(`*, stock_groups(name), units(name, symbol)`);
      } else {
        query = supabase.from(selectedMaster).select('*');
      }

      if (selectedMaster !== 'units') { // Units can be global or company-specific
        query = query.eq('company_id', selectedCompany?.id);
      }

      const { data: result, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAiCommand = async () => {
    if (!aiCommand.trim()) return;

    setAiProcessing(true);
    try {
      const prompt = `
        Create a ${selectedMaster.slice(0, -1)} based on this command: "${aiCommand}"

        Respond with JSON containing the fields needed for ${selectedMaster}:
        ${selectedMaster === 'ledgers' ? '- name, group_id (optional), opening_balance (default 0), is_active (boolean)' : ''}
        ${selectedMaster === 'ledger_groups' ? '- name, group_type (assets/liabilities/income/expenses), parent_group_id (optional)' : ''}
        ${selectedMaster === 'stock_items' ? '- name, group_id (optional), unit_id (optional), rate (default 0), opening_stock (default 0), hsn_code (optional), is_active (boolean)' : ''}
        ${selectedMaster === 'stock_groups' ? '- name, parent_group_id (optional)' : ''}
        ${selectedMaster === 'units' ? '- name, symbol' : ''}
        ${selectedMaster === 'godowns' ? '- name, address (optional), is_active (boolean)' : ''}

        Only respond with valid JSON, no additional text.
      `;

      const response = await gemini.generateContent(prompt);
      const result = JSON.parse(response);

      if (result) {
        setEditingItem({ ...result, company_id: selectedCompany?.id });
        setShowForm(true);
        setAiCommand('');
        toast.success('AI suggestion ready for review!');
      }
    } catch (error) {
      console.error('AI processing error:', error);
      toast.error('Could not process AI command. Please try again.');
    } finally {
      setAiProcessing(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (editingItem?.id) {
        // Update existing
        const { error } = await supabase
          .from(selectedMaster)
          .update(formData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Updated successfully!');
      } else {
        // Create new
        const { error } = await supabase
          .from(selectedMaster)
          .insert([{ ...formData, company_id: selectedCompany?.id }]);

        if (error) throw error;
        toast.success('Created successfully!');
      }

      setShowForm(false);
      setEditingItem(null);
      fetchData();
      fetchMasterDataForDropdowns(); // Refresh dropdown data after save
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from(selectedMaster)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Deleted successfully!');
      fetchData();
      fetchMasterDataForDropdowns(); // Refresh dropdown data after delete
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    }
  };

  const filteredData = data.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMaster = masterTypes.find(m => m.id === selectedMaster);

  // Render LedgerForm directly if showForm is true and selectedMaster is 'ledgers'
  if (showForm && selectedMaster === 'ledgers') {
    return (
      <LedgerForm
        masterType={selectedMaster}
        editingItem={editingItem}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingItem(null);
        }}
        allLedgerGroups={allLedgerGroups}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Management</h1>
          <p className="text-gray-600">Manage your accounting and inventory masters</p>
        </div>
      </div>

      {/* AI Assistant */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Master Creator</h3>
            <p className="text-sm text-gray-600">Create masters using natural language</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <input
            type="text"
            value={aiCommand}
            onChange={(e) => setAiCommand(e.target.value)}
            placeholder={`e.g., 'Create a ledger for Office Rent under Expenses'`}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleAiCommand()}
          />
          <Button
            onClick={handleAiCommand}
            disabled={aiProcessing || !aiCommand.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-600"
          >
            {aiProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Master Type Selection */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Master Types</h3>
            <div className="space-y-2">
              {masterTypes.map((master) => {
                const Icon = master.icon;
                return (
                  <motion.button
                    key={master.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMaster(master.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedMaster === master.id
                        ? `bg-gradient-to-r ${master.color} text-white shadow-lg`
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <p className="font-medium text-sm">{master.name}</p>
                        <p className={`text-xs ${
                          selectedMaster === master.id ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {master.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Data Table */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {currentMaster && <currentMaster.icon className="w-6 h-6 text-gray-600" />}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentMaster?.name}</h3>
                  <p className="text-sm text-gray-600">{currentMaster?.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <Button
                  onClick={() => {
                    setEditingItem(null);
                    setShowForm(true);
                  }}
                  className="bg-gradient-to-r from-green-500 to-green-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                      {selectedMaster === 'ledgers' && (
                        <>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Group</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Opening Balance</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Current Balance</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">Active</th>
                        </>
                      )}
                      {selectedMaster === 'ledger_groups' && (
                        <>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Parent Group</th>
                        </>
                      )}
                      {selectedMaster === 'stock_items' && (
                        <>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Group</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Unit</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Rate</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Stock</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">HSN</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">Active</th>
                        </>
                      )}
                      {selectedMaster === 'stock_groups' && (
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Parent Group</th>
                      )}
                      {selectedMaster === 'units' && (
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Symbol</th>
                      )}
                      {selectedMaster === 'godowns' && (
                        <>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Address</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">Active</th>
                        </>
                      )}
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                        {selectedMaster === 'ledgers' && (
                          <>
                            <td className="py-3 px-4">{item.ledger_groups?.name || 'N/A'}</td>
                            <td className="py-3 px-4 text-right">₹{item.opening_balance?.toFixed(2) || '0.00'}</td>
                            <td className="py-3 px-4 text-right">₹{item.current_balance?.toFixed(2) || '0.00'}</td>
                            <td className="py-3 px-4 text-center">
                              {item.is_active ? <CheckSquare className="w-5 h-5 text-green-500 mx-auto" /> : <Square className="w-5 h-5 text-gray-400 mx-auto" />}
                            </td>
                          </>
                        )}
                        {selectedMaster === 'ledger_groups' && (
                          <>
                            <td className="py-3 px-4 capitalize">{item.group_type}</td>
                            <td className="py-3 px-4">{allLedgerGroups.find(g => g.id === item.parent_group_id)?.name || 'N/A'}</td>
                          </>
                        )}
                        {selectedMaster === 'stock_items' && (
                          <>
                            <td className="py-3 px-4">{item.stock_groups?.name || 'N/A'}</td>
                            <td className="py-3 px-4">{item.units?.symbol || 'N/A'}</td>
                            <td className="py-3 px-4 text-right">₹{item.rate?.toFixed(2) || '0.00'}</td>
                            <td className="py-3 px-4 text-right">{item.current_stock?.toFixed(2) || '0.00'}</td>
                            <td className="py-3 px-4">{item.hsn_code || 'N/A'}</td>
                            <td className="py-3 px-4 text-center">
                              {item.is_active ? <CheckSquare className="w-5 h-5 text-green-500 mx-auto" /> : <Square className="w-5 h-5 text-gray-400 mx-auto" />}
                            </td>
                          </>
                        )}
                        {selectedMaster === 'stock_groups' && (
                          <td className="py-3 px-4">{allStockGroups.find(g => g.id === item.parent_group_id)?.name || 'N/A'}</td>
                        )}
                        {selectedMaster === 'units' && (
                          <td className="py-3 px-4">{item.symbol}</td>
                        )}
                        {selectedMaster === 'godowns' && (
                          <>
                            <td className="py-3 px-4">{item.address || 'N/A'}</td>
                            <td className="py-3 px-4 text-center">
                              {item.is_active ? <CheckSquare className="w-5 h-5 text-green-500 mx-auto" /> : <Square className="w-5 h-5 text-gray-400 mx-auto" />}
                            </td>
                          </>
                        )}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingItem(item);
                                setShowForm(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredData.length === 0 && (
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No {currentMaster?.name.toLowerCase()} found</p>
                    <Button
                      onClick={() => {
                        setEditingItem(null);
                        setShowForm(true);
                      }}
                      className="mt-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First {currentMaster?.name.slice(0, -1)}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Original MasterForm content (for other master types) */}
      {/* This section will only be rendered if showForm is true AND selectedMaster is NOT 'ledgers' */}
      <AnimatePresence>
        {showForm && selectedMaster !== 'ledgers' && (
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
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <MasterForm
                masterType={selectedMaster}
                editingItem={editingItem}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
                allLedgerGroups={allLedgerGroups}
                allStockGroups={allStockGroups}
                allUnits={allUnits}
                allLedgers={allLedgers}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Master Form Component (Original, kept for other master types)
interface MasterFormProps {
  masterType: string;
  editingItem: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  allLedgerGroups: LedgerGroup[];
  allStockGroups: StockGroup[];
  allUnits: Unit[];
  allLedgers: Ledger[];
}

const MasterForm: React.FC<MasterFormProps> = ({
  masterType,
  editingItem,
  onSave,
  onCancel,
  allLedgerGroups,
  allStockGroups,
  allUnits,
  allLedgers
}) => {
  const [formData, setFormData] = useState(editingItem || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderLedgerGroupItem = (item: LedgerGroup) => (
    <div className="flex items-center justify-between">
      <span className="font-medium">{item.name}</span>
      <span className="text-xs text-gray-500 capitalize">{item.group_type}</span>
    </div>
  );

  const renderStockGroupItem = (item: StockGroup) => (
    <div className="font-medium">{item.name}</div>
  );

  const renderUnitItem = (item: Unit) => (
    <div className="flex items-center justify-between">
      <span className="font-medium">{item.name}</span>
      <span className="text-xs text-gray-500">{item.symbol}</span>
    </div>
  );

  const renderLedgerItem = (item: Ledger) => (
    <div className="font-medium">{item.name}</div>
  );

  const renderFormFields = () => {
    switch (masterType) {
      case 'ledgers':
        return (
          <>
            <Input
              label="Ledger Name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Cash, Sales Account"
              required
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Group *
              </label>
              <SearchableDropdown
                items={allLedgerGroups}
                value={formData.group_id || ''}
                onSelect={(item) => setFormData(prev => ({ ...prev, group_id: item.id }))}
                placeholder="Search ledger group..."
                displayField="name"
                searchFields={['name', 'group_type']}
                renderItem={renderLedgerGroupItem}
              />
            </div>
            <Input
              label="Opening Balance"
              type="number"
              step="0.01"
              value={formData.opening_balance || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, opening_balance: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
            />
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active ?? true}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Is Active</span>
            </label>
          </>
        );

      case 'ledger_groups':
        return (
          <>
            <Input
              label="Group Name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Current Assets, Direct Expenses"
              required
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Group Type *
              </label>
              <select
                value={formData.group_type || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, group_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                required
              >
                <option value="">Select Type</option>
                <option value="assets">Assets</option>
                <option value="liabilities">Liabilities</option>
                <option value="income">Income</option>
                <option value="expenses">Expenses</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Parent Group (Optional)
              </label>
              <SearchableDropdown
                items={allLedgerGroups.filter(g => g.id !== formData.id)} // Prevent self-selection
                value={formData.parent_group_id || ''}
                onSelect={(item) => setFormData(prev => ({ ...prev, parent_group_id: item.id }))}
                placeholder="Search parent group..."
                displayField="name"
                searchFields={['name', 'group_type']}
                renderItem={renderLedgerGroupItem}
              />
            </div>
          </>
        );

      case 'stock_items':
        return (
          <>
            <Input
              label="Item Name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Laptop, Printer"
              required
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Group (Optional)
              </label>
              <SearchableDropdown
                items={allStockGroups}
                value={formData.group_id || ''}
                onSelect={(item) => setFormData(prev => ({ ...prev, group_id: item.id }))}
                placeholder="Search stock group..."
                displayField="name"
                searchFields={['name']}
                renderItem={renderStockGroupItem}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Unit *
              </label>
              <SearchableDropdown
                items={allUnits}
                value={formData.unit_id || ''}
                onSelect={(item) => setFormData(prev => ({ ...prev, unit_id: item.id }))}
                placeholder="Search unit..."
                displayField="name"
                searchFields={['name', 'symbol']}
                renderItem={renderUnitItem}
                required
              />
            </div>
            <Input
              label="Rate"
              type="number"
              step="0.01"
              value={formData.rate || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
            />
            <Input
              label="Opening Stock"
              type="number"
              step="0.001"
              value={formData.opening_stock || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, opening_stock: parseFloat(e.target.value) || 0 }))}
              placeholder="0.000"
            />
            <Input
              label="HSN Code (Optional)"
              value={formData.hsn_code || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, hsn_code: e.target.value }))}
              placeholder="e.g., 8471"
            />
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active ?? true}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Is Active</span>
            </label>
          </>
        );

      case 'stock_groups':
        return (
          <>
            <Input
              label="Group Name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Electronics, Furniture"
              required
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Parent Group (Optional)
              </label>
              <SearchableDropdown
                items={allStockGroups.filter(g => g.id !== formData.id)} // Prevent self-selection
                value={formData.parent_group_id || ''}
                onSelect={(item) => setFormData(prev => ({ ...prev, parent_group_id: item.id }))}
                placeholder="Search parent group..."
                displayField="name"
                searchFields={['name']}
                renderItem={renderStockGroupItem}
              />
            </div>
          </>
        );

      case 'units':
        return (
          <>
            <Input
              label="Unit Name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Kilograms, Pieces"
              required
            />
            <Input
              label="Symbol"
              value={formData.symbol || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
              placeholder="e.g., Kg, Pcs"
              required
            />
          </>
        );

      case 'godowns':
        return (
          <>
            <Input
              label="Godown Name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Main Warehouse, Store A"
              required
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address (Optional)
              </label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Full address of the godown"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active ?? true}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Is Active</span>
            </label>
          </>
        );

      default:
        return (
          <Input
            label="Name"
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {editingItem ? 'Edit' : 'Create'} {masterType.replace('_', ' ').replace(/s$/, '')}
      </h3>

      {renderFormFields()}

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {editingItem ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

