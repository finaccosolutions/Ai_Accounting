import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { 
  ChevronRight,
  Settings,
  FileText,
  TrendingUp,
  Clock,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
  Copy,
  Users,
  BarChart3,
  Calculator,
  Bot,
  Activity,
  Building2,
  Package,
  Receipt
} from 'lucide-react';

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

const entryModes = [
  { value: 'item_invoice', label: 'Item Invoice', icon: Package, description: 'Item-wise billing with stock' },
  { value: 'voucher_mode', label: 'Voucher Mode', icon: Receipt, description: 'Simple voucher entry' },
  { value: 'accounting_mode', label: 'Accounting Mode', icon: Calculator, description: 'Advanced accounting entries' }
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
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>(['voucher-type', 'entry-mode']);
  const [isHovering, setIsHovering] = useState(false);
  const [showTrigger, setShowTrigger] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Auto-hide trigger when sidebar is visible and not hovering
  useEffect(() => {
    if (visible && !isHovering) {
      const timer = setTimeout(() => setShowTrigger(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowTrigger(true);
    }
  }, [visible, isHovering]);

  // Mouse detection for auto-show/hide
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const windowWidth = window.innerWidth;
      const triggerZone = 20;
      
      if (e.clientX >= windowWidth - triggerZone) {
        if (!visible) {
          onVisibilityChange(true);
        }
        setShowTrigger(true);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (visible && !isHovering) {
        const windowWidth = window.innerWidth;
        if (e.clientX < windowWidth - 400) {
          onVisibilityChange(false);
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [visible, isHovering, onVisibilityChange]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleVoucherTypeChange = (type: string) => {
    const voucherType = voucherTypes.find(vt => vt.value === type);
    onVoucherChange(prev => ({ 
      ...prev, 
      voucher_type: type,
      mode: voucherType?.defaultMode || 'voucher_mode'
    }));
  };

  const handleEntryModeChange = (mode: string) => {
    onVoucherChange(prev => ({ ...prev, mode: mode }));
  };

  const handleSettingsClick = () => {
    onVisibilityChange(false);
    // Navigate to voucher settings page
    navigate('/voucher-settings');
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
      id: 'entry-mode',
      title: 'Entry Mode',
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      content: 'entry-modes'
    },
    {
      id: 'stats',
      title: 'Quick Stats',
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
      content: 'stats'
    },
    {
      id: 'recent',
      title: 'Recent Vouchers',
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      content: 'recent'
    }
  ];

  return (
    <>
      {/* Enhanced Trigger Area */}
      <AnimatePresence>
        {showTrigger && !visible && (
          <motion.div 
            ref={triggerRef}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-0 top-1/2 transform -translate-y-1/2 z-40 cursor-pointer"
            onMouseEnter={() => {
              onVisibilityChange(true);
              setIsHovering(true);
            }}
          >
            <div className="bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-l-xl shadow-xl p-3 hover:bg-white transition-all duration-300">
              <ChevronRight className="w-5 h-5 text-gray-600 hover:text-blue-600 transition-colors transform rotate-180" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Sidebar */}
      <AnimatePresence>
        {visible && (
          <motion.div
            ref={sidebarRef}
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-96 bg-white/95 backdrop-blur-md border-l border-gray-200/50 shadow-2xl z-50"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Voucher Settings</h3>
                    <p className="text-sm text-gray-600">Configure your preferences</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSettingsClick}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    title="Open Voucher Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onVisibilityChange(false)}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="h-full overflow-y-auto p-6 pb-20">
              <div className="space-y-6">
                {sidebarSections.map((section, index) => {
                  const Icon = section.icon;
                  const isExpanded = expandedSections.includes(section.id);
                  
                  return (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
                    >
                      {/* Section Header */}
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(248, 250, 252, 0.8)' }}
                        onClick={() => toggleSection(section.id)}
                        className={`w-full p-4 flex items-center justify-between transition-all duration-300 ${
                          isExpanded ? `bg-gradient-to-r ${section.color} text-white` : 'text-gray-700 hover:text-blue-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${isExpanded ? 'text-white' : 'text-gray-600'}`} />
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
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-gray-50/50">
                              {/* Voucher Types */}
                              {section.content === 'voucher-types' && (
                                <div className="space-y-3">
                                  {voucherTypes.map((type) => {
                                    const isSelected = voucher.voucher_type === type.value;
                                    
                                    return (
                                      <motion.button
                                        key={type.value}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleVoucherTypeChange(type.value)}
                                        className={`w-full p-3 rounded-lg transition-all duration-200 text-left flex items-center space-x-3 ${
                                          isSelected
                                            ? `bg-gradient-to-r ${type.color} text-white shadow-md`
                                            : 'bg-white hover:bg-gray-50 border-2 border-transparent text-gray-700 shadow-sm'
                                        }`}
                                      >
                                        <span className="text-lg">{type.icon}</span>
                                        <div className="flex-1">
                                          <div className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                            {type.label}
                                          </div>
                                          <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                            {type.description}
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <div className="w-2 h-2 rounded-full bg-white" />
                                        )}
                                      </motion.button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Entry Modes */}
                              {section.content === 'entry-modes' && (
                                <div className="space-y-3">
                                  {entryModes.map((mode) => {
                                    const ModeIcon = mode.icon;
                                    const isSelected = voucher.mode === mode.value;
                                    const currentVoucherType = voucherTypes.find(vt => vt.value === voucher.voucher_type);
                                    const isAvailable = 
                                      (mode.value === 'item_invoice' && currentVoucherType?.hasStock) ||
                                      (mode.value === 'voucher_mode') ||
                                      (mode.value === 'accounting_mode');
                                    
                                    if (!isAvailable) return null;
                                    
                                    return (
                                      <motion.button
                                        key={mode.value}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleEntryModeChange(mode.value)}
                                        className={`w-full p-3 rounded-lg transition-all duration-200 text-left flex items-center space-x-3 ${
                                          isSelected
                                            ? 'bg-purple-50 border-2 border-purple-500 text-purple-700 shadow-md'
                                            : 'bg-white hover:bg-gray-50 border-2 border-transparent text-gray-700 shadow-sm'
                                        }`}
                                      >
                                        <ModeIcon className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-gray-500'}`} />
                                        <div className="flex-1">
                                          <div className={`font-medium text-sm ${isSelected ? 'text-purple-700' : 'text-gray-900'}`}>
                                            {mode.label}
                                          </div>
                                          <div className={`text-xs ${isSelected ? 'text-purple-600' : 'text-gray-500'}`}>
                                            {mode.description}
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <div className="w-2 h-2 rounded-full bg-purple-600" />
                                        )}
                                      </motion.button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Quick Stats */}
                              {section.content === 'stats' && (
                                <div className="space-y-3">
                                  {[
                                    { label: "Today's Vouchers", value: '12', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50' },
                                    { label: 'This Month', value: '156', icon: Calendar, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
                                    { label: 'Pending', value: '3', icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50' },
                                    { label: 'Total Amount', value: `₹${totalAmount.toLocaleString()}`, icon: DollarSign, color: 'text-purple-600', bgColor: 'bg-purple-50' }
                                  ].map((item, index) => {
                                    const ItemIcon = item.icon;
                                    return (
                                      <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`flex items-center justify-between p-3 ${item.bgColor} rounded-lg border border-gray-200`}
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
                                <div className="space-y-3">
                                  {recentVouchers.slice(0, 5).map((recentVoucher, index) => (
                                    <motion.div
                                      key={recentVoucher.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      className="group p-3 bg-white rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer border border-gray-200 shadow-sm"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-sm text-gray-900">
                                          {recentVoucher.voucher_number}
                                        </span>
                                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button className="p-1 hover:bg-blue-100 rounded">
                                            <Eye className="w-3 h-3 text-blue-600" />
                                          </button>
                                          <button className="p-1 hover:bg-emerald-100 rounded">
                                            <Edit className="w-3 h-3 text-emerald-600" />
                                          </button>
                                          <button className="p-1 hover:bg-orange-100 rounded">
                                            <Copy className="w-3 h-3 text-orange-600" />
                                          </button>
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                                          {recentVoucher.voucher_type}
                                        </span>
                                        <span className="font-semibold text-sm text-gray-900">
                                          ₹{recentVoucher.total_amount?.toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-500 mt-2">
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