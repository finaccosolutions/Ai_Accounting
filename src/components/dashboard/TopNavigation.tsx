import React, { useState, useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Company, FinancialYear } from '../../types';
import { Button } from '../ui/Button';
import { 
  Calculator, 
  Menu,
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Minimize2,
  Plus,
  Sparkles,
  Zap,
  Globe,
  Shield,
  HelpCircle,
  Moon,
  Sun,
  Building2,
  Calendar,
  Star,
  Activity
} from 'lucide-react';

interface TopNavigationProps {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onToggleAIChat: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notifications: number;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  isMobile: boolean;
  onCreateCompany: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  sidebarOpen,
  sidebarCollapsed,
  onToggleSidebar,
  onToggleAIChat,
  searchQuery,
  setSearchQuery,
  notifications,
  darkMode,
  setDarkMode,
  isMobile,
  onCreateCompany
}) => {
  const { signOut, userProfile } = useAuth();
  const { selectedCompany, selectedFinancialYear } = useApp();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [accountsDropdownOpen, setAccountsDropdownOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchFinancialYears(selectedCompany.id);
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchFinancialYears = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('financial_years')
        .select('*')
        .eq('company_id', companyId)
        .order('year_start', { ascending: false });

      if (error) throw error;
      setFinancialYears(data || []);
    } catch (error) {
      console.error('Error fetching financial years:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownOpen) {
        setProfileDropdownOpen(false);
      }
      if (accountsDropdownOpen) {
        setAccountsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen, accountsDropdownOpen]);

  // Quick actions for search
  const quickActions = [
    { label: 'Create Sales Voucher', action: () => {}, icon: Plus },
    { label: 'Add New Ledger', action: () => {}, icon: Plus },
    { label: 'Generate Report', action: () => {}, icon: Plus },
    { label: 'AI Assistant', action: onToggleAIChat, icon: Sparkles },
  ];

  const filteredActions = quickActions.filter(action =>
    action.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-white/95 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-xl"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/50 opacity-60" />
      
      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Menu */}
          <div className="flex items-center space-x-4">
            <motion.button 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleSidebar}
              className="p-3 rounded-2xl text-gray-600 hover:text-gray-900 hover:bg-white/80 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200/50"
            >
              <AnimatePresence mode="wait">
                {sidebarOpen && !sidebarCollapsed ? (
                  <motion.div
                    key="minimize"
                    initial={{ rotate: 0, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    exit={{ rotate: 90, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Minimize2 className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: -90, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center cursor-pointer"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-14 h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mr-4 shadow-2xl"
              >
                <Calculator className="h-8 w-8 text-white" />
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AccounTech
                </h1>
                <p className="text-xs text-gray-500 -mt-1 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Powered Accounting
                </p>
              </div>
            </motion.div>
          </div>

          {/* Center - Enhanced Search */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative w-full"
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vouchers, ledgers, reports, or ask AI..."
                className="w-full pl-12 pr-20 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200/60 rounded-2xl focus:ring-4 focus:ring-blue-100/50 focus:border-blue-400 focus:bg-white transition-all duration-300 text-sm shadow-lg focus:shadow-xl placeholder-gray-400"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onToggleAIChat}
                  className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.button>
                <kbd className="px-3 py-1 text-xs text-gray-500 bg-gray-100/80 backdrop-blur-sm rounded-lg border border-gray-200/50">⌘K</kbd>
              </div>

              {/* Enhanced Search Dropdown */}
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border-2 border-gray-200/60 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto"
                >
                  {filteredActions.length > 0 ? (
                    <div className="p-3">
                      <p className="text-xs text-gray-500 px-3 py-2 font-semibold">Quick Actions</p>
                      {filteredActions.map((action, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ backgroundColor: '#f8fafc', x: 4 }}
                          onClick={() => {
                            action.action();
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 text-left group"
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <action.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{action.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No results found
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right side - Enhanced Actions */}
          <div className="flex items-center space-x-3">
            {/* Enhanced Accounts Dropdown */}
            <div className="hidden lg:block relative">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAccountsDropdownOpen(!accountsDropdownOpen)}
                className="flex items-center space-x-3 px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 rounded-2xl hover:bg-white focus:ring-4 focus:ring-blue-100/50 focus:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Building2 className="h-5 w-5 text-gray-600" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 truncate max-w-32">
                    {selectedCompany ? selectedCompany.name : 'Select Company'}
                  </p>
                  {selectedFinancialYear && (
                    <p className="text-xs text-gray-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      FY {new Date(selectedFinancialYear.year_start).getFullYear()}-{new Date(selectedFinancialYear.year_end).getFullYear().toString().slice(-2)}
                    </p>
                  )}
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${
                  accountsDropdownOpen ? 'rotate-180' : ''
                }`} />
              </motion.button>

              <AnimatePresence>
                {accountsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="absolute right-0 mt-2 w-96 bg-white/95 backdrop-blur-xl border-2 border-gray-200/60 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto"
                  >
                    {/* Company Section */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-900 flex items-center">
                          <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                          Company
                        </h4>
                        <Button size="sm" onClick={onCreateCompany} className="bg-gradient-to-r from-green-500 to-emerald-600">
                          <Plus className="w-3 h-3 mr-1" />
                          New
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                        {companies.map((company) => (
                          <motion.button
                            key={company.id}
                            whileHover={{ scale: 1.02, x: 4 }}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                              selectedCompany?.id === company.id
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-2 border-blue-200 shadow-lg'
                                : 'hover:bg-gray-50 border-2 border-transparent'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                selectedCompany?.id === company.id 
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                                  : 'bg-gray-100'
                              }`}>
                                <Building2 className={`w-5 h-5 ${
                                  selectedCompany?.id === company.id ? 'text-white' : 'text-gray-600'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{company.name}</p>
                                {company.gstin && (
                                  <p className="text-xs text-gray-500">GSTIN: {company.gstin}</p>
                                )}
                              </div>
                              {selectedCompany?.id === company.id && (
                                <Star className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Financial Year Section */}
                    {selectedCompany && (
                      <div className="p-6">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-green-600" />
                          Financial Year
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                          {financialYears.map((fy) => (
                            <motion.button
                              key={fy.id}
                              whileHover={{ scale: 1.02, x: 4 }}
                              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                                selectedFinancialYear?.id === fy.id
                                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-2 border-green-200 shadow-lg'
                                  : 'hover:bg-gray-50 border-2 border-transparent'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    selectedFinancialYear?.id === fy.id 
                                      ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                      : 'bg-gray-100'
                                  }`}>
                                    <Calendar className={`w-5 h-5 ${
                                      selectedFinancialYear?.id === fy.id ? 'text-white' : 'text-gray-600'
                                    }`} />
                                  </div>
                                  <span className="font-semibold">
                                    FY {new Date(fy.year_start).getFullYear()}-{new Date(fy.year_end).getFullYear().toString().slice(-2)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {fy.is_active && (
                                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
                                      Active
                                    </span>
                                  )}
                                  {selectedFinancialYear?.id === fy.id && (
                                    <Star className="w-4 h-4 text-green-600" />
                                  )}
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Enhanced Quick Actions */}
            <motion.button 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleAIChat}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl"
              title="AI Assistant"
            >
              <Zap className="h-5 w-5" />
            </motion.button>

            {/* Enhanced Theme Toggle */}
            <motion.button 
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-2xl text-gray-600 hover:text-gray-900 hover:bg-white/80 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200/50"
              title="Toggle Theme"
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    exit={{ rotate: 90, scale: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sun className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    exit={{ rotate: -90, scale: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Enhanced Notifications */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-3 rounded-2xl text-gray-600 hover:text-gray-900 hover:bg-white/80 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200/50"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg"
                >
                  {notifications}
                </motion.span>
              )}
            </motion.button>

            {/* Enhanced Help */}
            <motion.button 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-2xl text-gray-600 hover:text-gray-900 hover:bg-white/80 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200/50"
              title="Help & Support"
            >
              <HelpCircle className="h-5 w-5" />
            </motion.button>

            {/* Enhanced Profile Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-white/80 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200/50"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {userProfile?.name || userProfile?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500 capitalize flex items-center">
                    <Activity className="w-3 h-3 mr-1" />
                    {userProfile?.role}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </motion.button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl border-2 border-gray-200/60 rounded-2xl shadow-2xl z-50"
                  >
                    {/* Enhanced Profile Header */}
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                          <User className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-lg">
                            {userProfile?.name || 'User'}
                          </p>
                          <p className="text-sm text-gray-600">{userProfile?.email}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                              <Shield className="w-3 h-3 mr-1" />
                              {userProfile?.role}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                              Online
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Menu Items */}
                    <div className="p-3">
                      {[
                        { icon: User, label: 'Profile Settings', color: 'hover:bg-blue-50' },
                        { icon: Settings, label: 'Preferences', color: 'hover:bg-purple-50' },
                        { icon: Shield, label: 'Security', color: 'hover:bg-green-50' },
                        { icon: Globe, label: 'Language', color: 'hover:bg-orange-50' },
                      ].map((item, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 ${item.color} group`}
                        >
                          <item.icon className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{item.label}</span>
                        </motion.button>
                      ))}
                      <hr className="my-3 border-gray-200" />
                      <motion.button 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl hover:bg-red-50 text-red-600 transition-all duration-200 group"
                      >
                        <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-sm font-medium">Sign Out</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Company Selector */}
        <div className="lg:hidden px-4 pb-3 border-t border-gray-200/50 bg-gradient-to-r from-blue-50/30 to-purple-50/30">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAccountsDropdownOpen(!accountsDropdownOpen)}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 rounded-2xl hover:bg-white focus:ring-4 focus:ring-blue-100/50 focus:border-blue-400 transition-all duration-300 shadow-lg"
              >
                <Building2 className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {selectedCompany ? selectedCompany.name : 'Select Company'}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 ml-auto transition-transform duration-300 ${
                  accountsDropdownOpen ? 'rotate-180' : ''
                }`} />
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateCompany}
              className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-xl hover:shadow-2xl"
              title="Create New Company"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};