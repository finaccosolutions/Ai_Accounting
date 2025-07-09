import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { ArrowRightLeft, Banknote, CreditCard, Plus, Trash2, ArrowDown } from 'lucide-react';
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

  // Initialize contra entries if not present
  const debitEntries = voucher.debit_entries || [{ ledger_id: '', amount: 0 }];
  const creditEntries = voucher.credit_entries || [{ ledger_id: '', amount: 0 }];

  const addDebitEntry = () => {
    setVoucher(prev => ({
      ...prev,
      debit_entries: [...debitEntries, { ledger_id: '', amount: 0 }]
    }));
  };

  const addCreditEntry = () => {
    setVoucher(prev => ({
      ...prev,
      credit_entries: [...creditEntries, { ledger_id: '', amount: 0 }]
    }));
  };

  const removeDebitEntry = (index: number) => {
    if (debitEntries.length > 1) {
      setVoucher(prev => ({
        ...prev,
        debit_entries: debitEntries.filter((_, i) => i !== index)
      }));
    }
  };

  const removeCreditEntry = (index: number) => {
    if (creditEntries.length > 1) {
      setVoucher(prev => ({
        ...prev,
        credit_entries: creditEntries.filter((_, i) => i !== index)
      }));
    }
  };

  const updateDebitEntry = (index: number, field: string, value: any) => {
    const updatedEntries = debitEntries.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    );
    setVoucher(prev => ({ ...prev, debit_entries: updatedEntries }));
  };

  const updateCreditEntry = (index: number, field: string, value: any) => {
    const updatedEntries = creditEntries.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    );
    setVoucher(prev => ({ ...prev, credit_entries: updatedEntries }));
  };

  const totalDebitAmount = debitEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
  const totalCreditAmount = creditEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-6"
    >
      <Card className="p-8 bg-gradient-to-br from-white/95 via-blue-50/30 to-purple-50/30 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              <ArrowRightLeft className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
                Contra Entry
              </h3>
              <p className="text-gray-600">Cash/Bank Transfer Management</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Debit Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-red-50 via-red-100 to-pink-100 rounded-2xl p-6 border-2 border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-red-800">Debit Ledger</h4>
                    <p className="text-sm text-red-600">Money Going To</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={addDebitEntry}
                  className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  title="Add Debit Entry"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
              
              <div className="space-y-4">
                <AnimatePresence>
                  {debitEntries.map((entry, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-red-200/50 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Cash/Bank Account
                          </label>
                          <SearchableDropdown
                            items={cashBankLedgers}
                            value={entry.ledger_id || ''}
                            onSelect={(ledger) => updateDebitEntry(index, 'ledger_id', ledger.id)}
                            placeholder="Search accounts..."
                            displayField="name"
                            searchFields={['name']}
                            renderItem={renderLedgerItem}
                          />
                        </div>

                        <div className="flex items-end space-x-2">
                          <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Amount
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={entry.amount || ''}
                              onChange={(e) => updateDebitEntry(index, 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="text-right font-mono text-lg"
                            />
                          </div>
                          {debitEntries.length > 1 && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeDebitEntry(index)}
                              className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center text-white shadow-md transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-4 p-3 bg-red-100/50 rounded-lg border border-red-200">
                <p className="text-sm font-semibold text-red-800">
                  Total Debit: ₹{totalDebitAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Transfer Arrow */}
          <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center"
      >
        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 rounded-full flex items-center justify-center shadow-xl">
          <ArrowDown className="w-8 h-8 text-white animate-bounce" />
        </div>
      </motion.div>

          {/* Credit Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 rounded-2xl p-6 border-2 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Banknote className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-green-800">Credit Ledger</h4>
                    <p className="text-sm text-green-600">Money Coming From</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={addCreditEntry}
                  className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  title="Add Credit Entry"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
              
              <div className="space-y-4">
                <AnimatePresence>
                  {creditEntries.map((entry, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-200/50 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Cash/Bank Account
                          </label>
                          <SearchableDropdown
                            items={cashBankLedgers}
                            value={entry.ledger_id || ''}
                            onSelect={(ledger) => updateCreditEntry(index, 'ledger_id', ledger.id)}
                            placeholder="Search accounts..."
                            displayField="name"
                            searchFields={['name']}
                            renderItem={renderLedgerItem}
                          />
                        </div>

                        <div className="flex items-end space-x-2">
                          <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Amount
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={entry.amount || ''}
                              onChange={(e) => updateCreditEntry(index, 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="text-right font-mono text-lg"
                            />
                          </div>
                          {creditEntries.length > 1 && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeCreditEntry(index)}
                              className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-lg flex items-center justify-center text-white shadow-md transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-4 p-3 bg-green-100/50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-800">
                  Total Credit: ₹{totalCreditAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Balance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <div className={`p-6 rounded-2xl border-2 shadow-lg transition-all duration-300 ${
            Math.abs(totalDebitAmount - totalCreditAmount) < 0.01
              ? 'bg-gradient-to-r from-emerald-50 to-green-100 border-emerald-200'
              : 'bg-gradient-to-r from-orange-50 to-yellow-100 border-orange-200'
          }`}>
            <div className="text-center">
              <h4 className="text-lg font-bold text-gray-800 mb-2">Balance Summary</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Debit</p>
                  <p className="text-xl font-bold text-red-600">₹{totalDebitAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Credit</p>
                  <p className="text-xl font-bold text-green-600">₹{totalCreditAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Difference</p>
                  <p className={`text-xl font-bold ${
                    Math.abs(totalDebitAmount - totalCreditAmount) < 0.01 
                      ? 'text-emerald-600' 
                      : 'text-orange-600'
                  }`}>
                    ₹{Math.abs(totalDebitAmount - totalCreditAmount).toLocaleString()}
                  </p>
                </div>
              </div>
              {Math.abs(totalDebitAmount - totalCreditAmount) < 0.01 ? (
                <p className="text-emerald-600 font-semibold mt-2">✓ Entries are balanced</p>
              ) : (
                <p className="text-orange-600 font-semibold mt-2">⚠ Entries need to be balanced</p>
              )}
            </div>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
};