import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Company } from '../../types';
import { ChevronDown, Building2, Plus } from 'lucide-react';

export const CompanySelector: React.FC = () => {
  const { selectedCompany, setSelectedCompany } = useApp();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-w-[200px]"
      >
        <Building2 className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-900 truncate">
          {selectedCompany ? selectedCompany.name : 'Select Company'}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {companies.length > 0 ? (
            <>
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => handleCompanySelect(company)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-0"
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
                </button>
              ))}
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-t border-gray-200 text-blue-600"
              >
                <div className="flex items-center space-x-3">
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">Add New Company</span>
                </div>
              </button>
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">No companies found</p>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Create your first company
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};