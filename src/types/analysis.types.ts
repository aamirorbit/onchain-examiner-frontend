export interface Pair {
  id: string;
  token0: {
    symbol: string;
    name: string;
    decimals: string;
  };
  token1: {
    symbol: string;
    name: string;
    decimals: string;
  };
  reserveUSD: string;
  volumeUSD: string;
  txCount: string;
}

export interface AggregatedMetrics {
  averagePoolAge: number;
  totalTransactions: number;
  largestPool: Pair;
  volumeToLiquidityRatio: number;
}

export interface PoolData {
  pairs: Pair[];
  tokenInfo: any;
  totalLiquidityUSD: number;
  totalVolumeUSD: number;
  aggregatedMetrics: AggregatedMetrics;
}

export interface AIAnalysis {
  liquidityHealthScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  insights: string[];
  redFlags: string[];
  recommendations: string[];
  summary: string;
}

export interface AnalysisMetadata {
  analyzedAt: string;
  processingTimeMs: number;
  subgraphVersion?: string;
}

export interface Analysis {
  id: string;
  tokenAddress: string;
  poolData: PoolData;
  aiAnalysis: AIAnalysis;
  metadata: AnalysisMetadata;
  createdAt: string;
}

export interface AnalyzeTokenRequest {
  tokenAddress: string;
}

export interface PaginationParams {
  limit?: number;
  skip?: number;
  tokenAddress?: string;
}

export interface PaginationResponse {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

export interface HistoryResponse {
  data: Analysis[];
  pagination: PaginationResponse;
}

