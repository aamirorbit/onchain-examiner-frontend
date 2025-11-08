'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/useChat';
import { MessageList } from './message-list';
import type { Message } from '@/types/chat.types';
import { Send, Bot, Loader2, ChevronDown, Sparkles, Menu } from 'lucide-react';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  sessionId: string;
  tokenAddress: string;
  initialMessages?: Message[];
  onOpenMenu?: () => void;
}

export function ChatInterface({ sessionId, tokenAddress, initialMessages = [], onOpenMenu }: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { messages, isStreaming, sendMessage, loadSession } = useChat(sessionId, initialMessages);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevSessionIdRef = useRef(sessionId);

  console.log('[ChatInterface] onOpenMenu prop:', onOpenMenu ? 'provided' : 'not provided');

  // Handle session changes - clear input when session changes
  useEffect(() => {
    if (sessionId !== prevSessionIdRef.current) {
      console.log('[ChatInterface] Session changed from', prevSessionIdRef.current, 'to', sessionId);
      prevSessionIdRef.current = sessionId;
      setInputMessage(''); // Clear input
      // Note: useChat hook will automatically load session messages when sessionId changes
    }
  }, [sessionId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages, isStreaming]);

  useEffect(() => {
    // Check scroll position to show/hide scroll button
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isStreaming) return;

    const message = inputMessage;
    setInputMessage('');

    try {
      await sendMessage(sessionId, message);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  const quickActions = [
    'What are the risks?',
    'Should I invest?',
    'Is this good for LPs?',
    'Tell me about liquidity',
  ];

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto relative bg-gradient-to-b from-background to-muted/20" ref={messagesContainerRef}>
        <div className="max-w-5xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full py-12 sm:py-20 px-4 sm:px-6">
              <div className="text-center">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs sm:text-sm text-muted-foreground">Loading chat history...</p>
              </div>
            </div>
          ) : (
            <>
              <MessageList messages={messages} sessionId={sessionId} />
              
              {/* AI Typing Indicator */}
              {isStreaming && (
                <div className="px-3 sm:px-6 py-3 sm:py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl bg-muted/80 backdrop-blur-sm">
                        <div className="flex gap-1">
                          <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} className="h-3 sm:h-4" />
            </>
          )}
        </div>

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom('smooth')}
            className="fixed bottom-24 sm:bottom-32 right-4 sm:right-8 bg-primary text-primary-foreground rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 z-20"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}
      </div>

      {/* Quick Actions - Only show if there's only the welcome message */}
      {messages.length === 1 && messages[0]?.role === 'assistant' && !isStreaming && (
        <div className="backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
            {/* <p className="text-xs font-medium text-center text-muted-foreground mb-3 uppercase tracking-wide">Suggested Questions</p> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  disabled={isStreaming}
                  className="group flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-md border border-border/50 bg-background/50 hover:bg-muted hover:border-primary/30 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium">{action}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="sticky bottom-0">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <form onSubmit={handleSendMessage}>
            <div className="relative">
              {/* Menu Button - Mobile Only */}
              {onOpenMenu && (
                <Button 
                  type="button"
                  onClick={() => {
                    console.log('[ChatInterface] Menu button clicked!');
                    onOpenMenu();
                  }}
                  size="icon"
                  variant="ghost"
                  className="lg:hidden absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-lg transition-all z-10 hover:bg-muted border border-border/50"
                >
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              )}
              
              <Input
                placeholder="Ask anything about this token..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isStreaming}
                className={`h-11 sm:h-14 ${onOpenMenu ? 'pl-11 sm:pl-14 lg:pl-4' : 'pl-4'} pr-12 sm:pr-14 rounded-xl border-border/50 bg-transparent focus:border-primary/50 transition-colors shadow-sm text-sm sm:text-base placeholder:text-xs sm:placeholder:text-sm`}
                autoComplete="off"
              />
            <Button 
              type="submit" 
              disabled={isStreaming || !inputMessage.trim()}
                size="icon"
                className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-lg transition-all"
            >
              {isStreaming ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

