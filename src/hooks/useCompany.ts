import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

type Company = Database['public']['Tables']['companies']['Row'];
type CompanyUser = Database['public']['Tables']['company_users']['Row'];

export const useCompany = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🏢 useCompany: useEffect triggered, user:', user?.email || 'No user');
    
    if (user) {
      console.log('🏢 useCompany: User found, loading companies...');
      loadUserCompanies();
    } else {
      console.log('🏢 useCompany: No user, resetting state');
      setCompanies([]);
      setCurrentCompany(null);
      setUserRole(null);
      setError(null);
      setLoading(false);
    }
  }, [user]);

  const loadUserCompanies = async () => {
    console.log('🏢 loadUserCompanies: Starting to load companies...');
    
    try {
      if (!user) {
        console.log('🏢 loadUserCompanies: No user available, returning early');
        return;
      }

      setLoading(true);
      setError(null);

      // Increase timeout and add better error handling
      const companiesPromise = supabase
        .from('company_users')
        .select('company_id, role')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Company query timeout')), 15000)
      );

      const { data: companyUsers, error: companyUsersError } = await Promise.race([
        companiesPromise, 
        timeoutPromise
      ]) as any;

      console.log('🏢 loadUserCompanies: Company users query result:', {
        data: companyUsers,
        error: companyUsersError,
        count: companyUsers?.length || 0
      });

      if (companyUsersError) {
        console.error('🏢 loadUserCompanies: Error loading company users:', companyUsersError);
        
        // Handle specific RLS policy errors
        if (companyUsersError.message?.includes('infinite recursion')) {
          setError('Database configuration error. Please contact support.');
          toast.error('Database configuration error. Please contact support.');
        } else if (companyUsersError.message?.includes('permission denied')) {
          setError('Access denied. Please check your permissions.');
          toast.error('Access denied. Please check your permissions.');
        } else {
          setError('Failed to load companies. Please try again.');
          toast.error('Failed to load companies. Please try again.');
        }
        
        setCompanies([]);
        setLoading(false);
        return;
      }

      if (!companyUsers || companyUsers.length === 0) {
        console.log('🏢 loadUserCompanies: No company memberships found');
        setCompanies([]);
        setCurrentCompany(null);
        setUserRole(null);
        setError(null);
        setLoading(false);
        return;
      }

      // Get company details
      const companyIds = companyUsers.map(cu => cu.company_id);
      
      const { data: userCompanies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .in('id', companyIds);

      if (companiesError) {
        console.error('🏢 loadUserCompanies: Error loading companies:', companiesError);
        setError('Failed to load company details.');
        toast.error('Error loading companies');
        setCompanies([]);
      } else {
        console.log('🏢 loadUserCompanies: Successfully loaded companies:', userCompanies?.map(c => c.name));
        setCompanies(userCompanies || []);
        setError(null);
      }

      // Check for stored current company
      const storedCompanyId = localStorage.getItem('currentCompanyId');
      if (storedCompanyId && userCompanies) {
        const storedCompany = userCompanies.find(c => c.id === storedCompanyId);
        if (storedCompany) {
          const companyUser = companyUsers.find(cu => cu.company_id === storedCompanyId);
          setCurrentCompany(storedCompany);
          setUserRole(companyUser?.role || null);
        } else {
          // Clear invalid stored company
          localStorage.removeItem('currentCompanyId');
        }
      }
    } catch (error: any) {
      console.error('🏢 loadUserCompanies: Error:', error);
      
      if (error.message === 'Company query timeout') {
        setError('Request timed out. Please check your connection and try again.');
        toast.error('Request timed out. Please try again.');
      } else {
        setError('An unexpected error occurred.');
        toast.error('Error loading companies');
      }
      
      setCompanies([]);
      setCurrentCompany(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const switchCompany = async (companyId: string) => {
    console.log('🏢 switchCompany: Switching to company:', companyId);
    
    try {
      if (!user) return;

      setLoading(true);
      setError(null);

      const { data: companyUser, error } = await supabase
        .from('company_users')
        .select('role')
        .eq('company_id', companyId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      const company = companies.find(c => c.id === companyId);
      if (!company) throw new Error('Company not found');

      setCurrentCompany(company);
      setUserRole(companyUser.role);
      localStorage.setItem('currentCompanyId', companyId);
      toast.success(`Switched to ${company.name}`);
    } catch (error: any) {
      console.error('🏢 switchCompany: Error:', error);
      setError('Failed to switch company.');
      toast.error('Error switching company');
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: Database['public']['Tables']['companies']['Insert']) => {
    console.log('🏢 createCompany: Creating new company:', companyData.name);
    
    try {
      if (!user) throw new Error('No user logged in');

      setLoading(true);
      setError(null);

      // First, ensure the user has a profile record
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('🏢 createCompany: Profile check error:', profileError);
        throw new Error('Failed to verify user profile');
      }

      // If no profile exists, create one
      if (!profile) {
        console.log('🏢 createCompany: Creating user profile...');
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role: 'admin' // Set default role to admin for company creation
          });

        if (createProfileError) {
          console.error('🏢 createCompany: Profile creation error:', createProfileError);
          throw new Error('Failed to create user profile');
        }
      }

      // Prepare company data with explicit user references
      const companyInsertData = {
        ...companyData,
        created_by: user.id,
        user_id: user.id,
      };

      console.log('🏢 createCompany: Inserting company with data:', companyInsertData);

      // Create the company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert(companyInsertData)
        .select()
        .single();

      if (companyError) {
        console.error('🏢 createCompany: Company creation error:', companyError);
        
        // Provide more specific error messages based on the error
        if (companyError.code === '42501') {
          throw new Error('Permission denied. Your account may not have the required permissions to create companies.');
        } else if (companyError.message?.includes('row-level security')) {
          throw new Error('Security policy violation. Please ensure your profile is properly set up.');
        } else {
          throw new Error(companyError.message || 'Failed to create company');
        }
      }

      console.log('🏢 createCompany: Company created successfully:', company);

      // Create the company-user relationship
      const { error: userError } = await supabase
        .from('company_users')
        .insert({
          company_id: company.id,
          user_id: user.id,
          role: 'admin',
        });

      if (userError) {
        console.error('🏢 createCompany: Company user creation error:', userError);
        // Don't throw here as the company is already created
        console.warn('Company created but failed to create user relationship');
      } else {
        console.log('🏢 createCompany: Company user relationship created successfully');
      }

      // Set up default company data
      try {
        await supabase.rpc('setup_default_company_data', {
          company_uuid: company.id
        });
        console.log('🏢 createCompany: Default company data setup completed');
      } catch (setupError) {
        console.error('🏢 createCompany: Error setting up default data:', setupError);
        // Don't throw here as the company is already created
      }

      await loadUserCompanies();
      
      // Automatically switch to the new company
      setCurrentCompany(company);
      setUserRole('admin');
      localStorage.setItem('currentCompanyId', company.id);
      
      toast.success('Company created successfully');
      return { data: company, error: null };
    } catch (error: any) {
      console.error('🏢 createCompany: Error:', error);
      setError('Failed to create company.');
      toast.error(error.message || 'Failed to create company');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (companyId: string, updates: Database['public']['Tables']['companies']['Update']) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', companyId)
        .select()
        .single();

      if (error) throw error;

      if (currentCompany?.id === companyId) {
        setCurrentCompany(data);
      }

      await loadUserCompanies();
      toast.success('Company updated successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('🏢 updateCompany: Error:', error);
      setError('Failed to update company.');
      toast.error(error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  console.log('🏢 useCompany: Current state:', {
    companiesCount: companies.length,
    currentCompany: currentCompany?.name || 'None',
    userRole,
    loading,
    error
  });

  return {
    companies,
    currentCompany,
    userRole,
    loading,
    error,
    switchCompany,
    createCompany,
    updateCompany,
    refreshCompanies: loadUserCompanies,
  };
};