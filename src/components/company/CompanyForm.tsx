import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  Building2, 
  Save, 
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Hash,
  Globe,
  Sparkles,
  Settings,
  Shield,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CompanyFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const countries = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
  'Chandigarh', 'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep'
];

const currencies = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
];

const FORM_DATA_KEY = 'companySetupFormData';

export const CompanyForm: React.FC<CompanyFormProps> = ({ onBack, onSuccess }) => {
  const { userProfile } = useAuth();
  const { setSelectedCompany, setSelectedFinancialYear } = useApp();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Initialize form data from localStorage or defaults
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem(FORM_DATA_KEY);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
    
    return {
      // Basic Information
      name: '',
      mailing_name: '',
      industry: '',
      company_type: 'private_limited',
      
      // Tax Information
      gstin: '',
      pan: '',
      tan: '',
      cin: '',
      
      // Address Information
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'IN',
      
      // Contact Information
      phone: '',
      email: '',
      website: '',
      fax: '',
      
      // Financial Configuration
      financial_year_start: new Date().getFullYear() + '-04-01',
      currency: 'INR',
      decimal_places: 2,
      
      // System Features
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
      
      // Security & Compliance
      enable_data_encryption: true,
      enable_backup: true,
      backup_frequency: 'daily',
      enable_user_access_control: true,
    };
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Company name is required');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([{
          ...formData,
          admin_id: userProfile?.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Create default financial year
      const fyStart = new Date(formData.financial_year_start);
      const fyEnd = new Date(fyStart);
      fyEnd.setFullYear(fyEnd.getFullYear() + 1);
      fyEnd.setDate(fyEnd.getDate() - 1);

      const { data: fyData, error: fyError } = await supabase
        .from('financial_years')
        .insert([{
          company_id: data.id,
          year_start: fyStart.toISOString().split('T')[0],
          year_end: fyEnd.toISOString().split('T')[0],
          is_active: true
        }])
        .select()
        .single();

      if (fyError) throw fyError;

      // Set the created company and financial year as selected
      setSelectedCompany(data);
      setSelectedFinancialYear(fyData);

      // Create default ledger groups
      const defaultGroups = [
        { name: 'Current Assets', group_type: 'assets' },
        { name: 'Fixed Assets', group_type: 'assets' },
        { name: 'Investments', group_type: 'assets' },
        { name: 'Current Liabilities', group_type: 'liabilities' },
        { name: 'Long Term Liabilities', group_type: 'liabilities' },
        { name: 'Capital Account', group_type: 'liabilities' },
        { name: 'Reserves & Surplus', group_type: 'liabilities' },
        { name: 'Direct Income', group_type: 'income' },
        { name: 'Indirect Income', group_type: 'income' },
        { name: 'Direct Expenses', group_type: 'expenses' },
        { name: 'Indirect Expenses', group_type: 'expenses' },
        { name: 'Purchase Accounts', group_type: 'expenses' },
        { name: 'Sales Accounts', group_type: 'income' }
      ];

      const { error: groupsError } = await supabase
        .from('ledger_groups')
        .insert(defaultGroups.map(group => ({
          ...group,
          company_id: data.id
        })));

      if (groupsError) throw groupsError;

      // Create default units
      const defaultUnits = [
        { name: 'Numbers', symbol: 'Nos' },
        { name: 'Kilograms', symbol: 'Kg' },
        { name: 'Grams', symbol: 'Gms' },
        { name: 'Meters', symbol: 'Mtr' },
        { name: 'Centimeters', symbol: 'Cms' },
        { name: 'Liters', symbol: 'Ltr' },
        { name: 'Milliliters', symbol: 'Ml' },
        { name: 'Pieces', symbol: 'Pcs' },
        { name: 'Boxes', symbol: 'Box' },
        { name: 'Packets', symbol: 'Pkt' },
        { name: 'Dozens', symbol: 'Dzn' },
        { name: 'Pairs', symbol: 'Pr' }
      ];

      const { error: unitsError } = await supabase
        .from('units')
        .insert(defaultUnits.map(unit => ({
          ...unit,
          company_id: data.id
        })));

      if (unitsError) throw unitsError;

      // Create default stock groups if inventory is enabled
      if (formData.enable_inventory) {
        const defaultStockGroups = [
          { name: 'Raw Materials' },
          { name: 'Finished Goods' },
          { name: 'Work in Progress' },
          { name: 'Trading Goods' },
          { name: 'Consumables' },
          { name: 'Spare Parts' }
        ];

        const { error: stockGroupsError } = await supabase
          .from('stock_groups')
          .insert(defaultStockGroups.map(group => ({
            ...group,
            company_id: data.id
          })));

        if (stockGroupsError) throw stockGroupsError;
      }

      // Clear the saved form data
      localStorage.removeItem(FORM_DATA_KEY);
      
      toast.success('Company created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    localStorage.removeItem(FORM_DATA_KEY);
    onBack();
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepsData = () => [
    { id: 1, title: 'Basic Info', icon: Building2, description: 'Company details' },
    { id: 2, title: 'Address & Contact', icon: MapPin, description: 'Location & contact' },
    { id: 3, title: 'Financial Setup', icon: DollarSign, description: 'Currency & year' },
    { id: 4, title: 'Features', icon: Settings, description: 'System configuration' }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Company Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your company name"
                  required
                  className="text-lg font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mailing Name
                </label>
                <Input
                  value={formData.mailing_name}
                  onChange={(e) => handleInputChange('mailing_name', e.target.value)}
                  placeholder="Name for correspondence"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry Type
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Industry</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="trading">Trading</option>
                  <option value="services">Services</option>
                  <option value="retail">Retail</option>
                  <option value="construction">Construction</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="technology">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Type
                </label>
                <select
                  value={formData.company_type}
                  onChange={(e) => handleInputChange('company_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="private_limited">Private Limited</option>
                  <option value="public_limited">Public Limited</option>
                  <option value="partnership">Partnership</option>
                  <option value="llp">LLP</option>
                  <option value="sole_proprietorship">Sole Proprietorship</option>
                  <option value="trust">Trust</option>
                  <option value="society">Society</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  GSTIN
                </label>
                <Input
                  value={formData.gstin}
                  onChange={(e) => handleInputChange('gstin', e.target.value.toUpperCase())}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  PAN
                </label>
                <Input
                  value={formData.pan}
                  onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
                  placeholder="AAAAA0000A"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TAN
                </label>
                <Input
                  value={formData.tan}
                  onChange={(e) => handleInputChange('tan', e.target.value.toUpperCase())}
                  placeholder="AAAA00000A"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CIN
                </label>
                <Input
                  value={formData.cin}
                  onChange={(e) => handleInputChange('cin', e.target.value.toUpperCase())}
                  placeholder="U12345AB1234PTC123456"
                  maxLength={21}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Complete Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete business address"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select State</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 9876543210"
                  type="tel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fax Number
                </label>
                <Input
                  value={formData.fax}
                  onChange={(e) => handleInputChange('fax', e.target.value)}
                  placeholder="+91 11 12345678"
                  type="tel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address
                </label>
                <Input
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="company@example.com"
                  type="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Website
                </label>
                <Input
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.company.com"
                  type="url"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Financial Year Start *
                </label>
                <Input
                  type="date"
                  value={formData.financial_year_start}
                  onChange={(e) => handleInputChange('financial_year_start', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Base Currency *
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decimal Places
                </label>
                <select
                  value={formData.decimal_places}
                  onChange={(e) => handleInputChange('decimal_places', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>0 (No decimals)</option>
                  <option value={2}>2 (Standard)</option>
                  <option value={3}>3 (Precise)</option>
                  <option value={4}>4 (Very precise)</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                What will be automatically created:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Financial year setup
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Standard ledger groups
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Common units of measurement
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Chart of accounts structure
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Stock groups (if inventory enabled)
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    System configuration
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Core Features
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'enable_inventory', label: 'Inventory Management', desc: 'Track stock items, godowns, and movements' },
                  { key: 'enable_multi_currency', label: 'Multi-Currency', desc: 'Support multiple currencies in transactions' },
                  { key: 'enable_cost_center', label: 'Cost Centers', desc: 'Track expenses by departments or projects' },
                  { key: 'enable_job_costing', label: 'Job Costing', desc: 'Track costs for specific jobs or projects' },
                  { key: 'enable_budget', label: 'Budget Management', desc: 'Create and track budgets vs actuals' },
                  { key: 'auto_voucher_numbering', label: 'Auto Voucher Numbering', desc: 'Automatically generate voucher numbers' },
                ].map((feature) => (
                  <label key={feature.key} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[feature.key]}
                      onChange={(e) => handleInputChange(feature.key, e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded mt-0.5"
                    />
                    <div>
                      <span className="font-medium text-gray-900">{feature.label}</span>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security & Compliance
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'enable_audit_trail', label: 'Audit Trail', desc: 'Track all changes and user activities' },
                  { key: 'enable_data_encryption', label: 'Data Encryption', desc: 'Encrypt sensitive data for security' },
                  { key: 'enable_backup', label: 'Auto Backup', desc: 'Automatically backup your data' },
                  { key: 'enable_user_access_control', label: 'User Access Control', desc: 'Manage user permissions and roles' },
                ].map((feature) => (
                  <label key={feature.key} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[feature.key]}
                      onChange={(e) => handleInputChange(feature.key, e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded mt-0.5"
                    />
                    <div>
                      <span className="font-medium text-gray-900">{feature.label}</span>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {formData.enable_inventory && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Advanced Inventory Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'enable_multi_godown', label: 'Multiple Godowns', desc: 'Manage stock across multiple locations' },
                    { key: 'enable_batch_tracking', label: 'Batch Tracking', desc: 'Track items by batch numbers' },
                    { key: 'enable_serial_tracking', label: 'Serial Number Tracking', desc: 'Track individual items by serial numbers' },
                  ].map((feature) => (
                    <label key={feature.key} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData[feature.key]}
                        onChange={(e) => handleInputChange(feature.key, e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded mt-0.5"
                      />
                      <div>
                        <span className="font-medium text-gray-900">{feature.label}</span>
                        <p className="text-sm text-gray-600">{feature.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {formData.enable_backup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Frequency
                </label>
                <select
                  value={formData.backup_frequency}
                  onChange={(e) => handleInputChange('backup_frequency', e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-8"
        >
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            className="flex items-center bg-white/80 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Building2 className="w-8 h-8 text-white" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Create New Company
              </h1>
              <p className="text-gray-600">Set up your intelligent accounting system with comprehensive configuration</p>
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
          <div className="flex items-center justify-between">
            {getStepsData().map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : isCompleted 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : isCompleted 
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="hidden md:block">
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs opacity-75">{step.description}</p>
                    </div>
                  </div>
                  {index < getStepsData().length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-300' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <form onSubmit={handleSubmit}>
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="bg-white/80"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex space-x-3">
                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Next Step
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Creating Company...
                        </div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Create Company
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};