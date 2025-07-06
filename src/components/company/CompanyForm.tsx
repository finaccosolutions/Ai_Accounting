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
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Star,
  Zap,
  Users,
  Package,
  BarChart3
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
    { id: 1, title: 'Company Details', icon: Building2, description: 'Basic information', color: 'from-blue-500 to-blue-600' },
    { id: 2, title: 'Address & Contact', icon: MapPin, description: 'Location & contact', color: 'from-green-500 to-green-600' },
    { id: 3, title: 'Financial Setup', icon: DollarSign, description: 'Currency & year', color: 'from-purple-500 to-purple-600' },
    { id: 4, title: 'Features & Security', icon: Settings, description: 'System configuration', color: 'from-orange-500 to-orange-600' }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            {/* Company Name - Featured */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border-2 border-blue-200/50 shadow-xl">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Company Identity</h3>
                    <p className="text-gray-600">Define your company's core information</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                      Company Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your company name"
                      required
                      className="text-xl font-medium h-16 text-center bg-white/80 border-2 border-blue-300/50 focus:border-blue-500 shadow-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mailing Name
                      </label>
                      <Input
                        value={formData.mailing_name}
                        onChange={(e) => handleInputChange('mailing_name', e.target.value)}
                        placeholder="Name for correspondence"
                        className="bg-white/80"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Industry Type
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 shadow-sm"
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
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Company Type & Tax Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Legal Structure</h4>
                      <p className="text-sm text-gray-600">Company type and registration</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Type
                    </label>
                    <select
                      value={formData.company_type}
                      onChange={(e) => handleInputChange('company_type', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300/60 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
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
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Hash className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Tax Information</h4>
                      <p className="text-sm text-gray-600">Registration numbers</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        GSTIN
                      </label>
                      <Input
                        value={formData.gstin}
                        onChange={(e) => handleInputChange('gstin', e.target.value.toUpperCase())}
                        placeholder="22AAAAA0000A1Z5"
                        maxLength={15}
                        className="font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          PAN
                        </label>
                        <Input
                          value={formData.pan}
                          onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
                          placeholder="AAAAA0000A"
                          maxLength={10}
                          className="font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          TAN
                        </label>
                        <Input
                          value={formData.tan}
                          onChange={(e) => handleInputChange('tan', e.target.value.toUpperCase())}
                          placeholder="AAAA00000A"
                          maxLength={10}
                          className="font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CIN
                      </label>
                      <Input
                        value={formData.cin}
                        onChange={(e) => handleInputChange('cin', e.target.value.toUpperCase())}
                        placeholder="U12345AB1234PTC123456"
                        maxLength={21}
                        className="font-mono"
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* Address Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-0 shadow-xl">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Business Address</h3>
                    <p className="text-gray-600">Where your business is located</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Complete Business Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter complete business address"
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300/60 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white/80 shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City
                      </label>
                      <Input
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Enter city"
                        className="bg-white/80"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300/60 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 shadow-sm"
                      >
                        <option value="">Select State</option>
                        {indianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pincode
                      </label>
                      <Input
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        className="bg-white/80 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Country
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300/60 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 shadow-sm"
                      >
                        {countries.map(country => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Contact Information</h3>
                    <p className="text-gray-600">How customers can reach you</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 9876543210"
                      type="tel"
                      className="bg-white/80"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fax Number
                    </label>
                    <Input
                      value={formData.fax}
                      onChange={(e) => handleInputChange('fax', e.target.value)}
                      placeholder="+91 11 12345678"
                      type="tel"
                      className="bg-white/80"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address
                    </label>
                    <Input
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="company@example.com"
                      type="email"
                      className="bg-white/80"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Website
                    </label>
                    <Input
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://www.company.com"
                      type="url"
                      className="bg-white/80"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            {/* Financial Configuration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-8 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-0 shadow-xl">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Financial Configuration</h3>
                    <p className="text-gray-600">Set up your accounting preferences</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Financial Year Start *
                    </label>
                    <Input
                      type="date"
                      value={formData.financial_year_start}
                      onChange={(e) => handleInputChange('financial_year_start', e.target.value)}
                      required
                      className="bg-white/80"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Base Currency *
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300/60 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 shadow-sm"
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Decimal Places
                    </label>
                    <select
                      value={formData.decimal_places}
                      onChange={(e) => handleInputChange('decimal_places', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-300/60 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 shadow-sm"
                    >
                      <option value={0}>0 (No decimals)</option>
                      <option value={2}>2 (Standard)</option>
                      <option value={3}>3 (Precise)</option>
                      <option value={4}>4 (Very precise)</option>
                    </select>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* What will be created */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200/50 shadow-xl">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-emerald-900">Automatic Setup</h4>
                    <p className="text-emerald-700">We'll create these essentials for you</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {[
                      { icon: Calendar, text: 'Financial year configuration', color: 'text-blue-600' },
                      { icon: BarChart3, text: 'Standard chart of accounts', color: 'text-green-600' },
                      { icon: Package, text: 'Common units of measurement', color: 'text-purple-600' }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center space-x-3 p-3 bg-white/80 rounded-xl shadow-sm"
                      >
                        <div className={`w-8 h-8 ${item.color} bg-current opacity-10 rounded-lg flex items-center justify-center`}>
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <span className="text-gray-800 font-medium">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {[
                      { icon: Users, text: 'Ledger groups structure', color: 'text-orange-600' },
                      { icon: Package, text: 'Stock groups (if inventory enabled)', color: 'text-teal-600' },
                      { icon: Settings, text: 'System configuration', color: 'text-indigo-600' }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center space-x-3 p-3 bg-white/80 rounded-xl shadow-sm"
                      >
                        <div className={`w-8 h-8 ${item.color} bg-current opacity-10 rounded-lg flex items-center justify-center`}>
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <span className="text-gray-800 font-medium">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            {/* Core Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-xl">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Core Features</h3>
                    <p className="text-gray-600">Enable powerful accounting capabilities</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: 'enable_inventory', label: 'Inventory Management', desc: 'Track stock items, godowns, and movements', icon: Package, color: 'from-green-500 to-green-600' },
                    { key: 'enable_multi_currency', label: 'Multi-Currency', desc: 'Support multiple currencies in transactions', icon: Globe, color: 'from-blue-500 to-blue-600' },
                    { key: 'enable_cost_center', label: 'Cost Centers', desc: 'Track expenses by departments or projects', icon: BarChart3, color: 'from-purple-500 to-purple-600' },
                    { key: 'enable_job_costing', label: 'Job Costing', desc: 'Track costs for specific jobs or projects', icon: FileText, color: 'from-orange-500 to-orange-600' },
                    { key: 'enable_budget', label: 'Budget Management', desc: 'Create and track budgets vs actuals', icon: DollarSign, color: 'from-teal-500 to-teal-600' },
                    { key: 'auto_voucher_numbering', label: 'Auto Voucher Numbering', desc: 'Automatically generate voucher numbers', icon: Hash, color: 'from-indigo-500 to-indigo-600' },
                  ].map((feature, index) => (
                    <motion.label
                      key={feature.key}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="group flex items-start space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-200"
                    >
                      <input
                        type="checkbox"
                        checked={formData[feature.key]}
                        onChange={(e) => handleInputChange(feature.key, e.target.checked)}
                        className="w-6 h-6 text-blue-600 rounded-lg mt-1 focus:ring-blue-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <feature.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-bold text-gray-900 text-lg">{feature.label}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                      </div>
                    </motion.label>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Security & Compliance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 border-0 shadow-xl">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Security & Compliance</h3>
                    <p className="text-gray-600">Protect your data and ensure compliance</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: 'enable_audit_trail', label: 'Audit Trail', desc: 'Track all changes and user activities', icon: FileText, color: 'from-blue-500 to-blue-600' },
                    { key: 'enable_data_encryption', label: 'Data Encryption', desc: 'Encrypt sensitive data for security', icon: Shield, color: 'from-green-500 to-green-600' },
                    { key: 'enable_backup', label: 'Auto Backup', desc: 'Automatically backup your data', icon: Settings, color: 'from-purple-500 to-purple-600' },
                    { key: 'enable_user_access_control', label: 'User Access Control', desc: 'Manage user permissions and roles', icon: Users, color: 'from-orange-500 to-orange-600' },
                  ].map((feature, index) => (
                    <motion.label
                      key={feature.key}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="group flex items-start space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-red-200"
                    >
                      <input
                        type="checkbox"
                        checked={formData[feature.key]}
                        onChange={(e) => handleInputChange(feature.key, e.target.checked)}
                        className="w-6 h-6 text-red-600 rounded-lg mt-1 focus:ring-red-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <feature.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-bold text-gray-900 text-lg">{feature.label}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                      </div>
                    </motion.label>
                  ))}
                </div>

                {formData.enable_backup && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 p-4 bg-white/80 rounded-xl border border-gray-200"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Backup Frequency
                    </label>
                    <select
                      value={formData.backup_frequency}
                      onChange={(e) => handleInputChange('backup_frequency', e.target.value)}
                      className="w-full max-w-xs px-4 py-2 border-2 border-gray-300/60 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </motion.div>
                )}
              </Card>
            </motion.div>

            {/* Advanced Inventory Features */}
            {formData.enable_inventory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-8 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-0 shadow-xl">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Advanced Inventory</h3>
                      <p className="text-gray-600">Enhanced inventory tracking features</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { key: 'enable_multi_godown', label: 'Multiple Godowns', desc: 'Manage stock across multiple locations', icon: Building2 },
                      { key: 'enable_batch_tracking', label: 'Batch Tracking', desc: 'Track items by batch numbers', icon: Hash },
                      { key: 'enable_serial_tracking', label: 'Serial Number Tracking', desc: 'Track individual items by serial numbers', icon: CreditCard },
                    ].map((feature, index) => (
                      <motion.label
                        key={feature.key}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="group flex flex-col items-center text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-emerald-200"
                      >
                        <input
                          type="checkbox"
                          checked={formData[feature.key]}
                          onChange={(e) => handleInputChange(feature.key, e.target.checked)}
                          className="w-6 h-6 text-emerald-600 rounded-lg mb-4 focus:ring-emerald-500 focus:ring-2"
                        />
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-3">
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-gray-900 mb-2">{feature.label}</span>
                        <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                      </motion.label>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Building2 className="w-10 h-10 text-white" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-2 -right-2 w-8 h-8 border-4 border-dashed border-yellow-400 rounded-full"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Create New Company
                </h1>
                <p className="text-gray-600 text-lg">Set up your intelligent accounting system with comprehensive configuration</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-0">
            <div className="flex items-center justify-between">
              {getStepsData().map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className={`flex items-center space-x-4 p-4 rounded-2xl transition-all duration-500 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-100 to-purple-100 shadow-xl' 
                          : isCompleted 
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 shadow-lg'
                            : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${
                          isActive 
                            ? `bg-gradient-to-r ${step.color}` 
                            : isCompleted 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                              : 'bg-gray-300'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-8 h-8 text-white" />
                        ) : (
                          <Icon className="w-8 h-8 text-white" />
                        )}
                        
                        {isActive && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${step.color} blur-md`}
                          />
                        )}
                      </motion.div>
                      
                      <div className="hidden md:block">
                        <p className={`font-bold text-lg transition-colors duration-500 ${
                          isActive ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {step.title}
                        </p>
                        <p className={`text-sm transition-colors duration-500 ${
                          isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                    {index < getStepsData().length - 1 && (
                      <div className={`w-12 h-1 mx-4 rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Form Content with Scroll */}
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit}>
              {renderStepContent()}
            </form>
          </motion.div>
        </div>

        {/* Enhanced Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center mt-10 pt-8 border-t border-gray-200/50"
        >
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous Step
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </div>
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl"
              >
                Next Step
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl hover:shadow-2xl px-8"
              >
                {loading ? (
                  <div className="flex items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
                    />
                    Creating Company...
                  </div>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Create Company
                    <Star className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};