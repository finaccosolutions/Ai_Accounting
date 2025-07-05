import React, { useState } from 'react';
import { Menu, X, User, LogOut, Settings, ChevronDown, Calculator, Building, Bot } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import { Button } from './Button';

interface HeaderProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  onShowCompanySelector?: () => void;
  onToggleAIChat?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  sidebarOpen, 
  setSidebarOpen,
  onShowCompanySelector,
  onToggleAIChat
}) => {
  const { user, signOut } = useAuth();
  const { currentCompany, selectedFinancialYears, financialYears } = useApp();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
  };

  const getUserDisplayName = () => {
    if (user?.profile?.full_name) {
      return user.profile.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getSelectedFYNames = () => {
    if (selectedFinancialYears.length === 0) return 'No FY selected';
    if (selectedFinancialYears.length === financialYears.length) return 'All FYs';
    
    const selectedNames = financialYears
      .filter(fy => selectedFinancialYears.includes(fy.id))
      .map(fy => fy.year_name)
      .join(', ');
    
    return selectedNames.length > 30 ? `${selectedNames.substring(0, 30)}...` : selectedNames;
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between relative z-50">
      {/* Left side - Menu toggle and company info */}
      <div className="flex items-center space-x-4">
        {setSidebarOpen && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">AccounTech AI</h1>
        </div>
        
        {currentCompany && (
          <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span className="font-medium">{currentCompany.name}</span>
            </div>
            <div className="text-gray-400">|</div>
            <div className="flex items-center space-x-2">
              <span>FY: {getSelectedFYNames()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Right side - AI Chat and User menu */}
      <div className="flex items-center space-x-4">
        {/* AI Chat Toggle */}
        {onToggleAIChat && (
          <Button
            variant="outline"
            size="sm"
            icon={Bot}
            onClick={onToggleAIChat}
            className="hidden sm:flex"
          >
            AI Assistant
          </Button>
        )}

        {user && (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {getUserInitials()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500">{user.profile?.role || 'User'}</p>
                </div>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {userMenuOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setUserMenuOpen(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* User info section */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {getUserInitials()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{getUserDisplayName()}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <p className="text-xs text-blue-600 font-medium">{user.profile?.role || 'User'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Company info if available */}
                  {currentCompany && (
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Current Company</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{currentCompany.name}</p>
                      {currentCompany.gstin && (
                        <p className="text-xs text-gray-500">GSTIN: {currentCompany.gstin}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        FY: {getSelectedFYNames()}
                      </p>
                    </div>
                  )}

                  {/* Menu items */}
                  <div className="py-1">
                    {onShowCompanySelector && (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onShowCompanySelector();
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Building size={16} />
                        <span>Switch Company</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        // Add profile/settings navigation here
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={16} />
                      <span>Profile & Settings</span>
                    </button>
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};