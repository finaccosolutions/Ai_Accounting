import React, { createContext, useContext, useState } from 'react';
import { Company, FinancialYear } from '../types';

interface AppContextType {
  selectedCompany: Company | null;
  selectedFinancialYear: FinancialYear | null;
  setSelectedCompany: (company: Company | null) => void;
  setSelectedFinancialYear: (year: FinancialYear | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState<FinancialYear | null>(null);

  const value = {
    selectedCompany,
    selectedFinancialYear,
    setSelectedCompany,
    setSelectedFinancialYear,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};