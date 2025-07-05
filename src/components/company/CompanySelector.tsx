import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Company } from '../../types';
import { ChevronDown, Building2, Plus } from 'lucide-react';
import { CompanyForm } from './CompanyForm';
import { motion, AnimatePresence } from 'framer-motion';

export const CompanySelector: React.FC = () => {
  const { selectedCompany, setSelectedCompany } = useApp();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCompanyForm, setShowCompanyForm] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
      
      // Auto-select first company if none selected
      if (data && data.length > 0 && !selectedCompany) {
        setSelectedCompany(data[0]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setIsOpen(false);
  };

  const handleCreateCompany = () => {
    setIsOpen(false);
    setShowCompanyForm(true);
  };

  const handleCompanyCreated = () => {
    setShowCompanyForm(false);
    fetchCompanies();
  };

  if (showCompanyForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CompanyForm
            onBack={() => setShowCompanyForm(false)}
            onSuccess={handleCompanyCreated}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg animate-pulse">
        <Building2 className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-w-[200px]"
      >
        <Building2 className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-900 truncate">
          {selectedCompany ? selectedCompany.name : 'Select Company'}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 ml-auto transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {companies.length > 0 ? (
              <>
                {companies.map((company) => (
                  <motion.button
                    key={company.id}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    onClick={() => handleCompanySelect(company)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-0 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{company.name}</p>
                        {company.gstin && (
                          <p className="text-xs text-gray-500">GSTIN: {company.gstin}</p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ backgroundColor: '#eff6ff' }}
                  onClick={handleCreateCompany}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-t border-gray-200 text-blue-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Add New Company</span>
                  </div>
                </motion.button>
              </>
            ) : (
              <div className="px-4 py-6 text-center">
                <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-3">No companies found</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateCompany}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first company
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};