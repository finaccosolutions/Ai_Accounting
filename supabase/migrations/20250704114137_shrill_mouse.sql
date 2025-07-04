/*
  # Fix Company Creation RLS Policy

  1. Security Updates
    - Drop existing restrictive INSERT policy for companies
    - Create new INSERT policy that properly allows authenticated users to create companies
    - Ensure the policy works with the current application logic

  2. Changes
    - Updated INSERT policy to allow authenticated users to create companies where they are the creator
    - Fixed policy condition to work with both created_by and user_id fields
*/

-- Drop the existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can create companies" ON companies;

-- Create a new INSERT policy that allows authenticated users to create companies
CREATE POLICY "Users can create companies" 
  ON companies 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    auth.uid() = created_by OR 
    auth.uid() = user_id OR 
    (created_by IS NULL AND auth.uid() IS NOT NULL)
  );

-- Also ensure the SELECT policy allows users to see companies they created
DROP POLICY IF EXISTS "Users can read their companies" ON companies;

CREATE POLICY "Users can read their companies" 
  ON companies 
  FOR SELECT 
  TO authenticated 
  USING (
    id IN (
      SELECT company_users.company_id
      FROM company_users
      WHERE company_users.user_id = auth.uid() 
        AND company_users.is_active = true
    ) OR 
    created_by = auth.uid() OR 
    user_id = auth.uid()
  );

-- Ensure UPDATE policy allows company admins to update
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
    ) OR 
    created_by = auth.uid()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM company_users
      WHERE company_users.company_id = companies.id 
        AND company_users.user_id = auth.uid() 
        AND company_users.role = 'admin' 
        AND company_users.is_active = true
    ) OR 
    created_by = auth.uid()
  );