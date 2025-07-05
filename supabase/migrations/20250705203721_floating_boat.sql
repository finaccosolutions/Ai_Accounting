/*
  # Fix profiles table RLS policy for sign-up

  1. Security Changes
    - Update the INSERT policy on `profiles` table to allow profile creation during sign-up
    - The policy will allow inserting a profile if the user is authenticated OR if they're creating their own profile during sign-up
    - This handles the case where a user needs to create their profile immediately after sign-up

  2. Policy Updates
    - Modify the existing INSERT policy to be more permissive during the sign-up flow
    - Ensure users can still only create profiles for themselves
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create a new INSERT policy that allows profile creation during sign-up
CREATE POLICY "Users can insert their own profile" 
  ON profiles 
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (
    -- Allow if user is authenticated and creating their own profile
    (auth.role() = 'authenticated' AND auth.uid() = id) OR
    -- Allow if user is anonymous but creating a profile with a valid auth.uid()
    (auth.role() = 'anon' AND auth.uid() = id)
  );

-- Ensure the SELECT policy allows users to read their own profile
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Ensure the UPDATE policy allows users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);