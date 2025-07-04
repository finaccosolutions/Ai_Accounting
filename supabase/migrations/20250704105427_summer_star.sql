/*
  # Fix Company Creation RLS Policy

  1. Security Updates
    - Add INSERT policy for companies table to allow authenticated users to create companies
    - Ensure the policy checks that created_by matches the authenticated user
    - Update existing policies to be more specific and secure

  2. Changes
    - Add "Users can create companies" INSERT policy
    - Ensure RLS is properly enabled
    - Fix any policy conflicts
*/

-- Ensure RLS is enabled on companies table
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Users can insert companies" ON companies;
DROP POLICY IF EXISTS "Users can insert companies they create" ON companies;

-- Create a comprehensive INSERT policy for companies
CREATE POLICY "Users can create companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Ensure the SELECT policy is properly defined
DROP POLICY IF EXISTS "Users can read companies they belong to" ON companies;
CREATE POLICY "Users can read companies they belong to"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_users.company_id
      FROM company_users
      WHERE company_users.user_id = auth.uid()
        AND company_users.is_active = true
    )
  );

-- Ensure the UPDATE policy is properly defined
DROP POLICY IF EXISTS "Company admins can update companies" ON companies;
CREATE POLICY "Company admins can update companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM company_users
      WHERE company_users.company_id = companies.id
        AND company_users.user_id = auth.uid()
        AND company_users.role = 'admin'
        AND company_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM company_users
      WHERE company_users.company_id = companies.id
        AND company_users.user_id = auth.uid()
        AND company_users.role = 'admin'
        AND company_users.is_active = true
    )
  );