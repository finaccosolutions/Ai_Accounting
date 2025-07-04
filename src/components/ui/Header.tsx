import React from 'react';
import { Bell, Settings, User, MessageSquare, Search, Building } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCompany } from '../../hooks/useCompany';

interface HeaderProps {
  onOpenAIChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAIChat }) => {
  const { user, signOut } = useAuth();
  const { currentCompany } = useCompany();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Accounting</h1>
              {currentCompany && (
                <p className="text-sm text-gray-500">{currentCompany.name}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search vouchers, ledgers, or ask AI..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenAIChat}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="AI Assistant"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
              {user?.profile?.avatar_url ? (
                <img src={user.profile.avatar_url} alt={user.profile?.full_name} className="w-6 h-6 rounded-full" />
              ) : (
                <User className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{user?.profile?.full_name || user?.email}</span>
            </button>
            
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="p-4 border-b border-gray-200">
                <p className="font-medium text-gray-900">{user?.profile?.full_name || 'User'}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-xs text-blue-600 capitalize">{user?.profile?.role || 'user'}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={signOut}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};