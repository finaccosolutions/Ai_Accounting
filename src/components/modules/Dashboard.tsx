import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  CreditCard, 
  Banknote,
  Users,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { useApp } from '../../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const monthlyData = [
  { month: 'Jan', income: 200000, expense: 150000, profit: 50000 },
  { month: 'Feb', income: 220000, expense: 160000, profit: 60000 },
  { month: 'Mar', income: 240000, expense: 170000, profit: 70000 },
  { month: 'Apr', income: 250000, expense: 180000, profit: 70000 },
  { month: 'May', income: 280000, expense: 190000, profit: 90000 },
  { month: 'Jun', income: 300000, expense: 200000, profit: 100000 },
];

const expenseData = [
  { name: 'Rent', value: 45000, color: '#3B82F6' },
  { name: 'Salaries', value: 120000, color: '#10B981' },
  { name: 'Utilities', value: 25000, color: '#F59E0B' },
  { name: 'Marketing', value: 35000, color: '#EF4444' },
  { name: 'Others', value: 55000, color: '#8B5CF6' },
];

const topCustomers = [
  { name: 'ABC Corporation', amount: 150000, trend: 'up' },
  { name: 'XYZ Industries', amount: 125000, trend: 'up' },
  { name: 'Tech Solutions Ltd', amount: 98000, trend: 'down' },
  { name: 'Global Trading Co', amount: 87000, trend: 'up' },
  { name: 'Smart Systems', amount: 76000, trend: 'neutral' },
];

export const Dashboard: React.FC = () => {
  const { dashboardStats, aiInsights } = useApp();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your business performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>This Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Income"
          value={formatCurrency(dashboardStats.totalIncome)}
          change="+12.5% from last month"
          trend="up"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Total Expense"
          value={formatCurrency(dashboardStats.totalExpense)}
          change="+8.3% from last month"
          trend="up"
          icon={TrendingDown}
          color="red"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(dashboardStats.profit)}
          change="+18.2% from last month"
          trend="up"
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="GST Payable"
          value={formatCurrency(dashboardStats.gstPayable)}
          change="Due in 3 days"
          trend="neutral"
          icon={Receipt}
          color="orange"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Outstanding Receivables"
          value={formatCurrency(dashboardStats.outstandingReceivables)}
          change="15 invoices pending"
          trend="neutral"
          icon={CreditCard}
          color="purple"
        />
        <StatCard
          title="Outstanding Payables"
          value={formatCurrency(dashboardStats.outstandingPayables)}
          change="8 bills pending"
          trend="neutral"
          icon={Users}
          color="orange"
        />
        <StatCard
          title="Cash Balance"
          value={formatCurrency(dashboardStats.cashBalance)}
          change="+5.2% from last week"
          trend="up"
          icon={Banknote}
          color="green"
        />
        <StatCard
          title="Bank Balance"
          value={formatCurrency(dashboardStats.bankBalance)}
          change="+2.8% from last week"
          trend="up"
          icon={Package}
          color="blue"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="income" fill="#10B981" name="Income" />
              <Bar dataKey="expense" fill="#EF4444" name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Profit Trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {expenseData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(customer.amount)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {customer.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {customer.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                  {customer.trend === 'neutral' && <Target className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
          <div className="space-y-3">
            {aiInsights.map((insight) => (
              <div key={insight.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                  {insight.type === 'suggestion' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                  {insight.type === 'info' && <Clock className="w-5 h-5 text-gray-500" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{insight.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                  {insight.action && (
                    <button className="text-sm text-blue-600 hover:text-blue-800 mt-1">
                      {insight.action} →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};