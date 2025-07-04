export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          mobile_number: string | null;
          role: 'admin' | 'accountant' | 'auditor' | 'owner' | 'viewer';
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          mobile_number?: string | null;
          role?: 'admin' | 'accountant' | 'auditor' | 'owner' | 'viewer';
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          mobile_number?: string | null;
          role?: 'admin' | 'accountant' | 'auditor' | 'owner' | 'viewer';
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          mailing_name: string | null;
          country: string;
          gstin: string | null;
          pan: string | null;
          tan: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          pincode: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          logo_url: string | null;
          financial_year_start: string;
          currency: string;
          decimal_places: number;
          enable_inventory: boolean;
          enable_multi_currency: boolean;
          enable_cost_center: boolean;
          auto_voucher_numbering: boolean;
          enable_audit_trail: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          mailing_name?: string | null;
          country?: string;
          gstin?: string | null;
          pan?: string | null;
          tan?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          logo_url?: string | null;
          financial_year_start?: string;
          currency?: string;
          decimal_places?: number;
          enable_inventory?: boolean;
          enable_multi_currency?: boolean;
          enable_cost_center?: boolean;
          auto_voucher_numbering?: boolean;
          enable_audit_trail?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          mailing_name?: string | null;
          country?: string;
          gstin?: string | null;
          pan?: string | null;
          tan?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          logo_url?: string | null;
          financial_year_start?: string;
          currency?: string;
          decimal_places?: number;
          enable_inventory?: boolean;
          enable_multi_currency?: boolean;
          enable_cost_center?: boolean;
          auto_voucher_numbering?: boolean;
          enable_audit_trail?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      company_users: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          role: 'admin' | 'accountant' | 'auditor' | 'owner' | 'viewer';
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id: string;
          role: 'admin' | 'accountant' | 'auditor' | 'owner' | 'viewer';
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          user_id?: string;
          role?: 'admin' | 'accountant' | 'auditor' | 'owner' | 'viewer';
          is_active?: boolean;
          created_at?: string;
        };
      };
      ledger_groups: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          parent_id: string | null;
          group_type: 'asset' | 'liability' | 'income' | 'expense';
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          parent_id?: string | null;
          group_type: 'asset' | 'liability' | 'income' | 'expense';
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          parent_id?: string | null;
          group_type?: 'asset' | 'liability' | 'income' | 'expense';
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      ledgers: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          group_id: string | null;
          ledger_type: 'asset' | 'liability' | 'income' | 'expense';
          opening_balance: number;
          current_balance: number;
          gstin: string | null;
          pan: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          pincode: string | null;
          phone: string | null;
          email: string | null;
          credit_limit: number;
          credit_days: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          group_id?: string | null;
          ledger_type: 'asset' | 'liability' | 'income' | 'expense';
          opening_balance?: number;
          current_balance?: number;
          gstin?: string | null;
          pan?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          phone?: string | null;
          email?: string | null;
          credit_limit?: number;
          credit_days?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          group_id?: string | null;
          ledger_type?: 'asset' | 'liability' | 'income' | 'expense';
          opening_balance?: number;
          current_balance?: number;
          gstin?: string | null;
          pan?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          phone?: string | null;
          email?: string | null;
          credit_limit?: number;
          credit_days?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      stock_groups: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stock_items: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          group_id: string | null;
          unit: string;
          hsn_code_id: string | null;
          gst_rate: number;
          opening_stock: number;
          current_stock: number;
          rate: number;
          minimum_level: number;
          maximum_level: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          group_id?: string | null;
          unit?: string;
          hsn_code_id?: string | null;
          gst_rate?: number;
          opening_stock?: number;
          current_stock?: number;
          rate?: number;
          minimum_level?: number;
          maximum_level?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          group_id?: string | null;
          unit?: string;
          hsn_code_id?: string | null;
          gst_rate?: number;
          opening_stock?: number;
          current_stock?: number;
          rate?: number;
          minimum_level?: number;
          maximum_level?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      hsn_codes: {
        Row: {
          id: string;
          company_id: string;
          code: string;
          description: string | null;
          gst_rate: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          code: string;
          description?: string | null;
          gst_rate?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          code?: string;
          description?: string | null;
          gst_rate?: number;
          created_at?: string;
        };
      };
      tax_rates: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          rate: number;
          tax_type: 'CGST' | 'SGST' | 'IGST' | 'CESS' | 'TDS' | 'TCS';
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          rate: number;
          tax_type: 'CGST' | 'SGST' | 'IGST' | 'CESS' | 'TDS' | 'TCS';
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          rate?: number;
          tax_type?: 'CGST' | 'SGST' | 'IGST' | 'CESS' | 'TDS' | 'TCS';
          is_active?: boolean;
          created_at?: string;
        };
      };
      voucher_types: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          code: string;
          prefix: string | null;
          numbering_method: 'auto' | 'manual';
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          code: string;
          prefix?: string | null;
          numbering_method?: 'auto' | 'manual';
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          code?: string;
          prefix?: string | null;
          numbering_method?: 'auto' | 'manual';
          is_active?: boolean;
          created_at?: string;
        };
      };
      vouchers: {
        Row: {
          id: string;
          company_id: string;
          voucher_type_id: string | null;
          voucher_number: string;
          voucher_date: string;
          reference_number: string | null;
          narration: string | null;
          total_amount: number;
          status: 'draft' | 'posted' | 'cancelled';
          created_by: string | null;
          posted_by: string | null;
          posted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          voucher_type_id?: string | null;
          voucher_number: string;
          voucher_date: string;
          reference_number?: string | null;
          narration?: string | null;
          total_amount?: number;
          status?: 'draft' | 'posted' | 'cancelled';
          created_by?: string | null;
          posted_by?: string | null;
          posted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          voucher_type_id?: string | null;
          voucher_number?: string;
          voucher_date?: string;
          reference_number?: string | null;
          narration?: string | null;
          total_amount?: number;
          status?: 'draft' | 'posted' | 'cancelled';
          created_by?: string | null;
          posted_by?: string | null;
          posted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      voucher_entries: {
        Row: {
          id: string;
          voucher_id: string;
          ledger_id: string | null;
          stock_item_id: string | null;
          entry_type: 'debit' | 'credit';
          amount: number;
          quantity: number | null;
          rate: number | null;
          discount_percentage: number;
          discount_amount: number;
          tax_amount: number;
          narration: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          voucher_id: string;
          ledger_id?: string | null;
          stock_item_id?: string | null;
          entry_type: 'debit' | 'credit';
          amount: number;
          quantity?: number | null;
          rate?: number | null;
          discount_percentage?: number;
          discount_amount?: number;
          tax_amount?: number;
          narration?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          voucher_id?: string;
          ledger_id?: string | null;
          stock_item_id?: string | null;
          entry_type?: 'debit' | 'credit';
          amount?: number;
          quantity?: number | null;
          rate?: number | null;
          discount_percentage?: number;
          discount_amount?: number;
          tax_amount?: number;
          narration?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          company_id: string;
          table_name: string;
          record_id: string;
          action: 'INSERT' | 'UPDATE' | 'DELETE';
          old_values: any | null;
          new_values: any | null;
          user_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          table_name: string;
          record_id: string;
          action: 'INSERT' | 'UPDATE' | 'DELETE';
          old_values?: any | null;
          new_values?: any | null;
          user_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          table_name?: string;
          record_id?: string;
          action?: 'INSERT' | 'UPDATE' | 'DELETE';
          old_values?: any | null;
          new_values?: any | null;
          user_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      ai_insights: {
        Row: {
          id: string;
          company_id: string;
          insight_type: 'warning' | 'suggestion' | 'info' | 'error';
          title: string;
          description: string;
          action_text: string | null;
          priority: 'low' | 'medium' | 'high';
          is_read: boolean;
          related_table: string | null;
          related_id: string | null;
          metadata: any | null;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          insight_type: 'warning' | 'suggestion' | 'info' | 'error';
          title: string;
          description: string;
          action_text?: string | null;
          priority?: 'low' | 'medium' | 'high';
          is_read?: boolean;
          related_table?: string | null;
          related_id?: string | null;
          metadata?: any | null;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          insight_type?: 'warning' | 'suggestion' | 'info' | 'error';
          title?: string;
          description?: string;
          action_text?: string | null;
          priority?: 'low' | 'medium' | 'high';
          is_read?: boolean;
          related_table?: string | null;
          related_id?: string | null;
          metadata?: any | null;
          created_at?: string;
          expires_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      setup_default_company_data: {
        Args: {
          company_uuid: string;
        };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}