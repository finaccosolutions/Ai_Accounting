import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { 
  Edit, 
  Bot, 
  FileText, 
  Upload,
  Sparkles,
  MessageSquare,
  Camera,
  FileImage,
  Wand2,
  Send
} from 'lucide-react';

const entryMethods = [
  {
    value: 'manual',
    label: 'Manual Entry',
    icon: Edit,
    description: 'Traditional manual data entry',
    color: 'from-slate-500 to-slate-600',
    textColor: 'text-slate-600',
    bgColor: 'bg-slate-50'
  },
  {
    value: 'ai_assisted',
    label: 'AI Assisted',
    icon: Bot,
    description: 'AI helps with smart suggestions',
    color: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    value: 'pdf_upload',
    label: 'Upload PDF',
    icon: FileText,
    description: 'Extract data from PDF documents',
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50'
  }
];

interface EntryMethodSelectorProps {
  currentMethod: string;
  onMethodChange: (method: string) => void;
  voucher: any;
  onVoucherChange: (voucher: any) => void;
}

export const EntryMethodSelector: React.FC<EntryMethodSelectorProps> = ({
  currentMethod,
  onMethodChange,
  voucher,
  onVoucherChange
}) => {
  const [aiCommand, setAiCommand] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingPDF, setProcessingPDF] = useState(false);

  const currentMethodData = entryMethods.find(method => method.value === currentMethod);

  const handleAiCommand = async () => {
    if (!aiCommand.trim()) return;

    setAiProcessing(true);
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock AI response - in real implementation, this would call the Gemini AI
      const mockResponse = {
        voucher_type: 'payment',
        amount: 5000,
        party_name: 'ABC Suppliers',
        narration: aiCommand,
        entries: [
          { ledger_name: 'ABC Suppliers', debit_amount: 5000, credit_amount: 0 },
          { ledger_name: 'Cash Account', debit_amount: 0, credit_amount: 5000 }
        ]
      };

      // Update voucher with AI suggestions
      onVoucherChange(prev => ({
        ...prev,
        voucher_type: mockResponse.voucher_type,
        party_name: mockResponse.party_name,
        narration: mockResponse.narration,
        entries: mockResponse.entries.map(entry => ({
          ledger_id: '',
          ledger_name: entry.ledger_name,
          debit_amount: entry.debit_amount,
          credit_amount: entry.credit_amount,
          narration: ''
        }))
      }));

      setAiCommand('');
    } catch (error) {
      console.error('AI processing error:', error);
    } finally {
      setAiProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setProcessingPDF(true);

    try {
      // Simulate PDF processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock PDF extraction - in real implementation, this would extract data from PDF
      const mockExtraction = {
        voucher_type: 'purchase',
        party_name: 'XYZ Vendors Ltd',
        invoice_number: 'INV-2024-001',
        amount: 12000,
        tax_amount: 2160,
        items: [
          { name: 'Office Supplies', quantity: 10, rate: 1000, amount: 10000 }
        ]
      };

      // Update voucher with extracted data
      onVoucherChange(prev => ({
        ...prev,
        voucher_type: mockExtraction.voucher_type,
        party_name: mockExtraction.party_name,
        reference: mockExtraction.invoice_number,
        narration: `Invoice from ${mockExtraction.party_name}`,
        stock_entries: mockExtraction.items.map(item => ({
          stock_item_id: '',
          stock_item_name: item.name,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        }))
      }));

    } catch (error) {
      console.error('PDF processing error:', error);
    } finally {
      setProcessingPDF(false);
    }
  };

  const renderMethodSpecificContent = () => {
    switch (currentMethod) {
      case 'ai_assisted':
        return (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-900">AI Voucher Assistant</h4>
                <p className="text-sm text-purple-700">Describe your transaction in natural language</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <MessageSquare className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500" />
                <input
                  type="text"
                  value={aiCommand}
                  onChange={(e) => setAiCommand(e.target.value)}
                  placeholder="e.g., 'Paid ₹5000 to ABC Suppliers for office supplies'"
                  className="w-full pl-12 pr-16 py-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleAiCommand()}
                />
                <Button
                  onClick={handleAiCommand}
                  disabled={aiProcessing || !aiCommand.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  size="sm"
                >
                  {aiProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Paid ₹10,000 to vendor ABC Ltd',
                  'Received ₹25,000 from customer XYZ',
                  'Purchased office supplies for ₹5,000',
                  'Bank transfer ₹15,000 to savings'
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setAiCommand(example)}
                    className="p-3 text-left bg-white hover:bg-purple-50 border border-purple-200 rounded-lg transition-colors text-sm"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'pdf_upload':
        return (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">PDF Document Upload</h4>
                <p className="text-sm text-blue-700">Upload invoices, bills, or bank statements</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-blue-900">
                        {processingPDF ? 'Processing PDF...' : 'Drop PDF here or click to upload'}
                      </p>
                      <p className="text-sm text-blue-600">
                        Supports invoices, bills, bank statements, and receipts
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {uploadedFile && (
                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-blue-200">
                  <FileImage className="w-8 h-8 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">{uploadedFile.name}</p>
                    <p className="text-sm text-blue-600">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {processingPDF && (
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-900">Invoices</p>
                  <p className="text-xs text-blue-600">Sales & Purchase</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <Camera className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-900">Receipts</p>
                  <p className="text-xs text-blue-600">Expense Bills</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <FileImage className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-900">Statements</p>
                  <p className="text-xs text-blue-600">Bank & Credit</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${currentMethodData?.color} flex items-center justify-center shadow-lg`}>
            {currentMethodData?.icon && <currentMethodData.icon className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center text-lg">
              <Wand2 className="w-5 h-5 mr-2 text-purple-600" />
              Entry Method: {currentMethodData?.label}
            </h3>
            <p className="text-sm text-slate-600">{currentMethodData?.description}</p>
          </div>
        </div>
      </div>

      {/* Method Selection */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {entryMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = currentMethod === method.value;
          
          return (
            <motion.button
              key={method.value}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onMethodChange(method.value)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                isSelected
                  ? `border-transparent bg-gradient-to-r ${method.color} text-white shadow-lg`
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
              }`}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${
                isSelected ? 'text-white' : 'text-gray-600'
              }`} />
              <div className={`text-sm font-medium mb-1 ${
                isSelected ? 'text-white' : 'text-gray-900'
              }`}>
                {method.label}
              </div>
              <div className={`text-xs ${
                isSelected ? 'text-white/80' : 'text-gray-500'
              }`}>
                {method.description}
              </div>
              
              {isSelected && (
                <motion.div
                  layoutId="selectedMethod"
                  className="absolute inset-0 rounded-xl border-2 border-white/30"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Method-specific content */}
      <AnimatePresence mode="wait">
        {renderMethodSpecificContent()}
      </AnimatePresence>
    </Card>
  );
};