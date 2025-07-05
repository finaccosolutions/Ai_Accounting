import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { geminiAI } from '../../lib/gemini';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  FileText, 
  Plus, 
  Bot, 
  Save, 
  Trash2, 
  Calculator,
  Calendar,
  Hash,
  DollarSign,
  MessageSquare,
  Sparkles,
  Search,
  Filter,
  Upload,
  FileImage,
  Eye,
  CheckCircle,
  AlertCircle,
  Wand2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface VoucherEntry {
  id?: string;
  ledger_id: string;
  ledger_name?: string;
  debit_amount: number;
  credit_amount: number;
  narration?: string;
}

interface Voucher {
  voucher_type: string;
  voucher_number: string;
  date: string;
  reference?: string;
  narration?: string;
  entries: VoucherEntry[];
}

const voucherTypes = [
  { value: 'sales', label: 'Sales', color: 'from-green-500 to-green-600', icon: '💰' },
  { value: 'purchase', label: 'Purchase', color: 'from-blue-500 to-blue-600', icon: '🛒' },
  { value: 'receipt', label: 'Receipt', color: 'from-emerald-500 to-emerald-600', icon: '📥' },
  { value: 'payment', label: 'Payment', color: 'from-red-500 to-red-600', icon: '📤' },
  { value: 'journal', label: 'Journal', color: 'from-purple-500 to-purple-600', icon: '📝' },
  { value: 'contra', label: 'Contra', color: 'from-orange-500 to-orange-600', icon: '🔄' },
  { value: 'debit_note', label: 'Debit Note', color: 'from-pink-500 to-pink-600', icon: '📋' },
  { value: 'credit_note', label: 'Credit Note', color: 'from-indigo-500 to-indigo-600', icon: '📄' }
];

export const VoucherEntry: React.FC = () => {
  const { selectedCompany } = useApp();
  const [entryMode, setEntryMode] = useState<'manual' | 'ai' | 'pdf'>('manual');
  const [voucher, setVoucher] = useState<Voucher>({
    voucher_type: 'sales',
    voucher_number: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    narration: '',
    entries: [
      { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' },
      { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' }
    ]
  });
  
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [aiCommand, setAiCommand] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [showAiPreview, setShowAiPreview] = useState(false);
  const [aiPreview, setAiPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [recentVouchers, setRecentVouchers] = useState<any[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfProcessing, setPdfProcessing] = useState(false);

  useEffect(() => {
    if (selectedCompany) {
      fetchLedgers();
      fetchRecentVouchers();
      generateVoucherNumber();
    }
  }, [selectedCompany, voucher.voucher_type]);

  const fetchLedgers = async () => {
    try {
      const { data, error } = await supabase
        .from('ledgers')
        .select('id, name, group_id')
        .eq('company_id', selectedCompany?.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setLedgers(data || []);
    } catch (error) {
      console.error('Error fetching ledgers:', error);
      toast.error('Failed to fetch ledgers');
    }
  };

  const fetchRecentVouchers = async () => {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('company_id', selectedCompany?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentVouchers(data || []);
    } catch (error) {
      console.error('Error fetching recent vouchers:', error);
    }
  };

  const generateVoucherNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('voucher_number')
        .eq('company_id', selectedCompany?.id)
        .eq('voucher_type', voucher.voucher_type)
        .order('voucher_number', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastNumber = parseInt(data[0].voucher_number.replace(/\D/g, ''));
        nextNumber = lastNumber + 1;
      }

      const prefix = voucher.voucher_type.toUpperCase().substring(0, 2);
      const newVoucherNumber = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
      
      setVoucher(prev => ({ ...prev, voucher_number: newVoucherNumber }));
    } catch (error) {
      console.error('Error generating voucher number:', error);
    }
  };

  const handleAiCommand = async () => {
    if (!aiCommand.trim()) return;

    setAiProcessing(true);
    try {
      const result = await geminiAI.parseVoucherCommand(aiCommand);
      if (result) {
        setAiPreview(result);
        setShowAiPreview(true);
        toast.success('AI analysis complete! Review the preview below.');
      } else {
        toast.error('Could not understand the command. Please try again with more details.');
      }
    } catch (error) {
      console.error('AI processing error:', error);
      toast.error('AI processing failed. Please try again.');
    } finally {
      setAiProcessing(false);
    }
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setPdfFile(file);
    setPdfProcessing(true);

    try {
      // In a real implementation, you would extract text from PDF
      // For now, we'll simulate this with a placeholder
      const extractedText = `Invoice #INV-2024-001
Date: ${new Date().toLocaleDateString()}
To: ABC Company Ltd
Amount: ₹50,000
CGST: ₹4,500
SGST: ₹4,500
Total: ₹59,000
Items: Office Supplies - 1 Qty @ ₹50,000`;

      const result = await geminiAI.parsePDFInvoice(extractedText);
      if (result) {
        setAiPreview(result);
        setShowAiPreview(true);
        setEntryMode('pdf');
        toast.success('PDF processed successfully! Review the extracted data.');
      } else {
        toast.error('Could not extract data from PDF. Please try manual entry.');
      }
    } catch (error) {
      console.error('PDF processing error:', error);
      toast.error('Failed to process PDF. Please try again.');
    } finally {
      setPdfProcessing(false);
    }
  };

  const applyAiPreview = () => {
    if (!aiPreview) return;

    // Map AI response to voucher format
    const mappedEntries = aiPreview.ledger_entries?.map((entry: any) => ({
      ledger_id: '', // Will need to be mapped to actual ledger IDs
      ledger_name: entry.ledger_name,
      debit_amount: entry.debit_amount || 0,
      credit_amount: entry.credit_amount || 0,
      narration: entry.narration || ''
    })) || voucher.entries;

    setVoucher(prev => ({
      ...prev,
      voucher_type: aiPreview.voucher_type || prev.voucher_type,
      narration: aiPreview.narration || prev.narration,
      reference: aiPreview.reference || aiPreview.invoice_number || prev.reference,
      entries: mappedEntries
    }));

    setShowAiPreview(false);
    setAiCommand('');
    toast.success('AI suggestions applied successfully! Please verify and map ledgers.');
  };

  const addEntry = () => {
    setVoucher(prev => ({
      ...prev,
      entries: [...prev.entries, { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' }]
    }));
  };

  const removeEntry = (index: number) => {
    if (voucher.entries.length > 2) {
      setVoucher(prev => ({
        ...prev,
        entries: prev.entries.filter((_, i) => i !== index)
      }));
    }
  };

  const updateEntry = (index: number, field: string, value: any) => {
    setVoucher(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const calculateTotals = () => {
    const totalDebit = voucher.entries.reduce((sum, entry) => sum + (entry.debit_amount || 0), 0);
    const totalCredit = voucher.entries.reduce((sum, entry) => sum + (entry.credit_amount || 0), 0);
    return { totalDebit, totalCredit };
  };

  const saveVoucher = async () => {
    const { totalDebit, totalCredit } = calculateTotals();
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast.error('Debit and Credit amounts must be equal');
      return;
    }

    if (!selectedCompany) {
      toast.error('Please select a company');
      return;
    }

    setLoading(true);
    try {
      // Save voucher
      const { data: voucherData, error: voucherError } = await supabase
        .from('vouchers')
        .insert([{
          company_id: selectedCompany.id,
          voucher_type: voucher.voucher_type,
          voucher_number: voucher.voucher_number,
          date: voucher.date,
          reference: voucher.reference,
          narration: voucher.narration,
          total_amount: totalDebit
        }])
        .select()
        .single();

      if (voucherError) throw voucherError;

      // Save voucher entries
      const entries = voucher.entries
        .filter(entry => entry.ledger_id && (entry.debit_amount > 0 || entry.credit_amount > 0))
        .map(entry => ({
          voucher_id: voucherData.id,
          ledger_id: entry.ledger_id,
          debit_amount: entry.debit_amount || 0,
          credit_amount: entry.credit_amount || 0,
          narration: entry.narration
        }));

      const { error: entriesError } = await supabase
        .from('voucher_entries')
        .insert(entries);

      if (entriesError) throw entriesError;

      toast.success('Voucher saved successfully!');
      
      // Reset form
      setVoucher({
        voucher_type: voucher.voucher_type,
        voucher_number: '',
        date: new Date().toISOString().split('T')[0],
        reference: '',
        narration: '',
        entries: [
          { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' },
          { ledger_id: '', debit_amount: 0, credit_amount: 0, narration: '' }
        ]
      });
      
      generateVoucherNumber();
      fetchRecentVouchers();
      setEntryMode('manual');
      setPdfFile(null);
    } catch (error) {
      console.error('Error saving voucher:', error);
      toast.error('Failed to save voucher');
    } finally {
      setLoading(false);
    }
  };

  const { totalDebit, totalCredit } = calculateTotals();
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voucher Entry</h1>
          <p className="text-gray-600">Create and manage accounting vouchers with AI assistance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            Search Vouchers
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Voucher Entry Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Entry Mode Selection */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Choose Entry Method</h3>
            <div className="grid grid-cols-3 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEntryMode('manual')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  entryMode === 'manual'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Manual Entry</span>
                <p className="text-xs text-gray-500 mt-1">Traditional form entry</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEntryMode('ai')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  entryMode === 'ai'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <Bot className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">AI Assisted</span>
                <p className="text-xs text-gray-500 mt-1">Natural language entry</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEntryMode('pdf')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  entryMode === 'pdf'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <FileImage className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">PDF Upload</span>
                <p className="text-xs text-gray-500 mt-1">Extract from invoice</p>
              </motion.button>
            </div>
          </Card>

          {/* AI Assistant */}
          {entryMode === 'ai' && (
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Voucher Assistant</h3>
                  <p className="text-sm text-gray-600">Describe your transaction in natural language</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <textarea
                  value={aiCommand}
                  onChange={(e) => setAiCommand(e.target.value)}
                  placeholder="Example: 'Record a sales voucher for ₹50,000 to ABC Ltd for office supplies with 18% GST'"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleAiCommand}
                    disabled={aiProcessing || !aiCommand.trim()}
                    className="bg-gradient-to-r from-purple-500 to-blue-600"
                  >
                    {aiProcessing ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Sparkles className="w-5 h-5 mr-2" />
                    )}
                    {aiProcessing ? 'Processing...' : 'Generate Voucher'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* PDF Upload */}
          {entryMode === 'pdf' && (
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">PDF Invoice Processing</h3>
                  <p className="text-sm text-gray-600">Upload invoice or bill to extract data automatically</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload PDF invoice or bill</p>
                    <p className="text-sm text-gray-500">Supports PDF files up to 10MB</p>
                  </label>
                </div>
                
                {pdfFile && (
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                    <FileImage className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">{pdfFile.name}</span>
                    {pdfProcessing && (
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* AI Preview Modal */}
          <AnimatePresence>
            {showAiPreview && aiPreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              >
                <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">AI Generated Preview</h3>
                        <p className="text-sm text-gray-600">Review and confirm the extracted data</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={applyAiPreview} className="bg-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Apply
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAiPreview(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Voucher Type</label>
                        <p className="text-lg font-semibold capitalize">{aiPreview.voucher_type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Amount</label>
                        <p className="text-lg font-semibold">₹{aiPreview.amount?.toLocaleString() || aiPreview.total_amount?.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {aiPreview.party && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Party</label>
                        <p className="font-medium">{aiPreview.party || aiPreview.vendor_customer}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Narration</label>
                      <p className="text-gray-900">{aiPreview.narration}</p>
                    </div>
                    
                    {aiPreview.ledger_entries && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Ledger Entries</label>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">Ledger</th>
                                <th className="text-right py-2">Debit</th>
                                <th className="text-right py-2">Credit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {aiPreview.ledger_entries.map((entry: any, index: number) => (
                                <tr key={index} className="border-b">
                                  <td className="py-2">{entry.ledger_name}</td>
                                  <td className="py-2 text-right">₹{entry.debit_amount?.toFixed(2) || '0.00'}</td>
                                  <td className="py-2 text-right">₹{entry.credit_amount?.toFixed(2) || '0.00'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {aiPreview.items && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Items</label>
                        <div className="space-y-2">
                          {aiPreview.items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span>{item.name || item.description}</span>
                              <span>{item.quantity} × ₹{item.rate} = ₹{item.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voucher Form */}
          <Card className="p-6">
            {/* Voucher Type Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {voucherTypes.map((type) => (
                <motion.button
                  key={type.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setVoucher(prev => ({ ...prev, voucher_type: type.value }))}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    voucher.voucher_type === type.value
                      ? `border-blue-500 bg-gradient-to-r ${type.color} text-white shadow-lg`
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <span className="text-sm font-medium">{type.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Voucher Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Voucher Number
                </label>
                <Input
                  value={voucher.voucher_number}
                  onChange={(e) => setVoucher(prev => ({ ...prev, voucher_number: e.target.value }))}
                  placeholder="Auto-generated"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </label>
                <Input
                  type="date"
                  value={voucher.date}
                  onChange={(e) => setVoucher(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference
                </label>
                <Input
                  value={voucher.reference}
                  onChange={(e) => setVoucher(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="Reference number"
                />
              </div>
            </div>

            {/* Voucher Entries */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Voucher Entries</h3>
                <Button size="sm" onClick={addEntry}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Entry
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Ledger</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-700">Debit</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-700">Credit</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Narration</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {voucher.entries.map((entry, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 px-3">
                          <select
                            value={entry.ledger_id}
                            onChange={(e) => updateEntry(index, 'ledger_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select Ledger</option>
                            {ledgers.map((ledger) => (
                              <option key={ledger.id} value={ledger.id}>
                                {ledger.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <Input
                            type="number"
                            step="0.01"
                            value={entry.debit_amount || ''}
                            onChange={(e) => updateEntry(index, 'debit_amount', parseFloat(e.target.value) || 0)}
                            className="text-right"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <Input
                            type="number"
                            step="0.01"
                            value={entry.credit_amount || ''}
                            onChange={(e) => updateEntry(index, 'credit_amount', parseFloat(e.target.value) || 0)}
                            className="text-right"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <Input
                            value={entry.narration || ''}
                            onChange={(e) => updateEntry(index, 'narration', e.target.value)}
                            placeholder="Entry narration"
                          />
                        </td>
                        <td className="py-2 px-3">
                          {voucher.entries.length > 2 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeEntry(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 font-semibold">
                      <td className="py-3 px-3">Total</td>
                      <td className="py-3 px-3 text-right">₹{totalDebit.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right">₹{totalCredit.toFixed(2)}</td>
                      <td className="py-3 px-3"></td>
                      <td className="py-3 px-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {!isBalanced && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-600 text-sm">
                    Difference: ₹{Math.abs(totalDebit - totalCredit).toFixed(2)} - Debit and Credit must be equal
                  </p>
                </div>
              )}

              {isBalanced && totalDebit > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-green-600 text-sm">
                    Voucher is balanced - Ready to save
                  </p>
                </div>
              )}
            </div>

            {/* Narration */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Voucher Narration
              </label>
              <textarea
                value={voucher.narration}
                onChange={(e) => setVoucher(prev => ({ ...prev, narration: e.target.value }))}
                placeholder="Enter voucher narration..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline">
                Cancel
              </Button>
              <Button 
                onClick={saveVoucher}
                disabled={!isBalanced || loading}
                className="bg-gradient-to-r from-green-500 to-green-600"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Voucher
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Today's Vouchers</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">This Month</span>
                <span className="font-semibold">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending</span>
                <span className="font-semibold text-orange-600">3</span>
              </div>
            </div>
          </Card>

          {/* Recent Vouchers */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Vouchers</h3>
            <div className="space-y-3">
              {recentVouchers.map((voucher) => (
                <div key={voucher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{voucher.voucher_number}</p>
                    <p className="text-xs text-gray-500 capitalize">{voucher.voucher_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">₹{voucher.total_amount}</p>
                    <p className="text-xs text-gray-500">{new Date(voucher.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                View All Vouchers
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calculator className="w-4 h-4 mr-2" />
                Trial Balance
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <DollarSign className="w-4 h-4 mr-2" />
                Day Book
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};