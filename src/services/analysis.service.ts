import { apiFetch, authenticatedFetch, TokenManager } from './api.config';
import type {
  Analysis,
  AnalyzeTokenRequest,
  HistoryResponse,
  PaginationParams,
} from '@/types/analysis.types';

export const analysisService = {
  /**
   * Analyze a token - optionally authenticated
   */
  async analyzeToken(tokenAddress: string): Promise<Analysis> {
    const isAuthenticated = TokenManager.getToken() !== null;
    
    if (isAuthenticated) {
      return authenticatedFetch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ tokenAddress }),
      });
    }
    
    return apiFetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ tokenAddress }),
    });
  },

  /**
   * Get analysis history - optionally authenticated
   */
  async getHistory(params?: PaginationParams): Promise<HistoryResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.tokenAddress) queryParams.append('tokenAddress', params.tokenAddress);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/history${queryString ? `?${queryString}` : ''}`;
    
    const isAuthenticated = TokenManager.getToken() !== null;
    
    if (isAuthenticated) {
      return authenticatedFetch(endpoint, {
        method: 'GET',
      });
    }
    
    return apiFetch(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Get specific analysis by ID
   */
  async getAnalysisById(id: string): Promise<Analysis> {
    const isAuthenticated = TokenManager.getToken() !== null;
    
    if (isAuthenticated) {
      return authenticatedFetch(`/api/analysis/${id}`, {
        method: 'GET',
      });
    }
    
    return apiFetch(`/api/analysis/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Delete analysis - requires authentication
   */
  async deleteAnalysis(id: string): Promise<{ message: string }> {
    return authenticatedFetch(`/api/analysis/${id}`, {
      method: 'DELETE',
    });
  },
};

