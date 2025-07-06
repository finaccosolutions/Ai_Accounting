/*
  # Fix Companies RLS Policies

  1. Problem
    - Infinite recursion detected in policy for relation "companies"
    - Multiple SELECT policies causing circular dependency

  2. Solution
    - Drop existing problematic policies
    - Create a single, simplified SELECT policy that combines both conditions
    - Ensure no circular references in policy evaluation

  3. Changes
    - Remove conflicting SELECT policies
    - Add unified SELECT policy for company access
    - Maintain security while avoiding recursion
*/

-- Drop existing SELECT policies that are causing recursion
DROP POLICY IF EXISTS "Company admin can read own companies" ON companies;
DROP POLICY IF EXISTS "Users with permissions can read companies" ON companies;

-- Create a unified SELECT policy that combines both access patterns
CREATE POLICY "Users can read accessible companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    -- Company admin can read their own companies
    (admin_id = auth.uid())
    OR
    -- Users with permissions can read companies they have access to
    (
      EXISTS (
        SELECT 1
        FROM user_permissions up
        WHERE up.user_id = auth.uid()
        AND up.company_id = companies.id
      )
    )
  );