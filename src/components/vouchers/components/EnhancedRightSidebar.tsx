import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../ui/Button';
import { 
  X,
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
  Building2
} from 'lucide-react';

const voucherTypes = [
  { 
    value: 'sales', 
    label: 'Sales', 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50',
    icon: '💰',
    description: 'Record sales transactions'
  },
  { 
    value: 'purchase', 
    label: 'Purchase', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50',
    icon: '🛒',
    description: 'Record purchase transactions'
  },
  { 
    value: 'receipt', 
    label: 'Receipt', 
    color: 'text-green-600', 
    bgColor: 'bg-green-50',
    icon: '📥',
    description: 'Money received'
  },
  { 
    value: 'payment', 
    label: 'Payment', 
    color: 'text-red-600', 
    bgColor: 'bg-red-50',
    icon: '📤',
    description: 'Money paid out'
  },
  { 
    value: 'journal', 
    label: 'Journal', 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50',
    icon: '📝',
    description: 'General journal entries'
  },
  { 
    value: 'contra', 
    label: 'Contra', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50',
    icon: '🔄',
    description: 'Bank to cash transfers'
  }
];

const entryMethods = [
  {
    value: 'manual',
    label: 'Manual Entry',
    icon: Edit,
    description: 'Traditional manual data entry',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50'
  },
  {
    value: 'ai_assisted',
    label: 'AI Assisted',
    icon: Bot,
    description: 'AI helps with smart suggestions',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    value: 'pdf_upload',
    label: 'Upload PDF Invoice',
    icon: FileText,
    description: 'Extract data from PDF invoices',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    value: 'bank_statement',
    label: 'Bank Statement',
    icon: BarChart3,
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
  const [expandedSections, setExpandedSections] = useState<string[]>(['voucher-type', 'entry-method']);
  const [isHovering, setIsHovering] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Improved mouse detection
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const windowWidth = window.innerWidth;
      const triggerZone = 20; // 20px from the right edge
      
      // Show panel when mouse is in the trigger zone
      if (e.clientX >= windowWidth - triggerZone) {
        if (!visible) {
          onVisibilityChange(true);
        }
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Only hide if mouse is completely outside the sidebar and trigger area
      if (visible && !isHovering) {
        const windowWidth = window.innerWidth;
        if (e.clientX < windowWidth - 400) { // 400px is sidebar width + buffer
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
    onVoucherChange(prev => ({ ...prev, voucher_type: type }));
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
      icon: Settings,
      color: 'from-purple-500 to-purple-600',
      content: 'entry-methods'
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
      <div 
        ref={triggerRef}
        className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-5 z-40 cursor-pointer"
        onMouseEnter={() => onVisibilityChange(true)}
      >
        {/* Subtle trigger indicator */}
        <div className="w-1 h-full bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 opacity-30 hover:opacity-60 transition-opacity duration-300 ml-auto" />
        
        {/* Floating hint */}
        {!visible && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none"
          >
            Settings
          </motion.div>
        )}
      </div>

      {/* Main Sidebar */}
      <AnimatePresence>
        {visible && (
          <motion.div
            ref={sidebarRef}
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-96 bg-white/95 backdrop-blur-md border-l border-slate-200 shadow-2xl z-50"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Voucher Settings</h3>
                    <p className="text-sm text-slate-600">Configure your preferences</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onVisibilityChange(false)}
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </Button>
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
                      className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden"
                    >
                      {/* Section Header */}
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(248, 250, 252, 0.8)' }}
                        onClick={() => toggleSection(section.id)}
                        className={`w-full p-4 flex items-center justify-between transition-all duration-300 ${
                          isExpanded ? `bg-gradient-to-r ${section.color} text-white` : 'text-slate-700 hover:text-blue-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${isExpanded ? 'text-white' : 'text-slate-600'}`} />
                          <span className="font-medium text-sm">{section.title}</span>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className={`w-4 h-4 ${isExpanded ? 'text-white' : 'text-slate-400'}`} />
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
                            <div className="p-4 bg-slate-50/50">
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
                                            ? `${type.bgColor} border-2 ${type.color} shadow-md`
                                            : 'bg-white hover:bg-slate-50 border-2 border-transparent text-slate-700 shadow-sm'
                                        }`}
                                      >
                                        <span className="text-lg">{type.icon}</span>
                                        <div className="flex-1">
                                          <div className={`font-medium text-sm ${isSelected ? type.color : 'text-slate-900'}`}>
                                            {type.label}
                                          </div>
                                          <div className={`text-xs ${isSelected ? type.color.replace('600', '500') : 'text-slate-500'}`}>
                                            {type.description}
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <div className={`w-2 h-2 rounded-full ${type.color.replace('text-', 'bg-')}`} />
                                        )}
                                      </motion.button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Entry Methods */}
                              {section.content === 'entry-methods' && (
                                <div className="space-y-3">
                                  {entryMethods.map((method) => {
                                    const MethodIcon = method.icon;
                                    const isSelected = voucher.entry_method === method.value;
                                    
                                    return (
                                      <motion.button
                                        key={method.value}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleEntryMethodChange(method.value)}
                                        className={`w-full p-3 rounded-lg transition-all duration-200 text-left flex items-center space-x-3 ${
                                          isSelected
                                            ? `${method.bgColor} border-2 ${method.color} shadow-md`
                                            : 'bg-white hover:bg-slate-50 border-2 border-transparent text-slate-700 shadow-sm'
                                        }`}
                                      >
                                        <MethodIcon className={`w-5 h-5 ${isSelected ? method.color : 'text-slate-500'}`} />
                                        <div className="flex-1">
                                          <div className={`font-medium text-sm ${isSelected ? method.color : 'text-slate-900'}`}>
                                            {method.label}
                                          </div>
                                          <div className={`text-xs ${isSelected ? method.color.replace('600', '500') : 'text-slate-500'}`}>
                                            {method.description}
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <div className={`w-2 h-2 rounded-full ${method.color.replace('text-', 'bg-')}`} />
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
                                        className={`flex items-center justify-between p-3 ${item.bgColor} rounded-lg border border-slate-200`}
                                      >
                                        <div className="flex items-center space-x-3">
                                          <ItemIcon className={`w-4 h-4 ${item.color}`} />
                                          <span className="text-sm text-slate-700">{item.label}</span>
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
                                      className="group p-3 bg-white rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer border border-slate-200 shadow-sm"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-sm text-slate-900">
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
                                        <span className="text-xs text-slate-500 capitalize bg-slate-100 px-2 py-1 rounded">
                                          {recentVoucher.voucher_type}
                                        </span>
                                        <span className="font-semibold text-sm text-slate-900">
                                          ₹{recentVoucher.total_amount?.toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="text-xs text-slate-500 mt-2">
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