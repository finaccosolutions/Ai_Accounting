import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../ui/Card';
import { 
  Package, 
  Receipt, 
  Calculator, 
  ChevronDown, 
  ChevronUp,
  Sparkles
} from 'lucide-react';

const entryModes = [
  { 
    value: 'item_invoice', 
    label: 'Item Invoice', 
    icon: Package, 
    description: 'Item-wise billing with stock management',
    color: 'from-blue-500 to-blue-600'
  },
  { 
    value: 'voucher_mode', 
    label: 'Voucher Mode', 
    icon: Receipt, 
    description: 'Simple voucher entry without stock',
    color: 'from-green-500 to-green-600'
  },
  { 
    value: 'accounting_mode', 
    label: 'Accounting Mode', 
    icon: Calculator, 
    description: 'Advanced accounting entries',
    color: 'from-purple-500 to-purple-600'
  }
];

interface EntryModeSelectorProps {
  currentMode: string;
  voucherType: string;
  onModeChange: (mode: string) => void;
}

export const EntryModeSelector: React.FC<EntryModeSelectorProps> = ({
  currentMode,
  voucherType,
  onModeChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const currentModeData = entryModes.find(mode => mode.value === currentMode);
  const Icon = currentModeData?.icon || Package;

  // Filter available modes based on voucher type
  const availableModes = entryModes.filter(mode => {
    if (mode.value === 'item_invoice') {
      return ['sales', 'purchase'].includes(voucherType);
    }
    return true;
  });

  return (
    <Card className="p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-0 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${currentModeData?.color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
              Entry Mode: {currentModeData?.label}
            </h3>
            <p className="text-sm text-gray-600">{currentModeData?.description}</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg bg-white/80 hover:bg-white transition-colors shadow-md"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-gray-200/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {availableModes.map((mode) => {
                const ModeIcon = mode.icon;
                const isSelected = currentMode === mode.value;
                
                return (
                  <motion.button
                    key={mode.value}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onModeChange(mode.value);
                      setIsExpanded(false);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      isSelected
                        ? `border-transparent bg-gradient-to-r ${mode.color} text-white shadow-lg`
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                    }`}
                  >
                    <ModeIcon className={`w-6 h-6 mx-auto mb-2 ${
                      isSelected ? 'text-white' : 'text-gray-600'
                    }`} />
                    <div className={`text-sm font-medium ${
                      isSelected ? 'text-white' : 'text-gray-900'
                    }`}>
                      {mode.label}
                    </div>
                    <div className={`text-xs mt-1 ${
                      isSelected ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {mode.description}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};