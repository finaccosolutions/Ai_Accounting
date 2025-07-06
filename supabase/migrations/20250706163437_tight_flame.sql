/*
  # Add Missing RLS Policies for Database Tables

  ## Overview
  This migration adds comprehensive Row Level Security (RLS) policies for all tables
  that are currently missing proper security policies in the accounting software.

  ## Tables Covered
  1. stock_groups - Inventory categorization
  2. units - Measurement units
  3. stock_items - Inventory items
  4. godowns - Storage locations
  5. tax_ledgers - Tax-specific ledgers
  6. hsn_codes - HSN/SAC codes for GST
  7. cost_centers - Cost center tracking
  8. user_permissions - Role-based permissions
  9. audit_trail - Audit logging
  10. Enhanced policies for vouchers and voucher_entries
  11. Enhanced policies for ledgers

  ## Security Model
  - Company Admins: Full CRUD access to company data
  - Accountants: Can create/modify transactions, stock, tax data
  - Auditors: Read access to audit trails and financial data
  - Owners: Read access to audit trails and reports
  - Viewers: Read-only access to assigned company data

  ## Key Features
  - Multi-tenant isolation by company
  - Role-based access control
  - Audit trail protection (read-only)
  - Hierarchical permissions
*/

-- =====================================================
-- STOCK GROUPS POLICIES
-- =====================================================

-- Allow company admins to manage stock groups
CREATE POLICY "Company admin can manage stock groups"
  ON stock_groups
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = stock_groups.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow accountants to manage stock groups
CREATE POLICY "Accountants can manage stock groups"
  ON stock_groups
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE user_permissions.user_id::text = auth.uid()::text
      AND user_permissions.company_id = stock_groups.company_id
      AND user_permissions.role IN ('accountant')
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

-- =====================================================
-- UNITS POLICIES
-- =====================================================

-- Allow company admins to manage units
CREATE POLICY "Company admin can manage units"
  ON units
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = units.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow accountants to manage units
CREATE POLICY "Accountants can manage units"
  ON units
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE user_permissions.user_id::text = auth.uid()::text
      AND user_permissions.company_id = units.company_id
      AND user_permissions.role IN ('accountant')
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

-- =====================================================
-- STOCK ITEMS POLICIES
-- =====================================================

-- Allow company admins to manage stock items
CREATE POLICY "Company admin can manage stock items"
  ON stock_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = stock_items.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow accountants to manage stock items
CREATE POLICY "Accountants can manage stock items"
  ON stock_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE user_permissions.user_id::text = auth.uid()::text
      AND user_permissions.company_id = stock_items.company_id
      AND user_permissions.role IN ('accountant')
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

-- =====================================================
-- GODOWNS POLICIES
-- =====================================================

-- Allow company admins to manage godowns
CREATE POLICY "Company admin can manage godowns"
  ON godowns
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = godowns.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow accountants to manage godowns
CREATE POLICY "Accountants can manage godowns"
  ON godowns
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE user_permissions.user_id::text = auth.uid()::text
      AND user_permissions.company_id = godowns.company_id
      AND user_permissions.role IN ('accountant')
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

-- =====================================================
-- TAX LEDGERS POLICIES
-- =====================================================

-- Allow company admins to manage tax ledgers
CREATE POLICY "Company admin can manage tax ledgers"
  ON tax_ledgers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = tax_ledgers.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow accountants to manage tax ledgers
CREATE POLICY "Accountants can manage tax ledgers"
  ON tax_ledgers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE user_permissions.user_id::text = auth.uid()::text
      AND user_permissions.company_id = tax_ledgers.company_id
      AND user_permissions.role IN ('accountant')
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

-- =====================================================
-- HSN CODES POLICIES
-- =====================================================

-- Allow company admins to manage HSN codes
CREATE POLICY "Company admin can manage hsn codes"
  ON hsn_codes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = hsn_codes.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow accountants to manage HSN codes
CREATE POLICY "Accountants can manage hsn codes"
  ON hsn_codes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE user_permissions.user_id::text = auth.uid()::text
      AND user_permissions.company_id = hsn_codes.company_id
      AND user_permissions.role IN ('accountant')
    )
  );

-- Allow users to read HSN codes for accessible companies
CREATE POLICY "Users can read hsn codes for accessible companies"
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

-- =====================================================
-- COST CENTERS POLICIES
-- =====================================================

-- Allow company admins to manage cost centers
CREATE POLICY "Company admin can manage cost centers"
  ON cost_centers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = cost_centers.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow accountants to manage cost centers
CREATE POLICY "Accountants can manage cost centers"
  ON cost_centers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE user_permissions.user_id::text = auth.uid()::text
      AND user_permissions.company_id = cost_centers.company_id
      AND user_permissions.role IN ('accountant')
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

-- =====================================================
-- USER PERMISSIONS POLICIES
-- =====================================================

-- Allow company admins to manage user permissions
CREATE POLICY "Company admin can manage user permissions"
  ON user_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = user_permissions.company_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- Allow users to read their own permissions
CREATE POLICY "Users can read their own permissions"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (user_permissions.user_id::text = auth.uid()::text);

-- =====================================================
-- AUDIT TRAIL POLICIES
-- =====================================================

-- Allow company admins and auditors to read audit trail
CREATE POLICY "Admins and auditors can read audit trail"
  ON audit_trail
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = audit_trail.company_id
      AND (
        companies.admin_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_permissions.user_id::text = auth.uid()::text
          AND user_permissions.company_id = companies.id
          AND user_permissions.role IN ('auditor', 'owner')
        )
      )
    )
  );

-- Allow system to insert audit trail entries (no user restrictions)
CREATE POLICY "System can insert audit trail"
  ON audit_trail
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- ENHANCED VOUCHER POLICIES
-- =====================================================

-- Drop existing voucher policies to replace with enhanced ones
DROP POLICY IF EXISTS "Users can read vouchers for accessible companies" ON vouchers;

-- Enhanced voucher read policy
CREATE POLICY "Users can read vouchers for accessible companies"
  ON vouchers
  FOR SELECT
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
        )
      )
    )
  );

-- Allow company admins and accountants to create vouchers
CREATE POLICY "Admins and accountants can create vouchers"
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
          AND user_permissions.role IN ('accountant')
        )
      )
    )
  );

-- Allow company admins and accountants to update vouchers
CREATE POLICY "Admins and accountants can update vouchers"
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
          AND user_permissions.role IN ('accountant')
        )
      )
    )
  );

-- Allow company admins to delete vouchers
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

-- =====================================================
-- ENHANCED VOUCHER ENTRIES POLICIES
-- =====================================================

-- Allow users to read voucher entries for accessible vouchers
CREATE POLICY "Users can read voucher entries for accessible vouchers"
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

-- Allow company admins and accountants to create voucher entries
CREATE POLICY "Admins and accountants can create voucher entries"
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
          AND user_permissions.role IN ('accountant')
        )
      )
    )
  );

-- Allow company admins and accountants to update voucher entries
CREATE POLICY "Admins and accountants can update voucher entries"
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
          AND user_permissions.role IN ('accountant')
        )
      )
    )
  );

-- Allow company admins to delete voucher entries
CREATE POLICY "Company admin can delete voucher entries"
  ON voucher_entries
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vouchers
      JOIN companies ON companies.id = vouchers.company_id
      WHERE vouchers.id = voucher_entries.voucher_id
      AND companies.admin_id::text = auth.uid()::text
    )
  );

-- =====================================================
-- ENHANCED LEDGER POLICIES
-- =====================================================

-- Drop existing ledger policies to replace with enhanced ones
DROP POLICY IF EXISTS "Users can read ledgers for accessible companies" ON ledgers;

-- Enhanced ledger read policy
CREATE POLICY "Users can read ledgers for accessible companies"
  ON ledgers
  FOR SELECT
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
        )
      )
    )
  );

-- Allow company admins and accountants to create ledgers
CREATE POLICY "Admins and accountants can create ledgers"
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
          AND user_permissions.role IN ('accountant')
        )
      )
    )
  );

-- Allow company admins and accountants to update ledgers
CREATE POLICY "Admins and accountants can update ledgers"
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
          AND user_permissions.role IN ('accountant')
        )
      )
    )
  );

-- Allow company admins to delete ledgers
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