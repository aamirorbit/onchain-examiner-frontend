'use client';

import { useState, useCallback } from 'react';
import { analysisService } from '@/services/analysis.service';
import type { Analysis, HistoryResponse, PaginationParams } from '@/types/analysis.types';

export function useAnalysis() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeToken = useCallback(async (tokenAddress: string): Promise<Analysis> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await analysisService.analyzeToken(tokenAddress);
      setAnalysis(result);
      setIsLoading(false);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to analyze token');
      setIsLoading(false);
      throw err;
    }
  }, []);

  const getHistory = useCallback(async (params?: PaginationParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await analysisService.getHistory(params);
      setHistory(result);
      setIsLoading(false);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch history');
      setIsLoading(false);
      throw err;
    }
  }, []);

  const getAnalysisById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await analysisService.getAnalysisById(id);
      setAnalysis(result);
      setIsLoading(false);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analysis');
      setIsLoading(false);
      throw err;
    }
  }, []);

  const deleteAnalysis = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await analysisService.deleteAnalysis(id);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete analysis');
      setIsLoading(false);
      throw err;
    }
  }, []);

  return {
    analysis,
    history,
    isLoading,
    error,
    analyzeToken,
    getHistory,
    getAnalysisById,
    deleteAnalysis,
  };
}

