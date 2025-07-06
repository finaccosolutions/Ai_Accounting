/*
  # Add Missing RLS Policies for Database Tables

  ## Overview
  This migration adds comprehensive Row Level Security (RLS) policies for tables that are currently missing them.
  
  ## Tables Updated
  - `stock_groups` - Add policies for stock group management
  - `units` - Add policies for unit management  
  - `stock_items` - Add policies for stock item management
  - `godowns` - Add policies for godown management
  - `tax_ledgers` - Add policies for tax ledger management
  - `hsn_codes` - Add policies for HSN code management
  - `cost_centers` - Add policies for cost center management
  - `user_permissions` - Add policies for user permission management
  - `audit_trail` - Add policies for audit trail access

  ## Security Model
  - Company admins can manage all data for their companies
  - Users with permissions can read data for companies they have access to
  - Audit trail has special read-only access for auditors
  - User permissions are managed by company admins only
*/

-- ============================================================================
-- STOCK GROUPS POLICIES
-- ============================================================================

-- Allow company admin to insert stock groups
CREATE POLICY "Company admin can insert stock groups"
  ON stock_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = stock_groups.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow users to read stock groups for accessible companies
CREATE POLICY "Users can read stock groups for accessible companies"
  ON stock_groups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = stock_groups.company_id
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

-- Allow company admin to update stock groups
CREATE POLICY "Company admin can update stock groups"
  ON stock_groups
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = stock_groups.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = stock_groups.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow company admin to delete stock groups
CREATE POLICY "Company admin can delete stock groups"
  ON stock_groups
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = stock_groups.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- ============================================================================
-- UNITS POLICIES
-- ============================================================================

-- Allow company admin to insert units
CREATE POLICY "Company admin can insert units"
  ON units
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = units.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow users to read units for accessible companies
CREATE POLICY "Users can read units for accessible companies"
  ON units
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = units.company_id
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

-- Allow company admin to update units
CREATE POLICY "Company admin can update units"
  ON units
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = units.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = units.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow company admin to delete units
CREATE POLICY "Company admin can delete units"
  ON units
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = units.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- ============================================================================
-- STOCK ITEMS POLICIES
-- ============================================================================

-- Allow company admin and accountants to insert stock items
CREATE POLICY "Company admin and accountants can insert stock items"
  ON stock_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = stock_items.company_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  );

-- Allow users to read stock items for accessible companies
CREATE POLICY "Users can read stock items for accessible companies"
  ON stock_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = stock_items.company_id
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

-- Allow company admin and accountants to update stock items
CREATE POLICY "Company admin and accountants can update stock items"
  ON stock_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = stock_items.company_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = stock_items.company_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  );

-- Allow company admin to delete stock items
CREATE POLICY "Company admin can delete stock items"
  ON stock_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = stock_items.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- ============================================================================
-- GODOWNS POLICIES
-- ============================================================================

-- Allow company admin to insert godowns
CREATE POLICY "Company admin can insert godowns"
  ON godowns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = godowns.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow users to read godowns for accessible companies
CREATE POLICY "Users can read godowns for accessible companies"
  ON godowns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = godowns.company_id
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

-- Allow company admin to update godowns
CREATE POLICY "Company admin can update godowns"
  ON godowns
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = godowns.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = godowns.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow company admin to delete godowns
CREATE POLICY "Company admin can delete godowns"
  ON godowns
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = godowns.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- ============================================================================
-- TAX LEDGERS POLICIES
-- ============================================================================

-- Allow company admin and accountants to insert tax ledgers
CREATE POLICY "Company admin and accountants can insert tax ledgers"
  ON tax_ledgers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = tax_ledgers.company_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  );

-- Allow users to read tax ledgers for accessible companies
CREATE POLICY "Users can read tax ledgers for accessible companies"
  ON tax_ledgers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = tax_ledgers.company_id
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

-- Allow company admin and accountants to update tax ledgers
CREATE POLICY "Company admin and accountants can update tax ledgers"
  ON tax_ledgers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = tax_ledgers.company_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = tax_ledgers.company_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  );

-- Allow company admin to delete tax ledgers
CREATE POLICY "Company admin can delete tax ledgers"
  ON tax_ledgers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = tax_ledgers.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- ============================================================================
-- HSN CODES POLICIES
-- ============================================================================

-- Allow company admin and accountants to insert HSN codes
CREATE POLICY "Company admin and accountants can insert HSN codes"
  ON hsn_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = hsn_codes.company_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  );

-- Allow users to read HSN codes for accessible companies
CREATE POLICY "Users can read HSN codes for accessible companies"
  ON hsn_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = hsn_codes.company_id
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

-- Allow company admin and accountants to update HSN codes
CREATE POLICY "Company admin and accountants can update HSN codes"
  ON hsn_codes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = hsn_codes.company_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = hsn_codes.company_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  );

-- Allow company admin to delete HSN codes
CREATE POLICY "Company admin can delete HSN codes"
  ON hsn_codes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = hsn_codes.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- ============================================================================
-- COST CENTERS POLICIES
-- ============================================================================

-- Allow company admin to insert cost centers
CREATE POLICY "Company admin can insert cost centers"
  ON cost_centers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = cost_centers.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow users to read cost centers for accessible companies
CREATE POLICY "Users can read cost centers for accessible companies"
  ON cost_centers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = cost_centers.company_id
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

-- Allow company admin to update cost centers
CREATE POLICY "Company admin can update cost centers"
  ON cost_centers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = cost_centers.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = cost_centers.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow company admin to delete cost centers
CREATE POLICY "Company admin can delete cost centers"
  ON cost_centers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = cost_centers.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- ============================================================================
-- USER PERMISSIONS POLICIES
-- ============================================================================

-- Allow company admin to insert user permissions
CREATE POLICY "Company admin can insert user permissions"
  ON user_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = user_permissions.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow users to read their own permissions and company admins to read all permissions for their companies
CREATE POLICY "Users can read relevant user permissions"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (
    -- Users can read their own permissions
    user_permissions.user_id::text = auth.uid()::text
    OR
    -- Company admins can read all permissions for their companies
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = user_permissions.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow company admin to update user permissions
CREATE POLICY "Company admin can update user permissions"
  ON user_permissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = user_permissions.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = user_permissions.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow company admin to delete user permissions
CREATE POLICY "Company admin can delete user permissions"
  ON user_permissions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = user_permissions.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- ============================================================================
-- AUDIT TRAIL POLICIES
-- ============================================================================

-- Allow authenticated users to insert audit trail entries (system generated)
CREATE POLICY "System can insert audit trail entries"
  ON audit_trail
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if the user is making changes to data they have access to
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = audit_trail.company_id
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

-- Allow users to read audit trail for accessible companies (with role restrictions)
CREATE POLICY "Users can read audit trail for accessible companies"
  ON audit_trail
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = audit_trail.company_id
      AND (
        -- Company admin can read all audit trails
        companies.admin_id::text = auth.uid()::text
        OR
        -- Auditors and owners can read audit trails
        EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('auditor', 'owner', 'admin')
        )
      )
    )
  );

-- No UPDATE or DELETE policies for audit_trail - it should be immutable

-- ============================================================================
-- ADDITIONAL POLICIES FOR VOUCHER ENTRIES
-- ============================================================================

-- Allow users to read voucher entries for accessible companies
CREATE POLICY "Users can read voucher entries for accessible companies"
  ON voucher_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vouchers
      JOIN companies ON companies.id = vouchers.company_id
      WHERE vouchers.id = voucher_entries.voucher_id
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

-- Allow company admin and accountants to insert voucher entries
CREATE POLICY "Company admin and accountants can insert voucher entries"
  ON voucher_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vouchers
      JOIN companies ON companies.id = vouchers.company_id
      WHERE vouchers.id = voucher_entries.voucher_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  );

-- Allow company admin and accountants to update voucher entries
CREATE POLICY "Company admin and accountants can update voucher entries"
  ON voucher_entries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vouchers
      JOIN companies ON companies.id = vouchers.company_id
      WHERE vouchers.id = voucher_entries.voucher_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vouchers
      JOIN companies ON companies.id = vouchers.company_id
      WHERE vouchers.id = voucher_entries.voucher_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  );

-- Allow company admin and accountants to delete voucher entries
CREATE POLICY "Company admin and accountants can delete voucher entries"
  ON voucher_entries
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vouchers
      JOIN companies ON companies.id = vouchers.company_id
      WHERE vouchers.id = voucher_entries.voucher_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  );

-- ============================================================================
-- ADDITIONAL POLICIES FOR VOUCHERS
-- ============================================================================

-- Allow company admin and accountants to insert vouchers
CREATE POLICY "Company admin and accountants can insert vouchers"
  ON vouchers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = vouchers.company_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  );

-- Allow company admin and accountants to update vouchers
CREATE POLICY "Company admin and accountants can update vouchers"
  ON vouchers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = vouchers.company_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = vouchers.company_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  );

-- Allow company admin to delete vouchers
CREATE POLICY "Company admin can delete vouchers"
  ON vouchers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = vouchers.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- ============================================================================
-- ADDITIONAL POLICIES FOR LEDGERS
-- ============================================================================

-- Allow company admin and accountants to insert ledgers
CREATE POLICY "Company admin and accountants can insert ledgers"
  ON ledgers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = ledgers.company_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  );

-- Allow company admin and accountants to update ledgers
CREATE POLICY "Company admin and accountants can update ledgers"
  ON ledgers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = ledgers.company_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = ledgers.company_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('admin', 'accountant')
        )
      )
    )
  );

-- Allow company admin to delete ledgers
CREATE POLICY "Company admin can delete ledgers"
  ON ledgers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = ledgers.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );