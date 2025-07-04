import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Building, Package, Users, Tags } from 'lucide-react';
import { Button } from '../ui/Button';

const masterTypes = [
  { id: 'ledgers', label: 'Ledgers', icon: Building, count: 156 },
  { id: 'stock_items', label: 'Stock Items', icon: Package, count: 89 },
  { id: 'ledger_groups', label: 'Ledger Groups', icon: Users, count: 23 },
  { id: 'stock_groups', label: 'Stock Groups', icon: Tags, count: 15 },
];

const sampleLedgers = [
  { id: '1', name: 'ABC Corporation', group: 'Sundry Debtors', type: 'asset', balance: 125000 },
  { id: '2', name: 'XYZ Industries', group: 'Sundry Debtors', type: 'asset', balance: 98000 },
  { id: '3', name: 'Office Rent', group: 'Indirect Expenses', type: 'expense', balance: 45000 },
  { id: '4', name: 'Sales Account', group: 'Sales Accounts', type: 'income', balance: 2500000 },
  { id: '5', name: 'Bank of India', group: 'Bank Accounts', type: 'asset', balance: 850000 },
];

const sampleStockItems = [
  { id: '1', name: 'Air Conditioner - 1.5 Ton', group: 'Electronics', unit: 'Nos', stock: 45, rate: 35000 },
  { id: '2', name: 'Laptop - Dell Inspiron', group: 'Computers', unit: 'Nos', stock: 23, rate: 45000 },
  { id: '3', name: 'Office Chair - Executive', group: 'Furniture', unit: 'Nos', stock: 67, rate: 8500 },
  { id: '4', name: 'Printer - HP LaserJet', group: 'Electronics', unit: 'Nos', stock: 12, rate: 15000 },
  { id: '5', name: 'Mobile Phone - Samsung', group: 'Electronics', unit: 'Nos', stock: 89, rate: 25000 },
];

export const MasterManagement: React.FC = () => {
  const [activeMasterType, setActiveMasterType] = useState('ledgers');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderLedgersList = () => (
    <div className="space-y-2">
      {sampleLedgers.map((ledger) => (
        <div key={ledger.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="font-medium text-gray-900">{ledger.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  ledger.type === 'asset' ? 'bg-blue-100 text-blue-800' :
                  ledger.type === 'liability' ? 'bg-red-100 text-red-800' :
                  ledger.type === 'income' ? 'bg-green-100 text-green-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {ledger.type}
                </span>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <p className="text-sm text-gray-600">Group: {ledger.group}</p>
                <p className="text-sm font-medium text-gray-900">Balance: {formatCurrency(ledger.balance)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" icon={Edit}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" icon={Trash2} className="text-red-600 hover:text-red-700">
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStockItemsList = () => (
    <div className="space-y-2">
      {sampleStockItems.map((item) => (
        <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {item.group}
                </span>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <p className="text-sm text-gray-600">Unit: {item.unit}</p>
                <p className="text-sm text-gray-600">Stock: {item.stock}</p>
                <p className="text-sm font-medium text-gray-900">Rate: {formatCurrency(item.rate)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" icon={Edit}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" icon={Trash2} className="text-red-600 hover:text-red-700">
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Management</h1>
          <p className="text-gray-600">Manage ledgers, stock items, and other masters</p>
        </div>
        <Button icon={Plus} onClick={() => setShowCreateForm(true)}>
          Create New Master
        </Button>
      </div>

      {/* Master Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {masterTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setActiveMasterType(type.id)}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                activeMasterType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">{type.count}</span>
              </div>
              <h3 className="font-medium text-gray-900">{type.label}</h3>
            </button>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search masters..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button variant="outline" icon={Filter}>
          Filter
        </Button>
      </div>

      {/* Master List */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {masterTypes.find(t => t.id === activeMasterType)?.label}
          </h3>
          <div className="flex items-center space-x-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>All Groups</option>
              <option>Sundry Debtors</option>
              <option>Sundry Creditors</option>
              <option>Bank Accounts</option>
              <option>Expenses</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Sort by Name</option>
              <option>Sort by Balance</option>
              <option>Sort by Group</option>
            </select>
          </div>
        </div>

        {activeMasterType === 'ledgers' && renderLedgersList()}
        {activeMasterType === 'stock_items' && renderStockItemsList()}
        {activeMasterType === 'ledger_groups' && (
          <div className="text-center py-8">
            <p className="text-gray-600">Ledger Groups management coming soon...</p>
          </div>
        )}
        {activeMasterType === 'stock_groups' && (
          <div className="text-center py-8">
            <p className="text-gray-600">Stock Groups management coming soon...</p>
          </div>
        )}
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Master</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Master Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Ledger</option>
                  <option>Stock Item</option>
                  <option>Ledger Group</option>
                  <option>Stock Group</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter master name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Select group</option>
                  <option>Sundry Debtors</option>
                  <option>Sundry Creditors</option>
                  <option>Bank Accounts</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-4 mt-6">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreateForm(false)}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};