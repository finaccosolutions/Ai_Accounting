import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Database, 
  BarChart3, 
  Upload, 
  Shield, 
  Settings, 
  Users,
  Bot
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'accountant', 'owner', 'viewer', 'auditor'] },
  { id: 'vouchers', label: 'Voucher Entry', icon: FileText, roles: ['admin', 'accountant'] },
  { id: 'masters', label: 'Master Management', icon: Database, roles: ['admin', 'accountant'] },
  { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'accountant', 'owner', 'auditor', 'viewer'] },
  { id: 'import', label: 'Smart Import', icon: Upload, roles: ['admin', 'accountant'] },
  { id: 'audit', label: 'Audit Panel', icon: Shield, roles: ['admin', 'auditor'] },
  { id: 'users', label: 'User Management', icon: Users, roles: ['admin'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'] },
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
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.profile?.role || 'viewer')
  );

  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white border-r border-gray-200 z-40">
      <div className="p-4">
        <nav className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentModule(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-emerald-50">
        <button
          onClick={onToggleAIChat}
          className="w-full flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">AI Assistant</p>
            <p className="text-xs text-gray-500">Always here to help</p>
          </div>
        </button>
      </div>
    </aside>
  );
};