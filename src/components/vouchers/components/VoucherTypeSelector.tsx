import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';

const voucherTypes = [
  { 
    value: 'sales', 
    label: 'Sales', 
    color: 'from-green-500 to-green-600', 
    icon: '💰',
    description: 'Record sales transactions',
    hasParty: true,
    hasStock: true,
    hasTax: true,
    defaultMode: 'item_invoice'
  },
  { 
    value: 'purchase', 
    label: 'Purchase', 
    color: 'from-blue-500 to-blue-600', 
    icon: '🛒',
    description: 'Record purchase transactions',
    hasParty: true,
    hasStock: true,
    hasTax: true,
    defaultMode: 'item_invoice'
  },
  { 
    value: 'receipt', 
    label: 'Receipt', 
    color: 'from-emerald-500 to-emerald-600', 
    icon: '📥',
    description: 'Money received',
    hasParty: true,
    hasStock: false,
    hasTax: false,
    defaultMode: 'voucher_mode'
  },
  { 
    value: 'payment', 
    label: 'Payment', 
    color: 'from-red-500 to-red-600', 
    icon: '📤',
    description: 'Money paid out',
    hasParty: true,
    hasStock: false,
    hasTax: false,
    defaultMode: 'voucher_mode'
  },
  { 
    value: 'journal', 
    label: 'Journal', 
    color: 'from-purple-500 to-purple-600', 
    icon: '📝',
    description: 'General journal entries',
    hasParty: false,
    hasStock: false,
    hasTax: false,
    defaultMode: 'accounting_mode'
  },
  { 
    value: 'contra', 
    label: 'Contra', 
    color: 'from-orange-500 to-orange-600', 
    icon: '🔄',
    description: 'Bank to cash transfers',
    hasParty: false,
    hasStock: false,
    hasTax: false,
    defaultMode: 'voucher_mode'
  }
];

interface VoucherTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export const VoucherTypeSelector: React.FC<VoucherTypeSelectorProps> = ({
  selectedType,
  onTypeChange
}) => {
  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
        Voucher Type
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {voucherTypes.map((type) => (
          <motion.button
            key={type.value}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTypeChange(type.value)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              selectedType === type.value
                ? `border-transparent bg-gradient-to-r ${type.color} text-white shadow-lg transform scale-105`
                : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
            }`}
          >
            <div className="text-2xl mb-2">{type.icon}</div>
            <div className="text-sm font-medium">{type.label}</div>
            <div className={`text-xs mt-1 ${
              selectedType === type.value ? 'text-white/80' : 'text-gray-500'
            }`}>
              {type.description}
            </div>
          </motion.button>
        ))}
      </div>
    </Card>
  );
};