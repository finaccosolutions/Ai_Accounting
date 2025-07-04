import React from 'react';
import { Building, Plus, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCompany } from '../../hooks/useCompany';
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
        <div className="w-full max-w-2xl">
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
                  <button
                    key={company.id}
                    onClick={() => switchCompany(company.id)}
                    disabled={loading}
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                        <p className="text-sm text-gray-500">
                          {company.city && company.state ? `${company.city}, ${company.state}` : 'No location set'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
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