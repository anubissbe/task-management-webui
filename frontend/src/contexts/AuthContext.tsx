import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'developer' | 'viewer';
  is_active: boolean;
  is_verified: boolean;
  last_login_at?: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthTokens {
  access_token: string;
  expires_in: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get access token from localStorage
  const getAccessToken = (): string | null => {
    return localStorage.getItem('access_token');
  };

  // Set access token in localStorage
  const setAccessToken = (token: string): void => {
    localStorage.setItem('access_token', token);
  };

  // Remove access token from localStorage
  const removeAccessToken = (): void => {
    localStorage.removeItem('access_token');
  };

  // API request helper with authentication
  const apiRequest = useCallback(async (endpoint: string, options: RequestInit = {}): Promise<unknown> => {
    const token = getAccessToken();
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include', // Include cookies for refresh token
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Network error');
    }
  }, []);

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Login function
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }) as { access_token: string; user: User };

      setAccessToken(response.access_token);
      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // After successful registration, login automatically
      await login({ email: data.email, password: data.password });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Call logout endpoint to invalidate refresh token
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (err) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', err);
    } finally {
      // Clear local state regardless of API call result
      removeAccessToken();
      setUser(null);
    }
  };

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const response = await apiRequest('/auth/refresh', {
        method: 'POST',
      }) as { access_token: string };

      setAccessToken(response.access_token);
    } catch (err) {
      // Refresh failed, logout user
      removeAccessToken();
      setUser(null);
      throw err;
    }
  }, [apiRequest]);

  // Get user profile
  const fetchUserProfile = useCallback(async (): Promise<void> => {
    try {
      const response = await apiRequest('/auth/profile') as { user: User };
      setUser(response.user);
    } catch {
      // If profile fetch fails, try to refresh token
      try {
        await refreshToken();
        const response = await apiRequest('/auth/profile') as { user: User };
        setUser(response.user);
      } catch {
        // Both profile fetch and refresh failed, logout
        removeAccessToken();
        setUser(null);
      }
    }
  }, [apiRequest, refreshToken]);

  // Check authentication status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAccessToken();
      
      if (token) {
        try {
          await fetchUserProfile();
        } catch {
          // Authentication failed, user will be logged out by fetchUserProfile
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, [fetchUserProfile]);

  // Auto-refresh token every 14 minutes (1 minute before expiry)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        await refreshToken();
      } catch {
        console.error('Auto-refresh failed');
        // User will be logged out by refreshToken function
      }
    }, 14 * 60 * 1000); // 14 minutes

    return () => clearInterval(interval);
  }, [user, refreshToken]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};