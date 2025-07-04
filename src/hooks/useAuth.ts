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

    const loadUserProfile = async (authUser: User): Promise<void> => {
      try {
        console.log('🔐 loadUserProfile: Starting profile load for user:', {
          id: authUser.id,
          email: authUser.email,
          emailConfirmed: authUser.email_confirmed_at,
          createdAt: authUser.created_at
        });
        
        console.log('🔐 loadUserProfile: About to execute Supabase profile query...');
        console.log('🔐 loadUserProfile: Query details:', {
          table: 'profiles',
          filter: `id = ${authUser.id}`,
          operation: 'select(*).maybeSingle()'
        });
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        console.log('🔐 loadUserProfile: Supabase profile query completed!');
        console.log('🔐 loadUserProfile: Query result:', {
          profile: profile ? {
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name,
            role: profile.role,
            isActive: profile.is_active,
            createdAt: profile.created_at
          } : null,
          error: error ? {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          } : null
        });

        if (error) {
          console.error('🔐 loadUserProfile: Error loading profile:', error);
          // Don't throw error for missing profile, it's normal for new users
        } else if (!profile) {
          console.log('🔐 loadUserProfile: No profile found - this is normal for new users');
        }

        console.log('🔐 loadUserProfile: Profile processing result:', {
          profileFound: !!profile,
          mounted: mounted,
          willSetUser: mounted
        });
        
        if (mounted) {
          const userWithProfile = { ...authUser, profile: profile || undefined };
          console.log('🔐 loadUserProfile: Setting user with profile:', {
            userId: userWithProfile.id,
            userEmail: userWithProfile.email,
            hasProfile: !!userWithProfile.profile,
            profileRole: userWithProfile.profile?.role || 'None'
          });
          setUser(userWithProfile);
          console.log('🔐 loadUserProfile: User state updated successfully');
        } else {
          console.log('🔐 loadUserProfile: Component unmounted, skipping user state update');
        }
      } catch (error) {
        console.error('🔐 loadUserProfile: Unexpected error in try-catch:', error);
        console.error('🔐 loadUserProfile: Error stack:', (error as Error).stack);
        // Still set the user even if profile loading fails
        if (mounted) {
          console.log('🔐 loadUserProfile: Setting user without profile due to error');
          setUser(authUser);
          console.log('🔐 loadUserProfile: User state updated (without profile)');
        }
      }
    };

    // Centralized function to handle all auth events
    const handleAuthEvent = async (session: Session | null, eventType: string = 'unknown') => {
      if (!mounted) {
        console.log('🔐 handleAuthEvent: Component unmounted, skipping auth event:', eventType);
        return;
      }

      console.log(`🔐 handleAuthEvent: Processing ${eventType} event...`, {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email || 'None',
        sessionId: session?.access_token ? 'Present' : 'None'
      });
      
      try {
        console.log('🔐 handleAuthEvent: Setting session state...');
        setSession(session);
        console.log('🔐 handleAuthEvent: Session state updated');
        
        if (session?.user) {
          console.log('🔐 handleAuthEvent: User found in session, calling loadUserProfile...');
          await loadUserProfile(session.user);
          console.log('🔐 handleAuthEvent: loadUserProfile call completed');
        } else {
          console.log('🔐 handleAuthEvent: No session or user, clearing user state');
          if (mounted) {
            console.log('🔐 handleAuthEvent: Setting user to null');
            setUser(null);
            console.log('🔐 handleAuthEvent: User state cleared');
          }
        }
      } catch (error) {
        console.error(`🔐 handleAuthEvent: Error in ${eventType}:`, error);
        console.error(`🔐 handleAuthEvent: Error stack:`, (error as Error).stack);
        if (mounted) {
          console.log('🔐 handleAuthEvent: Setting user to null due to error');
          setUser(null);
          console.log('🔐 handleAuthEvent: User state cleared due to error');
        }
      } finally {
        if (mounted) {
          console.log(`🔐 handleAuthEvent: ${eventType} complete, setting loading to false`);
          setLoading(false);
          console.log(`🔐 handleAuthEvent: Loading state updated to false`);
        } else {
          console.log(`🔐 handleAuthEvent: Component unmounted, skipping loading state update`);
        }
      }
    };

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔐 getInitialSession: Getting initial session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('🔐 getInitialSession: Supabase getSession result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email || 'None',
          error: error ? {
            message: error.message,
            status: error.status
          } : null
        });
        
        if (error) {
          console.error('🔐 getInitialSession: Error getting initial session:', error);
          if (mounted) {
            console.log('🔐 getInitialSession: Setting loading to false due to error');
            setLoading(false);
            console.log('🔐 getInitialSession: Loading state updated to false');
          }
          return;
        }

        console.log('🔐 getInitialSession: Calling handleAuthEvent with initial session...');
        await handleAuthEvent(session, 'initial_session');
        console.log('🔐 getInitialSession: handleAuthEvent completed');
      } catch (error) {
        console.error('🔐 getInitialSession: Unexpected error:', error);
        console.error('🔐 getInitialSession: Error stack:', (error as Error).stack);
        if (mounted) {
          console.log('🔐 getInitialSession: Setting states to default due to unexpected error');
          setUser(null);
          setLoading(false);
          console.log('🔐 getInitialSession: States updated to default');
        }
      }
    };

    console.log('🔐 useAuth: Calling getInitialSession...');
    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) {
        console.log('🔐 onAuthStateChange: Component unmounted, ignoring event:', event);
        return;
      }

      console.log('🔐 onAuthStateChange: Auth state changed:', {
        event,
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email || 'None'
      });
      
      console.log('🔐 onAuthStateChange: Calling handleAuthEvent...');
      await handleAuthEvent(session, `auth_${event}`);
      console.log('🔐 onAuthStateChange: handleAuthEvent completed');
    });

    return () => {
      console.log('🔐 useAuth: Cleaning up, setting mounted to false...');
      mounted = false;
      subscription.unsubscribe();
      console.log('🔐 useAuth: Cleanup completed');
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, mobileNumber?: string) => {
    try {
      console.log('🔐 signUp: Starting sign up process for:', email);
      setLoading(true);
      console.log('🔐 signUp: Loading state set to true');
      
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

      console.log('🔐 signUp: Supabase signUp result:', {
        hasUser: !!data.user,
        userEmail: data.user?.email || 'None',
        emailConfirmed: data.user?.email_confirmed_at,
        hasSession: !!data.session,
        error: error ? {
          message: error.message,
          status: error.status
        } : null
      });

      if (error) throw error;

      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Please check your email for verification link');
      } else {
        toast.success('Account created successfully');
      }

      console.log('🔐 signUp: Sign up successful');
      return { data, error: null };
    } catch (error: any) {
      console.error('🔐 signUp: Sign up error:', error);
      toast.error(error.message);
      console.log('🔐 signUp: Setting loading to false due to error');
      setLoading(false);
      console.log('🔐 signUp: Loading state updated to false');
      return { data: null, error };
    }
    // Note: Don't set loading to false on success as auth state change will handle it
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 signIn: Starting sign in process for:', email);
      setLoading(true);
      console.log('🔐 signIn: Loading state set to true');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔐 signIn: Supabase signInWithPassword result:', {
        hasUser: !!data.user,
        userEmail: data.user?.email || 'None',
        hasSession: !!data.session,
        error: error ? {
          message: error.message,
          status: error.status
        } : null
      });

      if (error) throw error;

      toast.success('Signed in successfully');
      console.log('🔐 signIn: Sign in successful');
      return { data, error: null };
    } catch (error: any) {
      console.error('🔐 signIn: Sign in error:', error);
      toast.error(error.message);
      console.log('🔐 signIn: Setting loading to false due to error');
      setLoading(false);
      console.log('🔐 signIn: Loading state updated to false');
      return { data: null, error };
    }
    // Note: Don't set loading to false on success as auth state change will handle it
  };

  const signOut = async () => {
    try {
      console.log('🔐 signOut: Starting sign out process');
      setLoading(true);
      console.log('🔐 signOut: Loading state set to true');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Signed out successfully');
      console.log('🔐 signOut: Sign out successful');
    } catch (error: any) {
      console.error('🔐 signOut: Sign out error:', error);
      toast.error(error.message);
      console.log('🔐 signOut: Setting loading to false due to error');
      setLoading(false);
      console.log('🔐 signOut: Loading state updated to false');
    }
    // Note: Don't set loading to false on success as auth state change will handle it
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      console.log('🔐 updateProfile: Starting profile update');
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      console.log('🔐 updateProfile: Supabase update result:', {
        hasData: !!data,
        error: error ? {
          message: error.message,
          code: error.code
        } : null
      });

      if (error) throw error;

      console.log('🔐 updateProfile: Updating user state with new profile');
      setUser({ ...user, profile: data });
      console.log('🔐 updateProfile: User state updated');
      toast.success('Profile updated successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('🔐 updateProfile: Profile update error:', error);
      toast.error(error.message);
      return { data: null, error };
    }
  };

  // Debug logging
  console.log('🔐 useAuth: Current state:', {
    hasUser: !!user,
    userEmail: user?.email || 'None',
    hasProfile: !!user?.profile,
    profileRole: user?.profile?.role || 'None',
    loading,
    sessionExists: !!session,
    sessionUserId: session?.user?.id || 'None'
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