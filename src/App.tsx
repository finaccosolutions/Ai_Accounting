import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { useCompany } from './hooks/useCompany';
import { AuthForm } from './components/auth/AuthForm';
import { CompanySelector } from './components/company/CompanySelector';
import { Layout } from './components/ui/Layout';
import { Dashboard } from './components/modules/Dashboard';
import { VoucherEntry } from './components/modules/VoucherEntry';
import { MasterManagement } from './components/modules/MasterManagement';
import { Reports } from './components/modules/Reports';
import { SmartImport } from './components/modules/SmartImport';
import { Settings } from './components/modules/Settings';
import { useState } from 'react';

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { currentCompany, loading: companyLoading } = useCompany();
  const [currentModule, setCurrentModule] = useState('dashboard');

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // If no user, show auth form
  if (!user) {
    return <AuthForm />;
  }

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

  // If user but no company selected, show company selector
  if (!currentCompany) {
    return <CompanySelector />;
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
    <Layout currentModule={currentModule} setCurrentModule={setCurrentModule}>
      {renderCurrentModule()}
    </Layout>
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