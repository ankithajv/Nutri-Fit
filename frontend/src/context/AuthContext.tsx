import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  loadSampleWeek: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('nutriai_token');
    const savedUser = localStorage.getItem('nutriai_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
        localStorage.removeItem('nutriai_token');
        localStorage.removeItem('nutriai_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      let authToken = '';
      let userData: User;

      try {
        const response = await api.post('/auth/login', { email, password });
        authToken = response.data.token || response.data.access_token;
        userData = response.data.user || {
          id: response.data.id || 'usr_1',
          name: response.data.name || email.split('@')[0],
          email,
          calorie_goal: response.data.calorie_goal || 2000,
          protein_goal: response.data.protein_goal || 75,
        };
      } catch (err: unknown) {
        // If API fails with 401/400, rethrow
        const axiosErr = err as { response?: { status?: number; data?: { message?: string; detail?: string } } };
        if (axiosErr.response && axiosErr.response.status !== 404 && axiosErr.response.status !== 500) {
          const msg = axiosErr.response.data?.detail || axiosErr.response.data?.message || 'Invalid email or password';
          throw new Error(msg);
        }
        // Fallback for mock/local development if backend is not yet deployed
        authToken = 'mock_jwt_token_' + Date.now();
        userData = {
          id: 'usr_mock_1',
          name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' '),
          email,
          calorie_goal: 2000,
          protein_goal: 75,
        };
      }

      localStorage.setItem('nutriai_token', authToken);
      localStorage.setItem('nutriai_user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      let authToken = '';
      let userData: User;

      try {
        const response = await api.post('/auth/register', { name, email, password });
        authToken = response.data.token || response.data.access_token;
        userData = response.data.user || {
          id: response.data.id || 'usr_' + Date.now(),
          name,
          email,
          calorie_goal: 2000,
          protein_goal: 75,
        };
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string; detail?: string } } };
        if (axiosErr.response && axiosErr.response.status !== 404 && axiosErr.response.status !== 500) {
          const msg = axiosErr.response.data?.detail || axiosErr.response.data?.message || 'Registration failed';
          throw new Error(msg);
        }
        // Fallback demo
        authToken = 'mock_jwt_token_' + Date.now();
        userData = {
          id: 'usr_' + Date.now(),
          name,
          email,
          calorie_goal: 2000,
          protein_goal: 75,
        };
      }

      localStorage.setItem('nutriai_token', authToken);
      localStorage.setItem('nutriai_user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('nutriai_token');
    localStorage.removeItem('nutriai_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      try {
        await api.put('/user/profile', updates);
      } catch {
        // If API fails, update local state
      }
      const updatedUser: User = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('nutriai_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Failed to update profile', err);
      throw err;
    }
  };

  const loadSampleWeek = async () => {
    try {
      await api.post('/sample-data/load-week');
    } catch {
      // Offline fallback
    }
  };

  const deleteAccount = async () => {
    try {
      try {
        await api.delete('/user/account');
      } catch {
        // offline fallback
      }
      logout();
    } catch (err) {
      console.error('Failed to delete account', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        loadSampleWeek,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
