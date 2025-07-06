import React, { useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Package, Percent } from 'lucide-react';
import { SearchableDropdown } from './SearchableDropdown';
import { NumericInput } from './NumericInput';

interface StockItemsEntryProps {
  voucher: any;
  onVoucherChange: (voucher: any) => void;
  stockItems: any[];
  godowns: any[];
  selectedCompany: any;
}

export const StockItemsEntry: React.FC<StockItemsEntryProps> = ({
  voucher,
  onVoucherChange,
  stockItems,
  godowns,
  selectedCompany
}) => {
  // Initialize with one empty row if no entries exist
  useEffect(() => {
    if (!voucher.stock_entries || voucher.stock_entries.length === 0) {
      onVoucherChange(prev => ({
        ...prev,
        stock_entries: [{ 
          stock_item_id: '', 
          stock_item_name: '',
          quantity: 0, 
          rate: 0, 
          amount: 0,
          godown_id: ''
        }]
      }));
    }
  }, []);

  const updateStockEntry = (index: number, field: string, value: any) => {
    const updatedEntries = [...(voucher.stock_entries || [])];
    
    if (!updatedEntries[index]) {
      updatedEntries[index] = { 
        stock_item_id: '', 
        stock_item_name: '',
        quantity: 0, 
        rate: 0, 
        amount: 0,
        godown_id: ''
      };
    }

    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    
    // Auto-calculate amount when quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      updatedEntries[index].amount = (updatedEntries[index].quantity || 0) * (updatedEntries[index].rate || 0);
    }

    onVoucherChange(prev => ({ ...prev, stock_entries: updatedEntries }));

    // Auto-add new row if current row has item selected and this is the last row
    if (field === 'stock_item_id' && value && index === updatedEntries.length - 1) {
      addNewRow();
    }
  };

  const addNewRow = () => {
    const newEntry = { 
      stock_item_id: '', 
      stock_item_name: '',
      quantity: 0, 
      rate: 0, 
      amount: 0,
      godown_id: ''
    };
    
    onVoucherChange(prev => ({
      ...prev,
      stock_entries: [...(prev.stock_entries || []), newEntry]
    }));
  };

  const removeStockEntry = (index: number) => {
    if (voucher.stock_entries && voucher.stock_entries.length > 1) {
      onVoucherChange(prev => ({
        ...prev,
        stock_entries: prev.stock_entries.filter((_, i) => i !== index)
      }));
    }
  };

  const handleItemSelect = (index: number, item: any) => {
    updateStockEntry(index, 'stock_item_id', item.id);
    updateStockEntry(index, 'stock_item_name', item.name);
    updateStockEntry(index, 'rate', item.rate || 0);
  };

  const renderStockItem = (item: any) => (
    <div>
      <div className="font-medium text-gray-900">{item.name}</div>
      <div className="text-sm text-gray-500">
        Stock: {item.current_stock} {item.units?.symbol} • Rate: ₹{item.rate}
        {item.hsn_code && ` • HSN: ${item.hsn_code}`}
      </div>
    </div>
  );

  const stockTotal = voucher.stock_entries?.reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0;
  const hasGST = ['sales', 'purchase'].includes(voucher.voucher_type);

  return (
    <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Package className="w-5 h-5 mr-2 text-blue-600" />
          Stock Items
        </h3>
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
                    onSelect={(item) => handleItemSelect(index, item)}
                    placeholder="Search items..."
                    displayField="name"
                    searchFields={['name', 'hsn_code']}
                    renderItem={renderStockItem}
                    className="text-sm"
                  />
                </td>
                <td className="py-3 px-2">
                  <NumericInput
                    value={entry.quantity || 0}
                    onChange={(value) => updateStockEntry(index, 'quantity', value)}
                    step={0.001}
                    placeholder="0"
                    className="text-sm"
                  />
                </td>
                <td className="py-3 px-2">
                  <NumericInput
                    value={entry.rate || 0}
                    onChange={(value) => updateStockEntry(index, 'rate', value)}
                    step={0.01}
                    placeholder="0.00"
                    className="text-sm"
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
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
      {hasGST && stockTotal > 0 && (
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
  );
};