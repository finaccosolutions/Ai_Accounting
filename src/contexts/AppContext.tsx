import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCompany } from '../hooks/useCompany';
import { useFinancialYears } from '../hooks/useFinancialYears';
import { Database } from '../types/database';

type Company = Database['public']['Tables']['companies']['Row'];
type FinancialYear = Database['public']['Tables']['financial_years']['Row'];

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  profit: number;
  gstPayable: number;
  outstandingReceivables: number;
  outstandingPayables: number;
  cashBalance: number;
  bankBalance: number;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'suggestion' | 'info' | 'error';
  title: string;
  description: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

interface AppContextType {
  // Company state from useCompany hook
  companies: Company[];
  currentCompany: Company | null;
  userRole: string | null;
  companyLoading: boolean;
  companyError: string | null;
  switchCompany: (companyId: string) => Promise<{ success: boolean; error?: any }>;
  createCompany: (companyData: Database['public']['Tables']['companies']['Insert']) => Promise<{ data: Company | null; error: any }>;
  updateCompany: (companyId: string, updates: Database['public']['Tables']['companies']['Update']) => Promise<{ data: Company | null; error: any }>;
  refreshCompanies: () => Promise<void>;
  
  // Financial Years state from useFinancialYears hook
  financialYears: FinancialYear[];
  currentFinancialYear: FinancialYear | null;
  selectedFinancialYears: string[];
  fyLoading: boolean;
  toggleFinancialYearSelection: (fyId: string) => void;
  selectAllFinancialYears: () => void;
  clearFinancialYearSelection: () => void;
  createFinancialYear: (fyData: Database['public']['Tables']['financial_years']['Insert']) => Promise<{ data: FinancialYear | null; error: any }>;
  setCurrentFY: (fyId: string) => Promise<{ data: FinancialYear | null; error: any }>;
  refreshFinancialYears: () => Promise<void>;
  
  // App state
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
  // Get company state from useCompany hook
  const {
    companies,
    currentCompany,
    userRole,
    loading: companyLoading,
    error: companyError,
    switchCompany,
    createCompany,
    updateCompany,
    refreshCompanies: refreshCompaniesHook,
  } = useCompany();

  // Get financial years state from useFinancialYears hook
  const {
    financialYears,
    currentFinancialYear,
    selectedFinancialYears,
    loading: fyLoading,
    toggleFinancialYearSelection,
    selectAllFinancialYears,
    clearFinancialYearSelection,
    createFinancialYear,
    setCurrentFY,
    refreshFinancialYears: refreshFinancialYearsHook,
  } = useFinancialYears();

  // App-specific state
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

  // Debug logging
  console.log('🏢 AppProvider: Company state:', {
    companiesCount: companies.length,
    currentCompany: currentCompany?.name || 'None',
    currentCompanyId: currentCompany?.id || 'None',
    userRole,
    companyLoading
  });

  return (
    <AppContext.Provider value={{
      // Company state
      companies,
      currentCompany,
      userRole,
      companyLoading,
      companyError,
      switchCompany,
      createCompany,
      updateCompany,
      refreshCompanies: refreshCompaniesHook,
      
      // Financial Years state
      financialYears,
      currentFinancialYear,
      selectedFinancialYears,
      fyLoading,
      toggleFinancialYearSelection,
      selectAllFinancialYears,
      clearFinancialYearSelection,
      createFinancialYear,
      setCurrentFY,
      refreshFinancialYears: refreshFinancialYearsHook,
      
      // App state
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