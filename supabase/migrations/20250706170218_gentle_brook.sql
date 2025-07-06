/*
  # Fix infinite recursion in companies RLS policies

  1. Problem
    - The current SELECT policy on companies table creates infinite recursion
    - It tries to check user_permissions which may reference companies again
    
  2. Solution
    - Simplify the SELECT policy to avoid circular references
    - Use direct admin_id check and a simpler permission check
    - Break the recursive dependency chain
    
  3. Changes
    - Drop existing problematic policies
    - Create new non-recursive policies
    - Ensure proper access control without circular references
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can read companies" ON companies;
DROP POLICY IF EXISTS "Company admin can update own companies" ON companies;
DROP POLICY IF EXISTS "Company admin can delete own companies" ON companies;
DROP POLICY IF EXISTS "Users can create companies as admin" ON companies;

-- Create new non-recursive policies
CREATE POLICY "Users can read own companies as admin"
  ON companies
  FOR SELECT
  TO authenticated
  USING (admin_id = auth.uid());

CREATE POLICY "Users can read companies with direct permissions"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_permissions up
      WHERE up.company_id = companies.id 
      AND up.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create companies as admin"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Company admin can update own companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Company admin can delete own companies"
  ON companies
  FOR DELETE
  TO authenticated
  USING (admin_id = auth.uid());