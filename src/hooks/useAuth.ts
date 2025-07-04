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

    const loadUserProfile = async (authUser: User): Promise<void> => {
      try {
        console.log('🔐 useAuth: Loading profile for user:', authUser.email);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('🔐 useAuth: Error loading profile:', error);
          // Don't throw error for missing profile, it's normal for new users
        }

        console.log('🔐 useAuth: Profile loaded:', profile ? 'Profile found' : 'No profile');
        
        if (mounted) {
          setUser({ ...authUser, profile: profile || undefined });
        }
      } catch (error) {
        console.error('🔐 useAuth: Error loading profile:', error);
        // Still set the user even if profile loading fails
        if (mounted) {
          setUser(authUser);
        }
      }
    };

    // Centralized function to handle all auth events
    const handleAuthEvent = async (session: Session | null, eventType: string = 'unknown') => {
      if (!mounted) {
        console.log('🔐 useAuth: Component unmounted, skipping auth event');
        return;
      }

      console.log(`🔐 useAuth: Processing ${eventType} event...`);
      
      try {
        setSession(session);
        
        if (session?.user) {
          console.log('🔐 useAuth: User found, loading profile for:', session.user.email);
          await loadUserProfile(session.user);
        } else {
          console.log('🔐 useAuth: No session, clearing user state');
          if (mounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error(`🔐 useAuth: Error in ${eventType}:`, error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          console.log(`🔐 useAuth: ${eventType} complete, setting loading to false`);
          setLoading(false);
        }
      }
    };

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔐 useAuth: Getting initial session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔐 useAuth: Error getting initial session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        await handleAuthEvent(session, 'initial_session');
      } catch (error) {
        console.error('🔐 useAuth: Unexpected error in getInitialSession:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔐 useAuth: Auth state changed:', event, session?.user?.email || 'No user');
      await handleAuthEvent(session, `auth_${event}`);
    });

    return () => {
      console.log('🔐 useAuth: Cleaning up...');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, mobileNumber?: string) => {
    try {
      setLoading(true);
      console.log('🔐 useAuth: Signing up user:', email);
      
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

      console.log('🔐 useAuth: Sign up successful');
      return { data, error: null };
    } catch (error: any) {
      console.error('🔐 useAuth: Sign up error:', error);
      toast.error(error.message);
      setLoading(false); // Set loading to false on error
      return { data: null, error };
    }
    // Note: Don't set loading to false on success as auth state change will handle it
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('🔐 useAuth: Signing in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Signed in successfully');
      console.log('🔐 useAuth: Sign in successful');
      return { data, error: null };
    } catch (error: any) {
      console.error('🔐 useAuth: Sign in error:', error);
      toast.error(error.message);
      setLoading(false); // Set loading to false on error
      return { data: null, error };
    }
    // Note: Don't set loading to false on success as auth state change will handle it
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('🔐 useAuth: Signing out user');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Signed out successfully');
      console.log('🔐 useAuth: Sign out successful');
    } catch (error: any) {
      console.error('🔐 useAuth: Sign out error:', error);
      toast.error(error.message);
      setLoading(false); // Set loading to false on error
    }
    // Note: Don't set loading to false on success as auth state change will handle it
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
      console.log('🔐 useAuth: Profile update successful');
      return { data, error: null };
    } catch (error: any) {
      console.error('🔐 useAuth: Profile update error:', error);
      toast.error(error.message);
      return { data: null, error };
    }
  };

  // Debug logging
  console.log('🔐 useAuth: Current state:', {
    hasUser: !!user,
    userEmail: user?.email || 'None',
    hasProfile: !!user?.profile,
    loading,
    sessionExists: !!session
  });

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