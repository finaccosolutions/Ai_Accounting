import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../ui/Card';
import { 
  Package, 
  Receipt, 
  Calculator, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Check
} from 'lucide-react';

const entryModes = [
  { 
    value: 'item_invoice', 
    label: 'Item Invoice', 
    icon: Package, 
    description: 'Item-wise billing with stock management',
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  { 
    value: 'voucher_mode', 
    label: 'Voucher Mode', 
    icon: Receipt, 
    description: 'Simple voucher entry without stock',
    color: 'from-emerald-500 to-emerald-600',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  { 
    value: 'accounting_mode', 
    label: 'Accounting Mode', 
    icon: Calculator, 
    description: 'Advanced accounting entries',
    color: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50'
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
    <Card className="p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-0 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${currentModeData?.color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center text-lg">
              <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
              Entry Mode: {currentModeData?.label}
            </h3>
            <p className="text-sm text-slate-600">{currentModeData?.description}</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 rounded-xl bg-white/80 hover:bg-white transition-colors shadow-md border border-slate-200"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-600" />
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
            className="mt-6 pt-6 border-t border-slate-200/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    className={`relative p-5 rounded-xl border-2 transition-all duration-300 ${
                      isSelected
                        ? `border-transparent bg-gradient-to-r ${mode.color} text-white shadow-lg`
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-md'
                    }`}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                    
                    <ModeIcon className={`w-8 h-8 mx-auto mb-3 ${
                      isSelected ? 'text-white' : 'text-slate-600'
                    }`} />
                    <div className={`text-sm font-medium mb-2 ${
                      isSelected ? 'text-white' : 'text-slate-900'
                    }`}>
                      {mode.label}
                    </div>
                    <div className={`text-xs ${
                      isSelected ? 'text-white/80' : 'text-slate-500'
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