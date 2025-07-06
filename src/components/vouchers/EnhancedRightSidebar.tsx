import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { 
  ChevronRight,
  ChevronLeft,
  X,
  Settings,
  FileText,
  TrendingUp,
  Clock,
  DollarSign,
  Calendar,
  ChevronDown,
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
  Receipt,
  ShoppingCart,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  Sparkles,
  Zap
} from 'lucide-react';

const voucherTypes = [
  { 
    value: 'sales', 
    label: 'Sales Invoice', 
    icon: Receipt, 
    color: 'from-blue-500 to-blue-600',
    hasMode: true,
    description: 'Record sales transactions'
  },
  { 
    value: 'purchase', 
    label: 'Purchase Bill', 
    icon: ShoppingCart, 
    color: 'from-green-500 to-green-600',
    hasMode: true,
    description: 'Record purchase transactions'
  },
  { 
    value: 'debit_note', 
    label: 'Debit Note', 
    icon: ArrowUpRight, 
    color: 'from-orange-500 to-orange-600',
    hasMode: true,
    description: 'Debit adjustments'
  },
  { 
    value: 'credit_note', 
    label: 'Credit Note', 
    icon: ArrowDownRight, 
    color: 'from-purple-500 to-purple-600',
    hasMode: true,
    description: 'Credit adjustments'
  },
  { 
    value: 'receipt', 
    label: 'Receipt Voucher', 
    icon: DollarSign, 
    color: 'from-emerald-500 to-emerald-600',
    hasMode: false,
    description: 'Money received'
  },
  { 
    value: 'payment', 
    label: 'Payment Voucher', 
    icon: CreditCard, 
    color: 'from-red-500 to-red-600',
    hasMode: false,
    description: 'Money paid'
  },
  { 
    value: 'journal', 
    label: 'Journal Entry', 
    icon: FileText, 
    color: 'from-indigo-500 to-indigo-600',
    hasMode: false,
    description: 'General journal entries'
  },
  { 
    value: 'contra', 
    label: 'Contra Entry', 
    icon: ArrowRightLeft, 
    color: 'from-teal-500 to-teal-600',
    hasMode: false,
    description: 'Bank to cash transfers'
  }
];

const voucherModes = [
  { 
    value: 'item_invoice', 
    label: 'Item Invoice', 
    description: 'With stock items and detailed entries',
    icon: Package,
    color: 'from-blue-500 to-blue-600'
  },
  { 
    value: 'voucher_mode', 
    label: 'As Voucher', 
    description: 'Ledger entries only',
    icon: FileText,
    color: 'from-purple-500 to-purple-600'
  }
];

const quickActions = [
  { id: 'reports', icon: BarChart3, label: 'Reports', color: 'from-blue-500 to-blue-600' },
  { id: 'recent', icon: Clock, label: 'Recent', color: 'from-green-500 to-green-600' },
  { id: 'settings', icon: Settings, label: 'Settings', color: 'from-purple-500 to-purple-600' },
  { id: 'analytics', icon: Activity, label: 'Analytics', color: 'from-orange-500 to-orange-600' }
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
  const [isExpanded, setIsExpanded] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleVoucherTypeChange = (type: string) => {
    const selectedType = voucherTypes.find(vt => vt.value === type);
    const newVoucher = {
      ...voucher,
      voucher_type: type,
      mode: selectedType?.hasMode ? 'item_invoice' : 'voucher_mode'
    };
    onVoucherChange(newVoucher);
    
    // Collapse panel after selection if it was expanded
    if (isExpanded) {
      setIsExpanded(false);
    }
  };

  const handleVoucherModeChange = (mode: string) => {
    onVoucherChange({
      ...voucher,
      mode: mode
    });
    
    // Collapse panel after selection if it was expanded
    if (isExpanded) {
      setIsExpanded(false);
    }
  };

  const handleSettingsClick = () => {
    navigate('/voucher-settings');
  };

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const handleClose = () => {
    onVisibilityChange(false);
    setIsExpanded(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={sidebarRef}
          initial={{ x: 400, opacity: 0 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            width: isExpanded ? '400px' : '80px'
          }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed right-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-xl border-l border-purple-300/30 shadow-2xl z-50 overflow-hidden"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
          
          {/* Header Controls */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center space-y-3">
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-xl flex items-center justify-center text-white hover:shadow-2xl transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </motion.button>
            
            {/* Expand/Collapse Button */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleExpansion}
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-xl flex items-center justify-center text-white hover:shadow-2xl transition-all duration-300"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.div>
            </motion.button>
          </div>

          <div className="h-full overflow-y-auto pt-24 pb-4">
            {!isExpanded ? (
              /* Collapsed View - Enhanced Icons */
              <div className="px-3 space-y-4">
                {/* Voucher Types */}
                <div className="space-y-3">
                  {voucherTypes.map((type, index) => {
                    const Icon = type.icon;
                    const isActive = voucher.voucher_type === type.value;
                    
                    return (
                      <motion.button
                        key={type.value}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleVoucherTypeChange(type.value)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-2xl ${
                          isActive
                            ? `bg-gradient-to-r ${type.color} text-white shadow-2xl scale-110`
                            : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white'
                        }`}
                        title={type.label}
                      >
                        <Icon className="w-6 h-6" />
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center"
                          >
                            <Sparkles className="w-2 h-2 text-yellow-800" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent mx-2"></div>

                {/* Mode Toggle */}
                {['sales', 'purchase', 'debit_note', 'credit_note'].includes(voucher.voucher_type) && (
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.15, rotate: -5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleVoucherModeChange('item_invoice')}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-2xl ${
                        voucher.mode === 'item_invoice'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-2xl scale-110'
                          : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white'
                      }`}
                      title="Item Invoice"
                    >
                      <Package className="w-6 h-6" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleVoucherModeChange('voucher_mode')}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-2xl ${
                        voucher.mode === 'voucher_mode'
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-2xl scale-110'
                          : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white'
                      }`}
                      title="As Voucher"
                    >
                      <FileText className="w-6 h-6" />
                    </motion.button>
                  </div>
                )}

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent mx-2"></div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    
                    return (
                      <motion.button
                        key={action.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (voucherTypes.length + index) * 0.1 }}
                        whileHover={{ scale: 1.15, rotate: action.id === 'settings' ? 180 : 0 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={action.id === 'settings' ? handleSettingsClick : undefined}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-2xl bg-white/20 backdrop-blur-sm hover:bg-gradient-to-r hover:${action.color} text-white`}
                        title={action.label}
                      >
                        <Icon className="w-6 h-6" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Expanded View - Enhanced Content */
              <div className="px-6 space-y-6">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Voucher Panel</h3>
                  <p className="text-purple-200">Quick access & smart controls</p>
                </motion.div>

                {/* Voucher Types */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                  <div className="p-4 bg-gradient-to-r from-indigo-600/50 to-purple-600/50">
                    <h4 className="font-bold text-white flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Voucher Types
                    </h4>
                  </div>
                  
                  <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                    {voucherTypes.map((type, index) => {
                      const Icon = type.icon;
                      const isActive = voucher.voucher_type === type.value;
                      
                      return (
                        <motion.button
                          key={type.value}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleVoucherTypeChange(type.value)}
                          className={`w-full p-3 rounded-xl text-left transition-all duration-300 ${
                            isActive
                              ? `bg-gradient-to-r ${type.color} text-white shadow-lg scale-105`
                              : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5" />
                            <div className="flex-1">
                              <span className="font-medium text-sm">{type.label}</span>
                              <p className={`text-xs ${isActive ? 'text-white/80' : 'text-purple-200'}`}>
                                {type.description}
                              </p>
                            </div>
                            {isActive && (
                              <Sparkles className="w-4 h-4 text-yellow-300" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Voucher Mode */}
                {voucherTypes.find(vt => vt.value === voucher.voucher_type)?.hasMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                  >
                    <div className="p-4 bg-gradient-to-r from-purple-600/50 to-pink-600/50">
                      <h4 className="font-bold text-white flex items-center">
                        <Package className="w-5 h-5 mr-2" />
                        Voucher Mode
                      </h4>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      {voucherModes.map((mode, index) => {
                        const Icon = mode.icon;
                        const isActive = voucher.mode === mode.value;
                        
                        return (
                          <motion.button
                            key={mode.value}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleVoucherModeChange(mode.value)}
                            className={`w-full p-3 rounded-xl text-left transition-all duration-300 ${
                              isActive
                                ? `bg-gradient-to-r ${mode.color} text-white shadow-lg scale-105`
                                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className="w-5 h-5" />
                              <div className="flex-1">
                                <span className="font-medium text-sm">{mode.label}</span>
                                <p className={`text-xs ${isActive ? 'text-white/80' : 'text-purple-200'}`}>
                                  {mode.description}
                                </p>
                              </div>
                              {isActive && (
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Quick Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                  <div className="p-4 bg-gradient-to-r from-green-600/50 to-emerald-600/50">
                    <h4 className="font-bold text-white flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Quick Stats
                    </h4>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {[
                      { label: "Today's Vouchers", value: '12', icon: FileText, color: 'text-blue-300' },
                      { label: 'This Month', value: '156', icon: Calendar, color: 'text-green-300' },
                      { label: 'Total Amount', value: `₹${totalAmount.toLocaleString()}`, icon: DollarSign, color: 'text-yellow-300' }
                    ].map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className={`w-4 h-4 ${stat.color}`} />
                            <span className="text-sm text-purple-200">{stat.label}</span>
                          </div>
                          <span className="font-bold text-white">{stat.value}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Recent Vouchers */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                  <div className="p-4 bg-gradient-to-r from-orange-600/50 to-red-600/50">
                    <h4 className="font-bold text-white flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Recent Vouchers
                    </h4>
                  </div>
                  
                  <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
                    {recentVouchers.slice(0, 3).map((recentVoucher, index) => (
                      <motion.div
                        key={recentVoucher.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-white">
                            {recentVoucher.voucher_number}
                          </span>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:bg-blue-500/20 rounded">
                              <Eye className="w-3 h-3 text-blue-300" />
                            </button>
                            <button className="p-1 hover:bg-emerald-500/20 rounded">
                              <Edit className="w-3 h-3 text-emerald-300" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-purple-300 capitalize bg-white/10 px-2 py-1 rounded">
                            {recentVoucher.voucher_type}
                          </span>
                          <span className="font-semibold text-sm text-yellow-300">
                            ₹{recentVoucher.total_amount?.toLocaleString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};