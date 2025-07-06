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

const sidebarSections = [
  {
    id: 'stats',
    title: 'Quick Stats',
    icon: TrendingUp,
    color: 'from-blue-500 to-blue-600',
    items: [
      { label: "Today's Vouchers", value: '12', icon: FileText },
      { label: 'This Month', value: '156', icon: Calendar },
      { label: 'Pending', value: '3', icon: Clock, color: 'text-orange-600' },
      { label: 'Total Amount', value: '₹2,45,680', icon: DollarSign, color: 'text-green-600' }
    ]
  },
  {
    id: 'recent',
    title: 'Recent Vouchers',
    icon: FileText,
    color: 'from-green-500 to-green-600',
    items: []
  },
  {
    id: 'actions',
    title: 'Quick Actions',
    icon: Activity,
    color: 'from-purple-500 to-purple-600',
    items: [
      { label: 'View All Vouchers', icon: FileText, action: 'view_all' },
      { label: 'Trial Balance', icon: Calculator, action: 'trial_balance' },
      { label: 'Day Book', icon: BarChart3, action: 'day_book' },
      { label: 'AI Assistant', icon: Bot, action: 'ai_assistant' }
    ]
  },
  {
    id: 'shortcuts',
    title: 'Voucher Shortcuts',
    icon: Activity,
    color: 'from-orange-500 to-orange-600',
    items: [
      { label: 'Sales Invoice', icon: Receipt, action: 'sales' },
      { label: 'Purchase Bill', icon: Package, action: 'purchase' },
      { label: 'Payment', icon: DollarSign, action: 'payment' },
      { label: 'Receipt', icon: DollarSign, action: 'receipt' }
    ]
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
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>(['stats', 'recent']);
  const [isHovering, setIsHovering] = useState(false);
  const [showTrigger, setShowTrigger] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide trigger when sidebar is visible and not hovering
  useEffect(() => {
    if (visible && !isHovering) {
      const timer = setTimeout(() => setShowTrigger(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowTrigger(true);
    }
  }, [visible, isHovering]);

  // Enhanced mouse detection for auto-show/hide
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const windowWidth = window.innerWidth;
      const triggerZone = 30;
      
      if (e.clientX >= windowWidth - triggerZone) {
        if (!visible) {
          onVisibilityChange(true);
        }
        setShowTrigger(true);
        
        // Clear any pending hide timeout
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
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
    onVoucherChange(prev => ({ 
      ...prev, 
      voucher_type: type
    }));
    // Auto-hide sidebar when selection is made
    onVisibilityChange(false);
  };

  const handleSettingsClick = () => {
    onVisibilityChange(false);
    navigate('/voucher-settings');
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Set a timeout to hide the sidebar
    if (visible) {
      hideTimeoutRef.current = setTimeout(() => {
        onVisibilityChange(false);
      }, 300); // 300ms delay before hiding
    }
  };

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
            <div className="bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-l-xl shadow-xl p-3 hover:bg-white transition-all duration-300">
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
            className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-96 bg-gradient-to-br from-slate-100/95 via-blue-50/95 to-indigo-100/95 backdrop-blur-md border-l border-gray-200/50 shadow-2xl z-50"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/90 to-blue-50/90 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Voucher Settings</h3>
                    <p className="text-sm text-gray-500">Always ready to help</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSettingsClick}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100/80"
                    title="Open Voucher Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onVisibilityChange(false)}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100/80"
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
                      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100/50 overflow-hidden"
                    >
                      {/* Section Header */}
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(248, 250, 252, 0.9)' }}
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
                              {/* Quick Stats */}
                              {section.id === 'stats' && (
                                <div className="space-y-3">
                                  {section.items.map((item, index) => {
                                    const ItemIcon = item.icon;
                                    return (
                                      <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`flex items-center justify-between p-3 ${item.bgColor || 'bg-gray-50'} rounded-lg border border-gray-200/50`}
                                      >
                                        <div className="flex items-center space-x-3">
                                          <ItemIcon className="w-4 h-4 text-gray-600" />
                                          <span className="text-sm text-gray-700">{item.label}</span>
                                        </div>
                                        <span className={`font-semibold text-sm ${item.color || 'text-gray-900'}`}>
                                          {item.value}
                                        </span>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Recent Vouchers */}
                              {section.id === 'recent' && (
                                <div className="space-y-3">
                                  {recentVouchers.slice(0, 5).map((recentVoucher, index) => (
                                    <motion.div
                                      key={recentVoucher.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      className="group p-3 bg-white rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer border border-gray-200/50 shadow-sm"
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

                              {/* Quick Actions & Shortcuts */}
                              {(section.id === 'actions' || section.id === 'shortcuts') && (
                                <div className="space-y-2">
                                  {section.items.map((item, index) => {
                                    const ItemIcon = item.icon;
                                    return (
                                      <motion.button
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                          if (section.id === 'shortcuts' && item.action) {
                                            handleVoucherTypeChange(item.action);
                                          }
                                        }}
                                        className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all duration-300 text-left group"
                                      >
                                        <ItemIcon className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
                                        <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors">
                                          {item.label}
                                        </span>
                                      </motion.button>
                                    );
                                  })}
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