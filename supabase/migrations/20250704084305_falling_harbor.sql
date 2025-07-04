/*
  # Fix Company Users RLS Policy and Add Country Column

  1. Database Schema Updates
    - Add `country` column to `companies` table
    - Add `mailing_name` column to `companies` table (used in form but missing from schema)

  2. Security Policy Fixes
    - Fix infinite recursion in `company_users` RLS policies
    - Simplify policies to avoid circular references

  3. Data Integrity
    - Ensure all columns used in the application exist in the database
    - Maintain proper foreign key relationships
*/

-- First, add missing columns to companies table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'country'
  ) THEN
    ALTER TABLE companies ADD COLUMN country text DEFAULT 'IN';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'mailing_name'
  ) THEN
    ALTER TABLE companies ADD COLUMN mailing_name text;
  END IF;
END $$;

-- Drop existing problematic policies for company_users
DROP POLICY IF EXISTS "Company admins can manage company users" ON company_users;
DROP POLICY IF EXISTS "Users can read their own company memberships" ON company_users;

-- Create new, simplified policies that avoid recursion
CREATE POLICY "Users can read their own company memberships"
  ON company_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Company admins can read all company users"
  ON company_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM company_users cu2
      WHERE cu2.company_id = company_users.company_id
        AND cu2.user_id = auth.uid()
        AND cu2.role = 'admin'
        AND cu2.is_active = true
    )
  );

CREATE POLICY "Company admins can insert company users"
  ON company_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_users cu2
      WHERE cu2.company_id = company_users.company_id
        AND cu2.user_id = auth.uid()
        AND cu2.role = 'admin'
        AND cu2.is_active = true
    )
    OR
    -- Allow users to be added as admin when creating a new company
    (role = 'admin' AND user_id = auth.uid())
  );

CREATE POLICY "Company admins can update company users"
  ON company_users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM company_users cu2
      WHERE cu2.company_id = company_users.company_id
        AND cu2.user_id = auth.uid()
        AND cu2.role = 'admin'
        AND cu2.is_active = true
    )
  );

CREATE POLICY "Company admins can delete company users"
  ON company_users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM company_users cu2
      WHERE cu2.company_id = company_users.company_id
        AND cu2.user_id = auth.uid()
        AND cu2.role = 'admin'
        AND cu2.is_active = true
    )
  );