import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, User } from '../services/nodeAuthService';
import { storefrontApi } from '../services/storefrontApi';

interface PendingVerification {
  email: string;
  name: string;
  devOtp?: string;
}

interface AuthContextType {
  user: User | null;
  pendingVerification: PendingVerification | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  socialLogin: (provider: 'google' | 'apple') => Promise<void>;
  updateProfile: (payload: { name?: string; email?: string; password?: string }) => Promise<void>;
  clearPendingVerification: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pendingVerification, setPendingVerification] = useState<PendingVerification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      console.log('AuthContext - Validating token:', !!token);

      if (token) {
        try {
          const currentUser = await storefrontApi.getMe();
          console.log('AuthContext - Current user:', currentUser);
          setUser(currentUser);
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }

      setLoading(false);
    };

    void validateToken();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('AuthContext - Login attempt:', email);
    const res = await authAPI.login(email, password);
    console.log('AuthContext - Login response:', res);
    
    // Check if response has user directly or needs to be extracted
    const user = res.user || res;
    
    if (user) {
      setUser(user);
      console.log('AuthContext - User set successfully:', user);
    } else {
      console.error('AuthContext - No user in response');
    }
    
    setPendingVerification(null);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authAPI.register(name, email, password);
    setPendingVerification({
      email,
      name,
      devOtp: res.devOtp,
    });
  };

  const verifyOtp = async (email: string, otp: string) => {
    console.log('AuthContext - Verifying OTP for:', email);
    const res = await authAPI.verifyOtp(email, otp);
    console.log('AuthContext - OTP verification response:', res);
    
    setUser(res.user);
    setPendingVerification(null);
  };

  const resendOtp = async (email: string) => {
    const res = await authAPI.resendOtp(email);
    setPendingVerification((current) => ({
      email,
      name: current?.name || '',
      devOtp: res.devOtp,
    }));
  };

  const socialLogin = async (provider: 'google' | 'apple') => {
    const res = await authAPI.socialLogin(provider);
    setUser(res.user);
    setPendingVerification(null);
  };

  const updateProfile = async (payload: { name?: string; email?: string; password?: string }) => {
    const updatedUser = await storefrontApi.updateProfile(payload);
    setUser(updatedUser);
  };

  const clearPendingVerification = () => {
    setPendingVerification(null);
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setPendingVerification(null);
    // Token is already cleared in authAPI.logout
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        pendingVerification,
        login,
        register,
        verifyOtp,
        resendOtp,
        socialLogin,
        updateProfile,
        clearPendingVerification,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
