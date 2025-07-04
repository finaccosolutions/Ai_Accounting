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
    if (user) {
      loadUserCompanies();
    } else {
      setCompanies([]);
      setCurrentCompany(null);
      setUserRole(null);
      setLoading(false);
    }
  }, [user]);

  const loadUserCompanies = async () => {
    try {
      if (!user) return;

      setLoading(true);

      // Get user's company memberships
      const { data: companyUsers, error: companyUsersError } = await supabase
        .from('company_users')
        .select('company_id, role')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (companyUsersError) {
        console.error('Error loading company users:', companyUsersError);
        setCompanies([]);
        setLoading(false);
        return;
      }

      if (!companyUsers || companyUsers.length === 0) {
        setCompanies([]);
        setCurrentCompany(null);
        setUserRole(null);
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
        console.error('Error loading companies:', companiesError);
        toast.error('Error loading companies');
        setCompanies([]);
      } else {
        setCompanies(userCompanies || []);
      }

      // Check if there's a stored current company
      const storedCompanyId = localStorage.getItem('currentCompanyId');
      if (storedCompanyId && userCompanies) {
        const storedCompany = userCompanies.find(c => c.id === storedCompanyId);
        if (storedCompany) {
          const companyUser = companyUsers.find(cu => cu.company_id === storedCompanyId);
          setCurrentCompany(storedCompany);
          setUserRole(companyUser?.role || null);
        }
      }
    } catch (error: any) {
      console.error('Error loading companies:', error);
      toast.error('Error loading companies');
    } finally {
      setLoading(false);
    }
  };

  const switchCompany = async (companyId: string) => {
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

      setCurrentCompany(company);
      setUserRole(companyUser.role);
      localStorage.setItem('currentCompanyId', companyId);
      toast.success(`Switched to ${company.name}`);
    } catch (error: any) {
      console.error('Error switching company:', error);
      toast.error('Error switching company');
    }
  };

  const createCompany = async (companyData: Database['public']['Tables']['companies']['Insert']) => {
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

      // Add user as admin
      const { error: userError } = await supabase
        .from('company_users')
        .insert({
          company_id: company.id,
          user_id: user.id,
          role: 'admin',
        });

      if (userError) throw userError;

      // Set up default company data
      const { error: setupError } = await supabase.rpc('setup_default_company_data', {
        company_uuid: company.id
      });

      if (setupError) {
        console.error('Error setting up default data:', setupError);
        // Don't fail the company creation for this
      }

      await loadUserCompanies();
      toast.success('Company created successfully');
      return { data: company, error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (companyId: string, updates: Database['public']['Tables']['companies']['Update']) => {
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
      toast.error(error.message);
      return { data: null, error };
    }
  };

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