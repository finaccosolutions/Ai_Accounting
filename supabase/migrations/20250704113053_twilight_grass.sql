/*
  # Fix Companies RLS Policy

  1. Security
    - Update RLS policies for companies table to resolve conflicts
    - Ensure proper access control for company creation and management
    - Fix the user_id field handling in RLS policies

  2. Changes
    - Update INSERT policy to work with auth.uid() instead of explicit user_id
    - Ensure policies are consistent and don't conflict
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Allow insert if user_id matches" ON companies;
DROP POLICY IF EXISTS "Users can create companies" ON companies;

-- Create a single, clear INSERT policy for companies
CREATE POLICY "Users can create companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Update the user_id column to automatically use auth.uid() as default
ALTER TABLE companies 
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Ensure the user_id is set correctly for existing records if needed
UPDATE companies 
SET user_id = created_by 
WHERE user_id IS NULL AND created_by IS NOT NULL;