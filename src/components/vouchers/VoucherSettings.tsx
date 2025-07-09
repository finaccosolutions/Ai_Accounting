import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  Settings, 
  Save, 
  ArrowLeft,
  FileText,
  Calculator,
  Package,
  Receipt,
  DollarSign,
  Hash,
  Calendar,
  CheckCircle,
  AlertCircle,
  Zap,
  Shield,
  Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const VoucherSettings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Voucher Numbering
    auto_numbering: true,
    number_format: 'PREFIX-YYYY-####',
    reset_yearly: true,
    
    // Default Settings
    default_voucher_type: 'sales',
    default_entry_mode: 'item_invoice',
    default_entry_method: 'manual',
    
    // Validation Rules
    require_narration: false,
    require_party_details: true,
    require_reference: false,
    allow_negative_stock: false,
    
    // Tax Settings
    default_tax_rate: 18,
    auto_calculate_tax: true,
    include_tax_in_amount: false,
    
    // Workflow Settings
    enable_approval_workflow: false,
    auto_save_drafts: true,
    show_confirmation_dialog: true,
    
    // Display Settings
    show_recent_vouchers: true,
    recent_vouchers_count: 10,
    show_quick_stats: true,
    compact_view: false,
    
    // AI Settings
    enable_ai_suggestions: true,
    auto_fill_party_details: true,
    smart_ledger_mapping: true,
    
    // Security Settings
    enable_audit_log: true,
    require_reason_for_edit: true,
    lock_vouchers_after_days: 30
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Voucher settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const settingSections = [
    {
      id: 'numbering',
      title: 'Voucher Numbering',
      icon: Hash,
      color: 'from-blue-500 to-blue-600',
      settings: [
        { key: 'auto_numbering', label: 'Auto Generate Voucher Numbers', type: 'boolean', description: 'Automatically generate sequential voucher numbers' },
        { key: 'number_format', label: 'Number Format', type: 'text', description: 'Format: PREFIX-YYYY-#### (e.g., SAL-2024-0001)' },
        { key: 'reset_yearly', label: 'Reset Numbering Yearly', type: 'boolean', description: 'Reset voucher numbering at the start of each financial year' }
      ]
    },
    {
      id: 'defaults',
      title: 'Default Settings',
      icon: Settings,
      color: 'from-green-500 to-green-600',
      settings: [
        { key: 'default_voucher_type', label: 'Default Voucher Type', type: 'select', options: [
          { value: 'sales', label: 'Sales' },
          { value: 'purchase', label: 'Purchase' },
          { value: 'receipt', label: 'Receipt' },
          { value: 'payment', label: 'Payment' },
          { value: 'journal', label: 'Journal' }
        ]},
        { key: 'default_entry_mode', label: 'Default Entry Mode', type: 'select', options: [
          { value: 'item_invoice', label: 'Item Invoice' },
          { value: 'voucher_mode', label: 'Voucher Mode' },
          { value: 'accounting_mode', label: 'Accounting Mode' }
        ]},
        { key: 'default_entry_method', label: 'Default Entry Method', type: 'select', options: [
          { value: 'manual', label: 'Manual Entry' },
          { value: 'ai_assisted', label: 'AI Assisted' },
          { value: 'pdf_upload', label: 'PDF Upload' }
        ]}
      ]
    },
    {
      id: 'validation',
      title: 'Validation Rules',
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      settings: [
        { key: 'require_narration', label: 'Require Narration', type: 'boolean', description: 'Make narration mandatory for all vouchers' },
        { key: 'require_party_details', label: 'Require Party Details', type: 'boolean', description: 'Make party details mandatory for applicable vouchers' },
        { key: 'require_reference', label: 'Require Reference Number', type: 'boolean', description: 'Make reference number mandatory' },
        { key: 'allow_negative_stock', label: 'Allow Negative Stock', type: 'boolean', description: 'Allow stock items to go negative' }
      ]
    },
    {
      id: 'tax',
      title: 'Tax Settings',
      icon: Calculator,
      color: 'from-orange-500 to-orange-600',
      settings: [
        { key: 'default_tax_rate', label: 'Default Tax Rate (%)', type: 'number', description: 'Default GST rate for new items' },
        { key: 'auto_calculate_tax', label: 'Auto Calculate Tax', type: 'boolean', description: 'Automatically calculate tax amounts' },
        { key: 'include_tax_in_amount', label: 'Include Tax in Amount', type: 'boolean', description: 'Include tax in the item amount by default' }
      ]
    },
    {
      id: 'workflow',
      title: 'Workflow Settings',
      icon: Zap,
      color: 'from-pink-500 to-pink-600',
      settings: [
        { key: 'enable_approval_workflow', label: 'Enable Approval Workflow', type: 'boolean', description: 'Require approval for vouchers above certain amount' },
        { key: 'auto_save_drafts', label: 'Auto Save Drafts', type: 'boolean', description: 'Automatically save vouchers as drafts while editing' },
        { key: 'show_confirmation_dialog', label: 'Show Confirmation Dialog', type: 'boolean', description: 'Show confirmation before saving vouchers' }
      ]
    },
    {
      id: 'display',
      title: 'Display Settings',
      icon: FileText,
      color: 'from-teal-500 to-teal-600',
      settings: [
        { key: 'show_recent_vouchers', label: 'Show Recent Vouchers', type: 'boolean', description: 'Display recent vouchers in sidebar' },
        { key: 'recent_vouchers_count', label: 'Recent Vouchers Count', type: 'number', description: 'Number of recent vouchers to show' },
        { key: 'show_quick_stats', label: 'Show Quick Stats', type: 'boolean', description: 'Display quick statistics in sidebar' },
        { key: 'compact_view', label: 'Compact View', type: 'boolean', description: 'Use compact layout for voucher entry' }
      ]
    },
    {
      id: 'ai',
      title: 'AI Settings',
      icon: Zap,
      color: 'from-indigo-500 to-indigo-600',
      settings: [
        { key: 'enable_ai_suggestions', label: 'Enable AI Suggestions', type: 'boolean', description: 'Show AI-powered suggestions while entering vouchers' },
        { key: 'auto_fill_party_details', label: 'Auto Fill Party Details', type: 'boolean', description: 'Automatically fill party details based on history' },
        { key: 'smart_ledger_mapping', label: 'Smart Ledger Mapping', type: 'boolean', description: 'Use AI to suggest appropriate ledger accounts' }
      ]
    },
    {
      id: 'security',
      title: 'Security Settings',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      settings: [
        { key: 'enable_audit_log', label: 'Enable Audit Log', type: 'boolean', description: 'Log all voucher changes for audit trail' },
        { key: 'require_reason_for_edit', label: 'Require Reason for Edit', type: 'boolean', description: 'Require reason when editing saved vouchers' },
        { key: 'lock_vouchers_after_days', label: 'Lock Vouchers After (Days)', type: 'number', description: 'Automatically lock vouchers after specified days' }
      ]
    }
  ];

  const renderSettingField = (setting: any) => {
    switch (setting.type) {
      case 'text':
        return (
          <Input
            value={settings[setting.key] || ''}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            placeholder={setting.description}
          />
        );
    
      case 'number':
        return (
          <Input
            type="number"
            value={settings[setting.key] || ''}
            onChange={(e) => handleSettingChange(setting.key, parseFloat(e.target.value) || 0)}
            placeholder={setting.description}
          />
        );
    
      case 'select':
        return (
          <select
            value={settings[setting.key] || ''}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {setting.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'boolean':
        return (
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings[setting.key] || false}
              onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">{setting.label}</span>
              {setting.description && (
                <p className="text-sm text-gray-600">{setting.description}</p>
              )}
            </div>
          </label>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="sm"
              className="bg-white/80 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-800 bg-clip-text text-transparent">
              Voucher Settings
            </h1>
                <p className="text-gray-600">Configure voucher entry preferences and validation rules</p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-emerald-500 to-teal-600"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Settings
          </Button>
        </motion.div>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {settingSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${section.color.replace('blue', 'emerald').replace('purple', 'teal').replace('pink', 'green')} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {section.settings.map((setting) => (
                      <div key={setting.key}>
                        {setting.type === 'boolean' ? (
                          renderSettingField(setting)
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {setting.label}
                            </label>
                            {renderSettingField(setting)}
                            {setting.description && setting.type !== 'boolean' && (
                              <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Impact Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Card className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">Settings Impact</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Changes will apply to new vouchers immediately</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Existing vouchers will remain unchanged</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span>Some settings may require page refresh to take effect</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};