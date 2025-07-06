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
  Calendar
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
      className="w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-lg"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Menu */}
          <div className="flex items-center space-x-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-200 shadow-sm"
            >
              <AnimatePresence mode="wait">
                {sidebarOpen && !sidebarCollapsed ? (
                  <motion.div
                    key="minimize"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Minimize2 className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: 0 }}
                    transition={{ duration: 0.2 }}
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
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <Calculator className="h-7 w-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AccounTech
                </h1>
                <p className="text-xs text-gray-500 -mt-1">AI-Powered Accounting</p>
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
                className="w-full pl-12 pr-16 py-3 bg-gray-50/80 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 focus:bg-white transition-all duration-200 text-sm shadow-sm"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onToggleAIChat}
                  className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.button>
                <kbd className="px-2 py-1 text-xs text-gray-500 bg-gray-200/50 rounded-md">⌘K</kbd>
              </div>

              {/* Search Dropdown */}
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto"
                >
                  {filteredActions.length > 0 ? (
                    <div className="p-2">
                      <p className="text-xs text-gray-500 px-3 py-2">Quick Actions</p>
                      {filteredActions.map((action, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ backgroundColor: '#f8fafc' }}
                          onClick={() => {
                            action.action();
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-left"
                        >
                          <action.icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{action.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No results found
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right side - Enhanced Actions */}
          <div className="flex items-center space-x-3">
            {/* Accounts Dropdown (Company & Financial Year) */}
            <div className="hidden lg:block relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAccountsDropdownOpen(!accountsDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <Building2 className="h-4 w-4 text-gray-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {selectedCompany ? selectedCompany.name : 'Select Company'}
                  </p>
                  {selectedFinancialYear && (
                    <p className="text-xs text-gray-500">
                      FY {new Date(selectedFinancialYear.year_start).getFullYear()}-{new Date(selectedFinancialYear.year_end).getFullYear().toString().slice(-2)}
                    </p>
                  )}
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                  accountsDropdownOpen ? 'rotate-180' : ''
                }`} />
              </motion.button>

              <AnimatePresence>
                {accountsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto"
                  >
                    {/* Company Section */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Company</h4>
                        <Button size="sm" onClick={onCreateCompany} className="bg-green-600">
                          <Plus className="w-3 h-3 mr-1" />
                          New
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {companies.map((company) => (
                          <button
                            key={company.id}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                              selectedCompany?.id === company.id
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4 text-gray-600" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{company.name}</p>
                                {company.gstin && (
                                  <p className="text-xs text-gray-500">GSTIN: {company.gstin}</p>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Financial Year Section */}
                    {selectedCompany && (
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Financial Year</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {financialYears.map((fy) => (
                            <button
                              key={fy.id}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                selectedFinancialYear?.id === fy.id
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm font-medium">
                                    FY {new Date(fy.year_start).getFullYear()}-{new Date(fy.year_end).getFullYear().toString().slice(-2)}
                                  </span>
                                </div>
                                {fy.is_active && (
                                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                                    Active
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Actions */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleAIChat}
              className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              title="AI Assistant"
            >
              <Zap className="h-5 w-5" />
            </motion.button>

            {/* Theme Toggle */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-200 shadow-sm"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>

            {/* Notifications */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-200 shadow-sm"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg"
                >
                  {notifications}
                </motion.span>
              )}
            </motion.button>

            {/* Help */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-200 shadow-sm"
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
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200 shadow-sm"
              >
                <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.name || userProfile?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{userProfile?.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </motion.button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-xl z-50"
                  >
                    {/* Profile Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {userProfile?.name || 'User'}
                          </p>
                          <p className="text-sm text-gray-500">{userProfile?.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                              {userProfile?.role}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                              Online
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="p-2">
                      <button className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-xl hover:bg-gray-50 transition-colors">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Profile Settings</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-xl hover:bg-gray-50 transition-colors">
                        <Settings className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Preferences</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-xl hover:bg-gray-50 transition-colors">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Security</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-xl hover:bg-gray-50 transition-colors">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Language</span>
                      </button>
                      <hr className="my-2 border-gray-200" />
                      <button 
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Company Selector */}
        <div className="lg:hidden px-4 pb-3 border-t border-gray-200/50">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <button
                onClick={() => setAccountsDropdownOpen(!accountsDropdownOpen)}
                className="w-full flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <Building2 className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900 truncate">
                  {selectedCompany ? selectedCompany.name : 'Select Company'}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 ml-auto transition-transform duration-200 ${
                  accountsDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateCompany}
              className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
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