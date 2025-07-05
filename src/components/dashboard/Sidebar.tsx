import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Database, 
  BarChart3, 
  Upload, 
  Shield, 
  Settings, 
  Users,
  Bot,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'accountant', 'owner', 'viewer', 'auditor'], color: 'from-blue-500 to-blue-600' },
  { id: 'vouchers', label: 'Voucher Entry', icon: FileText, roles: ['admin', 'accountant'], color: 'from-green-500 to-green-600' },
  { id: 'masters', label: 'Master Management', icon: Database, roles: ['admin', 'accountant'], color: 'from-purple-500 to-purple-600' },
  { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'accountant', 'owner', 'auditor', 'viewer'], color: 'from-orange-500 to-orange-600' },
  { id: 'import', label: 'Smart Import', icon: Upload, roles: ['admin', 'accountant'], color: 'from-teal-500 to-teal-600' },
  { id: 'audit', label: 'Audit Panel', icon: Shield, roles: ['admin', 'auditor'], color: 'from-red-500 to-red-600' },
  { id: 'users', label: 'User Management', icon: Users, roles: ['admin'], color: 'from-indigo-500 to-indigo-600' },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'], color: 'from-gray-500 to-gray-600' },
];

interface SidebarProps {
  currentModule: string;
  setCurrentModule: (module: string) => void;
  isOpen: boolean;
  onToggleAIChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentModule, 
  setCurrentModule, 
  isOpen, 
  onToggleAIChat 
}) => {
  const { userProfile } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userProfile?.role || 'viewer')
  );

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white/90 backdrop-blur-md border-r border-gray-200/50 z-40 shadow-xl"
    >
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Navigation</h2>
            <p className="text-sm text-gray-500">Manage your accounting operations</p>
          </div>
          
          <nav className="space-y-2">
            {filteredMenuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentModule === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentModule(item.id)}
                  className={`w-full group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg shadow-blue-100/50'
                      : 'hover:bg-gray-50/80'
                  }`}
                >
                  <div className="flex items-center space-x-4 p-4">
                    <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? `bg-gradient-to-r ${item.color} shadow-lg` 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <Icon className={`w-5 h-5 transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'
                      }`} />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <span className={`font-medium transition-colors duration-300 ${
                        isActive ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                    
                    <ChevronRight className={`w-4 h-4 transition-all duration-300 ${
                      isActive 
                        ? 'text-blue-600 transform translate-x-1' 
                        : 'text-gray-400 group-hover:text-gray-600 group-hover:transform group-hover:translate-x-1'
                    }`} />
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>
        
        {/* AI Assistant */}
        <div className="p-6 border-t border-gray-200/50">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onToggleAIChat}
            className="w-full relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-semibold">AI Assistant</p>
                <p className="text-white/80 text-sm">Always here to help</p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
            
            {/* Animated background */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse" />
            </div>
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
};