/*
  # Financial Years and Enhanced Multi-tenant System

  1. New Tables
    - `financial_years` - Manage multiple financial years per company
    - `company_financial_years` - Junction table for company-financial year relationships
    - `user_permissions` - Granular permissions for users
    - `dashboard_data` - Cache for dashboard calculations

  2. Enhanced Tables
    - Update existing tables to support financial year context
    - Add proper indexes for performance
    - Enhanced audit trail

  3. Security
    - Enhanced RLS policies for financial year access
    - Role-based permissions system
    - Multi-tenant data isolation
*/

-- Financial Years table
CREATE TABLE IF NOT EXISTS financial_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  year_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean DEFAULT false,
  is_closed boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, year_name),
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- User permissions table for granular access control
CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  financial_year_id uuid REFERENCES financial_years(id) ON DELETE CASCADE,
  module text NOT NULL, -- 'vouchers', 'reports', 'masters', etc.
  permission text NOT NULL, -- 'create', 'read', 'update', 'delete'
  granted boolean DEFAULT true,
  granted_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, company_id, financial_year_id, module, permission)
);

-- Dashboard data cache table
CREATE TABLE IF NOT EXISTS dashboard_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  financial_year_id uuid REFERENCES financial_years(id) ON DELETE CASCADE,
  data_type text NOT NULL, -- 'income', 'expense', 'profit', etc.
  amount numeric(15,2) DEFAULT 0,
  period_type text DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly', 'yearly'
  period_date date NOT NULL,
  calculated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, financial_year_id, data_type, period_type, period_date)
);

-- Add financial_year_id to existing tables
DO $$
BEGIN
  -- Add financial_year_id to vouchers if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'financial_year_id'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN financial_year_id uuid REFERENCES financial_years(id);
  END IF;

  -- Add financial_year_id to ledgers if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ledgers' AND column_name = 'financial_year_id'
  ) THEN
    ALTER TABLE ledgers ADD COLUMN financial_year_id uuid REFERENCES financial_years(id);
  END IF;

  -- Add financial_year_id to stock_items if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stock_items' AND column_name = 'financial_year_id'
  ) THEN
    ALTER TABLE stock_items ADD COLUMN financial_year_id uuid REFERENCES financial_years(id);
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE financial_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for financial_years
CREATE POLICY "Users can access financial years for their companies"
  ON financial_years
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_users.company_id
      FROM company_users
      WHERE company_users.user_id = auth.uid() AND company_users.is_active = true
    )
  );

-- RLS Policies for user_permissions
CREATE POLICY "Users can read their own permissions"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Company admins can manage permissions"
  ON user_permissions
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_users.company_id
      FROM company_users
      WHERE company_users.user_id = auth.uid() 
        AND company_users.role = 'admin' 
        AND company_users.is_active = true
    )
  );

-- RLS Policies for dashboard_data
CREATE POLICY "Users can access dashboard data for their companies"
  ON dashboard_data
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_users.company_id
      FROM company_users
      WHERE company_users.user_id = auth.uid() AND company_users.is_active = true
    )
  );

-- Add updated_at trigger for financial_years
CREATE TRIGGER update_financial_years_updated_at 
  BEFORE UPDATE ON financial_years 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create default financial year when company is created
CREATE OR REPLACE FUNCTION create_default_financial_year(company_uuid uuid, start_date date DEFAULT NULL)
RETURNS uuid AS $$
DECLARE
  fy_start_date date;
  fy_end_date date;
  fy_id uuid;
BEGIN
  -- Use provided start_date or default to April 1st of current year
  fy_start_date := COALESCE(start_date, DATE(EXTRACT(YEAR FROM CURRENT_DATE) || '-04-01'));
  fy_end_date := fy_start_date + INTERVAL '1 year' - INTERVAL '1 day';
  
  -- Create the financial year
  INSERT INTO financial_years (
    company_id,
    year_name,
    start_date,
    end_date,
    is_current,
    created_by
  ) VALUES (
    company_uuid,
    EXTRACT(YEAR FROM fy_start_date) || '-' || EXTRACT(YEAR FROM fy_end_date),
    fy_start_date,
    fy_end_date,
    true,
    auth.uid()
  ) RETURNING id INTO fy_id;
  
  RETURN fy_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate dashboard data
CREATE OR REPLACE FUNCTION calculate_dashboard_data(
  company_uuid uuid, 
  financial_year_uuid uuid DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  fy_id uuid;
  total_income numeric(15,2) := 0;
  total_expense numeric(15,2) := 0;
  cash_balance numeric(15,2) := 0;
  bank_balance numeric(15,2) := 0;
  receivables numeric(15,2) := 0;
  payables numeric(15,2) := 0;
  current_date_val date := CURRENT_DATE;
BEGIN
  -- Get current financial year if not provided
  IF financial_year_uuid IS NULL THEN
    SELECT id INTO fy_id 
    FROM financial_years 
    WHERE company_id = company_uuid AND is_current = true 
    LIMIT 1;
  ELSE
    fy_id := financial_year_uuid;
  END IF;
  
  -- Calculate total income from posted vouchers
  SELECT COALESCE(SUM(ve.amount), 0) INTO total_income
  FROM voucher_entries ve
  JOIN vouchers v ON ve.voucher_id = v.id
  JOIN ledgers l ON ve.ledger_id = l.id
  WHERE v.company_id = company_uuid 
    AND v.financial_year_id = fy_id
    AND v.status = 'posted'
    AND l.ledger_type = 'income'
    AND ve.entry_type = 'credit';
  
  -- Calculate total expense from posted vouchers
  SELECT COALESCE(SUM(ve.amount), 0) INTO total_expense
  FROM voucher_entries ve
  JOIN vouchers v ON ve.voucher_id = v.id
  JOIN ledgers l ON ve.ledger_id = l.id
  WHERE v.company_id = company_uuid 
    AND v.financial_year_id = fy_id
    AND v.status = 'posted'
    AND l.ledger_type = 'expense'
    AND ve.entry_type = 'debit';
  
  -- Calculate cash balance
  SELECT COALESCE(SUM(current_balance), 0) INTO cash_balance
  FROM ledgers
  WHERE company_id = company_uuid 
    AND financial_year_id = fy_id
    AND LOWER(name) LIKE '%cash%'
    AND ledger_type = 'asset';
  
  -- Calculate bank balance
  SELECT COALESCE(SUM(current_balance), 0) INTO bank_balance
  FROM ledgers
  WHERE company_id = company_uuid 
    AND financial_year_id = fy_id
    AND LOWER(name) LIKE '%bank%'
    AND ledger_type = 'asset';
  
  -- Calculate receivables
  SELECT COALESCE(SUM(current_balance), 0) INTO receivables
  FROM ledgers
  WHERE company_id = company_uuid 
    AND financial_year_id = fy_id
    AND ledger_type = 'asset'
    AND current_balance > 0
    AND (LOWER(name) LIKE '%debtor%' OR LOWER(name) LIKE '%receivable%');
  
  -- Calculate payables
  SELECT COALESCE(SUM(current_balance), 0) INTO payables
  FROM ledgers
  WHERE company_id = company_uuid 
    AND financial_year_id = fy_id
    AND ledger_type = 'liability'
    AND current_balance > 0
    AND (LOWER(name) LIKE '%creditor%' OR LOWER(name) LIKE '%payable%');
  
  -- Insert/Update dashboard data
  INSERT INTO dashboard_data (company_id, financial_year_id, data_type, amount, period_date)
  VALUES 
    (company_uuid, fy_id, 'total_income', total_income, current_date_val),
    (company_uuid, fy_id, 'total_expense', total_expense, current_date_val),
    (company_uuid, fy_id, 'profit', total_income - total_expense, current_date_val),
    (company_uuid, fy_id, 'cash_balance', cash_balance, current_date_val),
    (company_uuid, fy_id, 'bank_balance', bank_balance, current_date_val),
    (company_uuid, fy_id, 'receivables', receivables, current_date_val),
    (company_uuid, fy_id, 'payables', payables, current_date_val)
  ON CONFLICT (company_id, financial_year_id, data_type, period_type, period_date)
  DO UPDATE SET 
    amount = EXCLUDED.amount,
    calculated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the setup_default_company_data function to include financial year
CREATE OR REPLACE FUNCTION setup_default_company_data(company_uuid uuid)
RETURNS void AS $$
DECLARE
  fy_id uuid;
BEGIN
  -- Create default financial year
  fy_id := create_default_financial_year(company_uuid);
  
  -- Insert default ledger groups
  INSERT INTO ledger_groups (company_id, name, group_type, is_system) VALUES
  (company_uuid, 'Current Assets', 'asset', true),
  (company_uuid, 'Fixed Assets', 'asset', true),
  (company_uuid, 'Current Liabilities', 'liability', true),
  (company_uuid, 'Capital Account', 'liability', true),
  (company_uuid, 'Sales Accounts', 'income', true),
  (company_uuid, 'Direct Expenses', 'expense', true),
  (company_uuid, 'Indirect Expenses', 'expense', true),
  (company_uuid, 'Bank Accounts', 'asset', true),
  (company_uuid, 'Cash-in-Hand', 'asset', true),
  (company_uuid, 'Sundry Debtors', 'asset', true),
  (company_uuid, 'Sundry Creditors', 'liability', true),
  (company_uuid, 'Duties & Taxes', 'liability', true);

  -- Insert default ledgers with financial year reference
  INSERT INTO ledgers (company_id, financial_year_id, name, group_id, ledger_type) VALUES
  (company_uuid, fy_id, 'Cash', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Cash-in-Hand'), 'asset'),
  (company_uuid, fy_id, 'Bank Account', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Bank Accounts'), 'asset'),
  (company_uuid, fy_id, 'Sales', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Sales Accounts'), 'income'),
  (company_uuid, fy_id, 'Purchase', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Direct Expenses'), 'expense'),
  (company_uuid, fy_id, 'CGST Payable', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Duties & Taxes'), 'liability'),
  (company_uuid, fy_id, 'SGST Payable', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Duties & Taxes'), 'liability'),
  (company_uuid, fy_id, 'IGST Payable', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Duties & Taxes'), 'liability'),
  (company_uuid, fy_id, 'TDS Payable', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Duties & Taxes'), 'liability'),
  (company_uuid, fy_id, 'Office Rent', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Indirect Expenses'), 'expense'),
  (company_uuid, fy_id, 'Salary', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Indirect Expenses'), 'expense'),
  (company_uuid, fy_id, 'Electricity', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Indirect Expenses'), 'expense');

  -- Insert default voucher types
  INSERT INTO voucher_types (company_id, name, code, prefix) VALUES
  (company_uuid, 'Sales', 'SALES', 'SV'),
  (company_uuid, 'Purchase', 'PURCHASE', 'PV'),
  (company_uuid, 'Receipt', 'RECEIPT', 'RV'),
  (company_uuid, 'Payment', 'PAYMENT', 'PY'),
  (company_uuid, 'Journal', 'JOURNAL', 'JV'),
  (company_uuid, 'Contra', 'CONTRA', 'CV'),
  (company_uuid, 'Debit Note', 'DEBIT_NOTE', 'DN'),
  (company_uuid, 'Credit Note', 'CREDIT_NOTE', 'CN');

  -- Insert default tax rates
  INSERT INTO tax_rates (company_id, name, rate, tax_type) VALUES
  (company_uuid, 'CGST 9%', 9.00, 'CGST'),
  (company_uuid, 'SGST 9%', 9.00, 'SGST'),
  (company_uuid, 'IGST 18%', 18.00, 'IGST'),
  (company_uuid, 'CGST 6%', 6.00, 'CGST'),
  (company_uuid, 'SGST 6%', 6.00, 'SGST'),
  (company_uuid, 'IGST 12%', 12.00, 'IGST'),
  (company_uuid, 'CGST 14%', 14.00, 'CGST'),
  (company_uuid, 'SGST 14%', 14.00, 'SGST'),
  (company_uuid, 'IGST 28%', 28.00, 'IGST'),
  (company_uuid, 'TDS 10%', 10.00, 'TDS');

  -- Insert default stock groups
  INSERT INTO stock_groups (company_id, name) VALUES
  (company_uuid, 'Electronics'),
  (company_uuid, 'Furniture'),
  (company_uuid, 'Computers'),
  (company_uuid, 'Office Supplies'),
  (company_uuid, 'Raw Materials');

  -- Insert sample HSN codes
  INSERT INTO hsn_codes (company_id, code, description, gst_rate) VALUES
  (company_uuid, '8415', 'Air conditioning machines', 18.00),
  (company_uuid, '8471', 'Automatic data processing machines', 18.00),
  (company_uuid, '9403', 'Other furniture and parts thereof', 18.00),
  (company_uuid, '8443', 'Printing machinery', 18.00),
  (company_uuid, '8517', 'Telephone sets, including smartphones', 18.00);

  -- Calculate initial dashboard data
  PERFORM calculate_dashboard_data(company_uuid, fy_id);
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_financial_years_company_current ON financial_years(company_id, is_current);
CREATE INDEX IF NOT EXISTS idx_vouchers_company_fy ON vouchers(company_id, financial_year_id);
CREATE INDEX IF NOT EXISTS idx_ledgers_company_fy ON ledgers(company_id, financial_year_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_data_company_fy ON dashboard_data(company_id, financial_year_id, data_type);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_company ON user_permissions(user_id, company_id);