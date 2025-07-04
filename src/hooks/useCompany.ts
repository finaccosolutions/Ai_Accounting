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

      console.log('🏢 loadUserCompanies: Setting loading to true');
      setLoading(true);

      console.log('🏢 loadUserCompanies: Fetching company_users for user:', user.id);
      
      // Get user's company memberships
      const { data: companyUsers, error: companyUsersError } = await supabase
        .from('company_users')
        .select('company_id, role')
        .eq('user_id', user.id)
        .eq('is_active', true);

      console.log('🏢 loadUserCompanies: Company users query result:', {
        data: companyUsers,
        error: companyUsersError,
        count: companyUsers?.length || 0
      });

      if (companyUsersError) {
        console.error('🏢 loadUserCompanies: Error loading company users:', companyUsersError);
        setCompanies([]);
        setLoading(false);
        return;
      }

      if (!companyUsers || companyUsers.length === 0) {
        console.log('🏢 loadUserCompanies: No company memberships found, user needs to create/join a company');
        setCompanies([]);
        setCurrentCompany(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      console.log('🏢 loadUserCompanies: Found company memberships, fetching company details...');
      
      // Get company details
      const companyIds = companyUsers.map(cu => cu.company_id);
      console.log('🏢 loadUserCompanies: Company IDs to fetch:', companyIds);
      
      const { data: userCompanies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .in('id', companyIds);

      console.log('🏢 loadUserCompanies: Companies query result:', {
        data: userCompanies,
        error: companiesError,
        count: userCompanies?.length || 0
      });

      if (companiesError) {
        console.error('🏢 loadUserCompanies: Error loading companies:', companiesError);
        toast.error('Error loading companies');
        setCompanies([]);
      } else {
        console.log('🏢 loadUserCompanies: Successfully loaded companies:', userCompanies?.map(c => c.name));
        setCompanies(userCompanies || []);
      }

      // Check if there's a stored current company
      const storedCompanyId = localStorage.getItem('currentCompanyId');
      console.log('🏢 loadUserCompanies: Stored company ID from localStorage:', storedCompanyId);
      
      if (storedCompanyId && userCompanies) {
        const storedCompany = userCompanies.find(c => c.id === storedCompanyId);
        console.log('🏢 loadUserCompanies: Found stored company:', storedCompany?.name || 'Not found');
        
        if (storedCompany) {
          const companyUser = companyUsers.find(cu => cu.company_id === storedCompanyId);
          console.log('🏢 loadUserCompanies: Setting current company and role:', {
            company: storedCompany.name,
            role: companyUser?.role
          });
          setCurrentCompany(storedCompany);
          setUserRole(companyUser?.role || null);
        }
      }
    } catch (error: any) {
      console.error('🏢 loadUserCompanies: Unexpected error:', error);
      toast.error('Error loading companies');
    } finally {
      console.log('🏢 loadUserCompanies: Setting loading to false');
      setLoading(false);
    }
  };

  const switchCompany = async (companyId: string) => {
    console.log('🏢 switchCompany: Switching to company:', companyId);
    
    try {
      if (!user) return;

      // Get company details and user role
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

      console.log('🏢 switchCompany: Successfully switched to:', company.name);
      setCurrentCompany(company);
      setUserRole(companyUser.role);
      localStorage.setItem('currentCompanyId', companyId);
      toast.success(`Switched to ${company.name}`);
    } catch (error: any) {
      console.error('🏢 switchCompany: Error switching company:', error);
      toast.error('Error switching company');
    }
  };

  const createCompany = async (companyData: Database['public']['Tables']['companies']['Insert']) => {
    console.log('🏢 createCompany: Creating new company:', companyData.name);
    
    try {
      if (!user) throw new Error('No user logged in');

      setLoading(true);

      // Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          ...companyData,
          created_by: user.id,
        })
        .select()
        .single();

      if (companyError) throw companyError;

      console.log('🏢 createCompany: Company created successfully:', company.name);

      // Add user as admin
      const { error: userError } = await supabase
        .from('company_users')
        .insert({
          company_id: company.id,
          user_id: user.id,
          role: 'admin',
        });

      if (userError) throw userError;

      console.log('🏢 createCompany: User added as admin');

      // Set up default company data
      const { error: setupError } = await supabase.rpc('setup_default_company_data', {
        company_uuid: company.id
      });

      if (setupError) {
        console.error('🏢 createCompany: Error setting up default data:', setupError);
        // Don't fail the company creation for this
      } else {
        console.log('🏢 createCompany: Default data setup completed');
      }

      await loadUserCompanies();
      toast.success('Company created successfully');
      return { data: company, error: null };
    } catch (error: any) {
      console.error('🏢 createCompany: Error creating company:', error);
      toast.error(error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (companyId: string, updates: Database['public']['Tables']['companies']['Update']) => {
    console.log('🏢 updateCompany: Updating company:', companyId);
    
    try {
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
      console.error('🏢 updateCompany: Error updating company:', error);
      toast.error(error.message);
      return { data: null, error };
    }
  };

  console.log('🏢 useCompany: Current state:', {
    companiesCount: companies.length,
    currentCompany: currentCompany?.name || 'None',
    userRole,
    loading
  });

  return {
    companies,
    currentCompany,
    userRole,
    loading,
    switchCompany,
    createCompany,
    updateCompany,
    refreshCompanies: loadUserCompanies,
  };
};