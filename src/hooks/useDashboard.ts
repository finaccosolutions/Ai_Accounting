import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCompany } from './useCompany';
import { useFinancialYears } from './useFinancialYears';
import { generateAIInsights } from '../lib/gemini';
import toast from 'react-hot-toast';

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  profit: number;
  gstPayable: number;
  outstandingReceivables: number;
  outstandingPayables: number;
  cashBalance: number;
  bankBalance: number;
  totalVouchers: number;
  pendingVouchers: number;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'suggestion' | 'info' | 'error';
  title: string;
  description: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export const useDashboard = () => {
  const { currentCompany } = useCompany();
  const { selectedFinancialYears, currentFinancialYear } = useFinancialYears();
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpense: 0,
    profit: 0,
    gstPayable: 0,
    outstandingReceivables: 0,
    outstandingPayables: 0,
    cashBalance: 0,
    bankBalance: 0,
    totalVouchers: 0,
    pendingVouchers: 0,
  });
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentCompany && selectedFinancialYears.length > 0) {
      loadDashboardData();
    }
  }, [currentCompany, selectedFinancialYears]);

  const loadDashboardData = async () => {
    try {
      if (!currentCompany || selectedFinancialYears.length === 0) return;

      setLoading(true);
      await Promise.all([
        loadFinancialStats(),
        loadAIInsights(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadFinancialStats = async () => {
    try {
      if (!currentCompany || selectedFinancialYears.length === 0) return;

      // Calculate dashboard data for selected financial years
      for (const fyId of selectedFinancialYears) {
        await supabase.rpc('calculate_dashboard_data', {
          company_uuid: currentCompany.id,
          financial_year_uuid: fyId
        });
      }

      // Get aggregated dashboard data
      const { data: dashboardData } = await supabase
        .from('dashboard_data')
        .select('data_type, amount')
        .eq('company_id', currentCompany.id)
        .in('financial_year_id', selectedFinancialYears)
        .eq('period_date', new Date().toISOString().split('T')[0]);

      // Get voucher statistics
      const { data: voucherStats } = await supabase
        .from('vouchers')
        .select('status, total_amount')
        .eq('company_id', currentCompany.id)
        .in('financial_year_id', selectedFinancialYears);

      // Aggregate data by type
      const aggregatedData: Record<string, number> = {};
      dashboardData?.forEach(item => {
        aggregatedData[item.data_type] = (aggregatedData[item.data_type] || 0) + item.amount;
      });

      // Calculate voucher stats
      const totalVouchers = voucherStats?.length || 0;
      const pendingVouchers = voucherStats?.filter(v => v.status === 'draft').length || 0;

      // Calculate GST payable from ledgers
      const { data: gstLedgers } = await supabase
        .from('ledgers')
        .select('current_balance')
        .eq('company_id', currentCompany.id)
        .in('financial_year_id', selectedFinancialYears)
        .ilike('name', '%gst%');

      const gstPayable = gstLedgers?.reduce((sum, ledger) => sum + ledger.current_balance, 0) || 0;

      setStats({
        totalIncome: aggregatedData.total_income || 0,
        totalExpense: aggregatedData.total_expense || 0,
        profit: aggregatedData.profit || 0,
        gstPayable,
        outstandingReceivables: aggregatedData.receivables || 0,
        outstandingPayables: aggregatedData.payables || 0,
        cashBalance: aggregatedData.cash_balance || 0,
        bankBalance: aggregatedData.bank_balance || 0,
        totalVouchers,
        pendingVouchers,
      });
    } catch (error) {
      console.error('Error loading financial stats:', error);
    }
  };

  const loadAIInsights = async () => {
    try {
      if (!currentCompany || selectedFinancialYears.length === 0) return;

      // Load existing insights from database
      const { data: dbInsights, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedInsights: AIInsight[] = dbInsights?.map(insight => ({
        id: insight.id,
        type: insight.insight_type,
        title: insight.title,
        description: insight.description,
        action: insight.action_text || undefined,
        priority: insight.priority,
        createdAt: insight.created_at,
      })) || [];

      setInsights(formattedInsights);

      // Generate new insights if we have less than 3
      if (formattedInsights.length < 3) {
        await generateNewInsights();
      }
    } catch (error) {
      console.error('Error loading AI insights:', error);
    }
  };

  const generateNewInsights = async () => {
    try {
      if (!currentCompany || selectedFinancialYears.length === 0) return;

      // Get recent data for AI analysis
      const { data: recentVouchers } = await supabase
        .from('vouchers')
        .select('*')
        .eq('company_id', currentCompany.id)
        .in('financial_year_id', selectedFinancialYears)
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: ledgers } = await supabase
        .from('ledgers')
        .select('*')
        .eq('company_id', currentCompany.id)
        .in('financial_year_id', selectedFinancialYears)
        .eq('is_active', true);

      // Generate insights using Gemini AI
      const aiInsights = await generateAIInsights({
        vouchers: recentVouchers,
        ledgers: ledgers,
        stats: stats,
        financialYears: selectedFinancialYears,
      });

      // Save new insights to database
      for (const insight of aiInsights) {
        await supabase
          .from('ai_insights')
          .insert({
            company_id: currentCompany.id,
            insight_type: insight.type,
            title: insight.title,
            description: insight.description,
            action_text: insight.action,
            priority: insight.priority,
          });
      }

      // Reload insights
      await loadAIInsights();
    } catch (error) {
      console.error('Error generating new insights:', error);
    }
  };

  const markInsightAsRead = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('ai_insights')
        .update({ is_read: true })
        .eq('id', insightId);

      if (error) throw error;

      setInsights(prev => prev.filter(insight => insight.id !== insightId));
    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  };

  return {
    stats,
    insights,
    loading,
    refreshDashboard: loadDashboardData,
    markInsightAsRead,
    generateNewInsights,
  };
};