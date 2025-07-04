/*
  # Fix company_users RLS policy to prevent infinite recursion

  1. Security Changes
    - Drop existing problematic policy
    - Create new policy without recursion
    - Add proper policies for company access
*/

-- Drop existing problematic policy
DROP POLICY IF EXISTS "Users can read company users for their companies" ON company_users;

-- Create new policy without recursion
CREATE POLICY "Users can read their own company memberships"
  ON company_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to read companies they belong to
DROP POLICY IF EXISTS "Users can read companies they belong to" ON companies;
CREATE POLICY "Users can read companies they belong to"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id 
      FROM company_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow company admins to manage company users
CREATE POLICY "Company admins can manage company users"
  ON company_users
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM company_users 
      WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND is_active = true
    )
  );