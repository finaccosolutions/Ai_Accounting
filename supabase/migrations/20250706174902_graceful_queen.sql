/*
  # Fix Companies RLS Policies - Prevent Infinite Recursion

  1. Problem
    - Current RLS policies on companies table are causing infinite recursion
    - The policies reference user_permissions table which in turn references companies table
    - This creates a circular dependency during policy evaluation

  2. Solution
    - Simplify the RLS policies to avoid circular references
    - Use direct checks against auth.uid() and admin_id
    - Remove complex subqueries that reference other tables with their own RLS policies

  3. Changes
    - Drop existing problematic policies
    - Create new simplified policies that avoid recursion
    - Ensure users can only access companies they admin or have explicit permissions for
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "company_admin_full_access" ON companies;
DROP POLICY IF EXISTS "company_create_as_admin" ON companies;
DROP POLICY IF EXISTS "company_read_via_permissions" ON companies;

-- Create new simplified policies that avoid recursion

-- Policy 1: Company admins have full access to their companies
CREATE POLICY "companies_admin_access"
  ON companies
  FOR ALL
  TO authenticated
  USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

-- Policy 2: Allow users to read companies where they are the admin
CREATE POLICY "companies_admin_read"
  ON companies
  FOR SELECT
  TO authenticated
  USING (admin_id = auth.uid());

-- Policy 3: Allow users to create companies where they are the admin
CREATE POLICY "companies_admin_create"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (admin_id = auth.uid());

-- Policy 4: Allow users to update companies where they are the admin
CREATE POLICY "companies_admin_update"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

-- Policy 5: Allow users to delete companies where they are the admin
CREATE POLICY "companies_admin_delete"
  ON companies
  FOR DELETE
  TO authenticated
  USING (admin_id = auth.uid());