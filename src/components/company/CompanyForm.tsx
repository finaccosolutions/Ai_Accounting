import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  ArrowLeft, 
  Building2, 
  Save, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  FileText, 
  CreditCard,
  Calendar,
  Settings,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Star,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Package,
  Calculator,
  Database,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CompanyFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({ onBack, onSuccess }) => {
  const { setSelectedCompany, setSelectedFinancialYear } = useApp();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    mailing_name: '',
    industry: '',
    company_type: 'private_limited',
    
    // Contact Information
    email: '',
    phone: '',
    website: '',
    fax: '',
    
    // Address Information
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'IN',
    
    // Legal Information
    gstin: '',
    pan: '',
    tan: '',
    cin: '',
    
    // Financial Configuration
    currency: 'INR',
    decimal_places: 2,
    financial_year_start: new Date(new Date().getFullYear(), 3, 1).toISOString().split('T')[0], // April 1st
    
    // Feature Flags
    enable_inventory: true,
    enable_multi_currency: false,
    enable_cost_center: false,
    enable_job_costing: false,
    enable_budget: false,
    auto_voucher_numbering: true,
    enable_audit_trail: true,
    enable_multi_godown: false,
    enable_batch_tracking: false,
    enable_serial_tracking: false,
    enable_data_encryption: true,
    enable_backup: true,
    backup_frequency: 'daily',
    enable_user_access_control: true
  });

  const steps = [
    {
      id: 1,
      title: 'Basic Information',
      description: 'Company details and contact information',
      icon: Building2,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      title: 'Legal & Tax Details',
      description: 'Registration numbers and compliance',
      icon: FileText,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 3,
      title: 'Financial Setup',
      description: 'Currency and accounting preferences',
      icon: Calculator,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 4,
      title: 'Features & Settings',
      description: 'Enable modules and configure options',
      icon: Settings,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const industries = [
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'trading', label: 'Trading' },
    { value: 'services', label: 'Services' },
    { value: 'retail', label: 'Retail' },
    { value: 'construction', label: 'Construction' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'other', label: 'Other' }
  ];

  const companyTypes = [
    { value: 'private_limited', label: 'Private Limited Company' },
    { value: 'public_limited', label: 'Public Limited Company' },
    { value: 'partnership', label: 'Partnership Firm' },
    { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
    { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
    { value: 'trust', label: 'Trust' },
    { value: 'society', label: 'Society' },
    { value: 'other', label: 'Other' }
  ];

  const currencies = [
    { value: 'INR', label: '₹ Indian Rupee' },
    { value: 'USD', label: '$ US Dollar' },
    { value: 'EUR', label: '€ Euro' },
    { value: 'GBP', label: '£ British Pound' },
    { value: 'CAD', label: 'C$ Canadian Dollar' },
    { value: 'AUD', label: 'A$ Australian Dollar' },
    { value: 'JPY', label: '¥ Japanese Yen' }
  ];

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh', 'Puducherry'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.name.trim() !== '';
      case 2:
        return true; // Optional fields
      case 3:
        return formData.currency !== '' && formData.financial_year_start !== '';
      case 4:
        return true; // All optional
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{
          ...formData,
          admin_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (companyError) throw companyError;

      // Create default financial year
      const yearEnd = new Date(formData.financial_year_start);
      yearEnd.setFullYear(yearEnd.getFullYear() + 1);
      yearEnd.setDate(yearEnd.getDate() - 1);

      const { data: financialYear, error: fyError } = await supabase
        .from('financial_years')
        .insert([{
          company_id: company.id,
          year_start: formData.financial_year_start,
          year_end: yearEnd.toISOString().split('T')[0],
          is_active: true
        }])
        .select()
        .single();

      if (fyError) throw fyError;

      // Create default ledger groups
      const defaultGroups = [
        { name: 'Current Assets', group_type: 'assets', company_id: company.id },
        { name: 'Fixed Assets', group_type: 'assets', company_id: company.id },
        { name: 'Current Liabilities', group_type: 'liabilities', company_id: company.id },
        { name: 'Long Term Liabilities', group_type: 'liabilities', company_id: company.id },
        { name: 'Sales Accounts', group_type: 'income', company_id: company.id },
        { name: 'Other Income', group_type: 'income', company_id: company.id },
        { name: 'Direct Expenses', group_type: 'expenses', company_id: company.id },
        { name: 'Indirect Expenses', group_type: 'expenses', company_id: company.id }
      ];

      const { error: groupsError } = await supabase
        .from('ledger_groups')
        .insert(defaultGroups);

      if (groupsError) throw groupsError;

      // Set as selected company and financial year
      setSelectedCompany(company);
      setSelectedFinancialYear(financialYear);

      toast.success('Company created successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating company:', error);
      toast.error(error.message || 'Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Company Name *"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div>
                <Input
                  label="Mailing Name"
                  value={formData.mailing_name}
                  onChange={(e) => handleInputChange('mailing_name', e.target.value)}
                  placeholder="Name for correspondence"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200/60 rounded-2xl shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  required
                >
                  <option value="">Select Industry</option>
                  {industries.map(industry => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Type *
                </label>
                <select
                  value={formData.company_type}
                  onChange={(e) => handleInputChange('company_type', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200/60 rounded-2xl shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  required
                >
                  {companyTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="company@example.com"
                  icon={<Mail className="w-4 h-4" />}
                />
              </div>
              <div>
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  icon={<Phone className="w-4 h-4" />}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.company.com"
                  icon={<Globe className="w-4 h-4" />}
                />
              </div>
              <div>
                <Input
                  label="Fax Number"
                  value={formData.fax}
                  onChange={(e) => handleInputChange('fax', e.target.value)}
                  placeholder="Fax number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Complete address"
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200/60 rounded-2xl shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200/60 rounded-2xl shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Input
                  label="PIN Code"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  placeholder="PIN Code"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="GSTIN"
                  value={formData.gstin}
                  onChange={(e) => handleInputChange('gstin', e.target.value)}
                  placeholder="22AAAAA0000A1Z5"
                  icon={<FileText className="w-4 h-4" />}
                />
              </div>
              <div>
                <Input
                  label="PAN"
                  value={formData.pan}
                  onChange={(e) => handleInputChange('pan', e.target.value)}
                  placeholder="AAAAA0000A"
                  icon={<CreditCard className="w-4 h-4" />}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="TAN"
                  value={formData.tan}
                  onChange={(e) => handleInputChange('tan', e.target.value)}
                  placeholder="AAAA00000A"
                />
              </div>
              <div>
                <Input
                  label="CIN"
                  value={formData.cin}
                  onChange={(e) => handleInputChange('cin', e.target.value)}
                  placeholder="U12345AB1234PTC123456"
                />
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                Legal Information Guidelines
              </h4>
              <div className="text-sm text-gray-700 space-y-2">
                <p><strong>GSTIN:</strong> 15-character Goods and Services Tax Identification Number</p>
                <p><strong>PAN:</strong> 10-character Permanent Account Number</p>
                <p><strong>TAN:</strong> 10-character Tax Deduction Account Number (for TDS)</p>
                <p><strong>CIN:</strong> 21-character Corporate Identification Number (for companies)</p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Base Currency *
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200/60 rounded-2xl shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  required
                >
                  {currencies.map(currency => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Decimal Places
                </label>
                <select
                  value={formData.decimal_places}
                  onChange={(e) => handleInputChange('decimal_places', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200/60 rounded-2xl shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                >
                  <option value={0}>0 (No decimals)</option>
                  <option value={2}>2 (Standard)</option>
                  <option value={3}>3 (Precise)</option>
                  <option value={4}>4 (Very precise)</option>
                </select>
              </div>
            </div>

            <div>
              <Input
                label="Financial Year Start Date *"
                type="date"
                value={formData.financial_year_start}
                onChange={(e) => handleInputChange('financial_year_start', e.target.value)}
                icon={<Calendar className="w-4 h-4" />}
                required
              />
            </div>

            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Financial Configuration
              </h4>
              <div className="text-sm text-gray-700 space-y-2">
                <p><strong>Currency:</strong> This will be the base currency for all transactions</p>
                <p><strong>Decimal Places:</strong> Number of decimal places for amounts (2 is standard)</p>
                <p><strong>Financial Year:</strong> Typically starts on April 1st in India</p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900">Feature Configuration</h4>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
              </button>
            </div>

            {/* Core Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enable_inventory}
                    onChange={(e) => handleInputChange('enable_inventory', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Inventory Management</span>
                    </div>
                    <p className="text-sm text-gray-600">Track stock items and inventory movements</p>
                  </div>
                </label>
              </div>

              <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.auto_voucher_numbering}
                    onChange={(e) => handleInputChange('auto_voucher_numbering', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">Auto Voucher Numbering</span>
                    </div>
                    <p className="text-sm text-gray-600">Automatically generate voucher numbers</p>
                  </div>
                </label>
              </div>

              <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enable_audit_trail}
                    onChange={(e) => handleInputChange('enable_audit_trail', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Audit Trail</span>
                    </div>
                    <p className="text-sm text-gray-600">Track all changes and user activities</p>
                  </div>
                </label>
              </div>

              <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enable_user_access_control}
                    onChange={(e) => handleInputChange('enable_user_access_control', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-gray-900">User Access Control</span>
                    </div>
                    <p className="text-sm text-gray-600">Manage user permissions and roles</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Advanced Features */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="border-t border-gray-200 pt-6">
                    <h5 className="font-medium text-gray-900 mb-4">Advanced Features</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'enable_multi_currency', label: 'Multi-Currency', icon: TrendingUp, description: 'Support multiple currencies' },
                        { key: 'enable_cost_center', label: 'Cost Centers', icon: Database, description: 'Track expenses by departments' },
                        { key: 'enable_job_costing', label: 'Job Costing', icon: Calculator, description: 'Track costs for specific jobs' },
                        { key: 'enable_budget', label: 'Budget Management', icon: Star, description: 'Create and track budgets' },
                        { key: 'enable_multi_godown', label: 'Multiple Godowns', icon: Package, description: 'Manage multiple locations' },
                        { key: 'enable_batch_tracking', label: 'Batch Tracking', icon: Package, description: 'Track items by batch numbers' }
                      ].map((feature) => {
                        const Icon = feature.icon;
                        return (
                          <div key={feature.key} className="p-3 bg-gray-50 rounded-lg">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData[feature.key as keyof typeof formData] as boolean}
                                onChange={(e) => handleInputChange(feature.key, e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <Icon className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm font-medium text-gray-900">{feature.label}</span>
                                </div>
                                <p className="text-xs text-gray-500">{feature.description}</p>
                              </div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="bg-white/80 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-800 bg-clip-text text-transparent">
              Create New Company
            </h1>
                <p className="text-gray-600">Set up your company profile and accounting preferences</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-110`
                    : isCompleted
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="hidden md:block">
                      <p className={`font-semibold text-sm ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded-full transition-colors duration-300 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {steps[currentStep - 1]?.title}
              </h2>
              <p className="text-gray-600">{steps[currentStep - 1]?.description}</p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {renderStepContent()}
            </div>
          </Card>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center"
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Step {currentStep} of {steps.length}</span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            {currentStep > 1 && (
              <Button
                onClick={prevStep}
                variant="outline"
                className="bg-white/80 backdrop-blur-sm"
              >
                Previous
              </Button>
            )}
            
            {currentStep < steps.length ? (
              <Button
            onClick={nextStep}
            disabled={!validateStep(currentStep)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600"
          >
            Next Step
          </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !validateStep(currentStep)}
                className="bg-gradient-to-r from-green-500 to-green-600"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Company...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-5 h-5 mr-2" />
                    Create Company
                  </div>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};