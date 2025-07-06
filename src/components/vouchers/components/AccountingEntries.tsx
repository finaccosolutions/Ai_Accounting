import React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Calculator, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface AccountingEntriesProps {
  voucher: any;
  onVoucherChange: (voucher: any) => void;
  ledgers: any[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

export const AccountingEntries: React.FC<AccountingEntriesProps> = ({
  voucher,
  onVoucherChange,
  ledgers,
  totalDebit,
  totalCredit,
  isBalanced
}) => {
  const addEntry = () => {
    onVoucherChange(prev => ({
      ...prev,
      entries: [...prev.entries, { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' }]
    }));
  };

  const removeEntry = (index: number) => {
    if (voucher.entries.length > 2) {
      onVoucherChange(prev => ({
        ...prev,
        entries: prev.entries.filter((_, i) => i !== index)
      }));
    }
  };

  const updateEntry = (index: number, field: string, value: any) => {
    onVoucherChange(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-purple-600" />
          Accounting Entries
        </h3>
        <Button size="sm" onClick={addEntry} className="bg-gradient-to-r from-purple-500 to-purple-600">
          <Plus className="w-4 h-4 mr-1" />
          Add Entry
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-3 font-medium text-gray-700">Ledger Account</th>
              <th className="text-right py-3 px-3 font-medium text-gray-700">Debit (₹)</th>
              <th className="text-right py-3 px-3 font-medium text-gray-700">Credit (₹)</th>
              <th className="text-left py-3 px-3 font-medium text-gray-700">Narration</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {voucher.entries.map((entry, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors">
                <td className="py-3 px-3">
                  <select
                    value={entry.ledger_id}
                    onChange={(e) => updateEntry(index, 'ledger_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Ledger</option>
                    {ledgers.map((ledger) => (
                      <option key={ledger.id} value={ledger.id}>
                        {ledger.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-3">
                  <Input
                    type="number"
                    step="0.01"
                    value={entry.debit_amount || ''}
                    onChange={(e) => updateEntry(index, 'debit_amount', parseFloat(e.target.value) || 0)}
                    className="text-right"
                  />
                </td>
                <td className="py-3 px-3">
                  <Input
                    type="number"
                    step="0.01"
                    value={entry.credit_amount || ''}
                    onChange={(e) => updateEntry(index, 'credit_amount', parseFloat(e.target.value) || 0)}
                    className="text-right"
                  />
                </td>
                <td className="py-3 px-3">
                  <Input
                    value={entry.narration || ''}
                    onChange={(e) => updateEntry(index, 'narration', e.target.value)}
                    placeholder="Entry description"
                  />
                </td>
                <td className="py-3 px-3">
                  {voucher.entries.length > 2 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeEntry(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300 font-semibold bg-gray-50">
              <td className="py-3 px-3">Total</td>
              <td className="py-3 px-3 text-right text-lg">₹{totalDebit.toFixed(2)}</td>
              <td className="py-3 px-3 text-right text-lg">₹{totalCredit.toFixed(2)}</td>
              <td className="py-3 px-3"></td>
              <td className="py-3 px-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Balance Status */}
      <div className="mt-4">
        {!isBalanced && totalDebit > 0 && (
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
              <strong>Voucher is balanced</strong> - Ready to save (₹{totalDebit.toFixed(2)})
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};