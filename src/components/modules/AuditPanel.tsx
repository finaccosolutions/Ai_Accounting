import React, { useState, useEffect } from 'react';
import { Shield, Search, Filter, Eye, Download, Calendar, User, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { generateAIInsights } from '../../lib/gemini';
import toast from 'react-hot-toast';

interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values: any;
  new_values: any;
  user_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface AuditInsight {
  type: 'warning' | 'suggestion' | 'info' | 'error';
  title: string;
  description: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
}

export const AuditPanel: React.FC = () => {
  const { user } = useAuth();
  const { currentCompany, userRole, selectedFinancialYears } = useApp();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [insights, setInsights] = useState<AuditInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [generatingInsights, setGeneratingInsights] = useState(false);

  const tables = [
    'all',
    'vouchers',
    'voucher_entries',
    'ledgers',
    'stock_items',
    'companies',
    'profiles'
  ];

  const actions = ['all', 'INSERT', 'UPDATE', 'DELETE'];

  useEffect(() => {
    if (currentCompany && (userRole === 'admin' || userRole === 'auditor')) {
      loadAuditLogs();
    }
  }, [currentCompany, userRole, selectedTable, selectedAction, dateRange]);

  const loadAuditLogs = async () => {
    try {
      if (!currentCompany) return;

      setLoading(true);

      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .eq('company_id', currentCompany.id)
        .gte('created_at', `${dateRange.from}T00:00:00`)
        .lte('created_at', `${dateRange.to}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (selectedTable !== 'all') {
        query = query.eq('table_name', selectedTable);
      }

      if (selectedAction !== 'all') {
        query = query.eq('action', selectedAction);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAuditLogs(data || []);
    } catch (error: any) {
      console.error('Error loading audit logs:', error);
      toast.error('Error loading audit logs');
    } finally {
      setLoading(false);
    }
  };

  const generateAuditInsights = async () => {
    try {
      if (!currentCompany || auditLogs.length === 0) return;

      setGeneratingInsights(true);

      // Prepare data for AI analysis
      const auditData = {
        logs: auditLogs.slice(0, 50), // Limit for API
        company: currentCompany,
        timeRange: dateRange,
        userActivity: auditLogs.reduce((acc, log) => {
          acc[log.user_id] = (acc[log.user_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        tableActivity: auditLogs.reduce((acc, log) => {
          acc[log.table_name] = (acc[log.table_name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };

      const aiInsights = await generateAIInsights(auditData);
      setInsights(aiInsights);
      toast.success('AI insights generated successfully');
    } catch (error: any) {
      console.error('Error generating audit insights:', error);
      toast.error('Error generating insights');
    } finally {
      setGeneratingInsights(false);
    }
  };

  const exportAuditLogs = () => {
    const csvContent = [
      ['Date', 'User', 'Table', 'Action', 'Record ID', 'IP Address'].join(','),
      ...auditLogs.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.profiles?.full_name || 'Unknown',
        log.table_name,
        log.action,
        log.record_id,
        log.ip_address || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${currentCompany?.name}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredLogs = auditLogs.filter(log =>
    log.table_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.profiles?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.profiles?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (userRole !== 'admin' && userRole !== 'auditor') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You need administrator or auditor privileges to access the audit panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Panel</h1>
          <p className="text-gray-600">Monitor and analyze system activity and changes</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            icon={Download} 
            onClick={exportAuditLogs}
            disabled={filteredLogs.length === 0}
          >
            Export Logs
          </Button>
          <Button 
            icon={Shield} 
            onClick={generateAuditInsights}
            loading={generatingInsights}
            disabled={auditLogs.length === 0}
          >
            Generate AI Insights
          </Button>
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Audit Insights</h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {insight.type === 'warning' && <Shield className="w-5 h-5 text-orange-500" />}
                  {insight.type === 'suggestion' && <FileText className="w-5 h-5 text-blue-500" />}
                  {insight.type === 'info' && <Eye className="w-5 h-5 text-gray-500" />}
                  {insight.type === 'error' && <Shield className="w-5 h-5 text-red-500" />}
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
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                  insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {insight.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Table</label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {tables.map(table => (
                <option key={table} value={table}>
                  {table === 'all' ? 'All Tables' : table}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {actions.map(action => (
                <option key={action} value={action}>
                  {action === 'all' ? 'All Actions' : action}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Audit Logs ({filteredLogs.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading audit logs...</p>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Record ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.profiles?.full_name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{log.profiles?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.table_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.action === 'INSERT' ? 'bg-green-100 text-green-800' :
                        log.action === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {log.record_id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.ip_address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Button variant="ghost" size="sm" icon={Eye}>
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Audit Logs Found</h3>
            <p className="text-gray-500">No activity found for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};