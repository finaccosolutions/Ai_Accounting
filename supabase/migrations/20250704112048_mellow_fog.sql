/*
  # Fix Companies Table RLS Policies

  1. Security Updates
    - Drop conflicting RLS policies on companies table
    - Create simplified and correct RLS policies for company operations
    - Ensure users can create companies and access companies they belong to

  2. Changes
    - Remove redundant and conflicting policies
    - Add clear INSERT policy for company creation
    - Add clear SELECT policy for company access
    - Add clear UPDATE policy for company admins
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Allow authenticated users to insert company" ON companies;
DROP POLICY IF EXISTS "Allow insert if user_id matches auth.uid" ON companies;
DROP POLICY IF EXISTS "Company admins can update companies" ON companies;
DROP POLICY IF EXISTS "Users can create companies" ON companies;
DROP POLICY IF EXISTS "Users can read companies they belong to" ON companies;

-- Create clear and non-conflicting RLS policies

-- Allow authenticated users to create companies
CREATE POLICY "Users can create companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow users to read companies they belong to
CREATE POLICY "Users can read their companies"
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

-- Allow company admins to update companies
CREATE POLICY "Company admins can update companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM company_users 
      WHERE company_id = companies.id 
        AND user_id = auth.uid() 
        AND role = 'admin' 
        AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM company_users 
      WHERE company_id = companies.id 
        AND user_id = auth.uid() 
        AND role = 'admin' 
        AND is_active = true
    )
  );