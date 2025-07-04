import React from 'react';
import { Building, Plus, ChevronRight, Calendar, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCompany } from '../../hooks/useCompany';
import { useFinancialYears } from '../../hooks/useFinancialYears';
import { Header } from '../ui/Header';

interface CompanySelectorProps {
  onCreateCompany: () => void;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({ onCreateCompany }) => {
  const { companies, switchCompany, loading } = useCompany();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Your Company</h1>
            <p className="text-gray-600">Choose a company to access your accounting dashboard</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {companies.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {companies.map((company) => (
                  <CompanyCard 
                    key={company.id} 
                    company={company} 
                    onSelect={() => switchCompany(company.id)}
                    loading={loading}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Companies Found</h3>
                <p className="text-gray-500 mb-6">You don't have access to any companies yet. Create your first company to get started.</p>
              </div>
            )}

            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <Button
                onClick={onCreateCompany}
                icon={Plus}
                size="lg"
                className="w-full"
                disabled={loading}
              >
                Create New Company
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CompanyCardProps {
  company: any;
  onSelect: () => void;
  loading: boolean;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onSelect, loading }) => {
  const [showFinancialYears, setShowFinancialYears] = React.useState(false);
  const [financialYears, setFinancialYears] = React.useState<any[]>([]);
  const [loadingFY, setLoadingFY] = React.useState(false);

  const loadFinancialYears = async () => {
    if (showFinancialYears || loadingFY) return;
    
    setLoadingFY(true);
    try {
      const { supabase } = await import('../../lib/supabase');
      const { data, error } = await supabase
        .from('financial_years')
        .select('*')
        .eq('company_id', company.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setFinancialYears(data || []);
      setShowFinancialYears(true);
    } catch (error) {
      console.error('Error loading financial years:', error);
    } finally {
      setLoadingFY(false);
    }
  };

  const handleCompanyClick = () => {
    if (financialYears.length === 0) {
      loadFinancialYears();
    } else {
      setShowFinancialYears(!showFinancialYears);
    }
  };

  const handleFinancialYearSelect = (fyId: string) => {
    // Store selected financial year in localStorage
    localStorage.setItem('selectedFinancialYear', fyId);
    onSelect();
  };

  return (
    <div className="border border-gray-200 rounded-lg m-4 overflow-hidden">
      <button
        onClick={handleCompanyClick}
        disabled={loading || loadingFY}
        className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              {company.city && company.state && (
                <span>{company.city}, {company.state}</span>
              )}
              {company.gstin && (
                <span>GSTIN: {company.gstin}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {loadingFY && (
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          )}
          <ChevronRight className={`w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-all ${showFinancialYears ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {showFinancialYears && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-900">Financial Years</h4>
              <span className="text-sm text-gray-500">({financialYears.length})</span>
            </div>
            
            {financialYears.length > 0 ? (
              <div className="space-y-2">
                {financialYears.map((fy) => (
                  <button
                    key={fy.id}
                    onClick={() => handleFinancialYearSelect(fy.id)}
                    className="w-full p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{fy.year_name}</span>
                          {fy.is_current && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Current
                            </span>
                          )}
                          {fy.is_closed && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Closed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(fy.start_date).toLocaleDateString()} - {new Date(fy.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </button>
                ))}
                
                <button
                  onClick={onSelect}
                  className="w-full p-3 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Access All Financial Years
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No financial years found</p>
                <button
                  onClick={onSelect}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Set up financial years →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};