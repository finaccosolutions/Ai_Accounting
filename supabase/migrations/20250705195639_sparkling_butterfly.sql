/*
  # Initial Database Schema for AccuSmart AI Accounting Software

  ## Overview
  This migration creates the complete database schema for a comprehensive accounting software system.

  ## 1. New Tables
  
  ### Core Tables
  - `profiles` - User profiles with role-based access
  - `companies` - Company master data
  - `financial_years` - Financial year periods for each company
  
  ### Accounting Tables
  - `ledgers` - Chart of accounts
  - `ledger_groups` - Grouping of ledgers
  - `vouchers` - Main voucher entries
  - `voucher_entries` - Individual debit/credit entries
  
  ### Inventory Tables
  - `stock_items` - Inventory items
  - `stock_groups` - Grouping of stock items
  - `units` - Units of measurement
  - `godowns` - Storage locations
  
  ### Tax Tables
  - `tax_ledgers` - Tax-specific ledgers (GST, TDS, TCS)
  - `hsn_codes` - HSN/SAC codes for GST
  
  ### Additional Tables
  - `cost_centers` - Cost center tracking
  - `user_permissions` - Role-based permissions
  - `audit_trail` - Complete audit trail
  
  ## 2. Security
  - Enable RLS on all tables
  - Add appropriate policies for each user role
  - Implement row-level security based on company access
  
  ## 3. Indexes
  - Create indexes for frequently queried columns
  - Optimize for reporting and dashboard queries
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'accountant', 'auditor', 'owner', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  gstin TEXT,
  pan TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  admin_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create financial_years table
CREATE TABLE IF NOT EXISTS financial_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  year_start DATE NOT NULL,
  year_end DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create ledger_groups table
CREATE TABLE IF NOT EXISTS ledger_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_group_id UUID REFERENCES ledger_groups(id),
  group_type TEXT NOT NULL CHECK (group_type IN ('assets', 'liabilities', 'income', 'expenses')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create ledgers table
CREATE TABLE IF NOT EXISTS ledgers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  financial_year_id UUID REFERENCES financial_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  group_id UUID REFERENCES ledger_groups(id),
  opening_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  financial_year_id UUID REFERENCES financial_years(id) ON DELETE CASCADE,
  voucher_type TEXT NOT NULL CHECK (voucher_type IN ('sales', 'purchase', 'receipt', 'payment', 'journal', 'contra', 'debit_note', 'credit_note', 'manufacturing_journal', 'stock_transfer')),
  voucher_number TEXT NOT NULL,
  date DATE NOT NULL,
  reference TEXT,
  narration TEXT,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, financial_year_id, voucher_type, voucher_number)
);

-- Create voucher_entries table
CREATE TABLE IF NOT EXISTS voucher_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_id UUID REFERENCES vouchers(id) ON DELETE CASCADE,
  ledger_id UUID REFERENCES ledgers(id),
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  narration TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create stock_groups table
CREATE TABLE IF NOT EXISTS stock_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_group_id UUID REFERENCES stock_groups(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create units table
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create stock_items table
CREATE TABLE IF NOT EXISTS stock_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  group_id UUID REFERENCES stock_groups(id),
  unit_id UUID REFERENCES units(id),
  rate DECIMAL(15,2) DEFAULT 0,
  opening_stock DECIMAL(15,3) DEFAULT 0,
  current_stock DECIMAL(15,3) DEFAULT 0,
  hsn_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create godowns table
CREATE TABLE IF NOT EXISTS godowns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create tax_ledgers table
CREATE TABLE IF NOT EXISTS tax_ledgers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  tax_type TEXT NOT NULL CHECK (tax_type IN ('cgst', 'sgst', 'igst', 'tds', 'tcs')),
  rate DECIMAL(5,2) NOT NULL,
  ledger_id UUID REFERENCES ledgers(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create hsn_codes table
CREATE TABLE IF NOT EXISTS hsn_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  hsn_code TEXT NOT NULL,
  description TEXT,
  gst_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create cost_centers table
CREATE TABLE IF NOT EXISTS cost_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'accountant', 'auditor', 'owner', 'viewer')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Create audit_trail table
CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES profiles(id),
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE godowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsn_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Companies policies
CREATE POLICY "Users can read companies they have access to"
  ON companies FOR SELECT
  TO authenticated
  USING (
    admin_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id::text = auth.uid()::text AND company_id = companies.id
    )
  );

CREATE POLICY "Admin can create companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (admin_id::text = auth.uid()::text);

CREATE POLICY "Admin can update companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (admin_id::text = auth.uid()::text);

-- Financial years policies
CREATE POLICY "Users can read financial years for accessible companies"
  ON financial_years FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = financial_years.company_id AND (
        companies.admin_id::text = auth.uid()::text OR
        EXISTS (
          SELECT 1 FROM user_permissions 
          WHERE user_id::text = auth.uid()::text AND company_id = companies.id
        )
      )
    )
  );

CREATE POLICY "Admin can manage financial years"
  ON financial_years FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = financial_years.company_id AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Ledgers policies
CREATE POLICY "Users can read ledgers for accessible companies"
  ON ledgers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = ledgers.company_id AND (
        companies.admin_id::text = auth.uid()::text OR
        EXISTS (
          SELECT 1 FROM user_permissions 
          WHERE user_id::text = auth.uid()::text AND company_id = companies.id
        )
      )
    )
  );

-- Vouchers policies
CREATE POLICY "Users can read vouchers for accessible companies"
  ON vouchers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = vouchers.company_id AND (
        companies.admin_id::text = auth.uid()::text OR
        EXISTS (
          SELECT 1 FROM user_permissions 
          WHERE user_id::text = auth.uid()::text AND company_id = companies.id
        )
      )
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_admin_id ON companies(admin_id);
CREATE INDEX IF NOT EXISTS idx_financial_years_company_id ON financial_years(company_id);
CREATE INDEX IF NOT EXISTS idx_ledgers_company_id ON ledgers(company_id);
CREATE INDEX IF NOT EXISTS idx_ledgers_financial_year_id ON ledgers(financial_year_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_company_id ON vouchers(company_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_financial_year_id ON vouchers(financial_year_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_date ON vouchers(date);
CREATE INDEX IF NOT EXISTS idx_voucher_entries_voucher_id ON voucher_entries(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_entries_ledger_id ON voucher_entries(ledger_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_company_id ON audit_trail(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_table_name ON audit_trail(table_name);

-- Insert default ledger groups
INSERT INTO ledger_groups (id, company_id, name, group_type) VALUES
(uuid_generate_v4(), NULL, 'Assets', 'assets'),
(uuid_generate_v4(), NULL, 'Liabilities', 'liabilities'),
(uuid_generate_v4(), NULL, 'Income', 'income'),
(uuid_generate_v4(), NULL, 'Expenses', 'expenses');

-- Insert default units
INSERT INTO units (id, company_id, name, symbol) VALUES
(uuid_generate_v4(), NULL, 'Numbers', 'Nos'),
(uuid_generate_v4(), NULL, 'Kilograms', 'Kg'),
(uuid_generate_v4(), NULL, 'Meters', 'Mtr'),
(uuid_generate_v4(), NULL, 'Liters', 'Ltr');