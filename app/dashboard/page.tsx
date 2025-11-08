'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import { TokenInput } from '@/components/dashboard/token-input';
import { ChatInterface } from '@/components/chat/chat-interface';
import { AnalysisResults } from '@/components/dashboard/analysis-results';
import { useAuth } from '@/contexts/auth.context';
import { useChat } from '@/hooks/useChat';
import { chatService } from '@/services/chat.service';
import type { Analysis } from '@/types/analysis.types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

function DashboardContent() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get('session');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Separate function for session loading to prevent infinite loops
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      // First clear current state
      setWelcomeMessage(null);
      setShowResults(false);
      
      // Then load new session
      const session = await chatService.getSession(sessionId);
      setCurrentSessionId(sessionId);
      setTokenAddress(session.tokenAddress);
      
      console.log('[Dashboard] Loaded session:', sessionId, 'Messages:', session.messages.length);
    } catch (error: any) {
      toast.error('Failed to load session');
      console.error(error);
    }
  }, []);

  useEffect(() => {
    // If URL has session param, load it
    if (sessionIdFromUrl && sessionIdFromUrl !== currentSessionId) {
      loadSession(sessionIdFromUrl);
    }
    // If URL has no session param but we have a currentSessionId, clear it
    else if (!sessionIdFromUrl && currentSessionId) {
      setCurrentSessionId(null);
      setTokenAddress('');
      setWelcomeMessage(null);
      setShowResults(false);
      setAnalysis(null);
    }
  }, [sessionIdFromUrl, currentSessionId, loadSession]);

  const handleAnalyze = async (address: string) => {
    setIsAnalyzing(true);
    setTokenAddress(address);
    
    try {
      toast.info('Creating analysis session... This may take 5-30 seconds');
      
      const response = await chatService.createSession(address);
      console.log('[Dashboard] Session created:', response);
      setCurrentSessionId(response.sessionId);
      setWelcomeMessage(response.welcomeMessage);
      setShowResults(false); // Go directly to chat
      
      // Update URL to include session ID for proper navigation
      router.push(`/dashboard?session=${response.sessionId}`);
      
      toast.success('Analysis complete! You can now chat with AI about this token');
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze token');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewChat = useCallback(() => {
    // Clear all state synchronously
    setCurrentSessionId(null);
    setTokenAddress('');
    setShowResults(false);
    setAnalysis(null);
    setWelcomeMessage(null);
    setIsAnalyzing(false);
    // Navigate to dashboard without session param - this will trigger useEffect to clear state
    router.push('/dashboard');
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar 
        currentSessionId={currentSessionId || undefined} 
        onNewChat={handleNewChat}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden lg:ml-0 bg-gradient-to-br from-background via-background to-muted/10">
        {!currentSessionId && !sessionIdFromUrl ? (
          // Show token input when no active session
          <TokenInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} onOpenMenu={() => setIsMobileMenuOpen(true)} />
        ) : currentSessionId ? (
          // Show chat interface when session is active
          <div className="h-full">
            {showResults && analysis ? (
              <div className="h-full overflow-auto p-8">
                <AnalysisResults analysis={analysis} />
              </div>
            ) : (
              <ChatInterface 
                key={currentSessionId} // Force remount on session change
                sessionId={currentSessionId} 
                tokenAddress={tokenAddress}
                initialMessages={welcomeMessage ? [welcomeMessage] : undefined}
                onOpenMenu={() => setIsMobileMenuOpen(true)}
              />
            )}
          </div>
        ) : (
          // Loading state while session is being loaded
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading session...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

