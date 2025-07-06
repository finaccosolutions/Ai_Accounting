/*
  # Fix Companies Table RLS Policies

  1. Problem
    - Multiple overlapping RLS policies on companies table causing infinite recursion
    - Policies are referencing the companies table within their own definitions
    - Complex EXISTS clauses creating circular dependencies

  2. Solution
    - Drop all existing policies on companies table
    - Create simplified, non-recursive policies
    - Use direct auth.uid() comparisons instead of complex subqueries
    - Ensure policies don't reference the companies table within themselves

  3. New Policies
    - Company admins can manage their own companies (direct admin_id check)
    - Users can read companies where they have permissions (via user_permissions table only)
    - Users can create companies as admin (simple auth.uid() check)
*/

-- Drop all existing policies on companies table to start fresh
DROP POLICY IF EXISTS "Admin can manage their companies" ON companies;
DROP POLICY IF EXISTS "All authenticated users can view companies" ON companies;
DROP POLICY IF EXISTS "Allow all access" ON companies;
DROP POLICY IF EXISTS "Companies minimal select" ON companies;
DROP POLICY IF EXISTS "Companies: admins only" ON companies;
DROP POLICY IF EXISTS "Company admin can delete own companies" ON companies;
DROP POLICY IF EXISTS "Company admin can manage companies" ON companies;
DROP POLICY IF EXISTS "Company admin can manage company" ON companies;
DROP POLICY IF EXISTS "Company admin can update own companies" ON companies;
DROP POLICY IF EXISTS "Users can create companies as admin" ON companies;
DROP POLICY IF EXISTS "Users can read accessible companies" ON companies;
DROP POLICY IF EXISTS "Users can read companies they are linked to" ON companies;
DROP POLICY IF EXISTS "Users can read companies via permissions" ON companies;
DROP POLICY IF EXISTS "Users can read companies where they are admin" ON companies;
DROP POLICY IF EXISTS "Users can read own companies as admin" ON companies;
DROP POLICY IF EXISTS "Users can read their companies" ON companies;
DROP POLICY IF EXISTS "Users with access can read companies" ON companies;
DROP POLICY IF EXISTS "company_select_basic" ON companies;

-- Create new simplified policies without recursion

-- Policy 1: Company admins can manage their own companies
CREATE POLICY "company_admin_full_access"
  ON companies
  FOR ALL
  TO authenticated
  USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

-- Policy 2: Users can read companies where they have permissions (via user_permissions table)
CREATE POLICY "company_read_via_permissions"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    admin_id = auth.uid() 
    OR EXISTS (
      SELECT 1 
      FROM user_permissions 
      WHERE user_permissions.user_id = auth.uid() 
      AND user_permissions.company_id = companies.id
    )
  );

-- Policy 3: Users can create companies (they become admin)
CREATE POLICY "company_create_as_admin"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (admin_id = auth.uid());