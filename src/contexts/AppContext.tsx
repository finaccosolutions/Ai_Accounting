import React, { createContext, useContext, useState, useEffect } from 'react';
import { Company, DashboardStats, AIInsight } from '../types';

interface AppContextType {
  company: Company | null;
  setCompany: (company: Company) => void;
  dashboardStats: DashboardStats;
  aiInsights: AIInsight[];
  isAIChatOpen: boolean;
  setIsAIChatOpen: (isOpen: boolean) => void;
  currentModule: string;
  setCurrentModule: (module: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState('dashboard');

  const [dashboardStats] = useState<DashboardStats>({
    totalIncome: 2500000,
    totalExpense: 1800000,
    profit: 700000,
    gstPayable: 125000,
    outstandingReceivables: 450000,
    outstandingPayables: 280000,
    cashBalance: 85000,
    bankBalance: 1200000
  });

  const [aiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'warning',
      title: 'GST Filing Due',
      description: 'GSTR-3B filing is due in 3 days. Review your tax liability.',
      action: 'View GST Reports',
      priority: 'high',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'suggestion',
      title: 'Duplicate Entry Detected',
      description: 'Found similar payment entries on 15th Jan. Please review.',
      action: 'Review Entries',
      priority: 'medium',
      createdAt: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      type: 'info',
      title: 'Profit Increased',
      description: 'Your profit margin increased by 12% this quarter.',
      priority: 'low',
      createdAt: '2024-01-15T08:45:00Z'
    }
  ]);

  useEffect(() => {
    // Load company data
    const mockCompany: Company = {
      id: '1',
      name: 'Demo Company Ltd.',
      gstin: '29ABCDE1234F1Z5',
      pan: 'ABCDE1234F',
      address: '123 Business Street, City, State - 560001',
      phone: '+91-9876543210',
      email: 'info@democompany.com'
    };
    setCompany(mockCompany);
  }, []);

  return (
    <AppContext.Provider value={{
      company,
      setCompany,
      dashboardStats,
      aiInsights,
      isAIChatOpen,
      setIsAIChatOpen,
      currentModule,
      setCurrentModule
    }}>
      {children}
    </AppContext.Provider>
  );
};