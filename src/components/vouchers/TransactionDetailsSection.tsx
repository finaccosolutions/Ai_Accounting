import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { NumberInput } from '../ui/NumberInput';
import { Input } from '../ui/Input';
import { Package, Plus, Trash2, Percent, DollarSign, Calculator } from 'lucide-react';
import { SearchableDropdown } from './SearchableDropdown';

interface TransactionDetailsSectionProps {
  voucher: any;
  setVoucher: (updater: (prev: any) => any) => void;
  stockItems: any[];
  godowns: any[];
  ledgers: any[];
  selectedCompany: any;
  shouldShowTransactionDetails: () => boolean;
  renderStockItem: (item: any) => React.ReactNode;
  renderLedgerItem: (ledger: any) => React.ReactNode;
  addStockEntry: () => void;
  removeStockEntry: (index: number) => void;
  updateStockEntry: (index: number, field: string, value: any) => void;
  stockTotal: number;
  currentVoucherType: any;
  getSalesLedgerLabel: () => string;
}

export const TransactionDetailsSection: React.FC<TransactionDetailsSectionProps> = ({
  voucher,
  setVoucher,
  stockItems,
  godowns,
  ledgers,
  selectedCompany,
  shouldShowTransactionDetails,
  renderStockItem,
  renderLedgerItem,
  addStockEntry,
  removeStockEntry,
  updateStockEntry,
  stockTotal,
  currentVoucherType,
  getSalesLedgerLabel
}) => {
  if (!shouldShowTransactionDetails()) return null;

  const handleStockEntryChange = (index: number, field: string, value: any) => {
    updateStockEntry(index, field, value);
    
    // Auto-add new row if this is the last row and user entered data
    if (index === voucher.stock_entries.length - 1 && value && field !== 'amount') {
      const hasData = voucher.stock_entries[index].stock_item_id || 
                     voucher.stock_entries[index].quantity || 
                     voucher.stock_entries[index].rate;
      
      if (hasData) {
        addStockEntry();
      }
    }
  };

  const handleCommonLedgerChange = (checked: boolean) => {
    setVoucher(prev => ({ 
      ...prev, 
      use_common_ledger: checked,
      // Clear individual ledgers if switching to common
      stock_entries: checked ? prev.stock_entries?.map(entry => ({
        ...entry,
        individual_ledger_id: undefined
      })) : prev.stock_entries
    }));
  };

  return (
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
            Transaction Details
          </h3>
        </div>

        {/* Common Ledger Section */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Calculator className="w-4 h-4 mr-2 text-blue-600" />
              Ledger Configuration
            </h4>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={voucher.use_common_ledger ?? true}
                onChange={(e) => handleCommonLedgerChange(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Use Common {getSalesLedgerLabel()}</span>
            </label>
          </div>

          {voucher.use_common_ledger !== false && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getSalesLedgerLabel()}
                </label>
                <SearchableDropdown
                  items={ledgers}
                  value={voucher.sales_ledger_id || voucher.purchase_ledger_id || ''}
                  onSelect={(ledger) => {
                    if (['sales', 'debit_note'].includes(voucher.voucher_type)) {
                      setVoucher(prev => ({ ...prev, sales_ledger_id: ledger.id }));
                    } else {
                      setVoucher(prev => ({ ...prev, purchase_ledger_id: ledger.id }));
                    }
                  }}
                  placeholder={`Search ${getSalesLedgerLabel().toLowerCase()}...`}
                  displayField="name"
                  searchFields={['name']}
                  renderItem={renderLedgerItem}
                />
              </div>

              {voucher.mode === 'voucher_mode' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Amount
                  </label>
                  <NumberInput
                    value={voucher.total_amount || 0}
                    onChange={(value) => setVoucher(prev => ({ ...prev, total_amount: value }))}
                    step={0.01}
                    min={0}
                    placeholder="0.00"
                    className="text-right"
                    showControls={true}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stock Items Section - Only show in item_invoice mode */}
        {voucher.mode === 'item_invoice' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Stock Items</h4>
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
                    {voucher.use_common_ledger === false && (
                      <th className="text-left py-3 px-2 font-medium text-gray-700 w-1/4">{getSalesLedgerLabel()}</th>
                    )}
                    {selectedCompany?.enable_multi_godown && (
                      <th className="text-left py-3 px-2 font-medium text-gray-700 w-1/6">Godown</th>
                    )}
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {voucher.stock_entries?.map((entry: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                      <td className="py-3 px-2">
                        <SearchableDropdown
                          items={stockItems}
                          value={entry.stock_item_id || ''}
                          onSelect={(item) => {
                            handleStockEntryChange(index, 'stock_item_id', item.id);
                            handleStockEntryChange(index, 'stock_item_name', item.name);
                            handleStockEntryChange(index, 'rate', item.rate || 0);
                          }}
                          placeholder="Search items..."
                          displayField="name"
                          searchFields={['name', 'hsn_code']}
                          renderItem={renderStockItem}
                          className="text-sm"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <NumberInput
                          value={entry.quantity || 0}
                          onChange={(value) => handleStockEntryChange(index, 'quantity', value)}
                          step={0.001}
                          min={0}
                          placeholder="0"
                          className="text-right text-sm"
                          showControls={true}
                        />
                      </td>
                      <td className="py-3 px-2">
                        <NumberInput
                          value={entry.rate || 0}
                          onChange={(value) => handleStockEntryChange(index, 'rate', value)}
                          step={0.01}
                          min={0}
                          placeholder="0.00"
                          className="text-right text-sm"
                          showControls={true}
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
                      {voucher.use_common_ledger === false && (
                        <td className="py-3 px-2">
                          <SearchableDropdown
                            items={ledgers}
                            value={entry.individual_ledger_id || ''}
                            onSelect={(ledger) => handleStockEntryChange(index, 'individual_ledger_id', ledger.id)}
                            placeholder={`Search ${getSalesLedgerLabel().toLowerCase()}...`}
                            displayField="name"
                            searchFields={['name']}
                            renderItem={renderLedgerItem}
                            className="text-sm"
                          />
                        </td>
                      )}
                      {selectedCompany?.enable_multi_godown && (
                        <td className="py-3 px-2">
                          <select
                            value={entry.godown_id || ''}
                            onChange={(e) => handleStockEntryChange(index, 'godown_id', e.target.value)}
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
                        {voucher.stock_entries && voucher.stock_entries.length > 1 && index < voucher.stock_entries.length - 1 && (
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
                    <td colSpan={3}></td>
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
          </>
        )}
      </Card>
    </motion.div>
  );
};