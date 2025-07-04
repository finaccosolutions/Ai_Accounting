import React, { useState } from 'react';
import { Building, Plus, ChevronRight, Calendar, MapPin, Globe, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCompany } from '../../hooks/useCompany';
import { Header } from '../ui/Header';
import toast from 'react-hot-toast';

interface CompanySelectorProps {
  onCreateCompany: () => void;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({ onCreateCompany }) => {  
  const { companies, switchCompany, loading } = useCompany();
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [switchingCompany, setSwitchingCompany] = useState<string | null>(null);

  const handleCompanySelect = async (companyId: string) => {
    console.log('🏢 CompanySelector: handleCompanySelect function triggered!');
    console.log('🏢 CompanySelector: User clicked on company:', companyId);
    
    const company = companies.find(c => c.id === companyId);
    if (!company) {
      console.error('🏢 CompanySelector: Company not found');
      toast.error('Company not found');
      return;
    }

    console.log('🏢 CompanySelector: Found company:', company.name);
    
    // Show loading toast
    const loadingToastId = toast.loading(`Switching to ${company.name}...`);
    setSwitchingCompany(companyId);
    
    try {
      console.log('🏢 CompanySelector: About to call switchCompany...');
      const result = await switchCompany(companyId);
      
      console.log('🏢 CompanySelector: switchCompany returned:', result);
      
      if (result.success) {
        console.log('🏢 CompanySelector: Company switch successful - should now show FinancialYearSelector');
        toast.dismiss(loadingToastId);
        toast.success(`Successfully switched to ${company.name}`);
        // The parent component should detect this change and show the next step
      } else {
        toast.dismiss(loadingToastId);
        toast.error('Failed to switch company');
        console.error('🏢 CompanySelector: Company switch failed:', result.error);
      }
    } catch (error) {
      console.error('🏢 CompanySelector: Error switching company:', error);
      toast.dismiss(loadingToastId);
      toast.error('Error switching company: ' + (error as Error).message);
    } finally {
      setSwitchingCompany(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-105 transition-all duration-300">
                <Building className="w-12 h-12 text-white" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-xl transform scale-110"></div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Select Your Company
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Choose a company to access your intelligent accounting dashboard and unlock powerful AI-driven insights
            </p>
          </div>

          {/* Companies Grid */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            {companies.length > 0 ? (
              <>
                <div className="p-8 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Your Companies</h3>
                      <p className="text-gray-600 mt-1">Select a company to continue</p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Building className="w-4 h-4" />
                      <span>{companies.length} {companies.length === 1 ? 'company' : 'companies'} available</span>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map((company) => (
                      <CompanyCard 
                        key={company.id} 
                        company={company} 
                        onSelect={() => handleCompanySelect(company.id)}
                        loading={switchingCompany === company.id}
                        isHovered={hoveredCompany === company.id}
                        onHover={() => setHoveredCompany(company.id)}
                        onLeave={() => setHoveredCompany(null)}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Building className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Companies Found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  You don't have access to any companies yet. Create your first company to get started with intelligent accounting.
                </p>
              </div>
            )}

            <div className="p-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-gray-100">
              <Button
                onClick={onCreateCompany}
                icon={Plus}
                size="lg"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
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
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ 
  company, 
  onSelect, 
  loading, 
  isHovered, 
  onHover, 
  onLeave 
}) => {
  return (
    <div 
      className={`group relative bg-white rounded-xl border-2 transition-all duration-300 overflow-hidden cursor-pointer ${
        isHovered 
          ? 'border-indigo-300 shadow-xl transform scale-[1.02]' 
          : 'border-gray-200 shadow-md hover:shadow-lg'
      } ${loading ? 'opacity-75 cursor-wait' : ''}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={loading ? undefined : onSelect}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 transition-opacity duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center transition-transform duration-300 ${
            isHovered ? 'scale-110' : ''
          }`}>
            <Building className="w-6 h-6 text-white" />
          </div>
          
          {loading ? (
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-all duration-300 ${
              isHovered ? 'text-indigo-600 transform translate-x-1' : ''
            }`} />
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
          {company.name}
        </h3>
        
        <div className="space-y-2 mb-4">
          {company.city && company.state && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{company.city}, {company.state}</span>
            </div>
          )}
          {company.gstin && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <span>GSTIN: {company.gstin}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {loading ? 'Switching...' : 'Click to select'}
          </span>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs text-green-600 font-medium">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};