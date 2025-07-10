// src/components/dashboard/TopNavigation.tsx
import React, { useState, useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Company, FinancialYear } from '../../types';
import { Button } from '../ui/Button';
import { 
  Calculator, 
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Plus,
  Sparkles,
  Globe,
  Shield,
  HelpCircle,
  Moon,
  Sun,
  Building2,
  Calendar,
  Star,
  Activity,
  Menu, // Added Menu icon for toggle
  ChevronLeft // Added ChevronLeft for toggle
} from 'lucide-react';

interface TopNavigationProps {
  onToggleAIChat: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notifications: number;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  isMobile: boolean;
  onCreateCompany: () => void;
  sidebarCollapsed: boolean; // New prop
  toggleSidebar: () => void; // New prop
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  onToggleAIChat,
  searchQuery,
  setSearchQuery,
  notifications,
  darkMode,
  setDarkMode,
  isMobile,
  onCreateCompany,
  sidebarCollapsed, // Destructure new prop
  toggleSidebar // Destructure new prop
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
      className="w-full bg-gradient-to-br from-gray-800 to-gray-900 border-b border-gray-700 sticky top-0 z-50 shadow-xl"
    >
      <div className="w-full h-16 flex items-center relative z-10">
        {/* Left section - Toggle and Logo */}
        <div className="flex items-center h-full" style={{ width: sidebarCollapsed ? '80px' : '240px' }}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="h-full w-20 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <Menu className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
          </motion.button>
          
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center space-x-2"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-10 h-10 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 rounded-lg flex items-center justify-center shadow-md" // Adjusted size
            >
              <Calculator className="h-5 w-5 text-white" /> {/* Adjusted icon size */}
            </motion.div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent"> {/* Adjusted font size */}
                  AccounTech
                </h1>
                <p className="text-sm text-gray-300 -mt-1 flex items-center"> {/* Adjusted font size */}
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Powered Accounting
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Center - Enhanced Search */}
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative w-full max-w-lg" // Adjusted max-width
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vouchers, ledgers, reports, or ask AI..."
              className="w-full pl-12 pr-20 py-2 bg-gray-700/50 backdrop-blur-sm border-2 border-gray-600/60 rounded-2xl focus:ring-4 focus:ring-emerald-100/50 focus:border-teal-400 focus:bg-gray-700 transition-all duration-300 text-sm shadow-lg focus:shadow-xl placeholder-gray-400 text-white" // py-2 for consistent height
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <kbd className="px-3 py-1 text-xs text-gray-300 bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600/50">⌘K</kbd>
            </div>

            {/* Enhanced Search Dropdown */}
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-xl border-2 border-gray-700/60 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto"
              >
                {filteredActions.length > 0 ? (
                  <div className="p-3">
                    <p className="text-xs text-gray-400 px-3 py-2 font-semibold">Quick Actions</p>
                    {filteredActions.map((action, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: '#374151' }}
                        onClick={() => {
                          action.action();
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-gray-700 transition-all duration-200 text-left group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <action.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-200 group-hover:text-white">{action.label}</span>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-400 text-sm">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No results found
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Right side - Enhanced Actions */}
        <div className="flex items-center space-x-2 px-4">
          {/* Enhanced Accounts Dropdown */}
          <div className="hidden lg:block relative">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAccountsDropdownOpen(!accountsDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 backdrop-blur-sm border-2 border-gray-600/60 rounded-2xl hover:bg-gray-700 focus:ring-4 focus:ring-emerald-100/50 focus:border-teal-400 transition-all duration-300 shadow-lg hover:shadow-xl" // py-2 for consistent height
            >
              <Building2 className="h-4 w-4 text-gray-300" /> {/* Adjusted icon size */}
              <div className="text-left">
                <p className="text-xs font-semibold text-white truncate max-w-28"> {/* Adjusted font size */}
                  {selectedCompany ? selectedCompany.name : 'Select Company'}
                </p>
                {selectedFinancialYear && (
                  <p className="text-xs text-gray-300 flex items-center">
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
                  className="absolute right-0 mt-2 w-96 bg-gray-800/95 backdrop-blur-xl border-2 border-gray-700/60 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto"
                >
                  {/* Company Section */}
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-white flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-blue-400" />
                        Company
                      </h4>
                      <Button size="sm" onClick={onCreateCompany} className="bg-gradient-to-r from-green-500 to-emerald-600">
                        <Plus className="w-3 h-3 mr-1" />
                        New
                      </Button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                      {companies.map((company) => (
                        <motion.button
                          key={company.id}
                          whileHover={{ scale: 1.02, x: 4 }}
                          className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-300 ${
                            selectedCompany?.id === company.id
                              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-2 border-teal-400/50 shadow-lg'
                            : 'hover:bg-gray-700 border-2 border-transparent'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              selectedCompany?.id === company.id
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                                : 'bg-gray-700'
                            }`}>
                              <Building2 className={`w-4 h-4 ${
                                selectedCompany?.id === company.id ? 'text-white' : 'text-gray-300'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate text-white">{company.name}</p>
                              {company.gstin && (
                                <p className="text-xs text-gray-400">GSTIN: {company.gstin}</p>
                              )}
                            </div>
                            {selectedCompany?.id === company.id && (
                              <Star className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Financial Year Section */}
                  {selectedCompany && (
                    <div className="p-4">
                      <h4 className="font-bold text-white mb-3 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-green-400" />
                        Financial Year
                      </h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                        {financialYears.map((fy) => (
                          <motion.button
                            key={fy.id}
                            whileHover={{ scale: 1.02, x: 4 }}
                            className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-300 ${
                              selectedFinancialYear?.id === fy.id
                                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-2 border-emerald-400/50 shadow-lg'
                                : 'hover:bg-gray-700 border-2 border-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                  selectedFinancialYear?.id === fy.id 
                                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                    : 'bg-gray-700'
                                }`}>
                                  <Calendar className={`w-4 h-4 ${
                                    selectedFinancialYear?.id === fy.id ? 'text-white' : 'text-gray-300'
                                  }`} />
                                </div>
                                <span className="font-semibold text-white">
                                  FY {new Date(fy.year_start).getFullYear()}-{new Date(fy.year_end).getFullYear().toString().slice(-2)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {fy.is_active && (
                                  <span className="text-xs bg-green-700 text-green-200 px-2 py-1 rounded-full font-medium">
                                    Active
                                  </span>
                                )}
                                {selectedFinancialYear?.id === fy.id && (
                                  <Star className="w-4 h-4 text-green-400" />
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

          {/* Enhanced Theme Toggle */}
          <motion.button 
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-2xl text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-700" // py-2 for consistent height
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
            className="relative p-2 rounded-2xl text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-700" // py-2 for consistent height
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
            className="p-2 rounded-2xl text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-700" // py-2 for consistent height
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
              className="flex items-center space-x-2 p-2 rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-700" // p-2 for consistent height
            >
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl"> {/* Adjusted size */}
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-white">
                  {userProfile?.name || userProfile?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-300 capitalize flex items-center">
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
                  className="absolute right-0 mt-2 w-80 bg-gray-800/95 backdrop-blur-xl border-2 border-gray-700/60 rounded-2xl shadow-2xl z-50"
                >
                  {/* Enhanced Profile Header */}
                  <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-emerald-700 to-teal-800"> {/* Adjusted padding */}
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-lg">
                          {userProfile?.name || 'User'}
                        </p>
                        <p className="text-sm text-gray-300">{userProfile?.email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-700 text-blue-200 capitalize">
                            <Shield className="w-3 h-3 mr-1" />
                            {userProfile?.role}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-700 text-green-200">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                            Online
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Menu Items */}
                  <div className="p-3"> {/* Adjusted padding */}
                    {[
                      { icon: User, label: 'Profile Settings', color: 'hover:bg-blue-700/20' },
                      { icon: Settings, label: 'Preferences', color: 'hover:bg-purple-700/20' },
                      { icon: Shield, label: 'Security', color: 'hover:bg-green-700/20' },
                      { icon: Globe, label: 'Language', color: 'hover:bg-orange-700/20' },
                    ].map((item, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-left rounded-xl transition-all duration-200 hover:bg-gray-700 group" // Adjusted padding
                      >
                        <item.icon className="h-5 w-5 text-gray-300 group-hover:text-white" />
                        <span className="text-sm font-medium text-gray-200 group-hover:text-white">{item.label}</span>
                      </motion.button>
                    ))}
                    <hr className="my-3 border-gray-700" />
                    <motion.button 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-left rounded-xl hover:bg-red-700/20 text-red-400 transition-all duration-200 group" // Adjusted padding
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

        {/* Enhanced Mobile Company Selector */}
        <div className="lg:hidden px-4 pb-3 border-t border-gray-700 bg-gradient-to-r from-gray-800/30 to-gray-900/30">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAccountsDropdownOpen(!accountsDropdownOpen)}
                className="w-full flex items-center space-x-3 px-3 py-2 bg-gray-700/50 backdrop-blur-sm border-2 border-gray-600/60 rounded-2xl hover:bg-gray-700 focus:ring-4 focus:ring-emerald-100/50 focus:border-teal-400 transition-all duration-300 shadow-lg" // py-2 for consistent height
              >
                <Building2 className="h-5 w-5 text-gray-300" />
                <span className="text-sm font-semibold text-white truncate">
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
              className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-xl hover:shadow-2xl" // p-2 for consistent height
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