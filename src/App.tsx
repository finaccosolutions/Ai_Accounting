import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { useCompany } from './hooks/useCompany';
import { AuthForm } from './components/auth/AuthForm';
import { CompanySelector } from './components/company/CompanySelector';
import { CompanySetup } from './components/company/CompanySetup';
import { Layout } from './components/ui/Layout';
import { Dashboard } from './components/modules/Dashboard';
import { VoucherEntry } from './components/modules/VoucherEntry';
import { MasterManagement } from './components/modules/MasterManagement';
import { Reports } from './components/modules/Reports';
import { SmartImport } from './components/modules/SmartImport';
import { Settings } from './components/modules/Settings';
import { useState } from 'react';

const AuthenticatedApp: React.FC = () => {
  const { currentCompany, loading: companyLoading } = useCompany();
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [showCompanySetup, setShowCompanySetup] = useState(false);

  // Show loading while companies are being loaded
  if (companyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your companies...</p>
        </div>
      </div>
    );
  }

  // If showing company setup
  if (showCompanySetup) {
    return <CompanySetup onBack={() => setShowCompanySetup(false)} />;
  }

  // If user but no company selected, show company selector
  if (!currentCompany) {
    return <CompanySelector onCreateCompany={() => setShowCompanySetup(true)} />;
  }

  const renderCurrentModule = () => {
    switch (currentModule) {
      case 'dashboard': return <Dashboard />;
      case 'vouchers': return <VoucherEntry />;
      case 'masters': return <MasterManagement />;
      case 'reports': return <Reports />;
      case 'import': return <SmartImport />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout 
      currentModule={currentModule} 
      setCurrentModule={setCurrentModule}
      onShowCompanySelector={() => setShowCompanySetup(true)}
    >
      {renderCurrentModule()}
    </Layout>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  // Show minimal loading only for very brief moments
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Simple logic: No user = show login, User = show authenticated app
  if (!user) {
    return <AuthForm />;
  }

  // User is authenticated, show the main app
  return <AuthenticatedApp />;
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