import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  currentModule: string;
  setCurrentModule: (module: string) => void;
  onShowCompanySelector: () => void;
  onToggleAIChat: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentModule, 
  setCurrentModule,
  onShowCompanySelector,
  onToggleAIChat
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        onShowCompanySelector={onShowCompanySelector}
        onToggleAIChat={onToggleAIChat}
      />
      <div className="flex">
        <Sidebar 
          currentModule={currentModule} 
          setCurrentModule={setCurrentModule}
          isOpen={sidebarOpen}
          onToggleAIChat={onToggleAIChat}
        />
        <main className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} mt-16`}>
          {children}
        </main>
      </div>
    </div>
  );
};