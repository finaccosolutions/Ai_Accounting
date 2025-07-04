/*
  # Fix infinite recursion in company_users RLS policies

  1. Problem
    - Current policies on company_users table create infinite recursion
    - Policies check for admin role by querying the same table they're protecting
    - This creates a circular dependency causing infinite recursion

  2. Solution
    - Simplify policies to avoid self-referencing queries
    - Use direct user_id checks where possible
    - Create separate policies for different scenarios
    - Ensure admin checks don't create circular dependencies

  3. Changes
    - Drop existing problematic policies
    - Create new simplified policies
    - Allow users to read their own company memberships
    - Allow company creation through insert policy
    - Use function-based approach for admin checks to break recursion
*/

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Company admins can delete company users" ON company_users;
DROP POLICY IF EXISTS "Company admins can insert company users" ON company_users;
DROP POLICY IF EXISTS "Company admins can read company users" ON company_users;
DROP POLICY IF EXISTS "Company admins can update company users" ON company_users;
DROP POLICY IF EXISTS "Users can read own company memberships" ON company_users;

-- Create a function to check if user is admin of a company (with recursion protection)
CREATE OR REPLACE FUNCTION is_company_admin(company_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_users 
    WHERE company_id = company_uuid 
    AND user_id = user_uuid 
    AND role = 'admin' 
    AND is_active = true
  );
$$;

-- Policy for users to read their own company memberships
CREATE POLICY "Users can read own company memberships"
  ON company_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy for inserting company users (allow if user is admin OR creating themselves as admin)
CREATE POLICY "Allow company user creation"
  ON company_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if user is creating themselves as admin (for new companies)
    (user_id = auth.uid() AND role = 'admin')
    OR
    -- Allow if user is already an admin of the company (checked via function to avoid recursion)
    is_company_admin(company_id, auth.uid())
  );

-- Policy for updating company users (only admins can update)
CREATE POLICY "Company admins can update company users"
  ON company_users
  FOR UPDATE
  TO authenticated
  USING (is_company_admin(company_id, auth.uid()))
  WITH CHECK (is_company_admin(company_id, auth.uid()));

-- Policy for deleting company users (only admins can delete)
CREATE POLICY "Company admins can delete company users"
  ON company_users
  FOR DELETE
  TO authenticated
  USING (is_company_admin(company_id, auth.uid()));

-- Policy for admins to read all company users
CREATE POLICY "Company admins can read company users"
  ON company_users
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR is_company_admin(company_id, auth.uid())
  );

-- Also fix the companies table policies to avoid potential recursion
DROP POLICY IF EXISTS "Users can read companies they belong to" ON companies;
DROP POLICY IF EXISTS "Company admins can update companies" ON companies;

-- Recreate companies policies with function-based checks
CREATE POLICY "Users can read companies they belong to"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id 
      FROM company_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Company admins can update companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (is_company_admin(id, auth.uid()))
  WITH CHECK (is_company_admin(id, auth.uid()));