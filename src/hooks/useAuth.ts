import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import toast from 'react-hot-toast';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AuthUser extends User {
  profile?: Profile;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let mounted = true;
    console.log('🔐 useAuth: Initializing...');

    // Get initial session immediately
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            console.log('🔐 User is logged in:', session.user.email);
            setUser(session.user);
            setSession(session);
            // Load profile in background without blocking
            loadUserProfile(session.user);
          } else {
            console.log('🔐 No user session found');
            setUser(null);
            setSession(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('🔐 Error getting session:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    };

    // Load user profile in background
    const loadUserProfile = async (authUser: User) => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (mounted && profile) {
          setUser({ ...authUser, profile });
        }
      } catch (error) {
        console.log('🔐 Profile not found or error loading profile, user can still continue');
        // Don't block user if profile fails to load
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔐 Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('🔐 User signed in:', session.user.email);
        setUser(session.user);
        setSession(session);
        setLoading(false);
        // Load profile in background
        loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('🔐 User signed out');
        setUser(null);
        setSession(null);
        setLoading(false);
        localStorage.removeItem('currentCompanyId');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, mobileNumber?: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            mobile_number: mobileNumber,
          },
        },
      });

      if (error) throw error;

      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Please check your email for verification link');
      } else {
        toast.success('Account created successfully');
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('🔐 signUp error:', error);
      toast.error(error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Signed in successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('🔐 signIn error:', error);
      toast.error(error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.removeItem('currentCompanyId');
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('🔐 signOut error:', error);
      // Clear local state even if signOut fails
      setUser(null);
      setSession(null);
      localStorage.removeItem('currentCompanyId');
      toast.error('Error signing out, but you have been logged out locally');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUser({ ...user, profile: data });
      toast.success('Profile updated successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('🔐 updateProfile error:', error);
      toast.error(error.message);
      return { data: null, error };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
};