import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './contexts/AppContext';
import { useAuth } from './hooks/useAuth';
import { useCompany } from './hooks/useCompany';
import { useFinancialYears } from './hooks/useFinancialYears';
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
import { useState, useEffect } from 'react';

const AuthenticatedApp: React.FC = () => {
  const { currentCompany, loading: companyLoading } = useCompany();
  const { selectedFinancialYears, loading: fyLoading } = useFinancialYears();
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [showCompanySetup, setShowCompanySetup] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  console.log('🏢 App state:', {
    currentCompany: currentCompany?.name || 'None',
    selectedFYs: selectedFinancialYears.length,
    companyLoading,
    fyLoading,
    showCompanySetup
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

  // If company selected but financial years are still loading, show loading
  if (fyLoading) {
    console.log('🏢 App: Financial years loading for company:', currentCompany.name);
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading financial years for {currentCompany.name}...</p>
        </div>
      </div>
    );
  }

  // If company selected but no financial years selected, show financial year selector
  if (selectedFinancialYears.length === 0) {
    console.log('🏢 App: Company selected but no FYs selected, showing FinancialYearSelector');
    return (
      <FinancialYearSelector 
        onContinue={() => {
          console.log('✅ Financial years selected, proceeding to dashboard');
          // The component will automatically proceed to dashboard
          // No need to do anything here as the selectedFinancialYears will update
        }}
        onChangeCompany={() => {
          // Reset company selection to show company selector
          window.location.reload(); // Simple way to reset state
        }}
      />
    );
  }

  console.log('🏢 App: Company and FYs selected, showing main dashboard');

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
        onShowCompanySelector={() => {
          // Reset to company selector
          window.location.reload();
        }}
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