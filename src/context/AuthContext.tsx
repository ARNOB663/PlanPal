import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockData';
import { validatePasswordStrength, SECURITY_CONSTANTS } from '../lib/security';

const API_URL = 'http://localhost:5000/api';

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
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setCurrentUser(userData);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };

    checkSession();
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

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginAttempts(prev => {
          const newAttempts = prev + 1;
          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            setLockoutTime(Date.now());
          }
          return newAttempts;
        });

        const remainingAttempts = MAX_LOGIN_ATTEMPTS - (loginAttempts + 1);
        return { 
          success: false, 
          error: data.message || `Invalid email or password. ${remainingAttempts} attempts remaining before temporary lockout.` 
        };
      }

      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      setLoginAttempts(0);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred during login' };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setCurrentUser(null);
      setIsAuthenticated(false);
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

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message };
      }

      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred during signup' };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'An unexpected error occurred while resetting password' };
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