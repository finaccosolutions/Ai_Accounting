import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Upload,
  FileText,
  Banknote,
  Bot,
  Sparkles,
  Camera,
  Loader,
  CheckCircle,
  X,
  MessageSquareText,
  ClipboardList,
  ReceiptText,
  ScanText,
  FileJson,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import { geminiAI } from '../../lib/gemini'; // Import the GeminiAI instance

export const SmartImport: React.FC = () => {
  const [selectedImportType, setSelectedImportType] = useState<'text' | 'pdf' | 'bank_statement' | null>(null);
  const [textCommand, setTextCommand] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleProcessTextCommand = async () => {
    if (!textCommand.trim()) {
      toast.error('Please enter a command.');
      return;
    }
    setProcessing(true);
    setAiResponse(null);
    try {
      const response = await geminiAI.parseVoucherCommand(textCommand);
      setAiResponse(response);
      setShowResponseModal(true);
      toast.success('AI processed your command!');
    } catch (error) {
      console.error('Error processing text command:', error);
      toast.error('Failed to process command. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessFile = async () => {
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }
    setProcessing(true);
    setAiResponse(null);
    try {
      const fileContent = await file.text(); // Read file content as text
      let response;
      if (selectedImportType === 'pdf') {
        response = await geminiAI.parsePDFInvoice(fileContent);
      } else if (selectedImportType === 'bank_statement') {
        response = await geminiAI.parseBankStatement(fileContent);
      }
      setAiResponse(response);
      setShowResponseModal(true);
      toast.success('File processed successfully!');
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file. Please ensure it is a valid text-based PDF/statement.');
    } finally {
      setProcessing(false);
    }
  };

  const renderImportContent = () => {
    switch (selectedImportType) {
      case 'text':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <MessageSquareText className="w-6 h-6 mr-2 text-blue-600" />
              AI-Assisted Text Input
            </h3>
            <p className="text-gray-600">Describe your transaction in natural language.</p>
            <textarea
              value={textCommand}
              onChange={(e) => setTextCommand(e.target.value)}
              placeholder="e.g., 'Create a sales invoice for ABC Ltd for ₹50,000 for 5 laptops' or 'Record payment of ₹25,000 to XYZ Vendor for office supplies'"
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-200/60 rounded-xl shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
            />
            <Button
            onClick={handleProcessTextCommand}
            disabled={processing}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
          >
              {processing ? (
                <Loader className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              {processing ? 'Processing...' : 'Process Command'}
            </Button>
          </motion.div>
        );
      case 'pdf':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-green-600" />
              Import PDF/Image Invoice
            </h3>
            <p className="text-gray-600">Upload your invoice (PDF or image) to extract data automatically.</p>
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <Camera className="w-12 h-12 text-gray-400 mb-3" />
              <span className="text-gray-600 font-medium">Drag & drop or click to upload</span>
              <span className="text-sm text-gray-500 mt-1">Supports PDF, JPG, PNG (Max 10MB)</span>
              <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
            </label>
            {file && (
              <p className="text-sm text-gray-700 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Selected file: {file.name}
              </p>
            )}
            <Button
              onClick={handleProcessFile}
              disabled={processing || !file}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
            >
              {processing ? (
                <Loader className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Upload className="w-5 h-5 mr-2" />
              )}
              {processing ? 'Processing...' : 'Process Invoice'}
            </Button>
          </motion.div>
        );
      case 'bank_statement':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Banknote className="w-6 h-6 mr-2 text-purple-600" />
              Import Bank Statement
            </h3>
            <p className="text-gray-600">Upload your bank statement (PDF) to categorize transactions.</p>
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <ClipboardList className="w-12 h-12 text-gray-400 mb-3" />
              <span className="text-gray-600 font-medium">Drag & drop or click to upload</span>
              <span className="text-sm text-gray-500 mt-1">Supports PDF (Max 10MB)</span>
              <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
            </label>
            {file && (
              <p className="text-sm text-gray-700 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Selected file: {file.name}
              </p>
            )}
            <Button
              onClick={handleProcessFile}
              disabled={processing || !file}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600"
            >
              {processing ? (
                <Loader className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Upload className="w-5 h-5 mr-2" />
              )}
              {processing ? 'Processing...' : 'Process Statement'}
            </Button>
          </motion.div>
        );
      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Choose an Import Method</h3>
            <p className="text-gray-600 mb-8">Select how you'd like to import your accounting data.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedImportType('text')}
                className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 cursor-pointer hover:border-blue-400 transition-all duration-300"
              >
                <Bot className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">AI Text Command</h4>
                <p className="text-sm text-gray-600">Describe transactions in plain English.</p>
              </motion.div>
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedImportType('pdf')}
                className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 cursor-pointer hover:border-green-400 transition-all duration-300"
              >
                <ReceiptText className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Invoice/Bill Import</h4>
                <p className="text-sm text-gray-600">Upload PDF or image invoices.</p>
              </motion.div>
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedImportType('bank_statement')}
                className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 cursor-pointer hover:border-purple-400 transition-all duration-300"
              >
                <ScanText className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Bank Statement</h4>
                <p className="text-sm text-gray-600">Process bank statements for transactions.</p>
              </motion.div>
            </div>
          </motion.div>
        );
    }
  };

  const renderResponseContent = () => {
    if (!aiResponse) return null;

    if (aiResponse.needs_clarification) {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
            Clarification Needed
          </h3>
          <p className="text-gray-700">The AI needs more information to complete the voucher:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            {aiResponse.questions.map((q: string, index: number) => (
              <li key={index}>{q}</li>
            ))}
          </ul>
          {aiResponse.suggested_voucher_type && (
            <p className="text-sm text-gray-500">Suggested voucher type: <span className="font-semibold capitalize">{aiResponse.suggested_voucher_type.replace(/_/g, ' ')}</span></p>
          )}
          <Input placeholder="Your answer..." />
          <Button className="w-full">Submit Clarification</Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
          AI Generated Voucher
        </h3>
        <p className="text-gray-700">Review the details below and confirm to create the voucher.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard label="Voucher Type" value={aiResponse.voucher_type} icon={FileText} />
          <InfoCard label="Total Amount" value={`₹${aiResponse.amount?.toLocaleString() || '0.00'}`} icon={Banknote} />
          {aiResponse.party_name && <InfoCard label="Party Name" value={aiResponse.party_name} icon={Bot} />}
          {aiResponse.date && <InfoCard label="Date" value={aiResponse.date} icon={FileText} />}
          {aiResponse.reference_number && <InfoCard label="Reference" value={aiResponse.reference_number} icon={FileText} />}
        </div>

        {aiResponse.ledger_entries && aiResponse.ledger_entries.length > 0 && (
          <CollapsibleSection title="Ledger Entries" icon={FileCode}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-3 text-left">Ledger</th>
                    <th className="py-2 px-3 text-right">Debit</th>
                    <th className="py-2 px-3 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {aiResponse.ledger_entries.map((entry: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 px-3">{entry.ledger_name}</td>
                      <td className="py-2 px-3 text-right">₹{entry.debit_amount?.toLocaleString() || '0.00'}</td>
                      <td className="py-2 px-3 text-right">₹{entry.credit_amount?.toLocaleString() || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>
        )}

        {aiResponse.items && aiResponse.items.length > 0 && (
          <CollapsibleSection title="Items" icon={FileSpreadsheet}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-3 text-left">Item</th>
                    <th className="py-2 px-3 text-right">Qty</th>
                    <th className="py-2 px-3 text-right">Rate</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {aiResponse.items.map((item: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 px-3">{item.name}</td>
                      <td className="py-2 px-3 text-right">{item.quantity}</td>
                      <td className="py-2 px-3 text-right">₹{item.rate?.toLocaleString() || '0.00'}</td>
                      <td className="py-2 px-3 text-right">₹{item.amount?.toLocaleString() || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>
        )}

        {aiResponse.narration && (
          <CollapsibleSection title="Narration" icon={MessageSquareText}>
            <p className="text-gray-700">{aiResponse.narration}</p>
          </CollapsibleSection>
        )}

        <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
          Confirm & Create Voucher
        </Button>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-16 h-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 rounded-2xl flex items-center justify-center shadow-xl"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-800 bg-clip-text text-transparent mb-2">
              Smart Import
            </h1>
              <p className="text-gray-600 text-lg">
                Leverage AI to effortlessly import and categorize your accounting data.
              </p>
            </div>
          </div>
        </motion.div>

        <Card className="p-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          {renderImportContent()}
        </Card>
      </div>

      <AnimatePresence>
        {showResponseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-end mb-4">
                <Button variant="ghost" onClick={() => setShowResponseModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              {renderResponseContent()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Helper component for displaying info cards
const InfoCard: React.FC<{ label: string; value: string; icon: React.ElementType }> = ({ label, value, icon: Icon }) => (
  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center space-x-3">
    <Icon className="w-5 h-5 text-emerald-600" />
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

// Helper component for collapsible sections
const CollapsibleSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Card className="p-4 bg-gray-50 border border-gray-200">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h4 className="font-semibold text-gray-900 flex items-center">
          <Icon className="w-5 h-5 mr-2 text-gray-600" />
          {title}
        </h4>
        {isOpen ? <X className="w-4 h-4 text-gray-500" /> : <Sparkles className="w-4 h-4 text-gray-500" />}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
