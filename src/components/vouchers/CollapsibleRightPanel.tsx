import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Package, 
  Receipt, 
  ShoppingCart, 
  DollarSign, 
  CreditCard, 
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  Clock,
  Settings
} from 'lucide-react';

interface CollapsibleRightPanelProps {
  visible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  voucher: any;
  onVoucherChange: (voucher: any) => void;
  onVoucherTypeChange: (type: string) => void;
  onModeChange: (mode: string) => void;
}

const voucherTypeIcons = {
  sales: { icon: Receipt, color: 'from-blue-500 to-blue-600', label: 'Sales' },
  purchase: { icon: ShoppingCart, color: 'from-green-500 to-green-600', label: 'Purchase' },
  receipt: { icon: DollarSign, color: 'from-emerald-500 to-emerald-600', label: 'Receipt' },
  payment: { icon: CreditCard, color: 'from-red-500 to-red-600', label: 'Payment' },
  journal: { icon: FileText, color: 'from-indigo-500 to-indigo-600', label: 'Journal' },
  contra: { icon: ArrowRightLeft, color: 'from-teal-500 to-teal-600', label: 'Contra' },
  debit_note: { icon: ArrowUpRight, color: 'from-orange-500 to-orange-600', label: 'Debit Note' },
  credit_note: { icon: ArrowDownRight, color: 'from-purple-500 to-purple-600', label: 'Credit Note' }
};

const quickActions = [
  { id: 'reports', icon: BarChart3, label: 'Reports', color: 'from-blue-500 to-blue-600' },
  { id: 'recent', icon: Clock, label: 'Recent', color: 'from-green-500 to-green-600' },
  { id: 'settings', icon: Settings, label: 'Settings', color: 'from-purple-500 to-purple-600' },
  { id: 'analytics', icon: Activity, label: 'Analytics', color: 'from-orange-500 to-orange-600' }
];

export const CollapsibleRightPanel: React.FC<CollapsibleRightPanelProps> = ({
  visible,
  onVisibilityChange,
  voucher,
  onVoucherChange,
  onVoucherTypeChange,
  onModeChange
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleVoucherTypeSelect = (type: string) => {
    onVoucherTypeChange(type);
    if (collapsed) {
      setCollapsed(false);
    }
  };

  const handleModeSelect = (mode: string) => {
    onModeChange(mode);
    if (collapsed) {
      setCollapsed(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={panelRef}
          initial={{ x: 400, opacity: 0 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            width: collapsed ? '80px' : '320px'
          }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed right-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-100/95 via-blue-50/95 to-indigo-100/95 backdrop-blur-md border-l border-gray-200/50 shadow-2xl z-50 overflow-hidden"
        >
          {/* Collapse/Expand Button */}
          <div className="absolute top-4 left-2 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleCollapse}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              {collapsed ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </motion.button>
          </div>

          {/* Close Button */}
          <div className="absolute top-4 right-4 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onVisibilityChange(false)}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-red-600 transition-colors"
            >
              ×
            </motion.button>
          </div>

          <div className="h-full overflow-y-auto pt-16 pb-4">
            {collapsed ? (
              /* Collapsed View - Icons Only */
              <div className="px-2 space-y-3">
                {/* Voucher Types */}
                <div className="space-y-2">
                  {Object.entries(voucherTypeIcons).map(([type, config]) => {
                    const Icon = config.icon;
                    const isActive = voucher.voucher_type === type;
                    
                    return (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleVoucherTypeSelect(type)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                          isActive
                            ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                            : 'bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 shadow-md'
                        }`}
                        title={config.label}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.button>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-300 mx-2"></div>

                {/* Mode Toggle */}
                {['sales', 'purchase', 'debit_note', 'credit_note'].includes(voucher.voucher_type) && (
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleModeSelect('item_invoice')}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        voucher.mode === 'item_invoice'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                          : 'bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 shadow-md'
                      }`}
                      title="Item Invoice"
                    >
                      <Package className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleModeSelect('voucher_mode')}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        voucher.mode === 'voucher_mode'
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                          : 'bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 shadow-md'
                      }`}
                      title="As Voucher"
                    >
                      <FileText className="w-5 h-5" />
                    </motion.button>
                  </div>
                )}

                {/* Divider */}
                <div className="h-px bg-gray-300 mx-2"></div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    
                    return (
                      <motion.button
                        key={action.id}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 bg-white/80 hover:bg-gradient-to-r hover:${action.color} text-gray-600 hover:text-white shadow-md`}
                        title={action.label}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Expanded View - Full Content */
              <div className="px-4 space-y-6">
                {/* Header */}
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">Voucher Panel</h3>
                  <p className="text-sm text-gray-500">Quick access & settings</p>
                </div>

                {/* Voucher Types */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md">
                  <h4 className="font-medium text-gray-900 mb-3">Voucher Types</h4>
                  <div className="space-y-2">
                    {Object.entries(voucherTypeIcons).map(([type, config]) => {
                      const Icon = config.icon;
                      const isActive = voucher.voucher_type === type;
                      
                      return (
                        <motion.button
                          key={type}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleVoucherTypeSelect(type)}
                          className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                            isActive
                              ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                            <span className="font-medium text-sm">{config.label}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Voucher Mode */}
                {['sales', 'purchase', 'debit_note', 'credit_note'].includes(voucher.voucher_type) && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md">
                    <h4 className="font-medium text-gray-900 mb-3">Voucher Mode</h4>
                    <div className="space-y-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleModeSelect('item_invoice')}
                        className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                          voucher.mode === 'item_invoice'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Package className={`w-5 h-5 ${voucher.mode === 'item_invoice' ? 'text-white' : 'text-gray-600'}`} />
                          <div>
                            <span className="font-medium text-sm">Item Invoice</span>
                            <p className={`text-xs ${voucher.mode === 'item_invoice' ? 'text-white/80' : 'text-gray-500'}`}>
                              With stock items
                            </p>
                          </div>
                        </div>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleModeSelect('voucher_mode')}
                        className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                          voucher.mode === 'voucher_mode'
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className={`w-5 h-5 ${voucher.mode === 'voucher_mode' ? 'text-white' : 'text-gray-600'}`} />
                          <div>
                            <span className="font-medium text-sm">As Voucher</span>
                            <p className={`text-xs ${voucher.mode === 'voucher_mode' ? 'text-white/80' : 'text-gray-500'}`}>
                              Ledger entries only
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md">
                  <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      
                      return (
                        <motion.button
                          key={action.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-3 rounded-lg text-center transition-all duration-200 bg-gray-50 hover:bg-gradient-to-r hover:${action.color} text-gray-700 hover:text-white shadow-sm`}
                        >
                          <Icon className="w-5 h-5 mx-auto mb-1" />
                          <span className="text-xs font-medium">{action.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};