import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, Role } from "../types";
import * as authService from "../api/auth";

interface AuthContextType {
  user: User | null;
  login: (email: string, role: Role) => void;
  loginWithPassword: (username: string, password: string, walletAddress?: string, signature?: string) => Promise<User | null>;
  loginWithWallet: () => void;
  signup: (name: string, email: string, role: Role, username?: string, password?: string, walletAddress?: string, signature?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  // Restore user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to restore user from localStorage:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (email: string, role: Role) => {
    try {
      const { user: userData, token } = await authService.login(email, role);
      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const loginWithPassword = async (
    username: string, 
    password: string, 
    walletAddress?: string,
    signature?: string
  ): Promise<User | null> => {
    try {
      const { user: userData, token } = await authService.loginWithPassword(
        username, 
        password, 
        walletAddress,
        signature
      );
      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      return null;
    }
  };

  const loginWithWallet = () => {
    setUser({
      id: 'wallet',
      name: 'Wallet User',
      email: '',
      role: 'user',
    });
    localStorage.setItem('token', 'wallet-token');
  };

  const signup = async (
    name: string, 
    email: string, 
    role: Role, 
    username?: string, 
    password?: string, 
    walletAddress?: string,
    signature?: string
  ) => {
    try {
      const { user: userData, token } = await authService.signup(
        name, 
        email, 
        role, 
        username, 
        password, 
        walletAddress,
        signature
      );
      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error("Signup failed:", error);
      throw error; // Propagate error to UI
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, login, loginWithPassword, loginWithWallet, signup, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
