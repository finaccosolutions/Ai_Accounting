import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../ui/Button';
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  FileText, 
  Clock, 
  DollarSign,
  BarChart3,
  Calculator,
  Bot,
  Zap,
  Activity,
  Calendar,
  Users,
  Package,
  Receipt,
  CreditCard,
  Banknote,
  ArrowUpDown,
  Eye,
  Edit,
  Copy,
  Trash2
} from 'lucide-react';

interface RightSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  recentVouchers: any[];
  voucherType: string;
  totalAmount: number;
}

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
    icon: Zap,
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
      { label: 'Payment', icon: CreditCard, action: 'payment' },
      { label: 'Receipt', icon: Banknote, action: 'receipt' },
      { label: 'Journal Entry', icon: ArrowUpDown, action: 'journal' }
    ]
  }
];

export const RightSidebar: React.FC<RightSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  recentVouchers,
  voucherType,
  totalAmount
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['stats', 'recent']);

  const toggleSection = (sectionId: string) => {
    if (collapsed) return;
    
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleAction = (action: string) => {
    console.log('Action:', action);
    // Implement action handlers
  };

  return (
    <div className={`fixed right-0 top-16 h-[calc(100vh-4rem)] bg-white/95 backdrop-blur-md border-l border-gray-200/50 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-80'
    } shadow-xl z-30`}>
      
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleCollapse}
        className="absolute -left-3 top-4 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {collapsed ? (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        )}
      </motion.button>

      {/* Sidebar Content */}
      <div className="h-full overflow-y-auto p-4">
        {collapsed ? (
          // Collapsed View - Icons Only
          <div className="space-y-4">
            {sidebarSections.map((section) => {
              const Icon = section.icon;
              return (
                <motion.button
                  key={section.id}
                  whileHover={{ scale: 1.1, x: 4 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleSection(section.id)}
                  className={`w-full p-3 rounded-xl bg-gradient-to-r ${section.color} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                  title={section.title}
                >
                  <Icon className="w-5 h-5 mx-auto" />
                </motion.button>
              );
            })}
          </div>
        ) : (
          // Expanded View
          <div className="space-y-4">
            {sidebarSections.map((section, sectionIndex) => {
              const Icon = section.icon;
              const isExpanded = expandedSections.includes(section.id);
              
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden"
                >
                  {/* Section Header */}
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
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
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronRight className={`w-4 h-4 ${isExpanded ? 'text-white' : 'text-gray-400'}`} />
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
                        <div className="p-4 pt-0">
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
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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

                          {section.id === 'recent' && (
                            <div className="space-y-3">
                              {recentVouchers.slice(0, 5).map((voucher, index) => (
                                <motion.div
                                  key={voucher.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="group p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-all duration-300 cursor-pointer"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-sm text-gray-900">
                                      {voucher.voucher_number}
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
                                      {voucher.voucher_type}
                                    </span>
                                    <span className="font-semibold text-sm text-gray-900">
                                      ₹{voucher.total_amount?.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {new Date(voucher.date).toLocaleDateString()}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}

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
                                    onClick={() => handleAction(item.action)}
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
        )}
      </div>
    </div>
  );
};