'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { chatService } from '@/services/chat.service';
import { useAuth } from '@/contexts/auth.context';
import type { ChatSessionSummary } from '@/types/chat.types';
import { MessageSquare, Plus, LogOut, History, User, TrendingUp, Loader2, X, Menu, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface SidebarProps {
  currentSessionId?: string;
  onNewChat: () => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export function Sidebar({ currentSessionId, onNewChat, isMobileMenuOpen: externalMenuOpen, setIsMobileMenuOpen: externalSetMenuOpen }: SidebarProps) {
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const [isProfilePopoverOpen, setIsProfilePopoverOpen] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isMobileMenuOpen = externalMenuOpen !== undefined ? externalMenuOpen : internalMenuOpen;
  const setIsMobileMenuOpen = externalSetMenuOpen || setInternalMenuOpen;
  
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only load once when user becomes available
    if (user && sessions.length === 0 && !isLoading) {
      loadSessions();
    }
  }, [user]); // Intentionally omit sessions and isLoading to prevent loops

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const response = await chatService.getUserSessions(20);
      setSessions(response.sessions);
    } catch (error: any) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(`/dashboard?session=${sessionId}`);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <>
      {/* Mobile Overlay - iOS style with blur */}
      {isMobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Bottom Sheet Container - iOS style */}
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
            {/* Handle bar */}
            <div className="flex justify-center py-3 bg-background rounded-t-3xl">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
            
            {/* Sheet Content */}
            <div className="bg-background shadow-2xl h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Onchain Examiner</h2>
                    <p className="text-xs text-muted-foreground">DeFi Analysis</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="px-6 py-4 bg-muted/30 border-b flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Active Account</p>
                    </div>
                  </div>
                </div>
              )}

              {/* New Analysis Button */}
              <div className="px-6 py-4 border-b flex-shrink-0">
                <Button
                  onClick={() => {
                    onNewChat();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full h-12 rounded-md shadow-sm hover:shadow-md transition-all"
                  variant="default"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  New Analysis
                </Button>
              </div>

              {/* Sessions List - Scrollable */}
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="px-6 py-4 border-b flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Recent History
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  <div className="px-6 py-3 space-y-2 pb-6">
                    {isLoading ? (
                      <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : sessions.length === 0 ? (
                      <div className="py-8 text-center">
                        <div className="mx-auto w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-2">
                          <MessageSquare className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <p className="text-xs font-medium text-foreground">No history yet</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Start analyzing!</p>
                      </div>
                    ) : (
                      sessions.map((session) => (
                        <button
                          key={session.id}
                          className={`w-full text-left p-3 rounded-lg transition-all active:scale-[0.98] ${
                            currentSessionId === session.id 
                              ? 'bg-primary/10 border border-primary/30' 
                              : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                          }`}
                          onClick={() => handleSessionClick(session.id)}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              currentSessionId === session.id
                                ? 'bg-primary/20 text-primary'
                                : 'bg-background text-muted-foreground'
                            }`}>
                              <MessageSquare className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate font-mono">
                                {session.tokenAddress.slice(0, 6)}...{session.tokenAddress.slice(-4)}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-muted-foreground">
                                  {session.messageCount} {session.messageCount === 1 ? 'msg' : 'msgs'}
                                </span>
                                <span className="text-[10px] text-muted-foreground">•</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(session.lastMessageAt).toLocaleDateString([], { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Footer - Always visible at bottom */}
              <div className="px-6 py-4 border-t bg-muted/20 flex-shrink-0">
                <Button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start hover:bg-destructive/10 hover:text-destructive transition-colors rounded-xl h-12 font-medium"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar - No changes needed */}
      <div className={`
        hidden lg:flex w-72 border-r bg-background flex-col h-screen
      `}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Onchain Examiner</h2>
            <p className="text-xs text-muted-foreground">DeFi Analysis</p>
          </div>
        </div>
        
        <Button
          onClick={onNewChat}
          className="w-full h-11 rounded-md shadow-sm hover:shadow-md transition-all"
          variant="default"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Analysis
        </Button>
      </div>

      {/* Sessions List - Scrollable with fixed footer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Recent History
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-2">
              {isLoading ? (
                <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : sessions.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-2">
                    <MessageSquare className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-xs font-medium text-foreground">No history yet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Start analyzing!</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      currentSessionId === session.id 
                        ? 'bg-primary/10 border border-primary/30' 
                        : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                    }`}
                    onClick={() => handleSessionClick(session.id)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        currentSessionId === session.id
                          ? 'bg-primary/20 text-primary'
                          : 'bg-background text-muted-foreground'
                      }`}>
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate font-mono">
                          {session.tokenAddress.slice(0, 6)}...{session.tokenAddress.slice(-4)}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {session.messageCount} {session.messageCount === 1 ? 'msg' : 'msgs'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">•</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(session.lastMessageAt).toLocaleDateString([], { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Footer - User Profile with Popover */}
      {user && (
        <div className="border-t bg-muted/10 flex-shrink-0">
          <Popover open={isProfilePopoverOpen} onOpenChange={setIsProfilePopoverOpen}>
            <PopoverTrigger asChild>
              <button 
                className="w-full p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors group"
                onMouseEnter={() => setIsProfilePopoverOpen(true)}
                onMouseLeave={() => setIsProfilePopoverOpen(false)}
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Active Account</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </PopoverTrigger>
            <PopoverContent 
              side="right" 
              align="end" 
              className="w-64 p-2"
              onMouseEnter={() => setIsProfilePopoverOpen(true)}
              onMouseLeave={() => setIsProfilePopoverOpen(false)}
            >
              <div className="space-y-1">
                <div className="px-3 py-2 mb-2">
                  <p className="text-sm font-semibold">{user.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Active Account</p>
                </div>
                <Separator />
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start hover:bg-destructive/10 hover:text-destructive transition-colors rounded-md h-10 font-medium mt-1"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
    </>
  );
}

