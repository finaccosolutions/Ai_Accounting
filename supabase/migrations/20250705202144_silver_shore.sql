/*
  # Add name and avatar fields to profiles table

  1. Changes
    - Add `name` column to store user's full name
    - Add `avatar_url` column to store user's profile picture URL
    - Update existing policies to work with new fields

  2. Security
    - Maintain existing RLS policies
    - Allow users to update their own name and avatar
*/

-- Add name and avatar_url columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;
END $$;

-- Update the existing policies to include the new fields (policies already exist, so no changes needed)
-- The existing RLS policies will automatically apply to the new columns