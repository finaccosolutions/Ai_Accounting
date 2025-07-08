// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { AuthPage } from './components/auth/AuthPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { useAuth } from './contexts/AuthContext';

const AppContent: React.FC<{ darkMode: boolean; setDarkMode: (dark: boolean) => void }> = ({ darkMode, setDarkMode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <AppProvider>
      <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />
    </AppProvider>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="w-full min-h-screen">
      <BrowserRouter>
        <AuthProvider>
          <AppContent darkMode={darkMode} setDarkMode={setDarkMode} />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;