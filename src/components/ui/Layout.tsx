import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  currentModule: string;
  setCurrentModule: (module: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentModule, setCurrentModule }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex">
        <Sidebar 
          currentModule={currentModule} 
          setCurrentModule={setCurrentModule}
          isOpen={sidebarOpen}
        />
        <main className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} mt-16`}>
          {children}
        </main>
      </div>
    </div>
  );
};