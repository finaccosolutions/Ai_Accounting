import React, { useState } from 'react';
import { FileText, Download, Filter, Calendar, BarChart3, PieChart, TrendingUp, FileCheck } from 'lucide-react';
import { Button } from '../ui/Button';

const reportCategories = [
  { id: 'accounting', label: 'Accounting Reports', icon: FileText, color: 'blue' },
  { id: 'inventory', label: 'Inventory Reports', icon: BarChart3, color: 'green' },
  { id: 'tax', label: 'Tax Reports', icon: FileCheck, color: 'orange' },
  { id: 'compliance', label: 'Compliance Reports', icon: PieChart, color: 'purple' },
];

const accountingReports = [
  { id: 'trial_balance', name: 'Trial Balance', description: 'Summary of all ledger balances' },
  { id: 'profit_loss', name: 'Profit & Loss Account', description: 'Income and expense statement' },
  { id: 'balance_sheet', name: 'Balance Sheet', description: 'Assets, liabilities, and equity' },
  { id: 'day_book', name: 'Day Book', description: 'Daily transaction summary' },
  { id: 'ledger', name: 'Ledger', description: 'Individual ledger account details' },
  { id: 'cash_book', name: 'Cash/Bank Book', description: 'Cash and bank transaction details' },
];

const inventoryReports = [
  { id: 'stock_summary', name: 'Stock Summary', description: 'Current stock levels and values' },
  { id: 'stock_movement', name: 'Stock Movement', description: 'Stock in/out transactions' },
  { id: 'item_sales', name: 'Item-wise Sales', description: 'Sales analysis by items' },
  { id: 'godown_summary', name: 'Godown Summary', description: 'Location-wise stock details' },
];

const taxReports = [
  { id: 'gstr1', name: 'GSTR-1', description: 'Outward supplies report' },
  { id: 'gstr2a', name: 'GSTR-2A', description: 'Auto-populated inward supplies' },
  { id: 'gstr3b', name: 'GSTR-3B', description: 'Monthly return summary' },
  { id: 'gst_payable', name: 'GST Payable Summary', description: 'Tax liability summary' },
  { id: 'tds_summary', name: 'TDS Summary', description: 'Tax deduction summary' },
];

const complianceReports = [
  { id: 'audit_trail', name: 'Audit Trail', description: 'Transaction modification history' },
  { id: 'outstanding_receivables', name: 'Outstanding Receivables', description: 'Pending customer payments' },
  { id: 'outstanding_payables', name: 'Outstanding Payables', description: 'Pending vendor payments' },
  { id: 'aging_analysis', name: 'Aging Analysis', description: 'Age-wise outstanding analysis' },
];

export const Reports: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('accounting');
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');

  const getReportsByCategory = (category: string) => {
    switch (category) {
      case 'accounting': return accountingReports;
      case 'inventory': return inventoryReports;
      case 'tax': return taxReports;
      case 'compliance': return complianceReports;
      default: return accountingReports;
    }
  };

  const handleGenerateReport = (reportId: string) => {
    // Mock report generation
    console.log(`Generating report: ${reportId}`);
  };

  const handleExportReport = (reportId: string, format: 'pdf' | 'excel') => {
    // Mock export functionality
    console.log(`Exporting report: ${reportId} as ${format}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate comprehensive business reports</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="current_month">Current Month</option>
            <option value="current_quarter">Current Quarter</option>
            <option value="current_year">Current Year</option>
            <option value="custom">Custom Range</option>
          </select>
          <Button variant="outline" icon={Filter}>
            Filters
          </Button>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCategories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                isActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <Icon className={`w-8 h-8 mb-3 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
              <h3 className="font-medium text-gray-900">{category.label}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {getReportsByCategory(category.id).length} reports
              </p>
            </button>
          );
        })}
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {reportCategories.find(c => c.id === activeCategory)?.label}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getReportsByCategory(activeCategory).map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{report.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateReport(report.id)}
                  >
                    Generate
                  </Button>
                  <div className="relative group">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Download}
                    />
                    <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="p-2">
                        <button
                          onClick={() => handleExportReport(report.id, 'pdf')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                        >
                          Export PDF
                        </button>
                        <button
                          onClick={() => handleExportReport(report.id, 'excel')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                        >
                          Export Excel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Report Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sample Report Preview</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Print
            </Button>
            <Button variant="outline" size="sm" icon={Download}>
              Download
            </Button>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="text-center mb-4">
            <h4 className="text-lg font-bold text-gray-900">Demo Company Ltd.</h4>
            <p className="text-sm text-gray-600">Trial Balance</p>
            <p className="text-sm text-gray-600">As on 31st January 2024</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-r border-gray-300">
                    Particulars
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 border-r border-gray-300">
                    Debit (₹)
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                    Credit (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-300">Cash A/C</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right border-r border-gray-300">85,000</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">-</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-300">Bank A/C</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right border-r border-gray-300">12,00,000</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">-</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-300">Sundry Debtors</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right border-r border-gray-300">4,50,000</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">-</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-300">Sales A/C</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right border-r border-gray-300">-</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">25,00,000</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-300">Sundry Creditors</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right border-r border-gray-300">-</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">2,80,000</td>
                </tr>
                <tr className="bg-gray-100 font-medium">
                  <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-300">Total</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right border-r border-gray-300">27,80,000</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">27,80,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};