export interface User {
  id: string;
  email: string;
  phone?: string;
  role: 'admin' | 'accountant' | 'auditor' | 'owner' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  gstin?: string;
  pan?: string;
  address?: string;
  phone?: string;
  email?: string;
  admin_id: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialYear {
  id: string;
  company_id: string;
  year_start: string;
  year_end: string;
  is_active: boolean;
  created_at: string;
}

export interface Ledger {
  id: string;
  company_id: string;
  financial_year_id: string;
  name: string;
  group: string;
  opening_balance: number;
  current_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Voucher {
  id: string;
  company_id: string;
  financial_year_id: string;
  voucher_type: 'sales' | 'purchase' | 'receipt' | 'payment' | 'journal' | 'contra' | 'debit_note' | 'credit_note';
  voucher_number: string;
  date: string;
  reference?: string;
  narration?: string;
  total_amount: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface VoucherEntry {
  id: string;
  voucher_id: string;
  ledger_id: string;
  debit_amount: number;
  credit_amount: number;
  narration?: string;
}

export interface StockItem {
  id: string;
  company_id: string;
  name: string;
  unit: string;
  rate: number;
  opening_stock: number;
  current_stock: number;
  hsn_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Dashboard {
  totalIncome: number;
  totalExpense: number;
  totalReceivables: number;
  totalPayables: number;
  gstPayable: number;
  profitLoss: number;
  topCustomers: Array<{name: string; amount: number}>;
  topVendors: Array<{name: string; amount: number}>;
  recentVouchers: Voucher[];
  monthlyTrend: Array<{month: string; income: number; expense: number}>;
}