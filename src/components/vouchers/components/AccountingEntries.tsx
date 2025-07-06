import React, { useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Calculator, AlertCircle } from 'lucide-react';
import { SearchableDropdown } from './SearchableDropdown';
import { NumericInput } from './NumericInput';

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
  // Initialize with one empty row if no entries exist
  useEffect(() => {
    if (!voucher.entries || voucher.entries.length === 0) {
      onVoucherChange(prev => ({
        ...prev,
        entries: [
          { ledger_id: '', ledger_name: '', debit_amount: 0, credit_amount: 0, narration: '' }
        ]
      }));
    }
  }, []);

  const updateEntry = (index: number, field: string, value: any) => {
    const updatedEntries = [...(voucher.entries || [])];
    
    if (!updatedEntries[index]) {
      updatedEntries[index] = { 
        ledger_id: '', 
        ledger_name: '',
        debit_amount: 0, 
        credit_amount: 0, 
        narration: '' 
      };
    }

    // Validation: Don't allow both debit and credit to be greater than 0
    if (field === 'debit_amount' && value > 0) {
      updatedEntries[index].credit_amount = 0;
    } else if (field === 'credit_amount' && value > 0) {
      updatedEntries[index].debit_amount = 0;
    }

    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    
    onVoucherChange(prev => ({ ...prev, entries: updatedEntries }));

    // Auto-add new row if current row has ledger selected and amount entered and this is the last row
    if ((field === 'debit_amount' || field === 'credit_amount') && value > 0 && 
        updatedEntries[index].ledger_id && index === updatedEntries.length - 1) {
      addNewRow();
    }
  };

  const addNewRow = () => {
    const newEntry = { 
      ledger_id: '', 
      ledger_name: '',
      debit_amount: 0, 
      credit_amount: 0, 
      narration: '' 
    };
    
    onVoucherChange(prev => ({
      ...prev,
      entries: [...(prev.entries || []), newEntry]
    }));
  };

  const removeEntry = (index: number) => {
    if (voucher.entries && voucher.entries.length > 1) {
      onVoucherChange(prev => ({
        ...prev,
        entries: prev.entries.filter((_, i) => i !== index)
      }));
    }
  };

  const handleLedgerSelect = (index: number, ledger: any) => {
    updateEntry(index, 'ledger_id', ledger.id);
    updateEntry(index, 'ledger_name', ledger.name);
  };

  const renderLedgerItem = (ledger: any) => (
    <div>
      <div className="font-medium text-gray-900">{ledger.name}</div>
      <div className="text-sm text-gray-500">
        {ledger.ledger_groups?.name} • Balance: ₹{ledger.current_balance?.toFixed(2) || '0.00'}
      </div>
    </div>
  );

  return (
    <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-purple-600" />
          Accounting Entries
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-700 w-2/5">Ledger Account</th>
              <th className="text-right py-3 px-2 font-medium text-gray-700 w-1/8">Debit (₹)</th>
              <th className="text-right py-3 px-2 font-medium text-gray-700 w-1/8">Credit (₹)</th>
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
                    onSelect={(ledger) => handleLedgerSelect(index, ledger)}
                    placeholder="Search ledgers..."
                    displayField="name"
                    searchFields={['name']}
                    renderItem={renderLedgerItem}
                    className="text-sm"
                  />
                </td>
                <td className="py-3 px-2">
                  <NumericInput
                    value={entry.debit_amount || 0}
                    onChange={(value) => updateEntry(index, 'debit_amount', value)}
                    step={0.01}
                    placeholder="0.00"
                    className="text-sm"
                  />
                </td>
                <td className="py-3 px-2">
                  <NumericInput
                    value={entry.credit_amount || 0}
                    onChange={(value) => updateEntry(index, 'credit_amount', value)}
                    step={0.01}
                    placeholder="0.00"
                    className="text-sm"
                  />
                </td>
                <td className="py-3 px-2">
                  <Input
                    value={entry.narration || ''}
                    onChange={(e) => updateEntry(index, 'narration', e.target.value)}
                    placeholder="Entry description"
                    className="text-sm"
                  />
                </td>
                <td className="py-3 px-2">
                  {voucher.entries && voucher.entries.length > 1 && (
                    <button
                      onClick={() => removeEntry(index)}
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
              <td className="py-3 px-2">Total</td>
              <td className="py-3 px-2 text-right text-lg">₹{totalDebit.toFixed(2)}</td>
              <td className="py-3 px-2 text-right text-lg">₹{totalCredit.toFixed(2)}</td>
              <td className="py-3 px-2"></td>
              <td className="py-3 px-2"></td>
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
      </div>
    </Card>
  );
};