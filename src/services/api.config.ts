// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 60000, // 60 seconds for long-running requests
};

// Token management
export const TokenManager = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  },

  getAuthHeader: (): HeadersInit => {
    const token = TokenManager.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

// Base fetch wrapper with error handling
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle different response types
    const contentType = response.headers.get('content-type');
    let data: any;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Handle 401 Unauthorized - clear token
      if (response.status === 401) {
        TokenManager.removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      throw {
        statusCode: response.status,
        message: data.message || 'An error occurred',
        errors: data.errors || [],
        ...data,
      };
    }

    return data as T;
  } catch (error: any) {
    // Network errors or other issues
    if (error.statusCode) {
      throw error;
    }
    
    throw {
      statusCode: 500,
      message: error.message || 'Network error occurred',
      errors: [],
    };
  }
}

// Helper for authenticated requests
export async function authenticatedFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const authHeaders = TokenManager.getAuthHeader();
  
  return apiFetch<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...authHeaders,
    },
  });
}

