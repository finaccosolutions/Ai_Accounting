import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  Settings, 
  Save, 
  Building2, 
  Package, 
  Calculator, 
  Shield, 
  Database,
  Globe,
  DollarSign,
  Users,
  FileText,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanySettings: React.FC = () => {
  const { selectedCompany, setSelectedCompany } = useApp();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Basic Settings
    name: '',
    mailing_name: '',
    industry: '',
    company_type: 'private_limited',
    
    // Financial Settings
    currency: 'INR',
    decimal_places: 2,
    financial_year_start: '',
    auto_voucher_numbering: true,
    
    // Feature Flags
    enable_inventory: true,
    enable_multi_currency: false,
    enable_cost_center: false,
    enable_job_costing: false,
    enable_budget: false,
    enable_audit_trail: true,
    enable_multi_godown: false,
    enable_batch_tracking: false,
    enable_serial_tracking: false,
    
    // Security & Compliance
    enable_data_encryption: true,
    enable_backup: true,
    backup_frequency: 'daily',
    enable_user_access_control: true,
  });

  useEffect(() => {
    if (selectedCompany) {
      setSettings({
        name: selectedCompany.name || '',
        mailing_name: selectedCompany.mailing_name || '',
        industry: selectedCompany.industry || '',
        company_type: selectedCompany.company_type || 'private_limited',
        currency: selectedCompany.currency || 'INR',
        decimal_places: selectedCompany.decimal_places || 2,
        financial_year_start: selectedCompany.financial_year_start || '',
        auto_voucher_numbering: selectedCompany.auto_voucher_numbering ?? true,
        enable_inventory: selectedCompany.enable_inventory ?? true,
        enable_multi_currency: selectedCompany.enable_multi_currency ?? false,
        enable_cost_center: selectedCompany.enable_cost_center ?? false,
        enable_job_costing: selectedCompany.enable_job_costing ?? false,
        enable_budget: selectedCompany.enable_budget ?? false,
        enable_audit_trail: selectedCompany.enable_audit_trail ?? true,
        enable_multi_godown: selectedCompany.enable_multi_godown ?? false,
        enable_batch_tracking: selectedCompany.enable_batch_tracking ?? false,
        enable_serial_tracking: selectedCompany.enable_serial_tracking ?? false,
        enable_data_encryption: selectedCompany.enable_data_encryption ?? true,
        enable_backup: selectedCompany.enable_backup ?? true,
        backup_frequency: selectedCompany.backup_frequency || 'daily',
        enable_user_access_control: selectedCompany.enable_user_access_control ?? true,
      });
    }
  }, [selectedCompany]);

  const handleSave = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(settings)
        .eq('id', selectedCompany.id)
        .select()
        .single();

      if (error) throw error;

      setSelectedCompany(data);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
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
      id: 'basic',
      title: 'Basic Information',
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      settings: [
        { key: 'name', label: 'Company Name', type: 'text', required: true },
        { key: 'mailing_name', label: 'Mailing Name', type: 'text' },
        { key: 'industry', label: 'Industry', type: 'select', options: [
          { value: '', label: 'Select Industry' },
          { value: 'manufacturing', label: 'Manufacturing' },
          { value: 'trading', label: 'Trading' },
          { value: 'services', label: 'Services' },
          { value: 'retail', label: 'Retail' },
          { value: 'construction', label: 'Construction' },
          { value: 'healthcare', label: 'Healthcare' },
          { value: 'education', label: 'Education' },
          { value: 'technology', label: 'Technology' },
          { value: 'finance', label: 'Finance' },
          { value: 'other', label: 'Other' }
        ]},
        { key: 'company_type', label: 'Company Type', type: 'select', options: [
          { value: 'private_limited', label: 'Private Limited' },
          { value: 'public_limited', label: 'Public Limited' },
          { value: 'partnership', label: 'Partnership' },
          { value: 'llp', label: 'LLP' },
          { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
          { value: 'trust', label: 'Trust' },
          { value: 'society', label: 'Society' },
          { value: 'other', label: 'Other' }
        ]}
      ]
    },
    {
      id: 'financial',
      title: 'Financial Configuration',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      settings: [
        { key: 'currency', label: 'Base Currency', type: 'select', options: [
          { value: 'INR', label: '₹ Indian Rupee' },
          { value: 'USD', label: '$ US Dollar' },
          { value: 'EUR', label: '€ Euro' },
          { value: 'GBP', label: '£ British Pound' },
          { value: 'CAD', label: 'C$ Canadian Dollar' },
          { value: 'AUD', label: 'A$ Australian Dollar' },
          { value: 'JPY', label: '¥ Japanese Yen' }
        ]},
        { key: 'decimal_places', label: 'Decimal Places', type: 'select', options: [
          { value: 0, label: '0 (No decimals)' },
          { value: 2, label: '2 (Standard)' },
          { value: 3, label: '3 (Precise)' },
          { value: 4, label: '4 (Very precise)' }
        ]},
        { key: 'auto_voucher_numbering', label: 'Auto Voucher Numbering', type: 'boolean', description: 'Automatically generate voucher numbers' }
      ]
    },
    {
      id: 'inventory',
      title: 'Inventory Management',
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      settings: [
        { key: 'enable_inventory', label: 'Enable Inventory', type: 'boolean', description: 'Track stock items and inventory movements' },
        { key: 'enable_multi_godown', label: 'Multiple Godowns', type: 'boolean', description: 'Manage stock across multiple locations', dependsOn: 'enable_inventory' },
        { key: 'enable_batch_tracking', label: 'Batch Tracking', type: 'boolean', description: 'Track items by batch numbers', dependsOn: 'enable_inventory' },
        { key: 'enable_serial_tracking', label: 'Serial Number Tracking', type: 'boolean', description: 'Track individual items by serial numbers', dependsOn: 'enable_inventory' }
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced Features',
      icon: Zap,
      color: 'from-orange-500 to-orange-600',
      settings: [
        { key: 'enable_multi_currency', label: 'Multi-Currency', type: 'boolean', description: 'Support multiple currencies in transactions' },
        { key: 'enable_cost_center', label: 'Cost Centers', type: 'boolean', description: 'Track expenses by departments or projects' },
        { key: 'enable_job_costing', label: 'Job Costing', type: 'boolean', description: 'Track costs for specific jobs or projects' },
        { key: 'enable_budget', label: 'Budget Management', type: 'boolean', description: 'Create and track budgets vs actuals' }
      ]
    },
    {
      id: 'security',
      title: 'Security & Compliance',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      settings: [
        { key: 'enable_audit_trail', label: 'Audit Trail', type: 'boolean', description: 'Track all changes and user activities' },
        { key: 'enable_data_encryption', label: 'Data Encryption', type: 'boolean', description: 'Encrypt sensitive data for security' },
        { key: 'enable_backup', label: 'Auto Backup', type: 'boolean', description: 'Automatically backup your data' },
        { key: 'backup_frequency', label: 'Backup Frequency', type: 'select', options: [
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' }
        ], dependsOn: 'enable_backup' },
        { key: 'enable_user_access_control', label: 'User Access Control', type: 'boolean', description: 'Manage user permissions and roles' }
      ]
    }
  ];

  const renderSettingField = (setting: any) => {
    const isDisabled = setting.dependsOn && !settings[setting.dependsOn];
    
    switch (setting.type) {
      case 'text':
        return (
          <Input
            value={settings[setting.key] || ''}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            placeholder={setting.label}
            required={setting.required}
            disabled={isDisabled}
          />
        );
      
      case 'select':
        return (
          <select
            value={settings[setting.key] || ''}
            onChange={(e) => handleSettingChange(setting.key, setting.key === 'decimal_places' ? parseInt(e.target.value) : e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={isDisabled}
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
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isDisabled}
            />
            <div className={`flex-1 ${isDisabled ? 'opacity-50' : ''}`}>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
          <p className="text-gray-600">Configure your company preferences and features</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-blue-600"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>

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
              <Card className="p-6 h-full">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${section.color} flex items-center justify-center shadow-lg`}>
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
                            {setting.required && <span className="text-red-500 ml-1">*</span>}
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
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">Settings Impact</h4>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Changes will affect new transactions and vouchers</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Existing data will remain unchanged</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span>Some features may require additional setup after enabling</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};