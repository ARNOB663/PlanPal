import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { mockUsers } from '../data/mockData';
import { validatePasswordStrength, SECURITY_CONSTANTS } from '../lib/security';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  signup: (userData: Partial<User> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  isLockedOut: boolean;
  remainingAttempts: number;
}

const MAX_LOGIN_ATTEMPTS = SECURITY_CONSTANTS.MAX_LOGIN_ATTEMPTS;
const LOCKOUT_DURATION = SECURITY_CONSTANTS.LOCKOUT_DURATION;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('id, name, email, gender, age, bio, location, interests, photo_url')
          .eq('id', session.user.id)
          .maybeSingle();

        if (userData) {
          setCurrentUser(userData as User);
          setIsAuthenticated(true);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: userData } = await supabase
          .from('users')
          .select('id, name, email, gender, age, bio, location, interests, photo_url')
          .eq('id', session.user.id)
          .maybeSingle();

        if (userData) {
          setCurrentUser(userData as User);
          setIsAuthenticated(true);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isLockedOut = (): boolean => {
    if (!lockoutTime) return false;
    const now = Date.now();
    if (now - lockoutTime >= LOCKOUT_DURATION) {
      setLockoutTime(null);
      setLoginAttempts(0);
      return false;
    }
    return true;
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isLockedOut()) {
        const remainingTime = Math.ceil((LOCKOUT_DURATION - (Date.now() - lockoutTime!)) / 60000);
        return { 
          success: false, 
          error: `Account temporarily locked. Please try again in ${remainingTime} minutes.` 
        };
      }

      // Check for mock users first (for demo purposes)
      const mockUser = mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
      if (mockUser && password === 'demo123') {
        setCurrentUser(mockUser);
        setIsAuthenticated(true);
        setLoginAttempts(0);
        return { success: true };
      }

      // Proceed with Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setLoginAttempts(prev => {
          const newAttempts = prev + 1;
          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            setLockoutTime(Date.now());
          }
          return newAttempts;
        });

        if (error.message === 'Invalid login credentials') {
          const remainingAttempts = MAX_LOGIN_ATTEMPTS - (loginAttempts + 1);
          return { 
            success: false, 
            error: `Invalid email or password. ${remainingAttempts} attempts remaining before temporary lockout.` 
          };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('id, name, email, gender, age, bio, location, interests, photo_url')
          .eq('id', data.user.id)
          .maybeSingle();

        if (userData) {
          setCurrentUser(userData as User);
          setIsAuthenticated(true);
          setLoginAttempts(0);
          return { success: true };
        }
      }
      return { success: false, error: 'User data not found' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred during login' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('csrf-token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const signup = async (userData: Partial<User> & { password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate password strength
      const { isValid, errors } = validatePasswordStrength(userData.password);
      if (!isValid) {
        return { 
          success: false, 
          error: errors.join('\n')
        };
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .maybeSingle();

      if (existingUser) {
        return { 
          success: false, 
          error: 'An account with this email already exists. Please try logging in or reset your password.' 
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email!,
        password: userData.password,
        options: {
          data: {
            name: userData.name
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Insert user data into the users table
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            name: userData.name,
            email: userData.email,
            gender: userData.gender,
            age: userData.age,
            bio: userData.bio,
            location: userData.location,
            interests: userData.interests,
            photo_url: null
          }]);

        if (profileError) {
          return { success: false, error: profileError.message };
        }

        // Fetch the newly created user data
        const { data: newUserData } = await supabase
          .from('users')
          .select('id, name, email, gender, age, bio, location, interests, photo_url')
          .eq('id', data.user.id)
          .maybeSingle();

        if (newUserData) {
          setCurrentUser(newUserData as User);
          setIsAuthenticated(true);
          return { success: true };
        }

        return { success: false, error: 'Failed to fetch user data after creation' };
      }
      return { success: false, error: 'Failed to create account' };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred during signup' };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        error: 'Password reset instructions have been sent to your email.' 
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: 'Failed to send password reset email. Please try again later.' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAuthenticated, 
      login, 
      logout, 
      signup,
      resetPassword,
      isLockedOut: isLockedOut(),
      remainingAttempts: MAX_LOGIN_ATTEMPTS - loginAttempts
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};