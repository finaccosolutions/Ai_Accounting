import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCompany } from './useCompany';
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
    if (currentCompany) {
      loadDashboardData();
    }
  }, [currentCompany]);

  const loadDashboardData = async () => {
    try {
      if (!currentCompany) return;

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
      if (!currentCompany) return;

      // Get voucher statistics
      const { data: voucherStats } = await supabase
        .from('vouchers')
        .select('status, total_amount')
        .eq('company_id', currentCompany.id);

      // Get ledger balances
      const { data: ledgerBalances } = await supabase
        .from('ledgers')
        .select('name, current_balance, ledger_type')
        .eq('company_id', currentCompany.id)
        .eq('is_active', true);

      // Calculate stats from real data
      const totalVouchers = voucherStats?.length || 0;
      const pendingVouchers = voucherStats?.filter(v => v.status === 'draft').length || 0;

      // Calculate income and expense from vouchers
      const totalIncome = voucherStats
        ?.filter(v => v.status === 'posted')
        .reduce((sum, v) => {
          // This is simplified - in real app, you'd check voucher type and entries
          return sum + (v.total_amount > 0 ? v.total_amount : 0);
        }, 0) || 0;

      const totalExpense = voucherStats
        ?.filter(v => v.status === 'posted')
        .reduce((sum, v) => {
          // This is simplified - in real app, you'd check voucher type and entries
          return sum + (v.total_amount < 0 ? Math.abs(v.total_amount) : 0);
        }, 0) || 0;

      // Get specific ledger balances
      const cashBalance = ledgerBalances?.find(l => l.name.toLowerCase().includes('cash'))?.current_balance || 0;
      const bankBalance = ledgerBalances?.find(l => l.name.toLowerCase().includes('bank'))?.current_balance || 0;
      const gstPayable = ledgerBalances?.filter(l => l.name.toLowerCase().includes('gst')).reduce((sum, l) => sum + l.current_balance, 0) || 0;

      // Calculate receivables and payables
      const outstandingReceivables = ledgerBalances?.filter(l => l.ledger_type === 'asset' && l.current_balance > 0).reduce((sum, l) => sum + l.current_balance, 0) || 0;
      const outstandingPayables = ledgerBalances?.filter(l => l.ledger_type === 'liability' && l.current_balance > 0).reduce((sum, l) => sum + l.current_balance, 0) || 0;

      setStats({
        totalIncome,
        totalExpense,
        profit: totalIncome - totalExpense,
        gstPayable,
        outstandingReceivables,
        outstandingPayables,
        cashBalance,
        bankBalance,
        totalVouchers,
        pendingVouchers,
      });
    } catch (error) {
      console.error('Error loading financial stats:', error);
    }
  };

  const loadAIInsights = async () => {
    try {
      if (!currentCompany) return;

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
      if (!currentCompany) return;

      // Get recent data for AI analysis
      const { data: recentVouchers } = await supabase
        .from('vouchers')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: ledgers } = await supabase
        .from('ledgers')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('is_active', true);

      // Generate insights using Gemini AI
      const aiInsights = await generateAIInsights({
        vouchers: recentVouchers,
        ledgers: ledgers,
        stats: stats,
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