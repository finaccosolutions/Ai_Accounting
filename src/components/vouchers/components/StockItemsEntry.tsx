import React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Package, Plus, Trash2, Percent } from 'lucide-react';

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
  const addStockEntry = () => {
    onVoucherChange(prev => ({
      ...prev,
      stock_entries: [...(prev.stock_entries || []), { 
        stock_item_id: '', 
        quantity: 0, 
        rate: 0, 
        amount: 0 
      }]
    }));
  };

  const removeStockEntry = (index: number) => {
    onVoucherChange(prev => ({
      ...prev,
      stock_entries: prev.stock_entries?.filter((_, i) => i !== index) || []
    }));
  };

  const updateStockEntry = (index: number, field: string, value: any) => {
    onVoucherChange(prev => ({
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

  const stockTotal = voucher.stock_entries?.reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0;
  const hasGST = ['sales', 'purchase'].includes(voucher.voucher_type);

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Package className="w-5 h-5 mr-2 text-blue-600" />
          Stock Items
        </h3>
        <Button size="sm" onClick={addStockEntry} className="bg-gradient-to-r from-blue-500 to-blue-600">
          <Plus className="w-4 h-4 mr-1" />
          Add Item
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-3 font-medium text-gray-700">Item</th>
              <th className="text-right py-3 px-3 font-medium text-gray-700">Qty</th>
              <th className="text-right py-3 px-3 font-medium text-gray-700">Rate</th>
              <th className="text-right py-3 px-3 font-medium text-gray-700">Amount</th>
              {selectedCompany?.enable_multi_godown && (
                <th className="text-left py-3 px-3 font-medium text-gray-700">Godown</th>
              )}
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {voucher.stock_entries?.map((entry, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                <td className="py-3 px-3">
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
                <td className="py-3 px-3">
                  <Input
                    type="number"
                    step="0.001"
                    value={entry.quantity || ''}
                    onChange={(e) => updateStockEntry(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="text-right"
                  />
                </td>
                <td className="py-3 px-3">
                  <Input
                    type="number"
                    step="0.01"
                    value={entry.rate || ''}
                    onChange={(e) => updateStockEntry(index, 'rate', parseFloat(e.target.value) || 0)}
                    className="text-right"
                  />
                </td>
                <td className="py-3 px-3">
                  <Input
                    type="number"
                    step="0.01"
                    value={entry.amount || ''}
                    readOnly
                    className="text-right bg-gray-50"
                  />
                </td>
                {selectedCompany?.enable_multi_godown && (
                  <td className="py-3 px-3">
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
                <td className="py-3 px-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeStockEntry(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300 font-semibold bg-gray-50">
              <td className="py-3 px-3" colSpan={3}>Subtotal</td>
              <td className="py-3 px-3 text-right text-lg">₹{stockTotal.toFixed(2)}</td>
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