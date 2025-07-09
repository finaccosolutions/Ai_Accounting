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
  Receipt,
  ShoppingCart,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  Sparkles,
  Zap,
  Maximize2,
  Minimize2
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
  const [expandedSections, setExpandedSections] = useState({
    voucherTypes: true,
    voucherMode: true,
    quickStats: true,
    recentVouchers: true
  });
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
          className="fixed right-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-800/95 via-slate-700/95 to-slate-600/95 backdrop-blur-xl border-l border-slate-300/30 shadow-2xl z-50 overflow-hidden"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-600/20 via-slate-500/20 to-slate-400/20"></div>
          
          {/* Header Controls - Positioned for small panel */}
          <div className="absolute top-4 left-2 z-10 flex items-center space-x-2">
            {/* Expand/Collapse Button - Left position */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleExpansion}
              className="w-8 h-8 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-300"
            >
              {isExpanded ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </motion.button>
            
            {/* Close Button - Right of expand button */}
            <motion.button
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-300"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="h-full overflow-y-auto pt-16 pb-4">
            {!isExpanded ? (
              /* Collapsed View - Enhanced Icons */
              <div className="px-3 space-y-3">
                {/* Voucher Types - All 8 types without scrolling */}
                <div className="space-y-2">
                  {voucherTypes.map((type, index) => {
                    const Icon = type.icon;
                    const isActive = voucher.voucher_type === type.value;
                    
                    return (
                    <motion.button
                      key={type.value}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.1, rotate: 3 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleVoucherTypeChange(type.value)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg ${
                        isActive
                          ? `bg-gradient-to-r ${type.color.replace('blue', 'emerald').replace('purple', 'teal').replace('pink', 'green')} text-white shadow-lg scale-105`
                                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                              }`}
                      title={type.label}
                    >
                      <Icon className="w-5 h-5" />
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center"
                          >
                            <Sparkles className="w-2 h-2 text-yellow-800" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent mx-1"></div>

                {/* Mode Toggle */}
                {['sales', 'purchase', 'debit_note', 'credit_note'].includes(voucher.voucher_type) && (
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: -3 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleVoucherModeChange('item_invoice')}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg ${
                        voucher.mode === 'item_invoice'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-105'
                          : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white'
                      }`}
                      title="Item Invoice"
                    >
                      <Package className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 3 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleVoucherModeChange('voucher_mode')}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg ${
                        voucher.mode === 'voucher_mode'
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg scale-105'
                          : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white'
                      }`}
                      title="As Voucher"
                    >
                      <FileText className="w-5 h-5" />
                    </motion.button>
                  </div>
                )}

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent mx-1"></div>

                {/* Quick Actions + Settings */}
                <div className="space-y-2">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    
                    return (
                      <motion.button
                        key={action.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (voucherTypes.length + index) * 0.05 }}
                        whileHover={{ scale: 1.1, rotate: action.id === 'analytics' ? 180 : 0 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg bg-white/20 backdrop-blur-sm hover:bg-gradient-to-r hover:${action.color} text-white`}
                        title={action.label}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.button>
                    );
                  })}
                  
                  {/* Settings Button */}
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (voucherTypes.length + quickActions.length) * 0.05 }}
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSettingsClick}
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg bg-white/20 backdrop-blur-sm hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-600 text-white"
                    title="Voucher Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </motion.button>
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
                  <div className="w-16 h-16 bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Voucher Panel</h3>
                  <p className="text-slate-300">Quick access & smart controls</p>
                </motion.div>

                {/* Voucher Types */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                  <div className="p-4 bg-gradient-to-r from-slate-600/50 to-slate-700/50 flex items-center justify-between">
                    <h4 className="font-bold text-white flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Voucher Types
                    </h4>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleSection('voucherTypes')}
                      className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                      {expandedSections.voucherTypes ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                  
                  <AnimatePresence>
                    {expandedSections.voucherTypes && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-3">
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
                                    <p className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-300'}`}>
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
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Voucher Mode */}
                {voucherTypes.find(vt => vt.value === voucher.voucher_type)?.hasMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                  >
                    <div className="p-4 bg-gradient-to-r from-slate-600/50 to-slate-700/50 flex items-center justify-between">
                      <h4 className="font-bold text-white flex items-center">
                        <Package className="w-5 h-5 mr-2" />
                        Voucher Mode
                      </h4>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleSection('voucherMode')}
                        className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                      >
                        {expandedSections.voucherMode ? (
                          <Minimize2 className="w-4 h-4" />
                        ) : (
                          <Maximize2 className="w-4 h-4" />
                        )}
                      </motion.button>
                    </div>
                    
                    <AnimatePresence>
                      {expandedSections.voucherMode && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
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
                                      ? `bg-gradient-to-r ${mode.color.replace('blue', 'emerald').replace('purple', 'teal').replace('pink', 'green')} text-white shadow-lg scale-105`
                                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                              }`}
                            >
                                  <div className="flex items-center space-x-3">
                                    <Icon className="w-5 h-5" />
                                    <div className="flex-1">
                                      <span className="font-medium text-sm">{mode.label}</span>
                                      <p className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-300'}`}>
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
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Quick Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                  <div className="p-4 bg-gradient-to-r from-slate-600/50 to-slate-700/50 flex items-center justify-between">
                    <h4 className="font-bold text-white flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Quick Stats
                    </h4>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleSection('quickStats')}
                      className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                      {expandedSections.quickStats ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                  
                  <AnimatePresence>
                    {expandedSections.quickStats && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
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
                                  <span className="text-sm text-slate-300">{stat.label}</span>
                                </div>
                                <span className="font-bold text-white">{stat.value}</span>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Recent Vouchers */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                  <div className="p-4 bg-gradient-to-r from-slate-600/50 to-slate-700/50 flex items-center justify-between">
                    <h4 className="font-bold text-white flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Recent Vouchers
                    </h4>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleSection('recentVouchers')}
                      className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                      {expandedSections.recentVouchers ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                  
                  <AnimatePresence>
                    {expandedSections.recentVouchers && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
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
                                <span className="text-xs text-slate-300 capitalize bg-white/10 px-2 py-1 rounded">
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
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Settings Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSettingsClick}
                    className="w-full p-4 bg-gradient-to-r from-gray-600/50 to-gray-700/50 text-left transition-all duration-300 hover:from-gray-500/50 hover:to-gray-600/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Settings className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white">Voucher Settings</h4>
                        <p className="text-xs text-slate-300">Configure voucher preferences</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </motion.button>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};