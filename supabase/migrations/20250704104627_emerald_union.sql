/*
  # Add INSERT policy for companies table

  1. Security Changes
    - Add policy to allow authenticated users to insert companies
    - Users can only create companies where they are set as the creator (created_by = auth.uid())

  This resolves the "new row violates row-level security policy" error when creating companies.
*/

-- Add policy to allow users to insert companies they create
CREATE POLICY "Users can insert companies they create"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);