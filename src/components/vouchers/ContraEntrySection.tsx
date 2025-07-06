import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { ArrowRightLeft, Banknote, CreditCard } from 'lucide-react';
import { SearchableDropdown } from './SearchableDropdown';

interface ContraEntrySectionProps {
  voucher: any;
  setVoucher: (updater: (prev: any) => any) => void;
  ledgers: any[];
  renderLedgerItem: (ledger: any) => React.ReactNode;
}

export const ContraEntrySection: React.FC<ContraEntrySectionProps> = ({
  voucher,
  setVoucher,
  ledgers,
  renderLedgerItem
}) => {
  if (voucher.voucher_type !== 'contra') return null;

  // Filter only cash and bank ledgers
  const cashBankLedgers = ledgers.filter(ledger => 
    ledger.ledger_groups?.group_type === 'assets' && 
    (ledger.name.toLowerCase().includes('cash') || 
     ledger.name.toLowerCase().includes('bank') ||
     ledger.name.toLowerCase().includes('petty'))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-6"
    >
      <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <ArrowRightLeft className="w-5 h-5 mr-2 text-purple-600" />
          Contra Entry - Cash/Bank Transfer
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Debit Section */}
          <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-800 mb-4 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Debit Ledger (Money Going To)
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Cash/Bank Account
                </label>
                <SearchableDropdown
                  items={cashBankLedgers}
                  value={voucher.debit_ledger_id || ''}
                  onSelect={(ledger) => setVoucher(prev => ({ 
                    ...prev, 
                    debit_ledger_id: ledger.id,
                    debit_ledger_name: ledger.name 
                  }))}
                  placeholder="Search cash/bank accounts..."
                  displayField="name"
                  searchFields={['name']}
                  renderItem={renderLedgerItem}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    value={voucher.contra_amount || ''}
                    onChange={(e) => setVoucher(prev => ({ ...prev, contra_amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className="text-right pr-20"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button
                      type="button"
                      onClick={() => setVoucher(prev => ({ 
                        ...prev, 
                        contra_amount: (prev.contra_amount || 0) + 1 
                      }))}
                      className="w-6 h-3 bg-gray-200 hover:bg-gray-300 rounded-t text-xs flex items-center justify-center transition-colors"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => setVoucher(prev => ({ 
                        ...prev, 
                        contra_amount: Math.max(0, (prev.contra_amount || 0) - 1)
                      }))}
                      className="w-6 h-3 bg-gray-200 hover:bg-gray-300 rounded-b text-xs flex items-center justify-center transition-colors"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Credit Section */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-4 flex items-center">
              <Banknote className="w-4 h-4 mr-2" />
              Credit Ledger (Money Coming From)
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Cash/Bank Account
                </label>
                <SearchableDropdown
                  items={cashBankLedgers}
                  value={voucher.credit_ledger_id || ''}
                  onSelect={(ledger) => setVoucher(prev => ({ 
                    ...prev, 
                    credit_ledger_id: ledger.id,
                    credit_ledger_name: ledger.name 
                  }))}
                  placeholder="Search cash/bank accounts..."
                  displayField="name"
                  searchFields={['name']}
                  renderItem={renderLedgerItem}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (Auto-filled)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={voucher.contra_amount || ''}
                  readOnly
                  className="text-right bg-gray-50"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Summary */}
        {voucher.contra_amount > 0 && voucher.debit_ledger_name && voucher.credit_ledger_name && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Transfer Summary</h4>
            <p className="text-blue-800">
              Transferring <strong>₹{voucher.contra_amount.toLocaleString()}</strong> from{' '}
              <strong>{voucher.credit_ledger_name}</strong> to{' '}
              <strong>{voucher.debit_ledger_name}</strong>
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};