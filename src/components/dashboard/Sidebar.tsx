// src/components/dashboard/Sidebar.tsx
import React from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Database,
  BarChart3,
  Shield,
  Settings,
  Users,
  Bot,
  ChevronRight,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'accountant', 'owner', 'viewer', 'auditor'], color: 'from-emerald-500 to-teal-600', description: 'Overview & insights' },
  { id: 'vouchers', label: 'Voucher Entry', icon: FileText, roles: ['admin', 'accountant'], color: 'from-green-500 to-green-600', description: 'Create transactions' },
  { id: 'masters', label: 'Master Management', icon: Database, roles: ['admin', 'accountant'], color: 'from-purple-500 to-indigo-600', description: 'Manage accounts' },
  { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'accountant', 'owner', 'auditor', 'viewer'], color: 'from-orange-500 to-orange-600', description: 'Financial reports' },
  { id: 'import', label: 'Smart Import', icon: Sparkles, roles: ['admin', 'accountant'], color: 'from-teal-500 to-cyan-600', description: 'AI-powered data import' }, 
  { id: 'audit', label: 'Audit Panel', icon: Shield, roles: ['admin', 'auditor'], color: 'from-red-500 to-pink-600', description: 'Audit & compliance' },
  { id: 'users', label: 'User Management', icon: Users, roles: ['admin'], color: 'from-indigo-500 to-blue-600', description: 'Manage users' },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'], color: 'from-gray-500 to-gray-600', description: 'System settings' },
];

interface SidebarProps {
  currentModule: string;
  setCurrentModule: (module: string) => void;
  onToggleAIChat: () => void;
  isCollapsed: boolean; // New prop
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  setCurrentModule,
  onToggleAIChat,
  isCollapsed,
}) => {
  const { userProfile } = useAuth();

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(userProfile?.role || 'viewer')
  );

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1, width: isCollapsed ? '80px' : '240px' }} // Dynamic width
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-gradient-to-br from-gray-800 to-gray-900 border-r border-gray-700 z-40 shadow-2xl"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-700/20 via-gray-600/20 to-gray-500/20"></div>
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      <div className="flex flex-col h-full relative z-10 pt-16"> {/* Added pt-16 for top navigation */}
        {/* Navigation */}
        <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
          <nav className="space-y-2">
            {filteredMenuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentModule === item.id;

              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 6 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentModule(item.id)}
                  className={`w-full h-12 flex items-center relative overflow-hidden rounded-2xl transition-all duration-300 border border-gray-700 ${
                    isActive
                      ? 'bg-white/10 shadow-md'
                      : 'hover:bg-white/10 hover:border-gray-600'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 via-teal-500 to-green-500 rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className={`flex items-center relative z-10 ${isCollapsed ? 'justify-center w-full' : 'space-x-3 px-2'}`}> {/* Adjusted px-2 */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`relative p-2 rounded-2xl transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-r ${item.color} shadow-lg`
                          : 'bg-white/10 group-hover:bg-white/20'
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-colors duration-300 ${ // Adjusted icon size
                        isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                      }`} />

                      {/* Icon glow effect */}
                      {isActive && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.color} blur-md`}
                        />
                      )}
                    </motion.div>

                    {!isCollapsed && ( // Only render text and arrow when not collapsed
                      <>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="flex-1 text-left" // This div takes remaining space
                        >
                          <span className={`font-medium text-xs transition-colors duration-300 ${ // Adjusted font size
                            isActive ? 'text-white' : 'text-gray-200 group-hover:text-white'
                          }`}>
                            {item.label}
                          </span>
                          <p className={`text-xxs transition-colors duration-300 ${ // Adjusted font size
                            isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                          }`}>
                            {item.description}
                          </p>
                        </motion.div>

                        {/* ChevronRight icon, now outside the text div but still within the main flex container */}
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="w-6 h-6 flex items-center justify-center ml-auto" // Use ml-auto to push it to the end
                        >
                          <ChevronRight className={`w-4 h-4 transition-all duration-300 ${
                            isActive
                              ? 'text-white transform translate-x-1'
                              : 'text-gray-400 group-hover:text-white group-hover:transform group-hover:translate-x-1'
                          }`} />
                        </motion.div>
                      </>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Enhanced AI Assistant */}
        <div className={`p-3 border-t border-gray-700 ${isCollapsed ? 'px-2' : 'px-6'}`}>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onToggleAIChat}
            className={`w-full relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-600 to-green-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group h-auto py-2 ${ // Adjusted height and padding
              isCollapsed ? '' : '' 
            }`}
            title={isCollapsed ? 'AI Assistant' : undefined}
          >
            {/* Animated background */}
            <motion.div
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-700 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ backgroundSize: '200% 100%' }}
            />

            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-pulse" />

            <div className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'}`}>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className={`bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg w-10 h-10`} // Adjusted size
              >
                <Bot className={`text-white w-5 h-5`} /> {/* Adjusted icon size */}
              </motion.div>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex-1 text-left"
                >
                  <p className="text-white font-bold text-base">AI Assistant</p> {/* Adjusted font size */}
                  <p className="text-gray-300 text-xs">Always here to help</p> {/* Adjusted font size */}
                </motion.div>
              )}
              {!isCollapsed && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 bg-green-400 rounded-full shadow-lg"
                />
              )}
            </div>
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
};