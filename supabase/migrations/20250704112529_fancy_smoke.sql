/*
  # Fix Companies INSERT Policy

  1. Security Changes
    - Drop existing INSERT policy that may be causing conflicts
    - Create new INSERT policy that allows authenticated users to create companies
    - Ensure the policy checks against the correct field (created_by)

  2. Policy Details
    - Allow authenticated users to insert companies where they are the creator
    - Use auth.uid() = created_by for the check condition
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can create companies" ON companies;

-- Create new INSERT policy for companies
CREATE POLICY "Users can create companies" 
  ON companies 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = created_by);

-- Ensure the SELECT policy allows users to read companies they have access to
DROP POLICY IF EXISTS "Users can read their companies" ON companies;

CREATE POLICY "Users can read their companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT company_users.company_id
    FROM company_users
    WHERE company_users.user_id = auth.uid() 
    AND company_users.is_active = true
  ));

-- Ensure the UPDATE policy allows company admins to update companies
DROP POLICY IF EXISTS "Company admins can update companies" ON companies;

CREATE POLICY "Company admins can update companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM company_users
    WHERE company_users.company_id = companies.id
    AND company_users.user_id = auth.uid()
    AND company_users.role = 'admin'
    AND company_users.is_active = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM company_users
    WHERE company_users.company_id = companies.id
    AND company_users.user_id = auth.uid()
    AND company_users.role = 'admin'
    AND company_users.is_active = true
  ));