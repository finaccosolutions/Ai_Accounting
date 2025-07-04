import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AIChat } from './AIChat';

interface LayoutProps {
  children: React.ReactNode;
  currentModule: string;
  setCurrentModule: (module: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentModule, setCurrentModule }) => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenAIChat={() => setIsAIChatOpen(true)} />
      <div className="flex">
        <Sidebar currentModule={currentModule} setCurrentModule={setCurrentModule} />
        <main className="flex-1 p-6 ml-64 mt-16 transition-all duration-300">
          {children}
        </main>
        <AIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      </div>
    </div>
  );
};