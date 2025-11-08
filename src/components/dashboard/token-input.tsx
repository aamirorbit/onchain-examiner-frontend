'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Menu } from 'lucide-react';
import { toast } from 'sonner';

interface TokenInputProps {
  onAnalyze: (tokenAddress: string) => Promise<void>;
  isLoading?: boolean;
  onOpenMenu?: () => void;
}

export function TokenInput({ onAnalyze, isLoading = false, onOpenMenu }: TokenInputProps) {
  const [tokenAddress, setTokenAddress] = useState('');
  const [showAllTokens, setShowAllTokens] = useState(false);

  const validateAddress = (address: string): boolean => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!tokenAddress.trim()) {
      toast.error('Please enter a token address');
      return;
    }

    if (!validateAddress(tokenAddress)) {
      toast.error('Invalid Ethereum address format');
      return;
    }

    try {
      await onAnalyze(tokenAddress);
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze token');
    }
  };

  const exampleTokens = [
    { name: 'CAKE', address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82' },
    { name: 'WBNB', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' },
    { name: 'BUSD', address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56' },
    { name: 'MERL', address: '0xa0c56a8c0692bD10B3fA8f8bA79Cf5332B7107F9' }
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Desktop View - Minimalistic Centered Layout */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-2xl space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">AI Pool Analyzer</h1>
          </div>

          {/* Main Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="tokenAddress"
              placeholder="Enter token address: 0x..."
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              disabled={isLoading}
              className="h-14 font-mono text-base rounded-xl text-center"
            />

            <Button
              type="submit"
              className="w-full h-14 rounded-xl text-base font-semibold"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                </div>
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Analyze Token
                </>
              )}
            </Button>

            {isLoading && (
              <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-muted/30 animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="text-sm text-muted-foreground">
                  This may take 5-30 seconds
                </span>
              </div>
            )}
          </form>

          {/* Popular Tokens */}
          {!isLoading && (
            <>
              <div className="text-center space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Popular Tokens
                </p>
                <div className="flex justify-center gap-3 flex-wrap">
                  {(showAllTokens ? exampleTokens : exampleTokens.slice(0, 4)).map((token) => (
                    <button
                      key={token.address}
                      onClick={() => setTokenAddress(token.address)}
                      disabled={isLoading}
                      className="px-6 py-2.5 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all font-medium disabled:opacity-50"
                    >
                      {token.name}
                    </button>
                  ))}
                </div>
                {exampleTokens.length > 4 && (
                  <button
                    onClick={() => setShowAllTokens(!showAllTokens)}
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {showAllTokens ? 'Show Less' : `Show More (${exampleTokens.length - 4} more)`}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile View - Bottom Input Layout */}
      <div className="lg:hidden flex flex-col h-full">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 flex items-center justify-center">
          <div className="w-full max-w-xl space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold">AI Pool Analyzer</h1>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-center text-muted-foreground">
                  Analyzing token...
                  <br />
                  <span className="text-xs">This may take 5-30 seconds</span>
                </span>
              </div>
            )}

            {/* Suggested Tokens */}
            {!isLoading && (
              <>
                <div className="space-y-3 text-center">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Popular Tokens
                  </p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {(showAllTokens ? exampleTokens : exampleTokens.slice(0, 4)).map((token) => (
                      <button
                        key={token.address}
                        onClick={() => {
                          setTokenAddress(token.address);
                          handleSubmit();
                        }}
                        disabled={isLoading}
                        className="px-5 py-3 rounded-xl border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-semibold disabled:opacity-50 active:scale-95"
                      >
                        {token.name}
                      </button>
                    ))}
                  </div>
                  {exampleTokens.length > 4 && (
                    <button
                      onClick={() => setShowAllTokens(!showAllTokens)}
                      className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      {showAllTokens ? 'Show Less' : `Show More (${exampleTokens.length - 4} more)`}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Input Bar - Similar to Chat */}
        <div className="backdrop-blur-sm sticky bottom-0 border-t">
          <div className="px-3 py-3">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                {/* Menu Button */}
                {onOpenMenu && (
                  <Button 
                    type="button"
                    onClick={onOpenMenu}
                    size="icon"
                    variant="ghost"
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg transition-all z-10 hover:bg-muted border border-border/50"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                )}
                
                <Input
                  placeholder="Paste token address..."
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  disabled={isLoading}
                  className={`h-11 ${onOpenMenu ? 'pl-11' : 'pl-4'} pr-11 rounded-xl border-border/50 bg-background focus:border-primary/50 transition-colors shadow-sm text-sm font-mono`}
                  autoComplete="off"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !tokenAddress.trim()}
                  size="icon"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

