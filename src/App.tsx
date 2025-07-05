import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { AuthPage } from './components/auth/AuthPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
};

function App() {
  return (
    <div className="w-full min-h-screen">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  );
}

export default App;