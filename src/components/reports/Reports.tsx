import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { GeminiAI } from '../../lib/gemini';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  BarChart3, 
  FileText, 
  TrendingUp, 
  Calculator, 
  Receipt, 
  DollarSign,
  Calendar,
  Download,
  Eye,
  Bot,
  Sparkles,
  Filter,
  Search,
  PieChart,
  Activity,
  CreditCard,
  Building2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import toast from 'react-hot-toast';

const reportCategories = [
  {
    id: 'accounting',
    name: 'Accounting Reports',
    icon: Calculator,
    color: 'from-blue-500 to-blue-600',
    reports: [
      { id: 'trial_balance', name: 'Trial Balance', description: 'Summary of all ledger balances' },
      { id: 'profit_loss', name: 'Profit & Loss', description: 'Income and expense statement' },
      { id: 'balance_sheet', name: 'Balance Sheet', description: 'Assets, liabilities and equity' },
      { id: 'day_book', name: 'Day Book', description: 'Daily transaction summary' },
      { id: 'ledger', name: 'Ledger Report', description: 'Individual ledger statements' },
      { id: 'cash_book', name: 'Cash/Bank Book', description: 'Cash and bank transactions' }
    ]
  },
  {
    id: 'inventory',
    name: 'Inventory Reports',
    icon: Receipt,
    color: 'from-green-500 to-green-600',
    reports: [
      { id: 'stock_summary', name: 'Stock Summary', description: 'Current stock positions' },
      { id: 'stock_movement', name: 'Stock Movement', description: 'Stock in/out transactions' },
      { id: 'item_wise_sales', name: 'Item-wise Sales', description: 'Sales analysis by item' },
      { id: 'godown_summary', name: 'Godown Summary', description: 'Stock by location' }
    ]
  },
  {
    id: 'tax',
    name: 'Tax & Compliance',
    icon: FileText,
    color: 'from-purple-500 to-purple-600',
    reports: [
      { id: 'gstr1', name: 'GSTR-1', description: 'Outward supplies return' },
      { id: 'gstr3b', name: 'GSTR-3B', description: 'Monthly return summary' },
      { id: 'gst_payable', name: 'GST Payable', description: 'Tax liability summary' },
      { id: 'tds_summary', name: 'TDS Summary', description: 'Tax deducted at source' },
      { id: 'tcs_summary', name: 'TCS Summary', description: 'Tax collected at source' }
    ]
  },
  {
    id: 'analysis',
    name: 'Business Analysis',
    icon: TrendingUp,
    color: 'from-orange-500 to-orange-600',
    reports: [
      { id: 'sales_analysis', name: 'Sales Analysis', description: 'Sales trends and patterns' },
      { id: 'expense_analysis', name: 'Expense Analysis', description: 'Expense breakdown' },
      { id: 'customer_analysis', name: 'Customer Analysis', description: 'Top customers and receivables' },
      { id: 'vendor_analysis', name: 'Vendor Analysis', description: 'Vendor performance and payables' }
    ]
  }
];

export const Reports: React.FC = () => {
  const { selectedCompany } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('accounting');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 3, 1).toISOString().split('T')[0], // Financial year start
    to: new Date().toISOString().split('T')[0]
  });
  const [aiInsights, setAiInsights] = useState<string>('');
  const [showAiInsights, setShowAiInsights] = useState(false);

  const gemini = new GeminiAI(import.meta.env.VITE_GEMINI_API_KEY);

  const generateReport = async (reportId: string) => {
    if (!selectedCompany) {
      toast.error('Please select a company');
      return;
    }

    setLoading(true);
    setSelectedReport(reportId);
    
    try {
      let data;
      
      switch (reportId) {
        case 'trial_balance':
          data = await generateTrialBalance();
          break;
        case 'profit_loss':
          data = await generateProfitLoss();
          break;
        case 'balance_sheet':
          data = await generateBalanceSheet();
          break;
        case 'day_book':
          data = await generateDayBook();
          break;
        case 'stock_summary':
          data = await generateStockSummary();
          break;
        case 'sales_analysis':
          data = await generateSalesAnalysis();
          break;
        default:
          data = { message: 'Report generation in progress...', type: 'info' };
      }
      
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const generateTrialBalance = async () => {
    const { data: ledgers, error } = await supabase
      .from('ledgers')
      .select(`
        id, name, opening_balance, current_balance,
        ledger_groups(name, group_type)
      `)
      .eq('company_id', selectedCompany?.id)
      .eq('is_active', true);

    if (error) throw error;

    const trialBalance = ledgers?.map(ledger => ({
      ledger_name: ledger.name,
      group_name: ledger.ledger_groups?.name || 'Ungrouped',
      group_type: ledger.ledger_groups?.group_type || 'assets',
      opening_balance: ledger.opening_balance || 0,
      current_balance: ledger.current_balance || 0,
      debit_balance: (ledger.current_balance || 0) > 0 ? ledger.current_balance : 0,
      credit_balance: (ledger.current_balance || 0) < 0 ? Math.abs(ledger.current_balance || 0) : 0
    })) || [];

    const totalDebit = trialBalance.reduce((sum, item) => sum + item.debit_balance, 0);
    const totalCredit = trialBalance.reduce((sum, item) => sum + item.credit_balance, 0);

    return {
      type: 'trial_balance',
      data: trialBalance,
      summary: { totalDebit, totalCredit, difference: totalDebit - totalCredit }
    };
  };

  const generateProfitLoss = async () => {
    const { data: ledgers, error } = await supabase
      .from('ledgers')
      .select(`
        id, name, current_balance,
        ledger_groups(name, group_type)
      `)
      .eq('company_id', selectedCompany?.id)
      .in('ledger_groups.group_type', ['income', 'expenses']);

    if (error) throw error;

    const income = ledgers?.filter(l => l.ledger_groups?.group_type === 'income') || [];
    const expenses = ledgers?.filter(l => l.ledger_groups?.group_type === 'expenses') || [];

    const totalIncome = income.reduce((sum, item) => sum + Math.abs(item.current_balance || 0), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + Math.abs(item.current_balance || 0), 0);
    const netProfit = totalIncome - totalExpenses;

    return {
      type: 'profit_loss',
      data: { income, expenses },
      summary: { totalIncome, totalExpenses, netProfit }
    };
  };

  const generateBalanceSheet = async () => {
    const { data: ledgers, error } = await supabase
      .from('ledgers')
      .select(`
        id, name, current_balance,
        ledger_groups(name, group_type)
      `)
      .eq('company_id', selectedCompany?.id)
      .in('ledger_groups.group_type', ['assets', 'liabilities']);

    if (error) throw error;

    const assets = ledgers?.filter(l => l.ledger_groups?.group_type === 'assets') || [];
    const liabilities = ledgers?.filter(l => l.ledger_groups?.group_type === 'liabilities') || [];

    const totalAssets = assets.reduce((sum, item) => sum + Math.abs(item.current_balance || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, item) => sum + Math.abs(item.current_balance || 0), 0);

    return {
      type: 'balance_sheet',
      data: { assets, liabilities },
      summary: { totalAssets, totalLiabilities, difference: totalAssets - totalLiabilities }
    };
  };

  const generateDayBook = async () => {
    const { data: vouchers, error } = await supabase
      .from('vouchers')
      .select(`
        id, voucher_type, voucher_number, date, total_amount, narration,
        voucher_entries(
          debit_amount, credit_amount,
          ledgers(name)
        )
      `)
      .eq('company_id', selectedCompany?.id)
      .gte('date', dateRange.from)
      .lte('date', dateRange.to)
      .order('date', { ascending: false });

    if (error) throw error;

    return {
      type: 'day_book',
      data: vouchers || [],
      summary: {
        totalVouchers: vouchers?.length || 0,
        totalAmount: vouchers?.reduce((sum, v) => sum + (v.total_amount || 0), 0) || 0
      }
    };
  };

  const generateStockSummary = async () => {
    const { data: stockItems, error } = await supabase
      .from('stock_items')
      .select(`
        id, name, current_stock, rate,
        stock_groups(name),
        units(name, symbol)
      `)
      .eq('company_id', selectedCompany?.id)
      .eq('is_active', true);

    if (error) throw error;

    const stockSummary = stockItems?.map(item => ({
      item_name: item.name,
      group_name: item.stock_groups?.name || 'Ungrouped',
      current_stock: item.current_stock || 0,
      rate: item.rate || 0,
      value: (item.current_stock || 0) * (item.rate || 0),
      unit: item.units?.symbol || 'Nos'
    })) || [];

    const totalValue = stockSummary.reduce((sum, item) => sum + item.value, 0);

    return {
      type: 'stock_summary',
      data: stockSummary,
      summary: { totalItems: stockSummary.length, totalValue }
    };
  };

  const generateSalesAnalysis = async () => {
    const { data: salesVouchers, error } = await supabase
      .from('vouchers')
      .select('date, total_amount')
      .eq('company_id', selectedCompany?.id)
      .eq('voucher_type', 'sales')
      .gte('date', dateRange.from)
      .lte('date', dateRange.to)
      .order('date');

    if (error) throw error;

    // Group by month
    const monthlyData = salesVouchers?.reduce((acc: any, voucher) => {
      const month = new Date(voucher.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!acc[month]) {
        acc[month] = { month, sales: 0, count: 0 };
      }
      acc[month].sales += voucher.total_amount || 0;
      acc[month].count += 1;
      return acc;
    }, {}) || {};

    const chartData = Object.values(monthlyData);
    const totalSales = salesVouchers?.reduce((sum, v) => sum + (v.total_amount || 0), 0) || 0;

    return {
      type: 'sales_analysis',
      data: chartData,
      summary: { totalSales, totalVouchers: salesVouchers?.length || 0 }
    };
  };

  const generateAiInsights = async () => {
    if (!reportData) return;

    try {
      const insights = await gemini.analyzeReport(reportData, selectedReport || 'general');
      setAiInsights(insights);
      setShowAiInsights(true);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast.error('Failed to generate AI insights');
    }
  };

  const currentCategory = reportCategories.find(cat => cat.id === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive business reports</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-auto"
            />
            <span className="text-gray-500">to</span>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-auto"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Categories */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Report Categories</h3>
            <div className="space-y-2">
              {reportCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedCategory === category.id
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{category.name}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Report List & Content */}
        <div className="lg:col-span-3">
          {!selectedReport ? (
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                {currentCategory && <currentCategory.icon className="w-6 h-6 text-gray-600" />}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentCategory?.name}</h3>
                  <p className="text-sm text-gray-600">Select a report to generate</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentCategory?.reports.map((report) => (
                  <motion.div
                    key={report.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => generateReport(report.id)}
                    className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {report.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      </div>
                      <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Report Header */}
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {currentCategory?.reports.find(r => r.id === selectedReport)?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Generated on {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={generateAiInsights}
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      AI Insights
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      onClick={() => setSelectedReport(null)}
                      variant="outline"
                      size="sm"
                    >
                      Back
                    </Button>
                  </div>
                </div>
              </Card>

              {/* AI Insights */}
              {showAiInsights && aiInsights && (
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">AI Insights</h4>
                      <div className="text-sm text-gray-700 whitespace-pre-line">{aiInsights}</div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Report Content */}
              <Card className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <ReportContent reportData={reportData} />
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Report Content Component
const ReportContent: React.FC<{ reportData: any }> = ({ reportData }) => {
  if (!reportData) return null;

  const renderChart = () => {
    if (reportData.type === 'sales_analysis' && reportData.data) {
      return (
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Sales']} />
              <Bar dataKey="sales" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    return null;
  };

  const renderTable = () => {
    switch (reportData.type) {
      case 'trial_balance':
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Ledger Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Group</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Debit</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Credit</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data?.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4">{item.ledger_name}</td>
                    <td className="py-3 px-4">{item.group_name}</td>
                    <td className="py-3 px-4 text-right">₹{item.debit_balance.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">₹{item.credit_balance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 font-semibold">
                  <td className="py-3 px-4" colSpan={2}>Total</td>
                  <td className="py-3 px-4 text-right">₹{reportData.summary?.totalDebit.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">₹{reportData.summary?.totalCredit.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        );

      case 'day_book':
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Voucher No.</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Narration</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data?.map((voucher: any) => (
                  <tr key={voucher.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">{new Date(voucher.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{voucher.voucher_number}</td>
                    <td className="py-3 px-4 capitalize">{voucher.voucher_type}</td>
                    <td className="py-3 px-4 text-right">₹{voucher.total_amount?.toFixed(2)}</td>
                    <td className="py-3 px-4">{voucher.narration || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Report data will be displayed here</p>
          </div>
        );
    }
  };

  return (
    <div>
      {renderChart()}
      {reportData.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(reportData.summary).map(([key, value]: [string, any]) => (
            <div key={key} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {typeof value === 'number' ? `₹${value.toFixed(2)}` : value}
              </p>
            </div>
          ))}
        </div>
      )}
      {renderTable()}
    </div>
  );
};