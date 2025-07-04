/*
  # Initial Schema for AI Accounting Software

  1. New Tables
    - `profiles` - User profile information
    - `companies` - Company details
    - `ledger_groups` - Chart of accounts groups
    - `ledgers` - Individual ledger accounts
    - `stock_groups` - Stock item categories
    - `stock_items` - Inventory items
    - `voucher_types` - Types of vouchers
    - `vouchers` - Transaction vouchers
    - `voucher_entries` - Individual voucher line items
    - `tax_rates` - GST and other tax configurations
    - `hsn_codes` - HSN/SAC codes for items
    - `audit_logs` - Audit trail for all changes
    - `ai_insights` - AI-generated insights and suggestions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on company access
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  mobile_number text,
  role text NOT NULL DEFAULT 'accountant' CHECK (role IN ('admin', 'accountant', 'auditor', 'owner', 'viewer')),
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gstin text,
  pan text,
  tan text,
  address text,
  city text,
  state text,
  pincode text,
  phone text,
  email text,
  website text,
  logo_url text,
  financial_year_start date DEFAULT '2024-04-01',
  currency text DEFAULT 'INR',
  decimal_places integer DEFAULT 2,
  enable_inventory boolean DEFAULT true,
  enable_multi_currency boolean DEFAULT false,
  enable_cost_center boolean DEFAULT false,
  auto_voucher_numbering boolean DEFAULT true,
  enable_audit_trail boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Company users junction table
CREATE TABLE IF NOT EXISTS company_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'accountant', 'auditor', 'owner', 'viewer')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- Ledger groups table
CREATE TABLE IF NOT EXISTS ledger_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  parent_id uuid REFERENCES ledger_groups(id),
  group_type text NOT NULL CHECK (group_type IN ('asset', 'liability', 'income', 'expense')),
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, name)
);

-- Ledgers table
CREATE TABLE IF NOT EXISTS ledgers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  group_id uuid REFERENCES ledger_groups(id),
  ledger_type text NOT NULL CHECK (ledger_type IN ('asset', 'liability', 'income', 'expense')),
  opening_balance numeric(15,2) DEFAULT 0,
  current_balance numeric(15,2) DEFAULT 0,
  gstin text,
  pan text,
  address text,
  city text,
  state text,
  pincode text,
  phone text,
  email text,
  credit_limit numeric(15,2) DEFAULT 0,
  credit_days integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, name)
);

-- Stock groups table
CREATE TABLE IF NOT EXISTS stock_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  parent_id uuid REFERENCES stock_groups(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, name)
);

-- HSN codes table
CREATE TABLE IF NOT EXISTS hsn_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  code text NOT NULL,
  description text,
  gst_rate numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Stock items table
CREATE TABLE IF NOT EXISTS stock_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  group_id uuid REFERENCES stock_groups(id),
  unit text NOT NULL DEFAULT 'Nos',
  hsn_code_id uuid REFERENCES hsn_codes(id),
  gst_rate numeric(5,2) DEFAULT 0,
  opening_stock numeric(15,3) DEFAULT 0,
  current_stock numeric(15,3) DEFAULT 0,
  rate numeric(15,2) DEFAULT 0,
  minimum_level numeric(15,3) DEFAULT 0,
  maximum_level numeric(15,3) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, name)
);

-- Tax rates table
CREATE TABLE IF NOT EXISTS tax_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  rate numeric(5,2) NOT NULL,
  tax_type text NOT NULL CHECK (tax_type IN ('CGST', 'SGST', 'IGST', 'CESS', 'TDS', 'TCS')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, name)
);

-- Voucher types table
CREATE TABLE IF NOT EXISTS voucher_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  prefix text,
  numbering_method text DEFAULT 'auto' CHECK (numbering_method IN ('auto', 'manual')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  voucher_type_id uuid REFERENCES voucher_types(id),
  voucher_number text NOT NULL,
  voucher_date date NOT NULL,
  reference_number text,
  narration text,
  total_amount numeric(15,2) NOT NULL DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'cancelled')),
  created_by uuid REFERENCES auth.users(id),
  posted_by uuid REFERENCES auth.users(id),
  posted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, voucher_type_id, voucher_number)
);

-- Voucher entries table
CREATE TABLE IF NOT EXISTS voucher_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id uuid REFERENCES vouchers(id) ON DELETE CASCADE,
  ledger_id uuid REFERENCES ledgers(id),
  stock_item_id uuid REFERENCES stock_items(id),
  entry_type text NOT NULL CHECK (entry_type IN ('debit', 'credit')),
  amount numeric(15,2) NOT NULL,
  quantity numeric(15,3),
  rate numeric(15,2),
  discount_percentage numeric(5,2) DEFAULT 0,
  discount_amount numeric(15,2) DEFAULT 0,
  tax_amount numeric(15,2) DEFAULT 0,
  narration text,
  created_at timestamptz DEFAULT now()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  user_id uuid REFERENCES auth.users(id),
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- AI insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('warning', 'suggestion', 'info', 'error')),
  title text NOT NULL,
  description text NOT NULL,
  action_text text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_read boolean DEFAULT false,
  related_table text,
  related_id uuid,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsn_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Companies policies
CREATE POLICY "Users can read companies they belong to"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Company admins can update companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Company users policies
CREATE POLICY "Users can read company users for their companies"
  ON company_users
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Generic company-based policies for other tables
CREATE POLICY "Users can access ledger_groups for their companies"
  ON ledger_groups
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can access ledgers for their companies"
  ON ledgers
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can access stock_groups for their companies"
  ON stock_groups
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can access stock_items for their companies"
  ON stock_items
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can access hsn_codes for their companies"
  ON hsn_codes
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can access tax_rates for their companies"
  ON tax_rates
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can access voucher_types for their companies"
  ON voucher_types
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can access vouchers for their companies"
  ON vouchers
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can access voucher_entries for their companies"
  ON voucher_entries
  FOR ALL
  TO authenticated
  USING (
    voucher_id IN (
      SELECT v.id FROM vouchers v
      JOIN company_users cu ON v.company_id = cu.company_id
      WHERE cu.user_id = auth.uid() AND cu.is_active = true
    )
  );

CREATE POLICY "Users can access audit_logs for their companies"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can access ai_insights for their companies"
  ON ai_insights
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ledger_groups_updated_at BEFORE UPDATE ON ledger_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ledgers_updated_at BEFORE UPDATE ON ledgers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_groups_updated_at BEFORE UPDATE ON stock_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_items_updated_at BEFORE UPDATE ON stock_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vouchers_updated_at BEFORE UPDATE ON vouchers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();