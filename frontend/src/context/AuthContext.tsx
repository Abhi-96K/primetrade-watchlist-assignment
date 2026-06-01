import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('pt_token');
    localStorage.removeItem('pt_user');
    setUser(null);
    setToken(null);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('pt_token');
    const storedUser = localStorage.getItem('pt_user');

    if (storedToken && storedUser) {
      // Decode JWT to verify expiration
      const decoded = parseJwt(storedToken);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        // Expired
        logout();
      }
    }
    setIsLoading(false);
  }, [logout]);

  const login = useCallback((newToken: string, userData: User) => {
    localStorage.setItem('pt_token', newToken);
    localStorage.setItem('pt_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isLoading,
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
