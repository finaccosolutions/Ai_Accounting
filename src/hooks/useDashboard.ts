import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCompany } from './useCompany';
import { useFinancialYears } from './useFinancialYears';
import { generateAIInsights, analyzeFinancialPerformance, performAuditAnalysis, generateTaxOptimizationSuggestions } from '../lib/gemini';
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
  profitMargin: number;
  growthRate: number;
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

export interface FinancialTrend {
  period: string;
  income: number;
  expense: number;
  profit: number;
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
    profitMargin: 0,
    growthRate: 0,
  });
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [trends, setTrends] = useState<FinancialTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);

  useEffect(() => {
    if (currentCompany && selectedFinancialYears.length > 0) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [currentCompany, selectedFinancialYears]);

  const loadDashboardData = async () => {
    try {
      if (!currentCompany || selectedFinancialYears.length === 0) return;

      console.log('📊 Loading dashboard data for company:', currentCompany.name);
      setLoading(true);
      
      await Promise.all([
        loadFinancialStats(),
        loadFinancialTrends(),
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

      console.log('💰 Loading financial stats...');

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
        .gte('period_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      // Get voucher statistics
      const { data: voucherStats } = await supabase
        .from('vouchers')
        .select('status, total_amount')
        .eq('company_id', currentCompany.id)
        .in('financial_year_id', selectedFinancialYears);

      // Get ledger balances
      const { data: ledgerBalances } = await supabase
        .from('ledgers')
        .select('name, current_balance, ledger_type')
        .eq('company_id', currentCompany.id)
        .in('financial_year_id', selectedFinancialYears)
        .eq('is_active', true);

      // Aggregate data by type
      const aggregatedData: Record<string, number> = {};
      dashboardData?.forEach(item => {
        aggregatedData[item.data_type] = (aggregatedData[item.data_type] || 0) + item.amount;
      });

      // Calculate voucher stats
      const totalVouchers = voucherStats?.length || 0;
      const pendingVouchers = voucherStats?.filter(v => v.status === 'draft').length || 0;

      // Calculate balances from ledgers
      const cashBalance = ledgerBalances?.filter(l => 
        l.name.toLowerCase().includes('cash') && l.ledger_type === 'asset'
      ).reduce((sum, l) => sum + l.current_balance, 0) || 0;

      const bankBalance = ledgerBalances?.filter(l => 
        l.name.toLowerCase().includes('bank') && l.ledger_type === 'asset'
      ).reduce((sum, l) => sum + l.current_balance, 0) || 0;

      const receivables = ledgerBalances?.filter(l => 
        (l.name.toLowerCase().includes('debtor') || l.name.toLowerCase().includes('receivable')) && 
        l.ledger_type === 'asset'
      ).reduce((sum, l) => sum + l.current_balance, 0) || 0;

      const payables = ledgerBalances?.filter(l => 
        (l.name.toLowerCase().includes('creditor') || l.name.toLowerCase().includes('payable')) && 
        l.ledger_type === 'liability'
      ).reduce((sum, l) => sum + l.current_balance, 0) || 0;

      const gstPayable = ledgerBalances?.filter(l => 
        l.name.toLowerCase().includes('gst') && l.ledger_type === 'liability'
      ).reduce((sum, l) => sum + l.current_balance, 0) || 0;

      const totalIncome = aggregatedData.total_income || 0;
      const totalExpense = aggregatedData.total_expense || 0;
      const profit = totalIncome - totalExpense;
      const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

      setStats({
        totalIncome,
        totalExpense,
        profit,
        gstPayable,
        outstandingReceivables: receivables,
        outstandingPayables: payables,
        cashBalance,
        bankBalance,
        totalVouchers,
        pendingVouchers,
        profitMargin,
        growthRate: 0, // Will be calculated from trends
      });

      console.log('💰 Financial stats loaded:', { totalIncome, totalExpense, profit });
    } catch (error) {
      console.error('Error loading financial stats:', error);
    }
  };

  const loadFinancialTrends = async () => {
    try {
      if (!currentCompany || selectedFinancialYears.length === 0) return;

      console.log('📈 Loading financial trends...');

      // Get monthly trends for the last 12 months
      const { data: monthlyData } = await supabase
        .from('dashboard_data')
        .select('period_date, data_type, amount')
        .eq('company_id', currentCompany.id)
        .in('financial_year_id', selectedFinancialYears)
        .eq('period_type', 'monthly')
        .gte('period_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('period_date', { ascending: true });

      // Group by month
      const monthlyTrends: Record<string, { income: number; expense: number }> = {};
      
      monthlyData?.forEach(item => {
        const month = item.period_date;
        if (!monthlyTrends[month]) {
          monthlyTrends[month] = { income: 0, expense: 0 };
        }
        
        if (item.data_type === 'total_income') {
          monthlyTrends[month].income = item.amount;
        } else if (item.data_type === 'total_expense') {
          monthlyTrends[month].expense = item.amount;
        }
      });

      const trendsArray: FinancialTrend[] = Object.entries(monthlyTrends).map(([period, data]) => ({
        period,
        income: data.income,
        expense: data.expense,
        profit: data.income - data.expense,
      }));

      setTrends(trendsArray);
      console.log('📈 Financial trends loaded:', trendsArray.length, 'months');
    } catch (error) {
      console.error('Error loading financial trends:', error);
    }
  };

  const loadAIInsights = async () => {
    try {
      if (!currentCompany || selectedFinancialYears.length === 0) return;

      console.log('🤖 Loading AI insights...');

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
      console.log('🤖 AI insights loaded:', formattedInsights.length);

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

      console.log('🤖 Generating new AI insights...');
      setAiAnalysisLoading(true);

      // Get recent data for AI analysis
      const { data: recentVouchers } = await supabase
        .from('vouchers')
        .select(`
          *,
          voucher_entries (
            *,
            ledgers (name, ledger_type)
          )
        `)
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
      const analysisData = {
        vouchers: recentVouchers,
        ledgers: ledgers,
        stats: stats,
        trends: trends,
        financialYears: selectedFinancialYears,
        company: currentCompany,
      };

      const aiInsights = await generateAIInsights(analysisData);

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
      console.log('🤖 New AI insights generated:', aiInsights.length);
    } catch (error) {
      console.error('Error generating new insights:', error);
      toast.error('Error generating AI insights');
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  const performAdvancedAnalysis = async () => {
    try {
      if (!currentCompany || selectedFinancialYears.length === 0) return;

      setAiAnalysisLoading(true);
      toast.loading('Performing advanced AI analysis...');

      // Get comprehensive data
      const { data: allVouchers } = await supabase
        .from('vouchers')
        .select(`
          *,
          voucher_entries (
            *,
            ledgers (name, ledger_type),
            stock_items (name)
          )
        `)
        .eq('company_id', currentCompany.id)
        .in('financial_year_id', selectedFinancialYears);

      const { data: allLedgers } = await supabase
        .from('ledgers')
        .select('*')
        .eq('company_id', currentCompany.id)
        .in('financial_year_id', selectedFinancialYears);

      const analysisData = {
        vouchers: allVouchers,
        ledgers: allLedgers,
        stats: stats,
        trends: trends,
        company: currentCompany,
      };

      // Perform multiple AI analyses
      const [
        financialAnalysis,
        auditFindings,
        taxOptimization
      ] = await Promise.all([
        analyzeFinancialPerformance(analysisData),
        performAuditAnalysis(analysisData),
        generateTaxOptimizationSuggestions(analysisData)
      ]);

      // Save analysis results as insights
      const analysisInsights = [
        {
          type: 'info' as const,
          title: 'Financial Performance Analysis',
          description: `Profit margin: ${financialAnalysis.profitability.netProfitMargin.toFixed(2)}%. ${financialAnalysis.profitability.insights[0] || 'Performance analysis completed.'}`,
          action: 'View detailed analysis',
          priority: 'medium' as const,
        },
        {
          type: auditFindings.anomalies.length > 0 ? 'warning' as const : 'info' as const,
          title: 'Audit Analysis Complete',
          description: `Found ${auditFindings.anomalies.length} anomalies and ${auditFindings.duplicateEntries.length} potential duplicates.`,
          action: 'Review audit findings',
          priority: auditFindings.anomalies.length > 0 ? 'high' as const : 'low' as const,
        },
        {
          type: 'suggestion' as const,
          title: 'Tax Optimization Opportunities',
          description: taxOptimization[0] || 'Tax optimization analysis completed.',
          action: 'View tax suggestions',
          priority: 'medium' as const,
        }
      ];

      // Save to database
      for (const insight of analysisInsights) {
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

      await loadAIInsights();
      toast.dismiss();
      toast.success('Advanced AI analysis completed');
    } catch (error) {
      console.error('Error performing advanced analysis:', error);
      toast.dismiss();
      toast.error('Error performing advanced analysis');
    } finally {
      setAiAnalysisLoading(false);
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
    trends,
    loading,
    aiAnalysisLoading,
    refreshDashboard: loadDashboardData,
    markInsightAsRead,
    generateNewInsights,
    performAdvancedAnalysis,
  };
};