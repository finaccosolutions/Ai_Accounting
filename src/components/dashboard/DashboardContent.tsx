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
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie, AreaChart, Area, BarChart, Bar } from 'recharts';

interface DashboardContentProps {
  currentModule: string;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({ currentModule }) => {
  const { selectedCompany } = useApp();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>({
    stats: [],
    monthlyData: [],
    pieData: [],
    recentActivities: []
  });

  useEffect(() => {
    if (selectedCompany && currentModule === 'dashboard') {
      fetchDashboardData();
    }
  }, [selectedCompany, currentModule]);

  const fetchDashboardData = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      // Fetch vouchers for stats
      const { data: vouchers, error: vouchersError } = await supabase
        .from('vouchers')
        .select('voucher_type, total_amount, date, created_at')
        .eq('company_id', selectedCompany.id)
        .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);

      if (vouchersError) throw vouchersError;

      // Calculate stats
      const salesVouchers = vouchers?.filter(v => v.voucher_type === 'sales') || [];
      const purchaseVouchers = vouchers?.filter(v => v.voucher_type === 'purchase') || [];
      const receiptVouchers = vouchers?.filter(v => v.voucher_type === 'receipt') || [];
      const paymentVouchers = vouchers?.filter(v => v.voucher_type === 'payment') || [];

      const totalRevenue = salesVouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0) + 
                          receiptVouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0);
      
      const totalExpenses = purchaseVouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0) + 
                           paymentVouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0);

      const netProfit = totalRevenue - totalExpenses;

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
          title: 'Active Vouchers',
          value: vouchers?.length.toString() || '0',
          change: '+3.1%',
          changeValue: '+5',
          icon: FileText,
          color: 'text-purple-600',
          bgGradient: 'from-purple-50 via-purple-100 to-indigo-100',
          iconBg: 'from-purple-500 to-purple-600',
          trend: 'up',
          shadowColor: 'shadow-purple-200/50'
        }
      ];

      // Generate monthly data
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthVouchers = vouchers?.filter(v => {
          const vDate = new Date(v.date);
          return vDate >= monthStart && vDate <= monthEnd;
        }) || [];

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
          profit: monthRevenue - monthExpenses
        });
      }

      // Generate pie data
      const pieData = [
        { name: 'Sales', value: salesVouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0), color: '#3B82F6' },
        { name: 'Receipts', value: receiptVouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0), color: '#10B981' },
        { name: 'Purchases', value: purchaseVouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0), color: '#F59E0B' },
        { name: 'Payments', value: paymentVouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0), color: '#EF4444' }
      ].filter(item => item.value > 0);

      // Recent activities
      const recentActivities = vouchers?.slice(0, 4).map(voucher => ({
        id: voucher.voucher_type + Math.random(),
        type: voucher.voucher_type,
        title: `${voucher.voucher_type.charAt(0).toUpperCase() + voucher.voucher_type.slice(1)} Voucher`,
        amount: `₹${voucher.total_amount?.toLocaleString()}`,
        time: new Date(voucher.created_at).toLocaleDateString(),
        status: 'completed'
      })) || [];

      setDashboardData({
        stats,
        monthlyData,
        pieData,
        recentActivities
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  const quickActions = [
    { title: 'Create Sales Voucher', icon: FileText, color: 'from-blue-500 to-blue-600', description: 'Record new sales transaction', module: 'vouchers' },
    { title: 'Add Purchase Entry', icon: TrendingDown, color: 'from-green-500 to-green-600', description: 'Log purchase details', module: 'vouchers' },
    { title: 'Generate Report', icon: BarChart3, color: 'from-purple-500 to-purple-600', description: 'Create financial reports', module: 'reports' },
    { title: 'Manage Ledgers', icon: Users, color: 'from-orange-500 to-orange-600', description: 'Update account ledgers', module: 'masters' }
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
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
                  <Layers className="w-10 h-10 text-white" />
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
                  Welcome back! 👋
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 text-lg"
                >
                  Here's what's happening with <span className="font-semibold text-blue-600">{selectedCompany.name}</span> today.
                </motion.p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Calendar className="w-4 h-4 mr-2" />
                Last 30 days
              </Button>
              <Button size="md" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Zap className="w-4 h-4 mr-2" />
                Quick Entry
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <p className="text-sm text-gray-500">{stat.changeValue} from last month</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Revenue Trend */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card className="p-8 bg-white/90 backdrop-blur-xl border-0 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Revenue Trend</h3>
                    <p className="text-gray-500">Monthly performance overview</p>
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
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-600">Profit</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={dashboardData.monthlyData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
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
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                    <Area type="monotone" dataKey="expenses" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={3} />
                    <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Enhanced Revenue Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-8 bg-white/90 backdrop-blur-xl border-0 shadow-2xl">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Transaction Types</h3>
                  <p className="text-gray-500">Distribution by category</p>
                </div>
                {dashboardData.pieData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={280}>
                      <RechartsPieChart>
                        <Pie
                          data={dashboardData.pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={120}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {dashboardData.pieData.map((entry: any, index: number) => (
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
                      {dashboardData.pieData.map((item: any, index: number) => (
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
                    <p className="text-gray-500 text-lg">No transaction data available</p>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Enhanced Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="p-8 bg-white/90 backdrop-blur-xl border-0 shadow-2xl">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h3>
                  <p className="text-gray-500">Frequently used operations</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className="group p-6 rounded-3xl bg-gradient-to-br from-gray-50 to-white hover:from-white hover:to-gray-50 border-2 border-gray-100 hover:border-gray-200 transition-all duration-500 text-left shadow-lg hover:shadow-2xl"
                    >
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                        <action.icon className="w-7 h-7 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">{action.title}</h4>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Enhanced Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="p-8 bg-white/90 backdrop-blur-xl border-0 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Recent Activity</h3>
                    <p className="text-gray-500">Latest transactions</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {dashboardData.recentActivities.length > 0 ? (
                    dashboardData.recentActivities.map((activity: any, index: number) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50/80 transition-all duration-300 group cursor-pointer border border-transparent hover:border-gray-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                            activity.type === 'sales' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                            activity.type === 'purchase' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                            activity.type === 'receipt' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                            activity.type === 'payment' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                            'bg-gradient-to-r from-purple-500 to-purple-600'
                          }`}>
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{activity.title}</p>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">{activity.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-lg">{activity.amount}</p>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            activity.status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No recent activity</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};