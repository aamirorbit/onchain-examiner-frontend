import { apiFetch, authenticatedFetch, TokenManager } from './api.config';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  VerifyEmailResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  CurrentUserResponse,
} from '@/types/auth.types';

export const authService = {
  /**
   * Unified sign in - handles both login and registration
   */
  async signIn(email: string, password: string): Promise<LoginResponse> {
    const response = await apiFetch<LoginResponse>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.access_token) {
      TokenManager.setToken(response.access_token);
    }
    
    return response;
  },

  /**
   * Separate registration
   */
  async register(email: string, password: string): Promise<{ message: string; email: string }> {
    return apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Separate login
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.access_token) {
      TokenManager.setToken(response.access_token);
    }
    
    return response;
  },

  /**
   * Email verification
   */
  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    return apiFetch(`/api/auth/verify-email?token=${token}`, {
      method: 'GET',
    });
  },

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Reset password
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return apiFetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<CurrentUserResponse> {
    return authenticatedFetch('/api/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Logout - clear token
   */
  logout(): void {
    TokenManager.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return TokenManager.getToken() !== null;
  },

  // ============ OTP Authentication ============

  /**
   * Send OTP to email
   */
  async sendOtp(email: string): Promise<{ message: string; email: string }> {
    return apiFetch('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Verify OTP and login/register
   */
  async verifyOtp(email: string, otp: string): Promise<LoginResponse> {
    const response = await apiFetch<LoginResponse>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    
    if (response.access_token) {
      TokenManager.setToken(response.access_token);
    }
    
    return response;
  },
};

