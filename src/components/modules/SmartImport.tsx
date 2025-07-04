import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Download, Eye } from 'lucide-react';
import { Button } from '../ui/Button';

const importTypes = [
  { id: 'bank_statement', label: 'Bank Statement', icon: '🏦', formats: ['PDF', 'CSV', 'Excel'] },
  { id: 'invoices', label: 'Purchase/Sales Invoices', icon: '📄', formats: ['PDF', 'Image'] },
  { id: 'gstr_data', label: 'GSTR Data', icon: '📊', formats: ['JSON', 'PDF'] },
  { id: 'tally_data', label: 'Tally XML', icon: '💾', formats: ['XML'] },
];

const sampleImportedData = [
  { id: '1', type: 'bank_statement', name: 'SBI_Statement_Jan2024.pdf', status: 'processed', records: 45, matches: 42, issues: 3 },
  { id: '2', type: 'invoices', name: 'Purchase_Invoice_001.pdf', status: 'processed', records: 1, matches: 1, issues: 0 },
  { id: '3', type: 'gstr_data', name: 'GSTR2A_Dec2023.json', status: 'processing', records: 28, matches: 25, issues: 3 },
  { id: '4', type: 'bank_statement', name: 'HDFC_Statement_Jan2024.csv', status: 'pending', records: 0, matches: 0, issues: 0 },
];

export const SmartImport: React.FC = () => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedImportType, setSelectedImportType] = useState('bank_statement');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing': return <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Import</h1>
          <p className="text-gray-600">AI-powered document parsing and data extraction</p>
        </div>
        <Button variant="outline" icon={Download}>
          Sample Templates
        </Button>
      </div>

      {/* Import Type Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Import Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {importTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedImportType(type.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedImportType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <h4 className="font-medium text-gray-900">{type.label}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {type.formats.join(', ')}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h3>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or click to upload
          </p>
          <p className="text-gray-600 mb-4">
            Supported formats: PDF, CSV, Excel, JSON, XML, Images
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.csv,.xlsx,.xls,.json,.xml,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button as="span" icon={Upload}>
              Choose Files
            </Button>
          </label>
        </div>

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Uploaded Files</h4>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Process
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Processing Options */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Processing Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
              <span className="text-sm text-gray-700">Auto-match with existing ledgers</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
              <span className="text-sm text-gray-700">Detect duplicate entries</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
              <span className="text-sm text-gray-700">Extract tax information</span>
            </label>
          </div>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-gray-700">Create vouchers automatically</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-gray-700">Notify on anomalies</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-gray-700">Generate processing report</span>
            </label>
          </div>
        </div>
      </div>

      {/* Import History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Import History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">File Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Records</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Matches</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Issues</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sampleImportedData.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{item.records}</td>
                  <td className="py-3 px-4 text-green-600">{item.matches}</td>
                  <td className="py-3 px-4 text-red-600">{item.issues}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" icon={Eye}>
                        View
                      </Button>
                      <Button variant="ghost" size="sm" icon={Download}>
                        Export
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};