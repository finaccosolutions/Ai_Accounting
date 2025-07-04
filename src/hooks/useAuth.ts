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
    console.log('🔐 useAuth: useEffect mounted, initializing...');

    const clearAuthState = () => {
      if (mounted) {
        console.log('🔐 clearAuthState: Clearing all auth state');
        setUser(null);
        setSession(null);
        setLoading(false);
        // Clear any stored data
        localStorage.removeItem('currentCompanyId');
      }
    };

    const loadUserProfile = async (authUser: User): Promise<void> => {
      try {
        console.log('🔐 loadUserProfile: Starting profile load for user:', authUser.email);
        
        // Increase timeout to 30 seconds for better reliability
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile query timeout')), 30000)
        );

        const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

        console.log('🔐 loadUserProfile: Query result:', { profile, error });

        if (error) {
          if (error.message === 'Profile query timeout') {
            console.error('🔐 loadUserProfile: Profile query timed out');
            // Still set the user even if profile loading times out
            if (mounted) {
              console.log('🔐 loadUserProfile: Setting user without profile due to timeout');
              setUser(authUser);
            }
            return;
          }
          
          console.error('🔐 loadUserProfile: Error loading profile:', error);
          // If profile doesn't exist, create one
          if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
            console.log('🔐 loadUserProfile: No profile found, creating one...');
            await createUserProfile(authUser);
            return;
          }
          
          // For other errors, still set the user without profile
          if (mounted) {
            console.log('🔐 loadUserProfile: Setting user without profile due to error');
            setUser(authUser);
          }
          return;
        }

        if (mounted) {
          const userWithProfile = { ...authUser, profile: profile || undefined };
          console.log('🔐 loadUserProfile: Setting user with profile');
          setUser(userWithProfile);
        }
      } catch (error) {
        console.error('🔐 loadUserProfile: Unexpected error:', error);
        // Still set the user even if profile loading fails
        if (mounted) {
          console.log('🔐 loadUserProfile: Setting user without profile due to unexpected error');
          setUser(authUser);
        }
      }
    };

    const createUserProfile = async (authUser: User): Promise<void> => {
      try {
        console.log('🔐 createUserProfile: Creating profile for user:', authUser.email);
        
        const profileData = {
          id: authUser.id,
          email: authUser.email!,
          full_name: authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
          mobile_number: authUser.user_metadata?.mobile_number || null,
          role: 'accountant' as const,
        };

        const { data: profile, error } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        if (error) {
          console.error('🔐 createUserProfile: Error creating profile:', error);
          // Set user without profile if creation fails
          if (mounted) {
            setUser(authUser);
          }
          return;
        }

        console.log('🔐 createUserProfile: Profile created successfully');
        if (mounted) {
          const userWithProfile = { ...authUser, profile };
          setUser(userWithProfile);
        }
      } catch (error) {
        console.error('🔐 createUserProfile: Error:', error);
        if (mounted) {
          setUser(authUser);
        }
      }
    };

    const handleAuthError = async (error: any): Promise<boolean> => {
      console.log('🔐 handleAuthError: Checking error:', error);
      
      // Check for refresh token errors or invalid session errors
      if (error?.message?.includes('refresh_token_not_found') || 
          error?.message?.includes('Invalid Refresh Token') ||
          error?.message?.includes('Refresh Token Not Found') ||
          error?.code === 'refresh_token_not_found') {
        
        console.log('🔐 handleAuthError: Invalid refresh token detected, clearing session');
        
        try {
          // Force sign out to clear invalid session
          await supabase.auth.signOut();
          clearAuthState();
          toast.error('Your session has expired. Please sign in again.');
          return true; // Error was handled
        } catch (signOutError) {
          console.error('🔐 handleAuthError: Error during forced sign out:', signOutError);
          clearAuthState();
          return true; // Still handled, just clear state
        }
      }
      
      return false; // Error was not handled
    };

    const handleAuthEvent = async (session: Session | null, eventType: string = 'unknown') => {
      if (!mounted) return;

      console.log(`🔐 handleAuthEvent: Processing ${eventType} event...`, {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email || 'None'
      });
      
      try {
        setSession(session);
        
        if (session?.user) {
          console.log('🔐 handleAuthEvent: User found, loading profile...');
          await loadUserProfile(session.user);
        } else {
          console.log('🔐 handleAuthEvent: No session or user, clearing user state');
          if (mounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error(`🔐 handleAuthEvent: Error in ${eventType}:`, error);
        
        // Try to handle the error
        const errorHandled = await handleAuthError(error);
        
        if (!errorHandled && mounted) {
          // Set user without profile if there's an unhandled error
          if (session?.user) {
            setUser(session.user);
          } else {
            setUser(null);
          }
        }
      } finally {
        if (mounted) {
          console.log(`🔐 handleAuthEvent: ${eventType} complete, setting loading to false`);
          setLoading(false);
        }
      }
    };

    const getInitialSession = async () => {
      try {
        console.log('🔐 getInitialSession: Getting initial session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('🔐 getInitialSession: Result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email || 'None',
          error: error?.message
        });
        
        if (error) {
          console.error('🔐 getInitialSession: Error:', error);
          
          // Try to handle the error
          const errorHandled = await handleAuthError(error);
          
          if (!errorHandled && mounted) {
            setLoading(false);
          }
          return;
        }

        await handleAuthEvent(session, 'initial_session');
      } catch (error) {
        console.error('🔐 getInitialSession: Unexpected error:', error);
        
        // Try to handle the error
        const errorHandled = await handleAuthError(error);
        
        if (!errorHandled && mounted) {
          clearAuthState();
        }
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔐 onAuthStateChange: Auth state changed:', {
        event,
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email || 'None'
      });
      
      // Handle sign out events immediately
      if (event === 'SIGNED_OUT') {
        clearAuthState();
        return;
      }
      
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
      console.log('🔐 signUp: Starting sign up process for:', email);
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
      console.error('🔐 signUp: Error:', error);
      toast.error(error.message);
      setLoading(false);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 signIn: Starting sign in process for:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Signed in successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('🔐 signIn: Error:', error);
      
      // Handle auth errors during sign in
      const errorHandled = await handleAuthError(error);
      if (!errorHandled) {
        toast.error(error.message);
      }
      
      setLoading(false);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('🔐 signOut: Starting sign out process');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear stored company data
      localStorage.removeItem('currentCompanyId');
      
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('🔐 signOut: Error:', error);
      // Even if sign out fails, clear local state
      setUser(null);
      setSession(null);
      localStorage.removeItem('currentCompanyId');
      setLoading(false);
      
      // Don't show error toast for sign out failures, just log them
      console.warn('Sign out failed, but local state cleared');
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
      console.error('🔐 updateProfile: Error:', error);
      toast.error(error.message);
      return { data: null, error };
    }
  };

  // Add a helper function to handle auth errors in other hooks
  const handleAuthError = async (error: any): Promise<boolean> => {
    console.log('🔐 handleAuthError: Checking error:', error);
    
    // Check for refresh token errors or invalid session errors
    if (error?.message?.includes('refresh_token_not_found') || 
        error?.message?.includes('Invalid Refresh Token') ||
        error?.message?.includes('Refresh Token Not Found') ||
        error?.code === 'refresh_token_not_found') {
      
      console.log('🔐 handleAuthError: Invalid refresh token detected, clearing session');
      
      try {
        // Force sign out to clear invalid session
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setLoading(false);
        localStorage.removeItem('currentCompanyId');
        toast.error('Your session has expired. Please sign in again.');
        return true; // Error was handled
      } catch (signOutError) {
        console.error('🔐 handleAuthError: Error during forced sign out:', signOutError);
        setUser(null);
        setSession(null);
        setLoading(false);
        localStorage.removeItem('currentCompanyId');
        return true; // Still handled, just clear state
      }
    }
    
    return false; // Error was not handled
  };

  console.log('🔐 useAuth: Current state:', {
    hasUser: !!user,
    userEmail: user?.email || 'None',
    hasProfile: !!user?.profile,
    profileRole: user?.profile?.role || 'None',
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
    handleAuthError, // Export for use in other hooks
  };
};