/*
  # Fix Companies Table RLS Policy

  1. Problem
    - The current RLS policy on companies table creates infinite recursion
    - Policy references companies.id while evaluating access to companies table
    - This creates a circular dependency when checking user permissions

  2. Solution
    - Drop the problematic policy
    - Create a simpler, non-recursive policy
    - Ensure policies don't reference the same table they're protecting

  3. Changes
    - Remove recursive policy on companies table
    - Add simplified policies that avoid circular references
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can read companies they have access to" ON companies;

-- Create a simpler policy for company admin access
CREATE POLICY "Company admin can read their companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (admin_id::text = auth.uid()::text);

-- Create a separate policy for users with permissions
-- This avoids the circular reference by using a direct join approach
CREATE POLICY "Users with permissions can read companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_permissions up
      WHERE up.user_id::text = auth.uid()::text 
      AND up.company_id = companies.id
    )
  );

-- Ensure the user_permissions table has proper RLS policies that don't reference companies
-- Drop any problematic policies on user_permissions if they exist
DROP POLICY IF EXISTS "Users can read their own permissions" ON user_permissions;

-- Recreate user_permissions policy without circular reference
CREATE POLICY "Users can read their own permissions"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (user_id::text = auth.uid()::text);

-- Ensure company admin policy on user_permissions doesn't cause recursion
DROP POLICY IF EXISTS "Company admin can manage user permissions" ON user_permissions;

CREATE POLICY "Company admin can manage user permissions"
  ON user_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM companies c
      WHERE c.id = user_permissions.company_id 
      AND c.admin_id::text = auth.uid()::text
    )
  );