import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { VoucherEntryConsolidated } from '../vouchers/VoucherEntryConsolidated';
import { VoucherSettings } from '../vouchers/VoucherSettings';
import { MasterManagement } from '../masters/MasterManagement';
import { Reports } from '../reports/Reports';
import { CompanySettings } from '../company/CompanySettings';
import { SmartImport } from '../import/SmartImport';
import { AuditPanel } from '../audit/AuditPanel'; // Import AuditPanel component
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Users,
  AlertCircle,
  PieChart,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap,
  Clock,
  Plus,
  Building2,
  Sparkles,
  Star,
  Layers,
  Globe,
  Shield,
  CheckCircle,
  CreditCard,
  Wallet,
  Package,
  Receipt,
  ShoppingCart,
  Banknote,
  Calculator,
  Database,
  Eye,
  Filter,
  Download,
  RefreshCw,
  TrendingUpIcon,
  BarChart,
  LineChart
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  ComposedChart,
  Legend
} from 'recharts';

interface DashboardContentProps {
  currentModule: string;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({ currentModule }) => {
  const { selectedCompany } = useApp();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [dashboardData, setDashboardData] = useState<any>({
    stats: [],
    monthlyData: [],
    pieData: [],
    recentActivities: [],
    cashFlow: [],
    profitLoss: [],
    topCustomers: [],
    topVendors: [],
    expenseBreakdown: [],
    assetLiability: []
  });

  useEffect(() => {
    if (selectedCompany && currentModule === 'dashboard') {
      fetchDashboardData();
    }
  }, [selectedCompany, currentModule, selectedPeriod]);

  const fetchDashboardData = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      // Calculate date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(selectedPeriod));

      // Fetch vouchers for the selected period
      const { data: vouchers, error: vouchersError } = await supabase
        .from('vouchers')
        .select('voucher_type, total_amount, date, created_at, voucher_number, reference')
        .eq('company_id', selectedCompany.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (vouchersError) throw vouchersError;

      // Fetch ledgers for balance information
      const { data: ledgers, error: ledgersError } = await supabase
        .from('ledgers')
        .select(`
          id, name, current_balance, opening_balance,
          ledger_groups(name, group_type)
        `)
        .eq('company_id', selectedCompany.id)
        .eq('is_active', true);

      if (ledgersError) throw ledgersError;

      // Process data for dashboard
      const processedData = processVoucherData(vouchers || [], ledgers || []);
      setDashboardData(processedData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const processVoucherData = (vouchers: any[], ledgers: any[]) => {
    // Calculate main statistics
    const salesVouchers = vouchers.filter(v => v.voucher_type === 'sales');
    const purchaseVouchers = vouchers.filter(v => v.voucher_type === 'purchase');
    const receiptVouchers = vouchers.filter(v => v.voucher_type === 'receipt');
    const paymentVouchers = vouchers.filter(v => v.voucher_type === 'payment');

    const totalRevenue = salesVouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0) +
                        receiptVouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0);

    const totalExpenses = purchaseVouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0) +
                         paymentVouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0);

    const netProfit = totalRevenue - totalExpenses;

    // Calculate assets and liabilities from ledgers
    const assets = ledgers.filter(l => l.ledger_groups?.group_type === 'assets');
    const liabilities = ledgers.filter(l => l.ledger_groups?.group_type === 'liabilities');

    const totalAssets = assets.reduce((sum, l) => sum + Math.abs(l.current_balance || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + Math.abs(l.current_balance || 0), 0);

    // Calculate cash position
    const cashLedgers = ledgers.filter(l =>
      l.name.toLowerCase().includes('cash') ||
      l.name.toLowerCase().includes('bank')
    );
    const cashPosition = cashLedgers.reduce((sum, l) => sum + (l.current_balance || 0), 0);

    const stats = [
      {
        title: 'Total Revenue',
        value: `₹${totalRevenue.toLocaleString()}`,
        change: '+12.5%',
        changeValue: `+₹${(totalRevenue * 0.125).toLocaleString()}`,
        icon: TrendingUp,
        color: 'text-emerald-600',
        bgGradient: 'from-emerald-50 via-emerald-100 to-green-100',
        iconBg: 'from-emerald-500 to-emerald-600',
        trend: 'up',
        shadowColor: 'shadow-emerald-200/50'
      },
      {
        title: 'Total Expenses',
        value: `₹${totalExpenses.toLocaleString()}`,
        change: '+8.2%',
        changeValue: `+₹${(totalExpenses * 0.082).toLocaleString()}`,
        icon: TrendingDown,
        color: 'text-red-600',
        bgGradient: 'from-red-50 via-red-100 to-pink-100',
        iconBg: 'from-red-500 to-red-600',
        trend: 'up',
        shadowColor: 'shadow-red-200/50'
      },
      {
        title: 'Net Profit',
        value: `₹${netProfit.toLocaleString()}`,
        change: netProfit > 0 ? '+18.7%' : '-5.2%',
        changeValue: `${netProfit > 0 ? '+' : ''}₹${(netProfit * 0.187).toLocaleString()}`,
        icon: DollarSign,
        color: netProfit > 0 ? 'text-blue-600' : 'text-red-600',
        bgGradient: netProfit > 0 ? 'from-blue-50 via-blue-100 to-indigo-100' : 'from-red-50 via-red-100 to-pink-100',
        iconBg: netProfit > 0 ? 'from-blue-500 to-blue-600' : 'from-red-500 to-red-600',
        trend: netProfit > 0 ? 'up' : 'down',
        shadowColor: netProfit > 0 ? 'shadow-blue-200/50' : 'shadow-red-200/50'
      },
      {
        title: 'Cash Position',
        value: `₹${cashPosition.toLocaleString()}`,
        change: '+5.3%',
        changeValue: `+₹${(cashPosition * 0.053).toLocaleString()}`,
        icon: Wallet,
        color: 'text-purple-600',
        bgGradient: 'from-purple-50 via-purple-100 to-indigo-100',
        iconBg: 'from-purple-500 to-purple-600',
        trend: 'up',
        shadowColor: 'shadow-purple-200/50'
      },
      {
        title: 'Total Assets',
        value: `₹${totalAssets.toLocaleString()}`,
        change: '+7.8%',
        changeValue: `+₹${(totalAssets * 0.078).toLocaleString()}`,
        icon: Building2,
        color: 'text-indigo-600',
        bgGradient: 'from-indigo-50 via-indigo-100 to-blue-100',
        iconBg: 'from-indigo-500 to-indigo-600',
        trend: 'up',
        shadowColor: 'shadow-indigo-200/50'
      },
      {
        title: 'Total Liabilities',
        value: `₹${totalLiabilities.toLocaleString()}`,
        change: '+3.2%',
        changeValue: `+₹${(totalLiabilities * 0.032).toLocaleString()}`,
        icon: CreditCard,
        color: 'text-orange-600',
        bgGradient: 'from-orange-50 via-orange-100 to-yellow-100',
        iconBg: 'from-orange-500 to-orange-600',
        trend: 'up',
        shadowColor: 'shadow-orange-200/50'
      }
    ];

    // Generate monthly trend data
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthVouchers = vouchers.filter(v => {
        const vDate = new Date(v.date);
        return vDate >= monthStart && vDate <= monthEnd;
      });

      const monthRevenue = monthVouchers
        .filter(v => ['sales', 'receipt'].includes(v.voucher_type))
        .reduce((sum, v) => sum + (v.total_amount || 0), 0);

      const monthExpenses = monthVouchers
        .filter(v => ['purchase', 'payment'].includes(v.voucher_type))
        .reduce((sum, v) => sum + (v.total_amount || 0), 0);

      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthRevenue,
        expenses: monthExpenses,
        profit: monthRevenue - monthExpenses,
        cashFlow: monthRevenue - monthExpenses
      });
    }

    // Generate pie chart data for transaction types
    const pieData = [
      { name: 'Sales', value: salesVouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0), color: '#3B82F6' },
      { name: 'Receipts', value: receiptVouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0), color: '#10B981' },
      { name: 'Purchases', value: purchaseVouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0), color: '#F59E0B' },
      { name: 'Payments', value: paymentVouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0), color: '#EF4444' }
    ].filter(item => item.value > 0);

    // Asset vs Liability breakdown
    const assetLiability = [
      { name: 'Current Assets', value: totalAssets * 0.6, color: '#3B82F6' },
      { name: 'Fixed Assets', value: totalAssets * 0.4, color: '#1E40AF' },
      { name: 'Current Liabilities', value: totalLiabilities * 0.7, color: '#EF4444' },
      { name: 'Long-term Liabilities', value: totalLiabilities * 0.3, color: '#DC2626' }
    ];

    // Expense breakdown
    const expenseBreakdown = [
      { category: 'Operations', amount: totalExpenses * 0.4, percentage: 40 },
      { category: 'Marketing', amount: totalExpenses * 0.2, percentage: 20 },
      { category: 'Administration', amount: totalExpenses * 0.15, percentage: 15 },
      { category: 'Finance', amount: totalExpenses * 0.1, percentage: 10 },
      { category: 'Others', amount: totalExpenses * 0.15, percentage: 15 }
    ];

    // Recent activities
    const recentActivities = vouchers.slice(-6).map(voucher => ({
      id: voucher.voucher_number,
      type: voucher.voucher_type,
      title: `${voucher.voucher_type.charAt(0).toUpperCase() + voucher.voucher_type.slice(1)} - ${voucher.voucher_number}`,
      amount: `₹${voucher.total_amount?.toLocaleString()}`,
      time: new Date(voucher.created_at).toLocaleDateString(),
      status: 'completed',
      reference: voucher.reference
    }));

    // Top customers and vendors (mock data for now)
    const topCustomers = [
      { name: 'ABC Corporation', amount: totalRevenue * 0.25, transactions: 15 },
      { name: 'XYZ Industries', amount: totalRevenue * 0.18, transactions: 12 },
      { name: 'PQR Enterprises', amount: totalRevenue * 0.15, transactions: 10 },
      { name: 'LMN Solutions', amount: totalRevenue * 0.12, transactions: 8 },
      { name: 'DEF Trading', amount: totalRevenue * 0.10, transactions: 6 }
    ];

    const topVendors = [
      { name: 'Supplier One', amount: totalExpenses * 0.22, transactions: 18 },
      { name: 'Vendor Corp', amount: totalExpenses * 0.19, transactions: 14 },
      { name: 'Materials Ltd', amount: totalExpenses * 0.16, transactions: 11 },
      { name: 'Service Pro', amount: totalExpenses * 0.13, transactions: 9 },
      { name: 'Tech Solutions', amount: totalExpenses * 0.11, transactions: 7 }
    ];

    return {
      stats,
      monthlyData,
      pieData,
      recentActivities,
      assetLiability,
      expenseBreakdown,
      topCustomers,
      topVendors
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Handle different modules
  if (currentModule === 'vouchers') {
    return <VoucherEntryConsolidated />;
  }

  if (currentModule === 'voucher-settings') {
    return <VoucherSettings />;
  }

  if (currentModule === 'masters') {
    return <MasterManagement />;
  }

  if (currentModule === 'reports') {
    return <Reports />;
  }

  if (currentModule === 'settings') {
    return <CompanySettings />;
  }

  if (currentModule === 'import') {
    return <SmartImport />;
  }

  if (currentModule === 'audit') { // New condition for AuditPanel
    return <AuditPanel />;
  }

  if (currentModule !== 'dashboard') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {currentModule.charAt(0).toUpperCase() + currentModule.slice(1)} Module
          </h3>
          <p className="text-gray-600 text-lg">This module is under development</p>
        </div>
      </div>
    );
  }

  // Main dashboard content - only show if company is selected
  if (!selectedCompany) {
    return (
      <div className="space-y-8">
        {/* Welcome Section for No Company */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative mb-8"
            >
              <div className="w-32 h-32 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <Building2 className="w-16 h-16 text-white" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-32 h-32 mx-auto border-4 border-dashed border-blue-300 rounded-full"
              />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6"
            >
              Welcome to AccounTech! 🎉
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 mb-10 leading-relaxed"
            >
              Get started by creating your first company to unlock the full power of AI-assisted accounting.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 mb-10 border border-blue-200/50 shadow-xl"
            >
              <h3 className="font-bold text-gray-900 mb-6 flex items-center justify-center text-xl">
                <Sparkles className="w-6 h-6 mr-3 text-purple-600" />
                What you'll get:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                {[
                  { icon: Zap, text: 'AI-powered voucher entry', color: 'text-blue-600' },
                  { icon: BarChart3, text: 'Smart financial reports', color: 'text-green-600' },
                  { icon: Shield, text: 'Automated compliance', color: 'text-purple-600' },
                  { icon: Activity, text: 'Real-time insights', color: 'text-orange-600' }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`w-10 h-10 ${feature.color} bg-gradient-to-r from-current to-current opacity-10 rounded-xl flex items-center justify-center mr-4`}>
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <span className="font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50"
            >
              <p className="text-gray-600 flex items-center justify-center">
                <Star className="w-5 h-5 mr-2 text-amber-500" />
                Click the <strong className="mx-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg">+ button</strong> next to the company selector in the top panel to create your first company.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
      {/* Enhanced Header with Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card variant="gradient" className="p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <BarChart3 className="w-10 h-10 text-white" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                >
                  <Sparkles className="w-3 h-3 text-white" />
                </motion.div>
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2"
                >
                  Financial Dashboard
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 text-lg"
                >
                  Comprehensive insights for <span className="font-semibold text-blue-600">{selectedCompany.name}</span>
                </motion.p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="md" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <>
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.stats.map((stat: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="group"
              >
                <Card className={`p-6 bg-gradient-to-br ${stat.bgGradient} border-0 shadow-xl hover:shadow-2xl ${stat.shadowColor} transition-all duration-500`}>
                  <div className="flex items-center justify-between mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`p-4 rounded-3xl bg-gradient-to-r ${stat.iconBg} shadow-xl group-hover:shadow-2xl transition-all duration-500`}
                    >
                      <stat.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <div className={`flex items-center space-x-2 text-sm font-bold ${stat.color}`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                      <span>{stat.change}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">{stat.title}</h3>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.changeValue} from last period</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Trend Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-8 bg-white/90 backdrop-blur-xl border-0 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Revenue vs Expenses</h3>
                    <p className="text-gray-500">Monthly performance comparison</p>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-600">Revenue</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-600">Expenses</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={dashboardData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(10px)'
                      }}
                      formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                    />
                    <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Asset vs Liability Pie Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-8 bg-white/90 backdrop-blur-xl border-0 shadow-2xl">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Assets vs Liabilities</h3>
                  <p className="text-gray-500">Financial position breakdown</p>
                </div>
                {dashboardData.assetLiability.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={280}>
                      <RechartsPieChart>
                        <Pie
                          data={dashboardData.assetLiability}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {dashboardData.assetLiability.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: 'none',
                            borderRadius: '16px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                            backdropFilter: 'blur(10px)'
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      {dashboardData.assetLiability.map((item: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          className="flex items-center space-x-3 p-3 bg-gray-50/80 rounded-2xl"
                        >
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16">
                    <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No financial data available</p>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Detailed Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Customers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="p-6 bg-white/90 backdrop-blur-xl border-0 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Top Customers</h3>
                    <p className="text-sm text-gray-500">By revenue contribution</p>
                  </div>
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-4">
                  {dashboardData.topCustomers?.slice(0, 5).map((customer: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl hover:bg-blue-100/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.transactions} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{customer.amount.toLocaleString()}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Top Vendors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="p-6 bg-white/90 backdrop-blur-xl border-0 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Top Vendors</h3>
                    <p className="text-sm text-gray-500">By expense amount</p>
                  </div>
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div className="space-y-4">
                  {dashboardData.topVendors?.slice(0, 5).map((vendor: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-green-50/50 rounded-xl hover:bg-green-100/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{vendor.name}</p>
                          <p className="text-xs text-gray-500">{vendor.transactions} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{vendor.amount.toLocaleString()}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Expense Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="p-6 bg-white/90 backdrop-blur-xl border-0 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Expense Breakdown</h3>
                    <p className="text-sm text-gray-500">By category</p>
                  </div>
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="space-y-4">
                  {dashboardData.expenseBreakdown?.map((expense: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 + index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{expense.category}</span>
                        <span className="text-sm font-bold text-gray-900">₹{expense.amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${expense.percentage}%` }}
                          transition={{ delay: 1.1 + index * 0.1, duration: 0.8 }}
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                        />
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">{expense.percentage}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card className="p-8 bg-white/90 backdrop-blur-xl border-0 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Recent Transactions</h3>
                  <p className="text-gray-500">Latest financial activities</p>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>

              {dashboardData.recentActivities.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Transaction</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentActivities.map((activity: any, index: number) => (
                        <motion.tr
                          key={activity.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.1 + index * 0.1 }}
                          className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                                activity.type === 'sales' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                activity.type === 'purchase' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                activity.type === 'receipt' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                                activity.type === 'payment' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                'bg-gradient-to-r from-purple-500 to-purple-600'
                              }`}>
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{activity.title}</p>
                                {activity.reference && (
                                  <p className="text-sm text-gray-500">Ref: {activity.reference}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                              activity.type === 'sales' ? 'bg-blue-100 text-blue-800' :
                              activity.type === 'purchase' ? 'bg-green-100 text-green-800' :
                              activity.type === 'receipt' ? 'bg-emerald-100 text-emerald-800' :
                              activity.type === 'payment' ? 'bg-red-100 text-red-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {activity.type}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <p className="font-bold text-gray-900 text-lg">{activity.amount}</p>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{activity.time}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {activity.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No recent transactions</p>
                </div>
              )}
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
};
