import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Company, FinancialYear } from '../../types';
import { 
  Building2, 
  Plus, 
  Search, 
  Calendar, 
  ChevronRight, 
  Filter,
  Sparkles,
  TrendingUp,
  Users,
  Globe,
  ArrowRight
} from 'lucide-react';
import { CompanyForm } from './CompanyForm';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import toast from 'react-hot-toast';

interface CompanySelectorPageProps {
  onCompanySelected: () => void;
}

export const CompanySelectorPage: React.FC<CompanySelectorPageProps> = ({ onCompanySelected }) => {
  const { setSelectedCompany, setSelectedFinancialYear } = useApp();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [step, setStep] = useState<'companies' | 'financial-years'>('companies');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
      .from('companies')
      .select('id, name, admin_id') // NOT '*'
      .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  }; 

  const fetchFinancialYears = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('financial_years')
        .select('id, year_start, year_end, is_active, created_at, company_id')
        .eq('company_id', companyId)
        .order('year_start', { ascending: false });


      if (error) throw error;
      setFinancialYears(data || []);
    } catch (error) {
      console.error('Error fetching financial years:', error);
      toast.error('Failed to fetch financial years');
    }
  };

  const handleCompanySelect = async (company: Company) => {
    setSelectedCompanyId(company.id);
    setSelectedCompany(company);
    await fetchFinancialYears(company.id);
    setStep('financial-years');
  };

  const handleFinancialYearSelect = (financialYear: FinancialYear) => {
    setSelectedFinancialYear(financialYear);
    onCompanySelected();
  };

  const handleCreateCompany = () => {
    setShowCompanyForm(true);
  };

  const handleCompanyCreated = () => {
    setShowCompanyForm(false);
    fetchCompanies();
    // After creating company, automatically proceed to dashboard
    onCompanySelected();
  };

  const handleBackToCompanies = () => {
    setStep('companies');
    setSelectedCompanyId(null);
    setFinancialYears([]);
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.gstin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  if (showCompanyForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <CompanyForm
          onBack={() => setShowCompanyForm(false)}
          onSuccess={handleCompanyCreated}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            {step === 'companies' ? 'Select Your Company' : 'Choose Financial Year'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {step === 'companies' 
              ? 'Choose a company to access your accounting dashboard and manage your financial data'
              : `Select the financial year for ${selectedCompany?.name} to continue`
            }
          </p>
        </motion.div>

        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center mb-8"
        >
          <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <div className={`flex items-center space-x-2 ${step === 'companies' ? 'text-blue-600' : 'text-gray-500'}`}>
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">Company</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div className={`flex items-center space-x-2 ${step === 'financial-years' ? 'text-blue-600' : 'text-gray-400'}`}>
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Financial Year</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center space-x-2 text-gray-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </div>
          </div>
        </motion.div>

        {step === 'companies' ? (
          <motion.div
            key="companies"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Search and Actions */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search companies by name, GSTIN, or email..."
                    className="pl-12 h-12 bg-gray-50/80 border-gray-200/50 focus:bg-white"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button 
                    onClick={handleCreateCompany}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Company
                  </Button>
                </div>
              </div>
            </Card>

            {/* Companies Grid */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredCompanies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map((company, index) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCompanySelect(company)}
                    className="group cursor-pointer"
                  >
                    <Card className="p-6 h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {company.name}
                        </h3>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          {company.gstin && (
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span>GSTIN: {company.gstin}</span>
                            </div>
                          )}
                          {company.email && (
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              <span className="truncate">{company.email}</span>
                            </div>
                          )}
                          {company.phone && (
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                              <span>{company.phone}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Created {new Date(company.created_at).toLocaleDateString()}</span>
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>Active</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No companies found' : 'No companies yet'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm 
                    ? 'Try adjusting your search terms or create a new company'
                    : 'Get started by creating your first company to access the accounting dashboard'
                  }
                </p>
                <Button 
                  onClick={handleCreateCompany}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Company
                </Button>
              </Card>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="financial-years"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Selected Company Info */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedCompany?.name}</h2>
                    <p className="text-gray-600">Select a financial year to continue</p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleBackToCompanies}>
                  <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                  Back to Companies
                </Button>
              </div>
            </Card>

            {/* Financial Years */}
            {financialYears.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {financialYears.map((fy, index) => (
                  <motion.div
                    key={fy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleFinancialYearSelect(fy)}
                    className="group cursor-pointer"
                  >
                    <Card className="p-6 h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        {fy.is_active && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                            Active
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                          FY {new Date(fy.year_start).getFullYear()}-{new Date(fy.year_end).getFullYear().toString().slice(-2)}
                        </h3>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center justify-between">
                            <span>Start Date:</span>
                            <span className="font-medium">{new Date(fy.year_start).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>End Date:</span>
                            <span className="font-medium">{new Date(fy.year_end).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Created {new Date(fy.created_at).toLocaleDateString()}</span>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Financial Years Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  This company doesn't have any financial years set up yet. Please contact your administrator to set up financial years.
                </p>
                <Button variant="outline" onClick={handleBackToCompanies}>
                  <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                  Back to Companies
                </Button>
              </Card>
            )}
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 pt-8 border-t border-gray-200/50"
        >
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Accounting</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Cloud-Based</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Real-time Analytics</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};