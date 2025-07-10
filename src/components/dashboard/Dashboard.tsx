// src/components/dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';  
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { CompanySelectorPage } from '../company/CompanySelector';
import { CompanyForm } from '../company/CompanyForm';
import { Sidebar } from './Sidebar';
import { DashboardContent } from './DashboardContent';
import { AIChat } from './AIChat';
import { TopNavigation } from './TopNavigation';

export const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { selectedCompany, selectedFinancialYear } = useApp();
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Default to collapsed state
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showCompanySelector, setShowCompanySelector] = useState(true);
  const [notifications, setNotifications] = useState(3);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true); // Collapse sidebar on mobile by default
      } else {
        // On desktop, sidebarCollapsed state is maintained
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Show company selector if no company or financial year is selected
  useEffect(() => {
    if (selectedCompany && selectedFinancialYear) {
      setShowCompanySelector(false);
    } else {
      setShowCompanySelector(true);
    }
  }, [selectedCompany, selectedFinancialYear]);

  const toggleAIChat = () => {
    setAiChatOpen(!aiChatOpen);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const handleCreateCompany = () => {
    setShowCompanyForm(true);
  };

  const handleCompanyCreated = () => {
    setShowCompanyForm(false);
    setShowCompanySelector(false);
  };

  const handleCompanySelected = () => {
    setShowCompanySelector(false);
  };

  // Show company selector page if no company/financial year selected
  if (showCompanySelector && !showCompanyForm) {
    return (
      <CompanySelectorPage onCompanySelected={handleCompanySelected} />
    );
  }

  // Show company form in full screen
  if (showCompanyForm) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <CompanyForm
          onBack={() => setShowCompanyForm(false)}
          onSuccess={handleCompanyCreated}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Top Navigation */}
      <TopNavigation
        onToggleAIChat={toggleAIChat}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        notifications={notifications}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isMobile={isMobile}
        onCreateCompany={handleCreateCompany}
        sidebarCollapsed={sidebarCollapsed} // Pass sidebarCollapsed state
        toggleSidebar={toggleSidebar} // Pass toggle function
      />

      {/* Main Layout */}
      <div className="flex relative">
        {/* Sidebar */}
        {/* Sidebar is always mounted on desktop, conditionally on mobile */}
        {isMobile ? (
          <AnimatePresence>
            {!sidebarCollapsed && ( // Only show if not collapsed on mobile
              <Sidebar 
                currentModule={currentModule}
                setCurrentModule={setCurrentModule}
                onToggleAIChat={toggleAIChat}
                isCollapsed={sidebarCollapsed}
              />
            )}
          </AnimatePresence>
        ) : (
          <Sidebar 
            currentModule={currentModule}
            setCurrentModule={setCurrentModule}
            onToggleAIChat={toggleAIChat}
            isCollapsed={sidebarCollapsed} // Pass collapsed state
          />
        )}

        {/* Mobile Overlay */}
        {isMobile && !sidebarCollapsed && ( // Show overlay if sidebar is expanded on mobile
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarCollapsed(true)} // Collapse sidebar on overlay click
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          />
        )}

        {/* Main Content */}
        <motion.main 
          layout
          className={`flex-1 transition-all duration-300 ${
            isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-[80px]' : 'ml-[240px]') // Dynamic margin for desktop sidebar
          } ${aiChatOpen ? 'mr-96' : 'mr-0'}`}
        >
          <div className="p-4 lg:p-6">
            <DashboardContent currentModule={currentModule} />
          </div>
        </motion.main>

        {/* AI Chat Panel */}
        <AnimatePresence>
          {aiChatOpen && (
            <AIChat onClose={() => setAiChatOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};