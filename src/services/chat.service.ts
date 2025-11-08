import { apiFetch, authenticatedFetch, TokenManager } from './api.config';
import type {
  ChatSession,
  CreateSessionResponse,
  SendMessageResponse,
  UserSessionsResponse,
  StreamChunk,
} from '@/types/chat.types';

export const chatService = {
  /**
   * Create a new chat session - optionally authenticated
   */
  async createSession(tokenAddress: string): Promise<CreateSessionResponse> {
    const isAuthenticated = TokenManager.getToken() !== null;
    
    if (isAuthenticated) {
      return authenticatedFetch('/api/chat/sessions', {
        method: 'POST',
        body: JSON.stringify({ tokenAddress }),
      });
    }
    
    return apiFetch('/api/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ tokenAddress }),
    });
  },

  /**
   * Send a message (non-streaming)
   */
  async sendMessage(sessionId: string, message: string): Promise<SendMessageResponse> {
    const isAuthenticated = TokenManager.getToken() !== null;
    
    if (isAuthenticated) {
      return authenticatedFetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    }
    
    return apiFetch(`/api/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  /**
   * Stream a message using Server-Sent Events
   */
  async streamMessage(
    sessionId: string,
    message: string,
    onChunk: (chunk: string) => void,
    onDone: (fullMessage: string) => void,
    onError: (error: string) => void
  ): Promise<() => void> {
    const encodedMessage = encodeURIComponent(message);
    const token = TokenManager.getToken();
    
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/chat/sessions/${sessionId}/stream?message=${encodedMessage}`;
    const finalUrl = token ? `${url}&token=${token}` : url;
    
    console.log('[chatService] Creating EventSource:', finalUrl.replace(token || '', 'TOKEN_HIDDEN'));
    
    const eventSource = new EventSource(finalUrl);

    let fullMessage = '';
    let lastEventData: string | null = null;

    eventSource.addEventListener('message', (event) => {
      lastEventData = event.data;
      try {
        const data: StreamChunk = JSON.parse(event.data);
        
        if (data.type === 'chunk') {
          fullMessage += data.content;
          onChunk(data.content);
        } else if (data.type === 'done') {
          onDone(data.content);
          eventSource.close();
        }
      } catch (error) {
        console.error('[chatService] Error parsing SSE data:', error, event.data);
        // Sometimes errors come as plain text in event.data
        if (event.data && typeof event.data === 'string' && !event.data.startsWith('{')) {
          onError(event.data);
          eventSource.close();
        }
      }
    });

    eventSource.addEventListener('error', (event: any) => {
      console.error('[chatService] SSE Error event:', event);
      console.error('[chatService] Last event data:', lastEventData);
      
      // If we got an error message in the last event, use it
      if (lastEventData && typeof lastEventData === 'string' && !lastEventData.startsWith('{')) {
        onError(lastEventData);
      } else if (event.type === 'error' && event.target.readyState === EventSource.CLOSED) {
        onError('Connection to server lost. Please try again.');
      } else {
        onError('An error occurred during streaming. Check console for details.');
      }
      eventSource.close();
    });

    eventSource.onerror = (error) => {
      console.error('[chatService] EventSource.onerror:', error);
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  },

  /**
   * Get chat session details
   */
  async getSession(sessionId: string): Promise<ChatSession> {
    const isAuthenticated = TokenManager.getToken() !== null;
    
    if (isAuthenticated) {
      return authenticatedFetch(`/api/chat/sessions/${sessionId}`, {
        method: 'GET',
      });
    }
    
    return apiFetch(`/api/chat/sessions/${sessionId}`, {
      method: 'GET',
    });
  },

  /**
   * Get user's chat sessions - requires authentication
   */
  async getUserSessions(limit: number = 10): Promise<UserSessionsResponse> {
    return authenticatedFetch(`/api/chat/sessions?limit=${limit}`, {
      method: 'GET',
    });
  },

  /**
   * End a chat session - requires authentication
   */
  async endSession(sessionId: string): Promise<{ message: string }> {
    return authenticatedFetch(`/api/chat/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },
};

