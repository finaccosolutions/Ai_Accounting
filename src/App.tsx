import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './contexts/AppContext';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/auth/AuthForm';
import { CompanySelector } from './components/company/CompanySelector';
import { CompanySetup } from './components/company/CompanySetup';
import { FinancialYearSelector } from './components/company/FinancialYearSelector';
import { Layout } from './components/ui/Layout';
import { Dashboard } from './components/modules/Dashboard';
import { VoucherEntry } from './components/modules/VoucherEntry';
import { MasterManagement } from './components/modules/MasterManagement';
import { Reports } from './components/modules/Reports';
import { SmartImport } from './components/modules/SmartImport';
import { Settings } from './components/modules/Settings';
import { UserManagement } from './components/modules/UserManagement';
import { AuditPanel } from './components/modules/AuditPanel';
import { AIChat } from './components/ui/AIChat';
import { useState } from 'react';

const AuthenticatedApp: React.FC = () => {
  const { 
    currentCompany, 
    companyLoading,
    financialYears,
    selectedFinancialYears,
    fyLoading,
    currentModule,
    setCurrentModule,
    isAIChatOpen,
    setIsAIChatOpen
  } = useApp();
  
  const [showCompanySetup, setShowCompanySetup] = useState(false);

  console.log('🏢 AuthenticatedApp: Received state from useApp:', {
    currentCompany: currentCompany?.name || 'None',
    currentCompanyId: currentCompany?.id || 'None',
    companyLoading,
    showCompanySetup,
    financialYearsCount: financialYears.length,
    selectedFYsCount: selectedFinancialYears.length,
    fyLoading
  });

  // Show loading while companies are being loaded
  if (companyLoading) {
    console.log('🏢 App: Company loading, showing spinner');
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // If showing company setup
  if (showCompanySetup) {
    console.log('🏢 App: Showing company setup');
    return (
      <CompanySetup 
        onBack={() => setShowCompanySetup(false)}
        onSuccess={() => {
          setShowCompanySetup(false);
          // After company creation, the useCompany hook will automatically set currentCompany
          // and we'll proceed to the financial year selector
        }}
      />
    );
  }

  // If user but no company selected, show company selector
  if (!currentCompany) {
    console.log('🏢 App: No company selected, showing CompanySelector');
    return <CompanySelector onCreateCompany={() => setShowCompanySetup(true)} />;
  }

  // If company is selected, show the financial year selector and main app
  console.log('🏢 App: Company selected, showing FinancialYearSelector and main app');
  return <MainAppWithFinancialYears 
    onShowCompanySelector={() => {
      // Reset to company selector
      window.location.reload();
    }}
  />;
};

interface MainAppWithFinancialYearsProps {
  onShowCompanySelector: () => void;
}

const MainAppWithFinancialYears: React.FC<MainAppWithFinancialYearsProps> = ({
  onShowCompanySelector
}) => {
  const { 
    currentCompany,
    financialYears,
    selectedFinancialYears,
    fyLoading,
    currentModule,
    setCurrentModule,
    isAIChatOpen,
    setIsAIChatOpen
  } = useApp();
  
  const [showDashboard, setShowDashboard] = useState(false);

  // Debug: Log the currentCompany received in this component
  console.log('🗓️ MainAppWithFinancialYears: currentCompany received:', {
    companyName: currentCompany?.name || 'None',
    companyId: currentCompany?.id || 'None'
  });

  console.log('🗓️ MainAppWithFinancialYears state:', {
    currentCompany: currentCompany?.name || 'None',
    selectedFYs: selectedFinancialYears.length,
    availableFYs: financialYears.length,
    fyLoading,
    showDashboard
  });

  // Show loading while financial years are being loaded
  if (fyLoading) {
    console.log('🗓️ MainApp: Financial years loading for company:', currentCompany?.name);
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading financial years for {currentCompany?.name}...</p>
        </div>
      </div>
    );
  }

  // If company selected but no financial years available, show error or create default
  if (financialYears.length === 0) {
    console.log('🗓️ MainApp: No financial years available for company:', currentCompany?.name);
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Financial Years Found</h3>
          <p className="text-gray-600 mb-4">No financial years are configured for {currentCompany?.name}.</p>
          <p className="text-sm text-gray-500">Please contact your administrator or create a financial year.</p>
        </div>
      </div>
    );
  }

  // If company selected but no financial years selected and not showing dashboard, show financial year selector
  if (selectedFinancialYears.length === 0 && !showDashboard) {
    console.log('🗓️ MainApp: Company selected but no FYs selected, showing FinancialYearSelector');
    console.log('🗓️ MainApp: Available financial years:', financialYears.length);
    return (
      <FinancialYearSelector 
        onContinue={() => {
          console.log('✅ Financial years selected, proceeding to dashboard');
          setShowDashboard(true);
        }}
        onChangeCompany={onShowCompanySelector}
      />
    );
  }

  // If no financial years selected but user wants to see dashboard, show error
  if (selectedFinancialYears.length === 0 && showDashboard) {
    console.log('🗓️ MainApp: No FYs selected but trying to show dashboard');
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Financial Years Selected</h3>
          <p className="text-gray-600 mb-4">Please select at least one financial year to continue.</p>
          <button 
            onClick={() => setShowDashboard(false)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Select Financial Years
          </button>
        </div>
      </div>
    );
  }

  console.log('🗓️ MainApp: Company and FYs selected, showing main dashboard');

  // Main application with selected company and financial years
  const renderCurrentModule = () => {
    switch (currentModule) {
      case 'dashboard': return <Dashboard />;
      case 'vouchers': return <VoucherEntry />;
      case 'masters': return <MasterManagement />;
      case 'reports': return <Reports />;
      case 'import': return <SmartImport />;
      case 'settings': return <Settings />;
      case 'users': return <UserManagement />;
      case 'audit': return <AuditPanel />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      <Layout 
        currentModule={currentModule} 
        setCurrentModule={setCurrentModule}
        onShowCompanySelector={onShowCompanySelector}
        onToggleAIChat={() => setIsAIChatOpen(!isAIChatOpen)}
      >
        {renderCurrentModule()}
      </Layout>
      <AIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  // Show minimal loading only for very brief moments
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Simple logic: No user = show login, User = show authenticated app
  if (!user) {
    return <AuthForm />;
  }

  // User is authenticated, show the main app wrapped with AppProvider
  return (
    <AppProvider>
      <AuthenticatedApp />
    </AppProvider>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </Router>
  );
}

export default App;