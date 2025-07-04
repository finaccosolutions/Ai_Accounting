import React, { useState } from 'react';
import { Plus, Save, FileText, Calculator, Bot, Search } from 'lucide-react';
import { Button } from '../ui/Button';

const voucherTypes = [
  { id: 'sales', label: 'Sales', icon: '📈' },
  { id: 'purchase', label: 'Purchase', icon: '📦' },
  { id: 'receipt', label: 'Receipt', icon: '💰' },
  { id: 'payment', label: 'Payment', icon: '💳' },
  { id: 'journal', label: 'Journal', icon: '📊' },
  { id: 'contra', label: 'Contra', icon: '🔄' },
  { id: 'debit_note', label: 'Debit Note', icon: '📋' },
  { id: 'credit_note', label: 'Credit Note', icon: '📄' },
];

export const VoucherEntry: React.FC = () => {
  const [activeVoucherType, setActiveVoucherType] = useState('sales');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [voucherData, setVoucherData] = useState({
    date: new Date().toISOString().split('T')[0],
    number: 'SV-001',
    reference: '',
    narration: '',
    party: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
  });

  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;
    
    // Simulate AI processing
    setShowAIAssistant(true);
    
    // Mock AI response - in real app, this would call Gemini API
    const mockResponse = {
      party: 'ABC Corporation',
      items: [
        { description: 'Air Conditioner', quantity: 5, rate: 10000, amount: 50000 }
      ],
      narration: 'Sale of 5 Air Conditioners to ABC Corporation'
    };
    
    setTimeout(() => {
      setVoucherData(prev => ({
        ...prev,
        ...mockResponse
      }));
      setShowAIAssistant(false);
    }, 2000);
  };

  const calculateTotal = () => {
    return voucherData.items.reduce((total, item) => total + item.amount, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voucher Entry</h1>
          <p className="text-gray-600">Create vouchers manually or with AI assistance</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" icon={Search}>
            Search Vouchers
          </Button>
          <Button icon={Plus}>
            New Voucher
          </Button>
        </div>
      </div>

      {/* Voucher Type Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Voucher Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {voucherTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveVoucherType(type.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                activeVoucherType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <div className="font-medium text-gray-900">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* AI Assistant */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
            <p className="text-sm text-gray-600">Describe your transaction in natural language</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="e.g., 'Add a sales voucher for 5 items of AC to ABC Ltd at ₹10,000 each'"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button 
              onClick={handleAIQuery}
              loading={showAIAssistant}
              icon={Bot}
            >
              Process with AI
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Example commands:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>• "Record a ₹15,000 payment to Rent A/C via bank"</div>
              <div>• "Create purchase bill from XYZ Corp for ₹25,000"</div>
              <div>• "Journal entry: Dr. Salary ₹50,000, Cr. Bank ₹50,000"</div>
              <div>• "Sales invoice to ABC Ltd for 10 laptops at ₹40,000 each"</div>
            </div>
          </div>
        </div>
      </div>

      {/* Voucher Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {voucherTypes.find(t => t.id === activeVoucherType)?.label} Voucher
          </h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Voucher No:</span>
            <input
              type="text"
              value={voucherData.number}
              onChange={(e) => setVoucherData(prev => ({ ...prev, number: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded w-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={voucherData.date}
              onChange={(e) => setVoucherData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
            <input
              type="text"
              value={voucherData.reference}
              onChange={(e) => setVoucherData(prev => ({ ...prev, reference: e.target.value }))}
              placeholder="Reference number (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Party</label>
          <input
            type="text"
            value={voucherData.party}
            onChange={(e) => setVoucherData(prev => ({ ...prev, party: e.target.value }))}
            placeholder="Select or enter party name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Items</h4>
            <Button variant="outline" size="sm" icon={Plus}>
              Add Item
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rate</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {voucherData.items.map((item, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...voucherData.items];
                          newItems[index].description = e.target.value;
                          setVoucherData(prev => ({ ...prev, items: newItems }));
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...voucherData.items];
                          newItems[index].quantity = Number(e.target.value);
                          newItems[index].amount = newItems[index].quantity * newItems[index].rate;
                          setVoucherData(prev => ({ ...prev, items: newItems }));
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => {
                          const newItems = [...voucherData.items];
                          newItems[index].rate = Number(e.target.value);
                          newItems[index].amount = newItems[index].quantity * newItems[index].rate;
                          setVoucherData(prev => ({ ...prev, items: newItems }));
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Narration</label>
          <textarea
            value={voucherData.narration}
            onChange={(e) => setVoucherData(prev => ({ ...prev, narration: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Description of the transaction"
          />
        </div>

        {/* Total */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-900">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-600">{formatCurrency(calculateTotal())}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Button variant="outline">
            Save as Draft
          </Button>
          <Button icon={Save}>
            Post Voucher
          </Button>
        </div>
      </div>
    </div>
  );
};