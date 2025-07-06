/*
  # Fix Companies RLS Policies

  1. Problem
    - Infinite recursion detected in policy for relation "companies"
    - The existing policies are creating circular dependencies

  2. Solution
    - Drop existing problematic policies
    - Create simplified, non-recursive policies
    - Ensure policies don't reference the companies table in a way that creates loops

  3. New Policies
    - Company admin can read their own companies (simple direct check)
    - Users with permissions can read companies (simplified permission check)
    - Admin can create companies (simple ownership check)
    - Admin can update companies (simple ownership check)
*/

-- Drop existing policies that are causing recursion
DROP POLICY IF EXISTS "Company admin can read their companies" ON companies;
DROP POLICY IF EXISTS "Users with permissions can read companies" ON companies;
DROP POLICY IF EXISTS "Admin can create companies" ON companies;
DROP POLICY IF EXISTS "Admin can update companies" ON companies;

-- Create new, simplified policies without recursion

-- Policy for company admins to read their own companies
CREATE POLICY "Company admin can read own companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (admin_id = auth.uid());

-- Policy for users with permissions to read companies
CREATE POLICY "Users with permissions can read companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_permissions up
      WHERE up.user_id = auth.uid()
        AND up.company_id = companies.id
    )
  );

-- Policy for creating companies (user becomes admin)
CREATE POLICY "Users can create companies as admin"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (admin_id = auth.uid());

-- Policy for updating companies (only admin)
CREATE POLICY "Company admin can update own companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

-- Policy for deleting companies (only admin)
CREATE POLICY "Company admin can delete own companies"
  ON companies
  FOR DELETE
  TO authenticated
  USING (admin_id = auth.uid());