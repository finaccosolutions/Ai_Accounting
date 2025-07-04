import React, { useState } from 'react';
import { Building, Plus, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCompany } from '../../hooks/useCompany';
import { CompanySetup } from './CompanySetup';

export const CompanySelector: React.FC = () => {
  const { companies, loading, switchCompany } = useCompany();
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return <CompanySetup onBack={() => setShowCreateForm(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Select Company</h2>
          <p className="mt-2 text-gray-600">Choose a company to continue or create a new one</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {companies.length === 0 ? (
            <div className="text-center py-12">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Companies Found</h3>
              <p className="text-gray-600 mb-6">You don't have access to any companies yet. Create your first company to get started.</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                icon={Plus}
                size="lg"
              >
                Create Your First Company
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Your Companies</h3>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  icon={Plus}
                  variant="outline"
                >
                  Create New Company
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => switchCompany(company.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-blue-600" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">{company.name}</h4>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      {company.gstin && (
                        <p><span className="font-medium">GSTIN:</span> {company.gstin}</p>
                      )}
                      {company.city && company.state && (
                        <p><span className="font-medium">Location:</span> {company.city}, {company.state}</p>
                      )}
                      <p><span className="font-medium">Financial Year:</span> {company.financial_year_start}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};