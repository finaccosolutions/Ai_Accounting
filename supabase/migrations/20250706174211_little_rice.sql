/*
  # Fix Companies RLS Policies - Remove Infinite Recursion

  1. Problem
    - The existing RLS policies on the companies table are causing infinite recursion
    - This happens when policies reference other tables that might create circular dependencies

  2. Solution
    - Drop the problematic policies
    - Create simpler, non-recursive policies
    - Ensure policies don't create circular references

  3. New Policies
    - Users can read companies where they are the admin
    - Users can read companies where they have explicit permissions (simplified)
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read companies with direct permissions" ON companies;
DROP POLICY IF EXISTS "Users can read own companies as admin" ON companies;

-- Create new, simplified policies that avoid recursion
CREATE POLICY "Users can read own companies as admin"
  ON companies
  FOR SELECT
  TO authenticated
  USING (admin_id = auth.uid());

CREATE POLICY "Users can read companies via permissions"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_permissions 
      WHERE user_permissions.company_id = companies.id 
        AND user_permissions.user_id = auth.uid()
    )
  );