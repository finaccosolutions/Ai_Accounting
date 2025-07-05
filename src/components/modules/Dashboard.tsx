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
  Target,
  Calendar,
  Filter,
  Bot,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { useDashboard } from '../../hooks/useDashboard';
import { useApp } from '../../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell } from 'recharts';
import { Button } from '../ui/Button';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const Dashboard: React.FC = () => {
  const { 
    stats, 
    insights, 
    trends, 
    loading, 
    aiAnalysisLoading,
    refreshDashboard, 
    markInsightAsRead,
    performAdvancedAnalysis 
  } = useDashboard();
  
  const { 
    financialYears, 
    selectedFinancialYears, 
    toggleFinancialYearSelection,
    selectAllFinancialYears,
    clearFinancialYearSelection 
  } = useApp();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getSelectedFYNames = () => {
    if (selectedFinancialYears.length === 0) return 'No financial years selected';
    if (selectedFinancialYears.length === financialYears.length) return 'All financial years';
    
    const selectedNames = financialYears
      .filter(fy => selectedFinancialYears.includes(fy.id))
      .map(fy => fy.year_name)
      .join(', ');
    
    return selectedNames.length > 50 ? `${selectedNames.substring(0, 50)}...` : selectedNames;
  };

  // Prepare chart data
  const expenseBreakdown = [
    { name: 'Direct Expenses', value: stats.totalExpense * 0.6, color: COLORS[0] },
    { name: 'Indirect Expenses', value: stats.totalExpense * 0.3, color: COLORS[1] },
    { name: 'Tax & Duties', value: stats.gstPayable, color: COLORS[2] },
    { name: 'Other', value: stats.totalExpense * 0.1, color: COLORS[3] },
  ];

  const profitTrendData = trends.map(trend => ({
    month: new Date(trend.period).toLocaleDateString('en-IN', { month: 'short' }),
    profit: trend.profit,
    income: trend.income,
    expense: trend.expense,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI-Powered Dashboard</h1>
          <p className="text-gray-600">Intelligent insights and real-time analytics for your business</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            icon={Bot} 
            onClick={performAdvancedAnalysis}
            loading={aiAnalysisLoading}
            className="hover:bg-blue-50 hover:border-blue-300"
          >
            AI Analysis
          </Button>
          <Button 
            variant="outline" 
            icon={Activity} 
            onClick={refreshDashboard}
            className="hover:bg-green-50 hover:border-green-300"
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Financial Year Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Financial Year Selection</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={selectAllFinancialYears}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={clearFinancialYearSelection}>
              Clear All
            </Button>
          </div>
        </div>
        
        <div className="mb-3">
          <p className="text-sm text-gray-600">
            Selected: <span className="font-medium">{getSelectedFYNames()}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {financialYears.map((fy) => (
            <button
              key={fy.id}
              onClick={() => toggleFinancialYearSelection(fy.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                selectedFinancialYears.includes(fy.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{fy.year_name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(fy.start_date).toLocaleDateString()} - {new Date(fy.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {fy.is_current && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Current
                    </span>
                  )}
                  {fy.is_closed && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Closed
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedFinancialYears.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Calendar className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">No Financial Years Selected</h3>
          <p className="text-yellow-700">Please select at least one financial year to view dashboard data.</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Income"
              value={formatCurrency(stats.totalIncome)}
              change={`${stats.profitMargin.toFixed(1)}% margin`}
              trend="up"
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              title="Total Expense"
              value={formatCurrency(stats.totalExpense)}
              change={`${stats.totalVouchers} vouchers`}
              trend="up"
              icon={TrendingDown}
              color="red"
            />
            <StatCard
              title="Net Profit"
              value={formatCurrency(stats.profit)}
              change={stats.profit > 0 ? 'Profitable' : 'Loss'}
              trend={stats.profit > 0 ? 'up' : 'down'}
              icon={DollarSign}
              color="blue"
            />
            <StatCard
              title="GST Payable"
              value={formatCurrency(stats.gstPayable)}
              change="Current liability"
              trend="neutral"
              icon={Receipt}
              color="orange"
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Outstanding Receivables"
              value={formatCurrency(stats.outstandingReceivables)}
              change="To be collected"
              trend="neutral"
              icon={CreditCard}
              color="purple"
            />
            <StatCard
              title="Outstanding Payables"
              value={formatCurrency(stats.outstandingPayables)}
              change={`${stats.pendingVouchers} pending`}
              trend="neutral"
              icon={Users}
              color="orange"
            />
            <StatCard
              title="Cash Balance"
              value={formatCurrency(stats.cashBalance)}
              change="Available cash"
              trend="up"
              icon={Banknote}
              color="green"
            />
            <StatCard
              title="Bank Balance"
              value={formatCurrency(stats.bankBalance)}
              change="Available in bank"
              trend="up"
              icon={Package}
              color="blue"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Trend Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Profit Trend</h3>
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={profitTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
                <PieChart className="w-5 h-5 text-gray-600" />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          {insights.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-blue-600" />
                  AI Insights & Recommendations
                </h3>
                {aiAnalysisLoading && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Analyzing...</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {insights.map((insight) => (
                  <div key={insight.id} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex-shrink-0">
                      {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                      {insight.type === 'suggestion' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                      {insight.type === 'info' && <Clock className="w-5 h-5 text-gray-500" />}
                      {insight.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{insight.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                          {insight.action && (
                            <button className="text-sm text-blue-600 hover:text-blue-800 mt-2 font-medium">
                              {insight.action} →
                            </button>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                            insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {insight.priority}
                          </span>
                          <button
                            onClick={() => markInsightAsRead(insight.id)}
                            className="text-xs text-gray-400 hover:text-gray-600 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Income</span>
                  <span className="font-medium text-green-600">{formatCurrency(stats.totalIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Expense</span>
                  <span className="font-medium text-red-600">{formatCurrency(stats.totalExpense)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Net Profit/Loss</span>
                    <span className={`font-bold text-lg ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(stats.profit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Profit Margin</span>
                    <span className="text-sm font-medium">{stats.profitMargin.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cash in Hand</span>
                  <span className="font-medium text-blue-600">{formatCurrency(stats.cashBalance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bank Balance</span>
                  <span className="font-medium text-blue-600">{formatCurrency(stats.bankBalance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Receivables</span>
                  <span className="font-medium text-orange-600">{formatCurrency(stats.outstandingReceivables)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payables</span>
                  <span className="font-medium text-red-600">{formatCurrency(stats.outstandingPayables)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Net Cash Position</span>
                    <span className="font-bold text-lg text-blue-600">
                      {formatCurrency(stats.cashBalance + stats.bankBalance + stats.outstandingReceivables - stats.outstandingPayables)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
                Create Voucher
              </Button>
              <Button className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
                View Reports
              </Button>
              <Button className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
                Manage Masters
              </Button>
              <Button className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
                AI Analysis
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};