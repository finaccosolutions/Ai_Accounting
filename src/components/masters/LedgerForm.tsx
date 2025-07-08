// src/components/masters/LedgerForm.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { NumberInput } from '../ui/NumberInput';
import { SearchableDropdown } from '../vouchers/SearchableDropdown';
import {
  BookOpen,
  Mail,
  FileText,
  Banknote,
  Scale,
  Plus,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Building2,
  MapPin,
  Phone,
  Globe,
  CreditCard,
  Percent,
  CircleDot,
  Circle,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Ledger, LedgerGroup } from '../../types';

interface LedgerFormProps {
  masterType: string;
  editingItem: Ledger | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  allLedgerGroups: LedgerGroup[];
}

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh', 'Puducherry', 'Andaman and Nicobar Islands',
  'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Ladakh', 'Jammu and Kashmir'
];

const gstRegistrationTypes = [
  'Regular', 'Composition', 'Unregistered', 'Consumer', 'SEZ', 'Exempt'
];

const typeOfDealers = [
  'Regular', 'Composition', 'Unregistered'
];

const ledgerSchema = z.object({
  name: z.string().min(1, 'Ledger Name is required'),
  alias: z.string().optional(),
  group_id: z.string().min(1, 'Under Group is required'),
  opening_balance: z.number().default(0),
  opening_balance_type: z.enum(['Dr', 'Cr']).default('Dr'),

  // Mailing Details
  mailing_name: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  phone: z.string().optional().refine((val) => !val || /^\d{10,15}$/.test(val), {
    message: 'Phone number must be 10-15 digits',
  }),

  // Statutory & GST Details (conditionally required/validated)
  gst_registration_type: z.enum(gstRegistrationTypes as [string, ...string[]]).optional(),
  gstin: z.string().optional().refine((val) => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val), {
    message: 'Invalid GSTIN format (e.g., 22AAAAA0000A1Z5)',
  }),
  pan_number: z.string().optional().refine((val) => !val || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val), {
    message: 'Invalid PAN format (e.g., AAAAA0000A)',
  }),
  is_rcm_applicable: z.boolean().default(false),
  type_of_dealer: z.enum(typeOfDealers as [string, ...string[]]).optional(),
  applicable_tax_rate: z.number().optional().refine((val) => !val || (val >= 0 && val <= 100), {
    message: 'Tax rate must be between 0 and 100',
  }),

  // Bank Details (conditionally required/validated)
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  ifsc_code: z.string().optional(),
  branch: z.string().optional(),
});

type LedgerFormData = z.infer<typeof ledgerSchema>;

export const LedgerForm: React.FC<LedgerFormProps> = ({
  editingItem,
  onSave,
  onCancel,
  allLedgerGroups,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LedgerFormData>({
    resolver: zodResolver(ledgerSchema),
    defaultValues: {
      opening_balance_type: 'Dr',
      country: 'India',
      is_rcm_applicable: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basicInfo: true,
    mailingDetails: false,
    statutoryGst: false,
    bankDetails: false,
    openingBalance: true,
  });

  const selectedGroupId = watch('group_id');
  const selectedGroup = allLedgerGroups.find((group) => group.id === selectedGroupId);

  const showStatutoryGstDetails = selectedGroup && [
    'Sundry Debtors', 'Sundry Creditors', 'Bank Accounts', 'Duties & Taxes'
  ].includes(selectedGroup.name);

  const showBankDetails = selectedGroup && selectedGroup.name === 'Bank Accounts';

  useEffect(() => {
    if (editingItem) {
      reset({
        ...editingItem,
        opening_balance_type: editingItem.opening_balance_type || (editingItem.opening_balance >= 0 ? 'Dr' : 'Cr'),
        opening_balance: Math.abs(editingItem.opening_balance),
      });
    } else {
      reset(); // Reset to default values for new ledger
    }
  }, [editingItem, reset]);

  // Keyboard navigation: Escape key to cancel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (confirm('Are you sure you want to cancel and discard changes?')) {
          onCancel();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  const onSubmit = async (data: LedgerFormData) => {
    setLoading(true);
    try {
      const finalData = {
        ...data,
        opening_balance: data.opening_balance_type === 'Cr' ? -data.opening_balance : data.opening_balance,
      };
      await onSave(finalData);
      toast.success(editingItem ? 'Ledger updated successfully!' : 'Ledger created successfully!');
    } catch (error: any) {
      console.error('Error saving ledger:', error);
      toast.error(error.message || 'Failed to save ledger');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderLedgerGroupItem = (item: LedgerGroup) => (
    <div className="flex items-center justify-between">
      <span className="font-medium">{item.name}</span>
      <span className="text-xs text-gray-500 capitalize">{item.group_type}</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Button onClick={onCancel} variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  {editingItem ? 'Edit Ledger' : 'Create New Ledger'}
                </h1>
                <p className="text-gray-600">Manage your chart of accounts</p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || loading}
            className="bg-gradient-to-r from-green-500 to-green-600"
          >
            {isSubmitting || loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="w-5 h-5 mr-2" />
                Save Ledger
              </div>
            )}
          </Button>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Ledger Info */}
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                Basic Ledger Information
              </h3>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleSection('basicInfo')}
                className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                {expandedSections.basicInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </motion.button>
            </div>
            <AnimatePresence>
              {expandedSections.basicInfo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden space-y-4"
                >
                  <Input
                    label="Ledger Name *"
                    {...register('name')}
                    placeholder="e.g., Cash, Sales Account"
                    error={errors.name?.message}
                  />
                  <Input
                    label="Alias (Optional)"
                    {...register('alias')}
                    placeholder="Alternative name"
                    error={errors.alias?.message}
                  />
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Under Group *
                    </label>
                    <SearchableDropdown
                      items={allLedgerGroups}
                      value={watch('group_id') || ''}
                      onSelect={(item) => setValue('group_id', item.id, { shouldValidate: true })}
                      placeholder="Search ledger group..."
                      displayField="name"
                      searchFields={['name', 'group_type']}
                      renderItem={renderLedgerGroupItem}
                      className="w-full"
                    />
                    {errors.group_id && <p className="mt-2 text-sm text-red-600">{errors.group_id.message}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Mailing Details */}
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-purple-600" />
                Mailing Details
              </h3>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleSection('mailingDetails')}
                className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 hover:text-purple-600 transition-colors"
              >
                {expandedSections.mailingDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </motion.button>
            </div>
            <AnimatePresence>
              {expandedSections.mailingDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden space-y-4"
                >
                  <Input
                    label="Mailing Name (Optional)"
                    {...register('mailing_name')}
                    placeholder="Name for correspondence"
                    error={errors.mailing_name?.message}
                  />
                  <Input
                    label="Address Line 1 (Optional)"
                    {...register('address_line1')}
                    placeholder="Street address, P.O. box"
                    error={errors.address_line1?.message}
                  />
                  <Input
                    label="Address Line 2 (Optional)"
                    {...register('address_line2')}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    error={errors.address_line2?.message}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="City (Optional)"
                      {...register('city')}
                      placeholder="City"
                      error={errors.city?.message}
                    />
                    <Input
                      label="Pincode (Optional)"
                      {...register('pincode')}
                      placeholder="Pincode"
                      error={errors.pincode?.message}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State (Optional)
                      </label>
                      <select
                        {...register('state')}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select State</option>
                        {indianStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      {errors.state && <p className="mt-2 text-sm text-red-600">{errors.state.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Country (Optional)
                      </label>
                      <Input
                        {...register('country')}
                        placeholder="Country"
                        error={errors.country?.message}
                      />
                    </div>
                  </div>
                  <Input
                    label="Phone Number (Optional)"
                    {...register('phone')}
                    placeholder="e.g., 9876543210"
                    error={errors.phone?.message}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Statutory & GST Details */}
          {showStatutoryGstDetails && (
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Scale className="w-5 h-5 mr-2 text-green-600" />
                  Statutory & GST Details
                </h3>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleSection('statutoryGst')}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 hover:text-green-600 transition-colors"
                >
                  {expandedSections.statutoryGst ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </motion.button>
              </div>
              <AnimatePresence>
                {expandedSections.statutoryGst && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        GST Registration Type
                      </label>
                      <select
                        {...register('gst_registration_type')}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select Type</option>
                        {gstRegistrationTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.gst_registration_type && <p className="mt-2 text-sm text-red-600">{errors.gst_registration_type.message}</p>}
                    </div>
                    <Input
                      label="GSTIN (Optional)"
                      {...register('gstin')}
                      placeholder="15-character GSTIN"
                      error={errors.gstin?.message}
                      icon={errors.gstin ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      success={!errors.gstin && watch('gstin') !== undefined && watch('gstin') !== ''}
                    />
                    <Input
                      label="PAN Number (Optional)"
                      {...register('pan_number')}
                      placeholder="10-character PAN"
                      error={errors.pan_number?.message}
                      icon={errors.pan_number ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      success={!errors.pan_number && watch('pan_number') !== undefined && watch('pan_number') !== ''}
                    />
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('is_rcm_applicable')}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Is RCM Applicable?</span>
                    </label>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Type of Dealer
                      </label>
                      <select
                        {...register('type_of_dealer')}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select Type</option>
                        {typeOfDealers.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.type_of_dealer && <p className="mt-2 text-sm text-red-600">{errors.type_of_dealer.message}</p>}
                    </div>
                    {selectedGroup?.name === 'Duties & Taxes' && (
                      <NumberInput
                        label="Applicable Tax Rate (%)"
                        value={watch('applicable_tax_rate') || 0}
                        onChange={(val) => setValue('applicable_tax_rate', val)}
                        step={0.01}
                        min={0}
                        max={100}
                        placeholder="0.00"
                        error={errors.applicable_tax_rate?.message}
                        icon={<Percent className="w-4 h-4" />}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )}

          {/* Bank Details */}
          {showBankDetails && (
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Banknote className="w-5 h-5 mr-2 text-orange-600" />
                  Bank Details
                </h3>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleSection('bankDetails')}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 hover:text-orange-600 transition-colors"
                >
                  {expandedSections.bankDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </motion.button>
              </div>
              <AnimatePresence>
                {expandedSections.bankDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden space-y-4"
                  >
                    <Input
                      label="Bank Name"
                      {...register('bank_name')}
                      placeholder="e.g., State Bank of India"
                      error={errors.bank_name?.message}
                    />
                    <Input
                      label="Account Number"
                      {...register('account_number')}
                      placeholder="Bank account number"
                      error={errors.account_number?.message}
                    />
                    <Input
                      label="IFSC Code"
                      {...register('ifsc_code')}
                      placeholder="e.g., SBIN0000001"
                      error={errors.ifsc_code?.message}
                    />
                    <Input
                      label="Branch"
                      {...register('branch')}
                      placeholder="Bank branch name"
                      error={errors.branch?.message}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )}

          {/* Opening Balance */}
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-red-600" />
                Opening Balance
              </h3>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleSection('openingBalance')}
                className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 transition-colors"
              >
                {expandedSections.openingBalance ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </motion.button>
            </div>
            <AnimatePresence>
              {expandedSections.openingBalance && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden space-y-4"
                >
                  <NumberInput
                    label="Opening Balance *"
                    value={watch('opening_balance')}
                    onChange={(val) => setValue('opening_balance', val, { shouldValidate: true })}
                    step={0.01}
                    min={0}
                    placeholder="0.00"
                    error={errors.opening_balance?.message}
                  />
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Balance Type *
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="Dr"
                          {...register('opening_balance_type')}
                          checked={watch('opening_balance_type') === 'Dr'}
                          className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Debit (Dr)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="Cr"
                          {...register('opening_balance_type')}
                          checked={watch('opening_balance_type') === 'Cr'}
                          className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Credit (Cr)</span>
                      </label>
                    </div>
                    {errors.opening_balance_type && <p className="mt-2 text-sm text-red-600">{errors.opening_balance_type.message}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </form>
      </div>
    </motion.div>
  );
};

