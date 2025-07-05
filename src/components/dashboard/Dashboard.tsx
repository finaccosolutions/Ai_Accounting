import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { CompanySelector } from '../company/CompanySelector';
import { CompanyForm } from '../company/CompanyForm';
import { Sidebar } from './Sidebar';
import { DashboardContent } from './DashboardContent';
import { AIChat } from './AIChat';
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
  Sun
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { signOut, userProfile } = useAuth();
  const { selectedCompany } = useApp();
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      if (sidebarOpen) {
        setSidebarCollapsed(!sidebarCollapsed);
      } else {
        setSidebarOpen(true);
        setSidebarCollapsed(false);
      }
    }
  };

  const toggleAIChat = () => {
    setAiChatOpen(!aiChatOpen);
  };

  const handleCreateCompany = () => {
    setShowCompanyForm(true);
  };

  const handleCompanyCreated = () => {
    setShowCompanyForm(false);
    // Refresh will happen automatically through context
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownOpen) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  // Quick actions for search
  const quickActions = [
    { label: 'Create Sales Voucher', action: () => setCurrentModule('vouchers'), icon: Plus },
    { label: 'Add New Ledger', action: () => setCurrentModule('masters'), icon: Plus },
    { label: 'Generate Report', action: () => setCurrentModule('reports'), icon: Plus },
    { label: 'AI Assistant', action: toggleAIChat, icon: Sparkles },
  ];

  const filteredActions = quickActions.filter(action =>
    action.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show company form in full screen
  if (showCompanyForm) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <CompanyForm
          onBack={() => setShowCompanyForm(false)}
          onSuccess={handleCompanyCreated}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
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
                onClick={toggleSidebar}
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
                    onClick={toggleAIChat}
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
              {/* Company Selector with Create Button */}
              <div className="hidden lg:flex items-center space-x-2">
                <CompanySelector />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateCompany}
                  className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
                  title="Create New Company"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Quick Actions */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleAIChat}
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
        </div>

        {/* Mobile Company Selector */}
        <div className="lg:hidden px-4 pb-3 border-t border-gray-200/50">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <CompanySelector />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateCompany}
              className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
              title="Create New Company"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Layout */}
      <div className="flex relative">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <Sidebar 
              currentModule={currentModule}
              setCurrentModule={setCurrentModule}
              isOpen={!sidebarCollapsed}
              onToggleAIChat={toggleAIChat}
            />
          )}
        </AnimatePresence>

        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          />
        )}

        {/* Main Content */}
        <motion.main 
          layout
          className={`flex-1 transition-all duration-300 ${
            isMobile ? 'ml-0' : sidebarOpen ? (sidebarCollapsed ? 'ml-16' : 'ml-80') : 'ml-0'
          } ${aiChatOpen ? 'mr-96' : 'mr-0'}`}
        >
          <div className="p-4 lg:p-6">
            <DashboardContent currentModule={currentModule} />
          </div>
        </motion.main>

        {/* AI Chat Panel */}
        <AnimatePresence>
          {aiChatOpen && (
            <AIChat onClose={() => setAiChatOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};