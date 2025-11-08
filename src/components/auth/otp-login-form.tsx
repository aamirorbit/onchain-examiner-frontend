'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth.context';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Loader2, Mail, KeyRound, ArrowLeft, Shield, Clock, Zap } from 'lucide-react';

export function OtpLoginForm() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser } = useAuth();
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.sendOtp(email);
      toast.success('Check your email for the 6-digit code!');
      setStep('otp');
    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.verifyOtp(email, otp);
      await refreshUser();
      
      // Show personalized welcome message
      const userName = response.user?.email?.split('@')[0] || 'User';
      toast.success(`Welcome back, ${userName}! 🎉`, {
        description: 'Successfully logged into your account.',
        duration: 4000,
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      toast.error(error.message || 'Invalid code. Please try again.');
      setOtp(''); // Clear OTP on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await authService.sendOtp(email);
      toast.success('New code sent! Check your email.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border-border/50 backdrop-blur-sm">
      <CardHeader className="space-y-4">
        <div className="flex flex-col items-center text-center">
          <CardDescription className="text-base max-w-sm">
            {step === 'email' 
              ? 'Sign in with your email address' 
              : `Enter the verification code sent to ${email}`
            }
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {step === 'email' ? (
          // Step 1: Email Input
          <form onSubmit={handleSendOtp} className="space-y-2">
            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  autoFocus
                  className="h-14 pl-12 rounded-md border-border/50 focus:border-primary text-base"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-md shadow-lg hover:shadow-xl transition-all text-base font-semibold"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending verification code...
                </>
              ) : (
                'Continue'
              )}
            </Button>

            <div className="pt-6 border-t border-border/50">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">Liquidity Analysis</p>
                </div>
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">Risk Assessment</p>
                </div>
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">AI Chat</p>
                </div>
              </div>
            </div>
          </form>
        ) : (
          // Step 2: OTP Input
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="otp" className="text-sm font-medium text-center block">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                  }}
                  disabled={isLoading}
                  required
                  autoFocus
                  className="text-center text-4xl tracking-[0.5em] font-mono h-20 rounded-md border-2 border-border/50 focus:border-primary shadow-inner"
                  maxLength={6}
                />
              </div>
              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-muted/50">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Code expires in 5 minutes</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-md shadow-lg hover:shadow-xl transition-all text-base font-semibold"
              disabled={isLoading || otp.length !== 6}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying code...
                </>
              ) : (
                'Verify & Sign In'
              )}
            </Button>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToEmail}
                disabled={isLoading}
                className="w-full h-12 rounded-md font-medium"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Use Different Email
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="w-full h-12 rounded-md font-medium text-muted-foreground hover:text-foreground"
              >
                Didn't receive the code? <span className="ml-2 font-semibold text-primary">Resend</span>
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

