/*
  # Fix infinite recursion in companies RLS policies

  1. Policy Changes
    - Drop existing SELECT policy that causes recursion
    - Create new simplified SELECT policy that avoids circular references
    - Keep other policies as they don't cause recursion

  2. Security
    - Maintain proper access control without circular dependencies
    - Users can read companies where they are admin or have permissions
*/

-- Drop the problematic SELECT policy
DROP POLICY IF EXISTS "Users can read accessible companies" ON companies;

-- Create a new SELECT policy that avoids recursion
-- This policy allows users to read companies where they are the admin
-- OR where they have a direct permission record (without checking company table again)
CREATE POLICY "Users can read companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    (admin_id = auth.uid()) 
    OR 
    (id IN (
      SELECT company_id 
      FROM user_permissions 
      WHERE user_id = auth.uid()
    ))
  );