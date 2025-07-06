import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../ui/Button';
import { 
  X,
  Settings,
  FileText,
  Package,
  Receipt,
  Calculator,
  CreditCard,
  Banknote,
  ArrowUpDown,
  Bot,
  Upload,
  FileImage,
  Database,
  Sparkles,
  Zap,
  Eye,
  Edit,
  Copy,
  TrendingUp,
  Clock,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp,
  Wand2,
  Brain,
  Scan,
  FileSpreadsheet,
  Check,
  Circle
} from 'lucide-react';

const voucherTypes = [
  { 
    value: 'sales', 
    label: 'Sales', 
    color: 'text-green-600', 
    bgColor: 'bg-green-50',
    icon: CreditCard,
    description: 'Record sales transactions'
  },
  { 
    value: 'purchase', 
    label: 'Purchase', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50',
    icon: Package,
    description: 'Record purchase transactions'
  },
  { 
    value: 'receipt', 
    label: 'Receipt', 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50',
    icon: Banknote,
    description: 'Money received'
  },
  { 
    value: 'payment', 
    label: 'Payment', 
    color: 'text-red-600', 
    bgColor: 'bg-red-50',
    icon: CreditCard,
    description: 'Money paid out'
  },
  { 
    value: 'journal', 
    label: 'Journal', 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50',
    icon: FileText,
    description: 'General journal entries'
  },
  { 
    value: 'contra', 
    label: 'Contra', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50',
    icon: ArrowUpDown,
    description: 'Bank to cash transfers'
  }
];

const entryModes = [
  { 
    value: 'item_invoice', 
    label: 'Item Invoice', 
    icon: Package, 
    description: 'Item-wise billing with stock',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  { 
    value: 'voucher_mode', 
    label: 'Voucher Mode', 
    icon: Receipt, 
    description: 'Simple voucher entry',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  { 
    value: 'accounting_mode', 
    label: 'Accounting Mode', 
    icon: Calculator, 
    description: 'Advanced accounting entries',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
];

const entryMethods = [
  {
    value: 'manual',
    label: 'Manual Entry',
    icon: Edit,
    description: 'Traditional manual data entry',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  },
  {
    value: 'ai_assisted',
    label: 'AI Assisted',
    icon: Brain,
    description: 'AI helps with smart suggestions',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    value: 'pdf_upload',
    label: 'Upload PDF Invoice',
    icon: FileImage,
    description: 'Extract data from PDF invoices',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    value: 'bank_statement',
    label: 'Bank Statement',
    icon: FileSpreadsheet,
    description: 'Import from bank statements',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  }
];

interface EnhancedRightSidebarProps {
  visible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  voucher: any;
  onVoucherChange: (voucher: any) => void;
  recentVouchers: any[];
  totalAmount: number;
}

export const EnhancedRightSidebar: React.FC<EnhancedRightSidebarProps> = ({
  visible,
  onVisibilityChange,
  voucher,
  onVoucherChange,
  recentVouchers,
  totalAmount
}) => {
  const [hovering, setHovering] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['voucher-type', 'entry-method']);
  const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(null);
  const [showTriggerHint, setShowTriggerHint] = useState(true);

  // Auto-hide functionality with immediate hide when mouse leaves
  useEffect(() => {
    if (visible && !hovering) {
      const timer = setTimeout(() => {
        onVisibilityChange(false);
      }, 100); // Very quick hide when mouse leaves
      
      setAutoHideTimer(timer);
      return () => clearTimeout(timer);
    } else if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      setAutoHideTimer(null);
    }
  }, [visible, hovering, onVisibilityChange]);

  // Hide trigger hint after first interaction
  useEffect(() => {
    if (visible) {
      setShowTriggerHint(false);
    }
  }, [visible]);

  const handleMouseEnter = () => {
    setHovering(true);
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      setAutoHideTimer(null);
    }
  };

  const handleMouseLeave = () => {
    setHovering(false);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleVoucherTypeChange = (type: string) => {
    onVoucherChange(prev => ({ ...prev, voucher_type: type }));
  };

  const handleModeChange = (mode: string) => {
    onVoucherChange(prev => ({ ...prev, mode }));
  };

  const handleEntryMethodChange = (method: string) => {
    onVoucherChange(prev => ({ ...prev, entry_method: method }));
  };

  const sidebarSections = [
    {
      id: 'voucher-type',
      title: 'Voucher Type',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      content: 'voucher-types'
    },
    {
      id: 'entry-method',
      title: 'Entry Method',
      icon: Wand2,
      color: 'from-purple-500 to-purple-600',
      content: 'entry-methods'
    },
    {
      id: 'entry-mode',
      title: 'Entry Mode',
      icon: Settings,
      color: 'from-green-500 to-green-600',
      content: 'entry-modes'
    },
    {
      id: 'stats',
      title: 'Quick Stats',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      content: 'stats'
    },
    {
      id: 'recent',
      title: 'Recent Vouchers',
      icon: Clock,
      color: 'from-indigo-500 to-indigo-600',
      content: 'recent'
    }
  ];

  return (
    <>
      {/* Enhanced Trigger Area with Visual Indicator */}
      <div 
        className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-6 z-40 cursor-pointer group"
        onMouseEnter={() => onVisibilityChange(true)}
      >
        {/* Trigger Strip */}
        <div className="w-2 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 ml-2 opacity-40 group-hover:opacity-80 transition-all duration-300 rounded-l-lg shadow-lg" />
        
        {/* Floating Icons */}
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 space-y-4">
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
          >
            <Settings className="w-4 h-4 text-blue-600" />
          </motion.div>
        </div>

        {/* Hint Text */}
        <AnimatePresence>
          {showTriggerHint && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-1/2 right-8 transform -translate-y-1/2 bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap pointer-events-none"
            >
              Hover here for settings
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-black/80 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Sidebar */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-96 bg-white/95 backdrop-blur-md border-l border-gray-200/50 shadow-2xl z-50"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Voucher Settings</h3>
                    <p className="text-sm text-gray-600">Configure your entry preferences</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onVisibilityChange(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="h-full overflow-y-auto p-4 pb-20">
              <div className="space-y-4">
                {sidebarSections.map((section, index) => {
                  const Icon = section.icon;
                  const isExpanded = expandedSections.includes(section.id);
                  
                  return (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden"
                    >
                      {/* Section Header */}
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                        onClick={() => toggleSection(section.id)}
                        className={`w-full p-3 flex items-center justify-between transition-all duration-300 ${
                          isExpanded ? `bg-gradient-to-r ${section.color} text-white` : 'text-gray-700 hover:text-blue-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-4 h-4 ${isExpanded ? 'text-white' : 'text-gray-600'}`} />
                          <span className="font-medium text-sm">{section.title}</span>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className={`w-4 h-4 ${isExpanded ? 'text-white' : 'text-gray-400'}`} />
                        </motion.div>
                      </motion.button>

                      {/* Section Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="p-3 pt-0">
                              {/* Voucher Types - List Format */}
                              {section.content === 'voucher-types' && (
                                <div className="space-y-2">
                                  {voucherTypes.map((type) => {
                                    const TypeIcon = type.icon;
                                    const isSelected = voucher.voucher_type === type.value;
                                    
                                    return (
                                      <motion.button
                                        key={type.value}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleVoucherTypeChange(type.value)}
                                        className={`w-full p-3 rounded-lg transition-all duration-200 text-left flex items-center space-x-3 ${
                                          isSelected
                                            ? `${type.bgColor} border-2 border-current ${type.color} shadow-md`
                                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent text-gray-700'
                                        }`}
                                      >
                                        <div className="flex items-center space-x-3 flex-1">
                                          <TypeIcon className={`w-4 h-4 ${isSelected ? type.color : 'text-gray-500'}`} />
                                          <div>
                                            <div className={`font-medium text-sm ${isSelected ? type.color : 'text-gray-900'}`}>
                                              {type.label}
                                            </div>
                                            <div className={`text-xs ${isSelected ? type.color.replace('600', '500') : 'text-gray-500'}`}>
                                              {type.description}
                                            </div>
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <Check className={`w-4 h-4 ${type.color}`} />
                                        )}
                                      </motion.button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Entry Methods - List Format */}
                              {section.content === 'entry-methods' && (
                                <div className="space-y-2">
                                  {entryMethods.map((method) => {
                                    const MethodIcon = method.icon;
                                    const isSelected = voucher.entry_method === method.value;
                                    
                                    return (
                                      <motion.button
                                        key={method.value}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleEntryMethodChange(method.value)}
                                        className={`w-full p-3 rounded-lg transition-all duration-200 text-left flex items-center space-x-3 ${
                                          isSelected
                                            ? `${method.bgColor} border-2 border-current ${method.color} shadow-md`
                                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent text-gray-700'
                                        }`}
                                      >
                                        <div className="flex items-center space-x-3 flex-1">
                                          <MethodIcon className={`w-4 h-4 ${isSelected ? method.color : 'text-gray-500'}`} />
                                          <div>
                                            <div className={`font-medium text-sm ${isSelected ? method.color : 'text-gray-900'}`}>
                                              {method.label}
                                            </div>
                                            <div className={`text-xs ${isSelected ? method.color.replace('600', '500') : 'text-gray-500'}`}>
                                              {method.description}
                                            </div>
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <Check className={`w-4 h-4 ${method.color}`} />
                                        )}
                                      </motion.button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Entry Modes - List Format */}
                              {section.content === 'entry-modes' && (
                                <div className="space-y-2">
                                  {entryModes.map((mode) => {
                                    const ModeIcon = mode.icon;
                                    const isSelected = voucher.mode === mode.value;
                                    const isAvailable = 
                                      (mode.value === 'item_invoice' && ['sales', 'purchase'].includes(voucher.voucher_type)) ||
                                      (mode.value !== 'item_invoice');
                                    
                                    if (!isAvailable) return null;
                                    
                                    return (
                                      <motion.button
                                        key={mode.value}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleModeChange(mode.value)}
                                        className={`w-full p-3 rounded-lg transition-all duration-200 text-left flex items-center space-x-3 ${
                                          isSelected
                                            ? `${mode.bgColor} border-2 border-current ${mode.color} shadow-md`
                                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent text-gray-700'
                                        }`}
                                      >
                                        <div className="flex items-center space-x-3 flex-1">
                                          <ModeIcon className={`w-4 h-4 ${isSelected ? mode.color : 'text-gray-500'}`} />
                                          <div>
                                            <div className={`font-medium text-sm ${isSelected ? mode.color : 'text-gray-900'}`}>
                                              {mode.label}
                                            </div>
                                            <div className={`text-xs ${isSelected ? mode.color.replace('600', '500') : 'text-gray-500'}`}>
                                              {mode.description}
                                            </div>
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <Check className={`w-4 h-4 ${mode.color}`} />
                                        )}
                                      </motion.button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Quick Stats */}
                              {section.content === 'stats' && (
                                <div className="space-y-2">
                                  {[
                                    { label: "Today's Vouchers", value: '12', icon: FileText, color: 'text-blue-600' },
                                    { label: 'This Month', value: '156', icon: Calendar, color: 'text-green-600' },
                                    { label: 'Pending', value: '3', icon: Clock, color: 'text-orange-600' },
                                    { label: 'Total Amount', value: `₹${totalAmount.toLocaleString()}`, icon: DollarSign, color: 'text-purple-600' }
                                  ].map((item, index) => {
                                    const ItemIcon = item.icon;
                                    return (
                                      <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                      >
                                        <div className="flex items-center space-x-3">
                                          <ItemIcon className={`w-4 h-4 ${item.color}`} />
                                          <span className="text-sm text-gray-700">{item.label}</span>
                                        </div>
                                        <span className={`font-semibold text-sm ${item.color}`}>
                                          {item.value}
                                        </span>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Recent Vouchers */}
                              {section.content === 'recent' && (
                                <div className="space-y-2">
                                  {recentVouchers.slice(0, 5).map((recentVoucher, index) => (
                                    <motion.div
                                      key={recentVoucher.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      className="group p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-sm text-gray-900">
                                          {recentVoucher.voucher_number}
                                        </span>
                                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button className="p-1 hover:bg-blue-100 rounded">
                                            <Eye className="w-3 h-3 text-blue-600" />
                                          </button>
                                          <button className="p-1 hover:bg-green-100 rounded">
                                            <Edit className="w-3 h-3 text-green-600" />
                                          </button>
                                          <button className="p-1 hover:bg-orange-100 rounded">
                                            <Copy className="w-3 h-3 text-orange-600" />
                                          </button>
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500 capitalize">
                                          {recentVoucher.voucher_type}
                                        </span>
                                        <span className="font-semibold text-sm text-gray-900">
                                          ₹{recentVoucher.total_amount?.toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {new Date(recentVoucher.date).toLocaleDateString()}
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};