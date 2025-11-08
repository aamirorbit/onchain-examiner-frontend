export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  sessionId: string;
  tokenAddress: string;
  messages: Message[];
  poolDataContext: {
    totalLiquidityUSD: number;
    totalVolumeUSD: number;
    pairCount: number;
    aggregatedMetrics: any;
  };
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface CreateSessionRequest {
  tokenAddress: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  tokenAddress: string;
  welcomeMessage: Message;
  expiresAt: string;
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  message: Message;
}

export interface StreamChunk {
  type: 'chunk' | 'done';
  content: string;
}

export interface ChatSessionSummary {
  id: string;
  tokenAddress: string;
  lastMessageAt: string;
  messageCount: number;
  createdAt: string;
}

export interface UserSessionsResponse {
  sessions: ChatSessionSummary[];
}

