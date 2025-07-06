/*
  # Add RLS policies for ledger_groups table

  1. Security
    - Add policy for company admins to insert ledger groups
    - Add policy for users to read ledger groups for accessible companies
    - Add policy for company admins to update ledger groups
    - Add policy for company admins to delete ledger groups

  This migration fixes the RLS policy violation that occurs when creating a company
  and attempting to insert default ledger groups.
*/

-- Allow company admin to insert ledger groups
CREATE POLICY "Company admin can insert ledger groups"
  ON ledger_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = ledger_groups.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow users to read ledger groups for accessible companies
CREATE POLICY "Users can read ledger groups for accessible companies"
  ON ledger_groups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = ledger_groups.company_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
        )
      )
    )
  );

-- Allow company admin to update ledger groups
CREATE POLICY "Company admin can update ledger groups"
  ON ledger_groups
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = ledger_groups.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = ledger_groups.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow company admin to delete ledger groups
CREATE POLICY "Company admin can delete ledger groups"
  ON ledger_groups
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = ledger_groups.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );