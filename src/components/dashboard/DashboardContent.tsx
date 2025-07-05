import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
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
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie, AreaChart, Area } from 'recharts';

interface DashboardContentProps {
  currentModule: string;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({ currentModule }) => {
  const { selectedCompany } = useApp();
  const [loading, setLoading] = useState(false);

  // Sample data - replace with real data from your database
  const stats = [
    {
      title: 'Total Revenue',
      value: '₹2,45,680',
      change: '+12.5%',
      changeValue: '+₹27,340',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100',
      iconBg: 'from-emerald-500 to-emerald-600',
      trend: 'up'
    },
    {
      title: 'Total Expenses',
      value: '₹1,89,420',
      change: '+8.2%',
      changeValue: '+₹14,320',
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'from-red-50 to-red-100',
      iconBg: 'from-red-500 to-red-600',
      trend: 'up'
    },
    {
      title: 'Net Profit',
      value: '₹56,260',
      change: '+18.7%',
      changeValue: '+₹8,860',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      iconBg: 'from-blue-500 to-blue-600',
      trend: 'up'
    },
    {
      title: 'Active Vouchers',
      value: '156',
      change: '+3.1%',
      changeValue: '+5',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      iconBg: 'from-purple-500 to-purple-600',
      trend: 'up'
    }
  ];

  const monthlyData = [
    { month: 'Jan', revenue: 45000, expenses: 35000, profit: 10000 },
    { month: 'Feb', revenue: 52000, expenses: 38000, profit: 14000 },
    { month: 'Mar', revenue: 48000, expenses: 42000, profit: 6000 },
    { month: 'Apr', revenue: 61000, expenses: 45000, profit: 16000 },
    { month: 'May', revenue: 55000, expenses: 40000, profit: 15000 },
    { month: 'Jun', revenue: 67000, expenses: 48000, profit: 19000 }
  ];

  const pieData = [
    { name: 'Sales', value: 245680, color: '#3B82F6' },
    { name: 'Services', value: 89420, color: '#10B981' },
    { name: 'Products', value: 156240, color: '#F59E0B' },
    { name: 'Others', value: 45680, color: '#EF4444' }
  ];

  const recentActivities = [
    { id: 1, type: 'voucher', title: 'Sales Voucher #SV001', amount: '₹12,500', time: '2 hours ago', status: 'completed' },
    { id: 2, type: 'payment', title: 'Payment to Supplier ABC', amount: '₹8,750', time: '4 hours ago', status: 'pending' },
    { id: 3, type: 'receipt', title: 'Receipt from Client XYZ', amount: '₹15,200', time: '6 hours ago', status: 'completed' },
    { id: 4, type: 'journal', title: 'Journal Entry #JE045', amount: '₹3,400', time: '1 day ago', status: 'completed' }
  ];

  const quickActions = [
    { title: 'Create Sales Voucher', icon: FileText, color: 'from-blue-500 to-blue-600', description: 'Record new sales transaction' },
    { title: 'Add Purchase Entry', icon: TrendingDown, color: 'from-green-500 to-green-600', description: 'Log purchase details' },
    { title: 'Generate Report', icon: BarChart3, color: 'from-purple-500 to-purple-600', description: 'Create financial reports' },
    { title: 'Manage Ledgers', icon: Users, color: 'from-orange-500 to-orange-600', description: 'Update account ledgers' }
  ];

  if (currentModule !== 'dashboard') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {currentModule.charAt(0).toUpperCase() + currentModule.slice(1)} Module
          </h3>
          <p className="text-gray-600">This module is under development</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-gray-600">
              {selectedCompany 
                ? `Here's what's happening with ${selectedCompany.name} today.` 
                : 'Select a company to view your dashboard.'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Calendar className="w-4 h-4 mr-2" />
              Last 30 days
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Zap className="w-4 h-4 mr-2" />
              Quick Entry
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group"
          >
            <Card className={`p-6 bg-gradient-to-br ${stat.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-r ${stat.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${stat.color}`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.changeValue} from last month</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <p className="text-sm text-gray-500">Monthly performance overview</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Expenses</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Profit</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                <Area type="monotone" dataKey="expenses" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={3} />
                <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Revenue Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Sources</h3>
              <p className="text-sm text-gray-500">Distribution by category</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-500">Frequently used operations</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 border border-gray-200/50 transition-all duration-300 text-left"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </motion.button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-500">Latest transactions</p>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/80 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activity.type === 'voucher' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'payment' ? 'bg-red-100 text-red-600' :
                      activity.type === 'receipt' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{activity.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === 'completed' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};