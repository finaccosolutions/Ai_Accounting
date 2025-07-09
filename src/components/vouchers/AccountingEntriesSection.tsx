import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { NumberInput } from '../ui/NumberInput';
import { Input } from '../ui/Input';
import { Calculator, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { SearchableDropdown } from './SearchableDropdown';

interface AccountingEntriesSectionProps {
  voucher: any;
  setVoucher: (updater: (prev: any) => any) => void;
  ledgers: any[];
  getAccountingEntryLabel: () => string;
  renderLedgerItem: (ledger: any) => React.ReactNode;
  addEntry: () => void;
  removeEntry: (index: number) => void;
  updateEntry: (index: number, field: string, value: any) => void;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

export const AccountingEntriesSection: React.FC<AccountingEntriesSectionProps> = ({
  voucher,
  setVoucher,
  ledgers,
  getAccountingEntryLabel,
  renderLedgerItem,
  addEntry,
  removeEntry,
  updateEntry,
  totalDebit,
  totalCredit,
  isBalanced
}) => {
  const handleEntryChange = (index: number, field: string, value: any) => {
    updateEntry(index, field, value);
  };

  return (
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
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={addEntry}
            className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300"
            title="Add Entry"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
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
              {voucher.entries?.map((entry: any, index: number) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors">
                  <td className="py-3 px-2">
                    <SearchableDropdown
                      items={ledgers}
                      value={entry.ledger_id || ''}
                      onSelect={(ledger) => handleEntryChange(index, 'ledger_id', ledger.id)}
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
                        <NumberInput
                          value={entry.debit_amount || 0}
                          onChange={(value) => handleEntryChange(index, 'debit_amount', value)}
                          step={0.01}
                          min={0}
                          placeholder="0.00"
                          className="text-right text-sm"
                          showControls={true}
                        />
                      </td>
                      <td className="py-3 px-2">
                        <NumberInput
                          value={entry.credit_amount || 0}
                          onChange={(value) => handleEntryChange(index, 'credit_amount', value)}
                          step={0.01}
                          min={0}
                          placeholder="0.00"
                          className="text-right text-sm"
                          showControls={true}
                        />
                      </td>
                    </>
                  ) : (
                    <td className="py-3 px-2">
                      <NumberInput
                        value={entry.amount || 0}
                        onChange={(value) => handleEntryChange(index, 'amount', value)}
                        step={0.01}
                        min={0}
                        placeholder="0.00"
                        className="text-right text-sm"
                        showControls={true}
                      />
                    </td>
                  )}
                  <td className="py-3 px-2">
                    <Input
                      value={entry.narration || ''}
                      onChange={(e) => handleEntryChange(index, 'narration', e.target.value)}
                      placeholder="Entry description"
                      className="text-sm"
                    />
                  </td>
                  <td className="py-3 px-2">
                    {voucher.entries && voucher.entries.length > (voucher.voucher_type === 'journal' ? 2 : 1) && 
                     index < voucher.entries.length - 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeEntry(index)}
                        className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center text-white shadow-md transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
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
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-emerald-600 mr-2" />
              <p className="text-emerald-600 text-sm">
                Voucher is balanced - Ready to save
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};