/*
  # Insert Default Data for AI Accounting Software

  1. Default ledger groups and ledgers
  2. Default voucher types
  3. Default tax rates
  4. Sample HSN codes
*/

-- This migration will be run after a company is created
-- For now, we'll create a function that can be called to set up default data

CREATE OR REPLACE FUNCTION setup_default_company_data(company_uuid uuid)
RETURNS void AS $$
BEGIN
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

  -- Insert default ledgers
  INSERT INTO ledgers (company_id, name, group_id, ledger_type) VALUES
  (company_uuid, 'Cash', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Cash-in-Hand'), 'asset'),
  (company_uuid, 'Bank Account', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Bank Accounts'), 'asset'),
  (company_uuid, 'Sales', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Sales Accounts'), 'income'),
  (company_uuid, 'Purchase', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Direct Expenses'), 'expense'),
  (company_uuid, 'CGST Payable', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Duties & Taxes'), 'liability'),
  (company_uuid, 'SGST Payable', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Duties & Taxes'), 'liability'),
  (company_uuid, 'IGST Payable', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Duties & Taxes'), 'liability'),
  (company_uuid, 'TDS Payable', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Duties & Taxes'), 'liability'),
  (company_uuid, 'Office Rent', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Indirect Expenses'), 'expense'),
  (company_uuid, 'Salary', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Indirect Expenses'), 'expense'),
  (company_uuid, 'Electricity', (SELECT id FROM ledger_groups WHERE company_id = company_uuid AND name = 'Indirect Expenses'), 'expense');

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

END;
$$ LANGUAGE plpgsql;