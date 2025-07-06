/*
  # Add missing fields to companies table

  1. New Columns Added
    - `mailing_name` (text) - Alternative name for correspondence
    - `industry` (text) - Industry type classification
    - `company_type` (text) - Legal structure of company
    - `tan` (text) - Tax Deduction Account Number
    - `cin` (text) - Corporate Identification Number
    - `city` (text) - City location
    - `state` (text) - State/Province location
    - `pincode` (text) - Postal/ZIP code
    - `country` (text) - Country code
    - `website` (text) - Company website URL
    - `fax` (text) - Fax number
    - `financial_year_start` (date) - Start date of financial year
    - `currency` (text) - Base currency code
    - `decimal_places` (integer) - Number of decimal places for amounts
    
  2. Feature Flags
    - `enable_inventory` (boolean) - Enable inventory management
    - `enable_multi_currency` (boolean) - Enable multiple currencies
    - `enable_cost_center` (boolean) - Enable cost center tracking
    - `enable_job_costing` (boolean) - Enable job costing
    - `enable_budget` (boolean) - Enable budget management
    - `auto_voucher_numbering` (boolean) - Auto-generate voucher numbers
    - `enable_audit_trail` (boolean) - Enable audit trail
    - `enable_multi_godown` (boolean) - Enable multiple godowns
    - `enable_batch_tracking` (boolean) - Enable batch tracking
    - `enable_serial_tracking` (boolean) - Enable serial number tracking
    - `enable_data_encryption` (boolean) - Enable data encryption
    - `enable_backup` (boolean) - Enable automatic backup
    - `backup_frequency` (text) - Frequency of backups
    - `enable_user_access_control` (boolean) - Enable user access control

  3. Constraints
    - Added check constraints for enum-like fields
    - Set appropriate default values for feature flags
*/

-- Add basic company information fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'mailing_name'
  ) THEN
    ALTER TABLE companies ADD COLUMN mailing_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'industry'
  ) THEN
    ALTER TABLE companies ADD COLUMN industry text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'company_type'
  ) THEN
    ALTER TABLE companies ADD COLUMN company_type text DEFAULT 'private_limited';
  END IF;
END $$;

-- Add tax identification fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'tan'
  ) THEN
    ALTER TABLE companies ADD COLUMN tan text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'cin'
  ) THEN
    ALTER TABLE companies ADD COLUMN cin text;
  END IF;
END $$;

-- Add address fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'city'
  ) THEN
    ALTER TABLE companies ADD COLUMN city text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'state'
  ) THEN
    ALTER TABLE companies ADD COLUMN state text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'pincode'
  ) THEN
    ALTER TABLE companies ADD COLUMN pincode text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'country'
  ) THEN
    ALTER TABLE companies ADD COLUMN country text DEFAULT 'IN';
  END IF;
END $$;

-- Add contact fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'website'
  ) THEN
    ALTER TABLE companies ADD COLUMN website text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'fax'
  ) THEN
    ALTER TABLE companies ADD COLUMN fax text;
  END IF;
END $$;

-- Add financial configuration fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'financial_year_start'
  ) THEN
    ALTER TABLE companies ADD COLUMN financial_year_start date;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'currency'
  ) THEN
    ALTER TABLE companies ADD COLUMN currency text DEFAULT 'INR';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'decimal_places'
  ) THEN
    ALTER TABLE companies ADD COLUMN decimal_places integer DEFAULT 2;
  END IF;
END $$;

-- Add feature flags
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'enable_inventory'
  ) THEN
    ALTER TABLE companies ADD COLUMN enable_inventory boolean DEFAULT true;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'enable_multi_currency'
  ) THEN
    ALTER TABLE companies ADD COLUMN enable_multi_currency boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'enable_cost_center'
  ) THEN
    ALTER TABLE companies ADD COLUMN enable_cost_center boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'enable_job_costing'
  ) THEN
    ALTER TABLE companies ADD COLUMN enable_job_costing boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'enable_budget'
  ) THEN
    ALTER TABLE companies ADD COLUMN enable_budget boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'auto_voucher_numbering'
  ) THEN
    ALTER TABLE companies ADD COLUMN auto_voucher_numbering boolean DEFAULT true;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'enable_audit_trail'
  ) THEN
    ALTER TABLE companies ADD COLUMN enable_audit_trail boolean DEFAULT true;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'enable_multi_godown'
  ) THEN
    ALTER TABLE companies ADD COLUMN enable_multi_godown boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'enable_batch_tracking'
  ) THEN
    ALTER TABLE companies ADD COLUMN enable_batch_tracking boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'enable_serial_tracking'
  ) THEN
    ALTER TABLE companies ADD COLUMN enable_serial_tracking boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'enable_data_encryption'
  ) THEN
    ALTER TABLE companies ADD COLUMN enable_data_encryption boolean DEFAULT true;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'enable_backup'
  ) THEN
    ALTER TABLE companies ADD COLUMN enable_backup boolean DEFAULT true;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'backup_frequency'
  ) THEN
    ALTER TABLE companies ADD COLUMN backup_frequency text DEFAULT 'daily';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'enable_user_access_control'
  ) THEN
    ALTER TABLE companies ADD COLUMN enable_user_access_control boolean DEFAULT true;
  END IF;
END $$;

-- Add check constraints for enum-like fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'companies' AND constraint_name = 'companies_company_type_check'
  ) THEN
    ALTER TABLE companies ADD CONSTRAINT companies_company_type_check 
    CHECK (company_type IN ('private_limited', 'public_limited', 'partnership', 'llp', 'sole_proprietorship', 'trust', 'society', 'other'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'companies' AND constraint_name = 'companies_backup_frequency_check'
  ) THEN
    ALTER TABLE companies ADD CONSTRAINT companies_backup_frequency_check 
    CHECK (backup_frequency IN ('daily', 'weekly', 'monthly'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'companies' AND constraint_name = 'companies_decimal_places_check'
  ) THEN
    ALTER TABLE companies ADD CONSTRAINT companies_decimal_places_check 
    CHECK (decimal_places >= 0 AND decimal_places <= 4);
  END IF;
END $$;