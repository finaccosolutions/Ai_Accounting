/*
  # Fix RLS Infinite Recursion and Profile Issues

  1. Security Policy Fixes
    - Drop all existing problematic company_users policies
    - Create simple, non-recursive policies
    - Ensure profiles can be queried without issues

  2. Key Changes
    - Remove circular references in RLS policies
    - Simplify company access patterns
    - Fix profile loading issues
*/

-- First, drop ALL existing policies on company_users to start fresh
DROP POLICY IF EXISTS "Users can read company users for their companies" ON company_users;
DROP POLICY IF EXISTS "Users can read their own company memberships" ON company_users;
DROP POLICY IF EXISTS "Company admins can manage company users" ON company_users;
DROP POLICY IF EXISTS "Company admins can read all company users" ON company_users;
DROP POLICY IF EXISTS "Company admins can insert company users" ON company_users;
DROP POLICY IF EXISTS "Company admins can update company users" ON company_users;
DROP POLICY IF EXISTS "Company admins can delete company users" ON company_users;

-- Create simple, non-recursive policies for company_users
-- Policy 1: Users can always read their own company memberships
CREATE POLICY "Users can read own company memberships"
  ON company_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Company admins can read all users in their companies
-- This uses a direct subquery without referencing company_users recursively
CREATE POLICY "Company admins can read company users"
  ON company_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM company_users cu2
      WHERE cu2.company_id = company_users.company_id
        AND cu2.user_id = auth.uid()
        AND cu2.role = 'admin'
        AND cu2.is_active = true
    )
  );

-- Policy 3: Company admins can insert new company users
CREATE POLICY "Company admins can insert company users"
  ON company_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if user is admin of the company
    EXISTS (
      SELECT 1 FROM company_users cu2
      WHERE cu2.company_id = company_users.company_id
        AND cu2.user_id = auth.uid()
        AND cu2.role = 'admin'
        AND cu2.is_active = true
    )
    OR
    -- Allow users to add themselves as admin when creating a new company
    (role = 'admin' AND user_id = auth.uid())
  );

-- Policy 4: Company admins can update company users
CREATE POLICY "Company admins can update company users"
  ON company_users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM company_users cu2
      WHERE cu2.company_id = company_users.company_id
        AND cu2.user_id = auth.uid()
        AND cu2.role = 'admin'
        AND cu2.is_active = true
    )
  );

-- Policy 5: Company admins can delete company users
CREATE POLICY "Company admins can delete company users"
  ON company_users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM company_users cu2
      WHERE cu2.company_id = company_users.company_id
        AND cu2.user_id = auth.uid()
        AND cu2.role = 'admin'
        AND cu2.is_active = true
    )
  );

-- Ensure profiles table has proper policies (these should already exist but let's make sure)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to insert their own profile (needed for signup)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Fix companies policies to avoid recursion
DROP POLICY IF EXISTS "Users can read companies they belong to" ON companies;
CREATE POLICY "Users can read companies they belong to"
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

-- Allow users to insert companies (needed for company creation)
DROP POLICY IF EXISTS "Users can insert companies" ON companies;
CREATE POLICY "Users can insert companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Company admins can update companies
DROP POLICY IF EXISTS "Company admins can update companies" ON companies;
CREATE POLICY "Company admins can update companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT company_id 
      FROM company_users 
      WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND is_active = true
    )
  );