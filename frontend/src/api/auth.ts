import apiClient from './client';
import type { User, Role } from '../types';

const HARDCODED_VERIFIER = { username: "verifier", password: "verify" };

export const loginWithPassword = async (
  username: string, 
  password: string, 
  walletAddress?: string,
  signature?: string
): Promise<{ user: User; token: string }> => {
  if (username === HARDCODED_VERIFIER.username && password === HARDCODED_VERIFIER.password) {
    return {
      user: { id: "v1", name: "Verifier", email: "", role: "verifier" },
      token: "verifier-token",
    };
  }
  try {
    const response = await apiClient.post('/users/login', { 
      username, 
      password, 
      walletAddress,
      signature 
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error(error.response?.data?.message || "Invalid credentials");
    }
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const login = async (email: string, role: Role): Promise<{ user: User; token: string }> => {
  // This seems to be a legacy/alternate login. For now, we can map it to wallet auth or just fail?
  // Or maybe this was the "connect wallet" simulation?
  // Let's keep it as a placeholder or remove it if not used.
  // The AuthContext uses it. Let's redirect to auth endpoint.
  // Actually, let's assume this is not used anymore or map it to something else.
  return Promise.resolve({
      user: { id: '1', name: 'Demo User', email, role },
      token: 'mock-token-123',
  });
};

export const signup = async (
  name: string, 
  email: string, 
  role: Role, 
  username?: string, 
  password?: string, 
  walletAddress?: string,
  signature?: string
): Promise<{ user: User; token: string }> => {
    try {
        const response = await apiClient.post('/users/signup', { 
          name, 
          email, 
          role, 
          username, 
          password, 
          walletAddress,
          signature 
        });
        return response.data;
    } catch (error: any) {
        console.error("Signup error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Signup failed");
    }
};
