'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { chatService } from '@/services/chat.service';
import type { Message, CreateSessionResponse } from '@/types/chat.types';

export function useChat(sessionId?: string, initialMessages?: Message[]) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedSession, setHasLoadedSession] = useState(false);
  const [lastSessionId, setLastSessionId] = useState<string | undefined>(undefined);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Update messages if initialMessages change (only if sessionId matches or is initial)
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      // Only set if sessionId matches lastSessionId, or if lastSessionId is undefined (initial mount)
      if (sessionId === lastSessionId || lastSessionId === undefined) {
        console.log('[useChat] Setting initial messages:', initialMessages.length);
        setMessages(initialMessages);
        setHasLoadedSession(true); // Mark as loaded since we have initial messages
        setIsLoading(false); // Make sure loading is false
        if (lastSessionId === undefined && sessionId) {
          setLastSessionId(sessionId); // Set lastSessionId if it's initial mount
        }
      }
    }
  }, [initialMessages, sessionId, lastSessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  const createSession = useCallback(async (tokenAddress: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await chatService.createSession(tokenAddress);
      setMessages([response.welcomeMessage]);
      setIsLoading(false);
      return response.sessionId;
    } catch (err: any) {
      setError(err.message || 'Failed to create session');
      setIsLoading(false);
      throw err;
    }
  }, []);

  const sendMessage = useCallback(async (sessionId: string, message: string) => {
    if (!message.trim()) return;

    console.log('[useChat] Sending message:', message, 'to session:', sessionId);

    // Add user message immediately
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    
    console.log('[useChat] Current messages before adding:', messages.length);
    setMessages(prev => {
      console.log('[useChat] Adding user message, prev length:', prev.length);
      return [...prev, userMessage];
    });
    setIsStreaming(true);
    setError(null);

    // Add timeout to prevent infinite "Thinking..." state
    const streamTimeout = setTimeout(() => {
      console.warn('[useChat] Stream timeout - forcing completion with fallback message');
      setIsStreaming(false);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        // Only add fallback if last message is empty or from user
        if (!lastMessage || lastMessage.role === 'user' || !lastMessage.content.trim()) {
          newMessages.push({
            role: 'assistant',
            content: "Sorry, I didn't get that. Can you ask again?",
            timestamp: new Date().toISOString(),
          });
        }
        return newMessages;
      });
    }, 90000); // 90 second timeout

    try {
      let fullMessage = '';
      let hasAddedPlaceholder = false;
      
      const cleanup = await chatService.streamMessage(
        sessionId,
        message,
        (chunk) => {
          console.log('[useChat] Received chunk:', chunk);
          fullMessage += chunk;
          
          // Add assistant message on first chunk
          if (!hasAddedPlaceholder) {
            hasAddedPlaceholder = true;
            const assistantMessage: Message = {
              role: 'assistant',
              content: fullMessage,
              timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, assistantMessage]);
          } else {
            // Update the last message
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                ...newMessages[newMessages.length - 1],
                content: fullMessage,
              };
              return newMessages;
            });
          }
        },
        (complete) => {
          clearTimeout(streamTimeout); // Clear timeout on successful completion
          console.log('[useChat] Message complete:', complete);
          
          // Check if response is empty
          const finalContent = complete && complete.trim() 
            ? complete 
            : "Sorry, I didn't get that. Can you ask again?";
          
          if (!complete || !complete.trim()) {
            console.warn('[useChat] Empty response received, using fallback message');
          }
          
          setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages.length > 0) {
              newMessages[newMessages.length - 1] = {
                ...newMessages[newMessages.length - 1],
                content: finalContent,
              };
            }
            return newMessages;
          });
          setIsStreaming(false);
        },
        (errorMsg) => {
          clearTimeout(streamTimeout); // Clear timeout on error
          console.error('[useChat] Error:', errorMsg);
          setError(errorMsg);
          setIsStreaming(false);
          // Only remove user message on error if no assistant response started
          if (!hasAddedPlaceholder) {
            setMessages(prev => prev.slice(0, -1));
          }
        }
      );

      cleanupRef.current = cleanup;
    } catch (err: any) {
      clearTimeout(streamTimeout); // Clear timeout on exception
      console.error('[useChat] Exception:', err);
      setError(err.message || 'Failed to send message');
      setIsStreaming(false);
      // Remove user message on error
      setMessages(prev => prev.slice(0, -1));
    }
  }, []);

  const loadSession = useCallback(async (sessionId: string, force = false) => {
    // Prevent loading the same session multiple times unless forced
    if (hasLoadedSession && lastSessionId === sessionId && !force) {
      console.log('[useChat] Session already loaded, skipping');
      return;
    }
    
    console.log('[useChat] Loading session:', sessionId, 'Force:', force);
    setIsLoading(true);
    setError(null);
    
    try {
      const session = await chatService.getSession(sessionId);
      console.log('[useChat] Session loaded successfully!');
      console.log('[useChat] Messages count:', session.messages.length);
      console.log('[useChat] Messages:', session.messages);
      setMessages(session.messages);
      setHasLoadedSession(true);
      setIsLoading(false);
      console.log('[useChat] State updated, messages should now be visible');
    } catch (err: any) {
      console.error('[useChat] Failed to load session:', err);
      setError(err.message || 'Failed to load session');
      setHasLoadedSession(false); // Allow retry on error
      setIsLoading(false);
      throw err;
    }
  }, [hasLoadedSession, lastSessionId]);

  // Load session when sessionId changes
  useEffect(() => {
    if (!sessionId) return;
    
    // If sessionId changed, reset and load
    if (sessionId !== lastSessionId) {
      console.log('[useChat] SessionId changed from', lastSessionId, 'to', sessionId);
      setLastSessionId(sessionId);
      setHasLoadedSession(false);
      setMessages([]); // Clear old messages
      setIsStreaming(false);
      setError(null);
      setIsLoading(true);
      
      // Load session messages
      chatService.getSession(sessionId)
        .then(session => {
          console.log('[useChat] Session loaded successfully! Messages:', session.messages.length);
          setMessages(session.messages);
          setHasLoadedSession(true);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('[useChat] Failed to load session:', err);
          setError(err.message || 'Failed to load session');
          setHasLoadedSession(false);
          setIsLoading(false);
        });
    }
    // Initial mount with sessionId - only load if we don't have initialMessages
    else if (lastSessionId === undefined && !hasLoadedSession && (!initialMessages || initialMessages.length === 0)) {
      console.log('[useChat] Initial mount with sessionId, loading session');
      setLastSessionId(sessionId);
      setIsLoading(true);
      
      chatService.getSession(sessionId)
        .then(session => {
          console.log('[useChat] Session loaded on mount! Messages:', session.messages.length);
          setMessages(session.messages);
          setHasLoadedSession(true);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('[useChat] Failed to load session on mount:', err);
          setError(err.message || 'Failed to load session');
          setHasLoadedSession(false);
          setIsLoading(false);
        });
    }
  }, [sessionId, lastSessionId, hasLoadedSession, initialMessages]);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    createSession,
    sendMessage,
    loadSession,
  };
}

