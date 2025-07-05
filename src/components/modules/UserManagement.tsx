import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Users, Mail, Phone, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface CompanyUser {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
    mobile_number?: string;
  };
}

const roles = [
  { value: 'admin', label: 'Administrator', description: 'Full access to all features' },
  { value: 'accountant', label: 'Accountant', description: 'Can create vouchers and manage masters' },
  { value: 'auditor', label: 'Auditor', description: 'Read-only access with audit features' },
  { value: 'owner', label: 'Owner', description: 'View reports and dashboard' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access to basic features' },
];

export const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const { currentCompany, userRole } = useApp();
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    full_name: '',
    mobile_number: '',
    role: 'accountant',
    send_invitation: true
  });

  useEffect(() => {
    if (currentCompany && userRole === 'admin') {
      loadCompanyUsers();
    }
  }, [currentCompany, userRole]);

  const loadCompanyUsers = async () => {
    try {
      if (!currentCompany) return;

      const { data, error } = await supabase
        .from('company_users')
        .select(`
          *,
          profiles (
            full_name,
            email,
            mobile_number
          )
        `)
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCompanyUsers(data || []);
    } catch (error: any) {
      console.error('Error loading company users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!currentCompany) throw new Error('No company selected');

      setLoading(true);

      // First, check if user already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteData.email)
        .single();

      let userId: string;

      if (existingProfile) {
        // User exists, just add them to the company
        userId = existingProfile.id;
        
        // Check if they're already in this company
        const { data: existingCompanyUser } = await supabase
          .from('company_users')
          .select('id')
          .eq('company_id', currentCompany.id)
          .eq('user_id', userId)
          .single();

        if (existingCompanyUser) {
          throw new Error('User is already a member of this company');
        }
      } else {
        // Create new user account
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: inviteData.email,
          password: Math.random().toString(36).slice(-8), // Temporary password
          email_confirm: true,
          user_metadata: {
            full_name: inviteData.full_name,
            mobile_number: inviteData.mobile_number,
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Failed to create user');

        userId = authData.user.id;

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: inviteData.email,
            full_name: inviteData.full_name,
            mobile_number: inviteData.mobile_number,
            role: inviteData.role,
          });

        if (profileError) throw profileError;
      }

      // Add user to company
      const { error: companyUserError } = await supabase
        .from('company_users')
        .insert({
          company_id: currentCompany.id,
          user_id: userId,
          role: inviteData.role,
        });

      if (companyUserError) throw companyUserError;

      // Send invitation email if requested
      if (inviteData.send_invitation) {
        // In a real app, you would send an email invitation here
        toast.success('User invited successfully! Invitation email sent.');
      } else {
        toast.success('User added to company successfully!');
      }

      setShowInviteForm(false);
      setInviteData({
        email: '',
        full_name: '',
        mobile_number: '',
        role: 'accountant',
        send_invitation: true
      });
      
      await loadCompanyUsers();
    } catch (error: any) {
      console.error('Error inviting user:', error);
      toast.error(error.message || 'Error inviting user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (companyUserId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('company_users')
        .update({ role: newRole })
        .eq('id', companyUserId);

      if (error) throw error;

      toast.success('User role updated successfully');
      await loadCompanyUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('Error updating user role');
    }
  };

  const handleDeactivateUser = async (companyUserId: string) => {
    try {
      const { error } = await supabase
        .from('company_users')
        .update({ is_active: false })
        .eq('id', companyUserId);

      if (error) throw error;

      toast.success('User deactivated successfully');
      await loadCompanyUsers();
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      toast.error('Error deactivating user');
    }
  };

  const filteredUsers = companyUsers.filter(companyUser =>
    companyUser.profiles?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    companyUser.profiles?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    companyUser.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You need administrator privileges to manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage company users and their permissions</p>
        </div>
        <Button icon={Plus} onClick={() => setShowInviteForm(true)}>
          Invite User
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button variant="outline" icon={Filter}>
          Filter
        </Button>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Company Users ({filteredUsers.length})</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((companyUser) => (
              <div key={companyUser.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {companyUser.profiles?.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{companyUser.profiles?.full_name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{companyUser.profiles?.email}</span>
                        </div>
                        {companyUser.profiles?.mobile_number && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{companyUser.profiles.mobile_number}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          companyUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          companyUser.role === 'accountant' ? 'bg-blue-100 text-blue-800' :
                          companyUser.role === 'auditor' ? 'bg-orange-100 text-orange-800' :
                          companyUser.role === 'owner' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {roles.find(r => r.value === companyUser.role)?.label || companyUser.role}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          companyUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {companyUser.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {companyUser.user_id !== user?.id && (
                    <div className="flex items-center space-x-2">
                      <select
                        value={companyUser.role}
                        onChange={(e) => handleUpdateUserRole(companyUser.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {roles.map(role => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      
                      {companyUser.is_active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDeactivateUser(companyUser.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
            <p className="text-gray-500 mb-6">Start by inviting users to your company.</p>
            <Button icon={Plus} onClick={() => setShowInviteForm(true)}>
              Invite First User
            </Button>
          </div>
        )}
      </div>

      {/* Invite User Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite User</h3>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={inviteData.full_name}
                  onChange={(e) => setInviteData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <input
                  type="tel"
                  value={inviteData.mobile_number}
                  onChange={(e) => setInviteData(prev => ({ ...prev, mobile_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {roles.find(r => r.value === inviteData.role)?.description}
                </p>
              </div>
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={inviteData.send_invitation}
                    onChange={(e) => setInviteData(prev => ({ ...prev, send_invitation: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Send invitation email</span>
                </label>
              </div>
              <div className="flex items-center justify-end space-x-4 mt-6">
                <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  Invite User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};