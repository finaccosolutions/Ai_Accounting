import React, { useState } from 'react';
import { Calendar, Building, ChevronRight, Plus, ArrowLeft, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useFinancialYears } from '../../hooks/useFinancialYears';
import { useCompany } from '../../hooks/useCompany';
import { Header } from '../ui/Header';

interface FinancialYearSelectorProps {
  onContinue: () => void;
  onChangeCompany: () => void;
}

export const FinancialYearSelector: React.FC<FinancialYearSelectorProps> = ({ 
  onContinue, 
  onChangeCompany 
}) => {
  const { currentCompany } = useCompany();
  const { 
    financialYears, 
    selectedFinancialYears, 
    toggleFinancialYearSelection,
    selectAllFinancialYears,
    clearFinancialYearSelection,
    createFinancialYear,
    loading 
  } = useFinancialYears();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hoveredFY, setHoveredFY] = useState<string | null>(null);
  const [newFYData, setNewFYData] = useState({
    year_name: '',
    start_date: '',
    end_date: '',
    is_current: false
  });

  const handleCreateFY = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createFinancialYear(newFYData);
    if (result.data) {
      setShowCreateForm(false);
      setNewFYData({
        year_name: '',
        start_date: '',
        end_date: '',
        is_current: false
      });
    }
  };

  const handleContinue = () => {
    console.log('✅ Financial years selected, proceeding to dashboard');
    onContinue();
  };

  const canContinue = selectedFinancialYears.length > 0;

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading financial years...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-5xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-105 transition-all duration-300">
                <Calendar className="w-12 h-12 text-white" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-blue-600/20 rounded-3xl blur-xl transform scale-110"></div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              Select Financial Years
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Choose one or more financial years to analyze and manage your accounting data with AI-powered insights
            </p>
            
            {currentCompany && (
              <div className="mt-6 inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
                <Building className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-900">{currentCompany.name}</span>
                <button 
                  onClick={onChangeCompany}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                >
                  Change Company
                </button>
              </div>
            )}
          </div>

          {/* Financial Years Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Available Financial Years</h3>
                  <p className="text-gray-600 mt-1">
                    Selected: <span className="font-semibold text-indigo-600">{selectedFinancialYears.length}</span> of {financialYears.length} financial years
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={selectAllFinancialYears}
                    className="hover:bg-indigo-50 hover:border-indigo-300"
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFinancialYearSelection}
                    className="hover:bg-red-50 hover:border-red-300"
                  >
                    Clear All
                  </Button>
                  <Button 
                    size="sm" 
                    icon={Plus} 
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                  >
                    Create New
                  </Button>
                </div>
              </div>
            </div>

            {financialYears.length > 0 ? (
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {financialYears.map((fy) => (
                    <div
                      key={fy.id}
                      className={`group relative bg-white rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                        selectedFinancialYears.includes(fy.id)
                          ? 'border-indigo-500 shadow-lg transform scale-[1.02] bg-gradient-to-br from-indigo-50 to-purple-50'
                          : hoveredFY === fy.id
                          ? 'border-indigo-300 shadow-lg transform scale-[1.01]'
                          : 'border-gray-200 shadow-md hover:shadow-lg'
                      }`}
                      onClick={() => toggleFinancialYearSelection(fy.id)}
                      onMouseEnter={() => setHoveredFY(fy.id)}
                      onMouseLeave={() => setHoveredFY(null)}
                    >
                      {/* Selection indicator */}
                      {selectedFinancialYears.includes(fy.id) && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center transition-transform duration-300 ${
                            hoveredFY === fy.id || selectedFinancialYears.includes(fy.id) ? 'scale-110' : ''
                          }`}>
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex flex-col items-end space-y-1">
                            {fy.is_current && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                Current
                              </span>
                            )}
                            {fy.is_closed && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                                Closed
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                          {fy.year_name}
                        </h3>
                        
                        <p className="text-gray-600 mb-4">
                          {new Date(fy.start_date).toLocaleDateString()} - {new Date(fy.end_date).toLocaleDateString()}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {Math.ceil((new Date(fy.end_date).getTime() - new Date(fy.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                          </span>
                          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                            selectedFinancialYears.includes(fy.id) ? 'rotate-90 text-indigo-600' : ''
                          }`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Financial Years Found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Create your first financial year to get started with your accounting system.
                </p>
                <Button 
                  icon={Plus} 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  Create Financial Year
                </Button>
              </div>
            )}

            <div className="p-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={onChangeCompany} 
                  icon={ArrowLeft}
                  className="hover:bg-white hover:shadow-md"
                >
                  Change Company
                </Button>
                <Button 
                  onClick={handleContinue}
                  disabled={!canContinue}
                  size="lg"
                  className={`${
                    canContinue 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } transition-all duration-200`}
                >
                  Continue to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Financial Year Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-white/20 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600">
              <h3 className="text-xl font-bold text-white">Create New Financial Year</h3>
              <p className="text-purple-100 mt-1">Set up a new financial period for your company</p>
            </div>
            
            <form onSubmit={handleCreateFY} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Year Name</label>
                <input
                  type="text"
                  value={newFYData.year_name}
                  onChange={(e) => setNewFYData(prev => ({ ...prev, year_name: e.target.value }))}
                  placeholder="e.g., 2024-25"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newFYData.start_date}
                    onChange={(e) => setNewFYData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={newFYData.end_date}
                    onChange={(e) => setNewFYData(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>
              
              <div className="bg-indigo-50 rounded-xl p-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={newFYData.is_current}
                    onChange={(e) => setNewFYData(prev => ({ ...prev, is_current: e.target.checked }))}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900">Set as current financial year</span>
                    <p className="text-xs text-gray-600">This will be the active financial year for new transactions</p>
                  </div>
                </label>
              </div>
              
              <div className="flex items-center justify-end space-x-4 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  loading={loading}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  Create Financial Year
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};