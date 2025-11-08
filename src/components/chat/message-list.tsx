'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Message } from '@/types/chat.types';
import { Bot, User, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageListProps {
  messages: Message[];
  sessionId: string;
}

export function MessageList({ messages, sessionId }: MessageListProps) {
  // Helper to handle empty messages from history
  const getMessageContent = (message: Message): string => {
    if (!message.content || !message.content.trim()) {
      return message.role === 'assistant' 
        ? "Sorry, I didn't get that. Can you ask again?"
        : message.content || '';
    }
    return message.content;
  };

  return (
    <>
      {messages.map((message, index) => {
        const key = `msg-${sessionId}-${index}-${message.timestamp}`;
        const isUser = message.role === 'user';
        const displayContent = getMessageContent(message);
        
        return (
          <div
            key={key}
            className={`group flex gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            {!isUser && (
              <Avatar className="h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 ring-2 ring-primary/10">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                </AvatarFallback>
              </Avatar>
            )}

            <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className={`rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3 min-w-0 max-w-full ${
                  isUser
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted/80 text-foreground border border-border/50'
                }`}
              >
                {displayContent ? (
                  <div className={`text-sm sm:text-[15px] leading-relaxed max-w-full overflow-hidden ${
                    isUser ? 'text-primary-foreground' : 'text-foreground'
                  }`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: (props) => <h1 className={`text-lg sm:text-xl font-semibold mt-3 sm:mt-4 mb-2 ${isUser ? 'text-primary-foreground' : 'text-foreground'}`} {...props} />,
                        h2: (props) => <h2 className={`text-base sm:text-lg font-semibold mt-2.5 sm:mt-3 mb-1.5 sm:mb-2 ${isUser ? 'text-primary-foreground' : 'text-foreground'}`} {...props} />,
                        h3: (props) => <h3 className={`text-sm sm:text-base font-semibold mt-2 sm:mt-3 mb-1 sm:mb-1.5 ${isUser ? 'text-primary-foreground' : 'text-foreground'}`} {...props} />,
                        p: (props) => <p className={`mb-2 last:mb-0 break-words ${isUser ? 'text-primary-foreground' : 'text-foreground'}`} {...props} />,
                        ul: (props) => <ul className={`list-disc list-inside mb-2 space-y-0.5 sm:space-y-1 ${isUser ? 'text-primary-foreground' : 'text-foreground'}`} {...props} />,
                        ol: (props) => <ol className={`list-decimal list-inside mb-2 space-y-0.5 sm:space-y-1 ${isUser ? 'text-primary-foreground' : 'text-foreground'}`} {...props} />,
                        li: (props) => <li className="ml-1 sm:ml-2 break-words" {...props} />,
                        table: (props) => (
                          <div className="overflow-x-auto my-2 sm:my-3 -mx-1 max-w-full">
                            <table className={`min-w-full border-collapse rounded-md text-xs sm:text-sm ${
                              isUser 
                                ? 'border border-primary-foreground/20' 
                                : 'border border-border/50'
                            }`} {...props} />
                          </div>
                        ),
                        thead: (props) => (
                          <thead className={isUser ? 'bg-primary-foreground/10' : 'bg-muted/50'} {...props} />
                        ),
                        th: (props) => (
                          <th className={`border px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-xs sm:text-sm whitespace-nowrap ${
                            isUser 
                              ? 'border-primary-foreground/20 text-primary-foreground' 
                              : 'border-border/50 text-foreground'
                          }`} {...props} />
                        ),
                        td: (props) => (
                          <td className={`border px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm ${
                            isUser 
                              ? 'border-primary-foreground/20 text-primary-foreground' 
                              : 'border-border/50 text-foreground'
                          }`} {...props} />
                        ),
                        tbody: (props) => (
                          <tbody>
                            {props.children}
                          </tbody>
                        ),
                        tr: (props) => (
                          <tr className={isUser ? '' : 'even:bg-muted/30'} {...props} />
                        ),
                        code: ({ inline, ...props }: { inline?: boolean; [key: string]: any }) => 
                          inline ? (
                            <code className={`px-1 sm:px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono break-words ${
                              isUser 
                                ? 'bg-primary-foreground/20 text-primary-foreground' 
                                : 'bg-muted text-foreground'
                            }`} {...props} />
                          ) : (
                            <code className={`block p-2 sm:p-3 rounded-md text-xs sm:text-sm font-mono overflow-x-auto my-2 max-w-full ${
                              isUser 
                                ? 'bg-primary-foreground/20 text-primary-foreground' 
                                : 'bg-muted text-foreground'
                            }`} style={{ maxWidth: '100%' }} {...props} />
                          ),
                        pre: (props) => (
                          <pre className="my-2 overflow-x-auto max-w-full" {...props} />
                        ),
                        strong: (props) => <strong className={`font-semibold ${isUser ? 'text-primary-foreground' : 'text-foreground'}`} {...props} />,
                        em: (props) => <em className={`italic ${isUser ? 'text-primary-foreground' : 'text-foreground'}`} {...props} />,
                        a: (props) => (
                          <a 
                            className={`underline hover:opacity-80 ${
                              isUser ? 'text-primary-foreground' : 'text-primary'
                            }`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            {...props} 
                          />
                        ),
                        hr: (props) => (
                          <hr className={`my-4 ${
                            isUser ? 'border-primary-foreground/20' : 'border-border/50'
                          }`} {...props} />
                        ),
                        blockquote: (props) => (
                          <blockquote className={`border-l-4 pl-4 italic my-2 ${
                            isUser 
                              ? 'border-primary-foreground/50 text-primary-foreground' 
                              : 'border-primary/50 text-foreground'
                          }`} {...props} />
                        ),
                      }}
                    >
                      {displayContent}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-1">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                )}
              </div>
              {message.timestamp && displayContent && (
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 sm:mt-1.5 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              )}
            </div>

            {isUser && (
              <Avatar className="h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 ring-2 ring-secondary/20">
                <AvatarFallback className="bg-gradient-to-br from-secondary to-secondary/80">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        );
      })}
    </>
  );
}

