import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Shield,
  BarChart3,
  FileText,
  Users,
  Calendar,
  Download,
  Bot,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader,
  RefreshCw,
  ClipboardList,
  Repeat,
  ListChecks,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { geminiAI } from '../../lib/gemini';
import { Voucher, Ledger } from '../../types';

interface AuditCheck {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const auditChecks: AuditCheck[] = [
  {
    id: 'data_consistency',
    name: 'Data Consistency',
    description: 'Analyze for missing or inconsistent data entries.',
    icon: ListChecks,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'duplicate_entries',
    name: 'Duplicate Entries',
    description: 'Identify potentially duplicate vouchers or transactions.',
    icon: Repeat,
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'voucher_sequence',
    name: 'Voucher Sequence',
    description: 'Check for gaps or irregularities in voucher numbering.',
    icon: ClipboardList,
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'ai_full_analysis',
    name: 'AI Full Analysis',
    description: 'Comprehensive AI-powered audit insights across all data.',
    icon: Sparkles,
    color: 'from-red-500 to-pink-600',
  },
];

export const AuditPanel: React.FC = () => {
  const { selectedCompany } = useApp();
  const [loading, setLoading] = useState(false);
  const [auditData, setAuditData] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [selectedCheck, setSelectedCheck] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    auditChecks: true,
    aiInsights: true,
  });

  useEffect(() => {
    if (selectedCompany) {
      fetchAuditData();
    }
  }, [selectedCompany, dateRange]);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const { data: vouchers, error: vouchersError } = await supabase
        .from('vouchers')
        .select(`
          id, voucher_type, voucher_number, date, total_amount, narration, reference,
          voucher_entries(id, ledger_id, debit_amount, credit_amount, narration)
        `)
        .eq('company_id', selectedCompany?.id)
        .gte('date', dateRange.from)
        .lte('date', dateRange.to)
        .order('date', { ascending: true });

      if (vouchersError) throw vouchersError;

      const { data: ledgers, error: ledgersError } = await supabase
        .from('ledgers')
        .select(`id, name, current_balance, opening_balance, ledger_groups(name, group_type)`)
        .eq('company_id', selectedCompany?.id);

      if (ledgersError) throw ledgersError;

      const { data: auditTrail, error: auditTrailError } = await supabase
        .from('audit_trail')
        .select('*')
        .eq('company_id', selectedCompany?.id)
        .gte('changed_at', dateRange.from)
        .lte('changed_at', dateRange.to);

      if (auditTrailError) throw auditTrailError;

      setAuditData({ vouchers, ledgers, auditTrail });
    } catch (error) {
      console.error('Error fetching audit data:', error);
      toast.error('Failed to fetch audit data');
    } finally {
      setLoading(false);
    }
  };

  const runAuditCheck = async (checkId: string) => {
    if (!auditData) {
      toast.error('No data available for audit. Please select a company and date range.');
      return;
    }

    setLoading(true);
    setSelectedCheck(checkId);
    setAiAnalysis(''); // Clear previous AI analysis

    try {
      let insights = '';
      switch (checkId) {
        case 'data_consistency':
          insights = await geminiAI.auditAnalysis(auditData.vouchers, auditData.ledgers, 'data_consistency');
          break;
        case 'duplicate_entries':
          insights = await geminiAI.auditAnalysis(auditData.vouchers, auditData.ledgers, 'duplicate_entries');
          break;
        case 'voucher_sequence':
          insights = await geminiAI.auditAnalysis(auditData.vouchers, auditData.ledgers, 'voucher_sequence');
          break;
        case 'ai_full_analysis':
          insights = await geminiAI.auditAnalysis(auditData.vouchers, auditData.ledgers, 'full_analysis', auditData.auditTrail);
          break;
        default:
          insights = 'No specific AI analysis available for this check yet.';
      }
      setAiAnalysis(insights);
      toast.success(`Audit check "${checkId.replace(/_/g, ' ')}" completed!`);
    } catch (error) {
      console.error(`Error running audit check ${checkId}:`, error);
      toast.error(`Failed to run audit check "${checkId.replace(/_/g, ' ')}".`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderAuditContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
          />
        </div>
      );
    }

    if (!selectedCheck) {
      return (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Select an Audit Check</h3>
          <p className="text-gray-600">Choose an audit check from the left panel to begin analysis.</p>
        </div>
      );
    }

    const currentAuditCheck = auditChecks.find(check => check.id === selectedCheck);

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          {currentAuditCheck && (
            <currentAuditCheck.icon className={`w-8 h-8 ${currentAuditCheck.color.split(' ')[0].replace('from-', 'text-')}`} />
          )}
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{currentAuditCheck?.name}</h3>
            <p className="text-gray-600">{currentAuditCheck?.description}</p>
          </div>
        </div>

        {aiAnalysis ? (
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">AI Insights</h4>
                <div className="text-sm text-gray-700 whitespace-pre-line">{aiAnalysis}</div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Run the audit check to generate AI insights.</p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export to PDF
          </Button>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-16 h-16 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-2xl flex items-center justify-center shadow-xl"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-orange-800 bg-clip-text text-transparent mb-2">
                Audit Panel
              </h1>
              <p className="text-gray-600 text-lg">
                Comprehensive audit and compliance tools with AI assistance.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
            <Button onClick={fetchAuditData} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Audit Checks Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Audit Checks</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleSection('auditChecks')}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {expandedSections.auditChecks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </motion.button>
              </div>
              <AnimatePresence>
                {expandedSections.auditChecks && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 mt-4">
                      {auditChecks.map((check, index) => {
                        const Icon = check.icon;
                        const isActive = selectedCheck === check.id;
                        return (
                          <motion.button
                            key={check.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => runAuditCheck(check.id)}
                            className={`w-full p-3 rounded-xl text-left transition-all duration-300 ${
                              isActive
                                ? `bg-gradient-to-r ${check.color} text-white shadow-lg`
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className="w-5 h-5" />
                              <div>
                                <p className="font-medium text-sm">{check.name}</p>
                                <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                                  {check.description}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          {/* Audit Content Area */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {renderAuditContent()}
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
