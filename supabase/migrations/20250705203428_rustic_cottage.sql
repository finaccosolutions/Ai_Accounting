/*
  # Fix RLS policies for profiles table

  1. Security Updates
    - Remove conflicting and duplicate RLS policies on profiles table
    - Add proper INSERT policy for authenticated users to create their own profiles
    - Ensure SELECT and UPDATE policies work correctly
    - Fix policy conditions to use proper auth.uid() syntax

  2. Changes Made
    - Drop all existing policies on profiles table
    - Create new, properly structured policies for INSERT, SELECT, and UPDATE operations
    - Ensure users can only access and modify their own profile data
*/

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create new, properly structured policies
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);