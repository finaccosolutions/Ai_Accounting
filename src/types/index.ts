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
  // New fields from company form
  mailing_name?: string;
  industry?: string;
  company_type?: string;
  tan?: string;
  cin?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  website?: string;
  fax?: string;
  financial_year_start?: string;
  currency?: string;
  decimal_places?: number;
  enable_inventory?: boolean;
  enable_multi_currency?: boolean;
  enable_cost_center?: boolean;
  enable_job_costing?: boolean;
  enable_budget?: boolean;
  auto_voucher_numbering?: boolean;
  enable_audit_trail?: boolean;
  enable_multi_godown?: boolean; // Added
  enable_batch_tracking?: boolean; // Added
  enable_serial_tracking?: boolean; // Added
  enable_data_encryption?: boolean;
  enable_backup?: boolean;
  backup_frequency?: string;
  enable_user_access_control?: boolean;
}

export interface FinancialYear {
  id: string;
  company_id: string;
  year_start: string;
  year_end: string;
  is_active: boolean;
  created_at: string;
}

export interface LedgerGroup {
  id: string;
  company_id: string;
  name: string;
  parent_group_id?: string;
  group_type: 'assets' | 'liabilities' | 'income' | 'expenses';
  created_at: string;
  updated_at: string;
}

export interface Ledger {
  id: string;
  company_id: string;
  financial_year_id: string;
  name: string;
  group_id: string;
  ledger_groups?: LedgerGroup; // Added for nested data
  opening_balance: number;
  current_balance: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Voucher {
  id?: string; // Made optional for new vouchers
  company_id: string;
  financial_year_id: string;
  voucher_type: 'sales' | 'purchase' | 'receipt' | 'payment' | 'journal' | 'contra' | 'debit_note' | 'credit_note' | 'manufacturing_journal' | 'stock_transfer';
  voucher_number: string;
  date: string;
  reference?: string;
  narration?: string;
  total_amount: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  party_ledger_id?: string;
  party_name?: string;
  sales_ledger_id?: string;
  purchase_ledger_id?: string;
  cash_bank_ledger_id?: string;
  place_of_supply?: string;
  entries: VoucherEntry[];
  stock_entries?: StockEntry[];
  mode?: 'item_invoice' | 'voucher_mode'; // Added
  use_common_ledger?: boolean; // Added
  debit_entries?: Array<{ ledger_id: string; amount: number; }>; // Added for contra
  credit_entries?: Array<{ ledger_id: string; amount: number; }>; // Added for contra
}

export interface VoucherEntry {
  id: string;
  voucher_id: string;
  ledger_id: string;
  debit_amount: number;
  credit_amount: number;
  narration?: string;
}

export interface Unit {
  id: string;
  company_id: string;
  name: string;
  symbol: string;
  created_at: string;
}

export interface StockGroup {
  id: string;
  company_id: string;
  name: string;
  parent_group_id?: string;
  created_at: string;
  updated_at: string;
}

export interface StockItem {
  id: string;
  company_id: string;
  name: string;
  group_id?: string;
  stock_groups?: StockGroup; // Added for nested data
  unit_id?: string;
  units?: Unit; // Added for nested data
  rate: number;
  opening_stock: number;
  current_stock: number;
  hsn_code?: string; // Added
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockEntry {
  id?: string;
  stock_item_id: string;
  stock_item_name?: string;
  quantity: number;
  rate: number;
  amount: number;
  godown_id?: string;
  individual_ledger_id?: string;
  batch_number?: string; // Added
  serial_number?: string; // Added
}

export interface Godown { // New interface
  id: string;
  company_id: string;
  name: string;
  address?: string;
  is_active?: boolean;
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
