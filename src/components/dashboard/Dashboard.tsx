import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { CompanySelector } from '../company/CompanySelector';
import { Sidebar } from './Sidebar';
import { DashboardContent } from './DashboardContent';
import { AIChat } from './AIChat';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { 
  Calculator, 
  Menu,
  X,
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { signOut, userProfile } = useAuth();
  const { selectedCompany } = useApp();
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleAIChat = () => {
    setAiChatOpen(!aiChatOpen);
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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-200"
              >
                <AnimatePresence mode="wait">
                  {sidebarOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 0 }}
                      exit={{ rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
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
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AccounTech
                  </h1>
                  <p className="text-xs text-gray-500 -mt-1">AI-Powered Accounting</p>
                </div>
              </motion.div>
            </div>

            {/* Center - Search */}
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
                  placeholder="Search vouchers, ledgers, reports, or ask AI..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 focus:bg-white transition-all duration-200 text-sm"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <kbd className="px-2 py-1 text-xs text-gray-500 bg-gray-200/50 rounded-md">⌘K</kbd>
                </div>
              </motion.div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              <CompanySelector />
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-200"
              >
                <Bell className="h-6 w-6" />
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

              {/* Profile Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
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
                      className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-xl z-50"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {userProfile?.name || 'User'}
                            </p>
                            <p className="text-sm text-gray-500">{userProfile?.email}</p>
                            <p className="text-xs text-blue-600 capitalize font-medium">
                              {userProfile?.role}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <button className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-xl hover:bg-gray-50 transition-colors">
                          <Settings className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">Settings</span>
                        </button>
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
      </motion.header>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <Sidebar 
              currentModule={currentModule}
              setCurrentModule={setCurrentModule}
              isOpen={sidebarOpen}
              onToggleAIChat={toggleAIChat}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.main 
          layout
          className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}
        >
          <div className="p-6">
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