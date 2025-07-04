export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'accountant' | 'auditor' | 'owner' | 'viewer';
  avatar?: string;
}

export interface Company {
  id: string;
  name: string;
  gstin: string;
  pan: string;
  address: string;
  phone: string;
  email: string;
}

export interface Voucher {
  id: string;
  type: 'sales' | 'purchase' | 'receipt' | 'payment' | 'journal' | 'contra' | 'debit_note' | 'credit_note' | 'manufacturing' | 'stock_transfer';
  number: string;
  date: string;
  reference?: string;
  narration: string;
  amount: number;
  status: 'draft' | 'posted' | 'cancelled';
  entries: VoucherEntry[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherEntry {
  id: string;
  ledger: string;
  amount: number;
  type: 'debit' | 'credit';
  stockItem?: string;
  quantity?: number;
  rate?: number;
  discount?: number;
  tax?: number;
}

export interface Ledger {
  id: string;
  name: string;
  group: string;
  type: 'asset' | 'liability' | 'income' | 'expense';
  openingBalance: number;
  currentBalance: number;
  gstin?: string;
  pan?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface StockItem {
  id: string;
  name: string;
  group: string;
  unit: string;
  hsnCode?: string;
  taxRate?: number;
  openingStock: number;
  currentStock: number;
  rate: number;
  minimumLevel?: number;
  maximumLevel?: number;
}

export interface Report {
  id: string;
  name: string;
  type: 'accounting' | 'inventory' | 'tax' | 'compliance';
  category: string;
  description: string;
  parameters?: ReportParameter[];
}

export interface ReportParameter {
  name: string;
  type: 'date' | 'dateRange' | 'select' | 'multiSelect' | 'text';
  required: boolean;
  options?: string[];
  defaultValue?: any;
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