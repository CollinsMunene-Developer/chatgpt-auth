"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { checkEmailVerification, resendVerificationEmail } from "@/actions/auth-service";

export default function VerifyEmail() {
  const [email, setEmail] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const searchParams = useSearchParams();

  useEffect(() => {
    // Try to get email from URL params first, then localStorage
    const emailFromParams = searchParams.get('email');
    const emailFromStorage = localStorage.getItem('verificationEmail');
    
    if (emailFromParams) {
      setEmail(emailFromParams);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    }
  }, [searchParams]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendStatus('idle');

    try {
      const response = await resendVerificationEmail();
      
      if (response.success) {
        setResendStatus('success');
      } else {
        setResendStatus('error');
      }
    } catch (error) {
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md p-6">
      <div className="text-center space-y-6">
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="text-muted-foreground">
          We've sent a verification link to{' '}
          <span className="font-medium text-foreground">{email}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Please check your email and click the verification link to complete your registration.
        </p>
        
        <div className="space-y-2">
          <Button
            onClick={handleResendEmail}
            disabled={isResending}
            variant="outline"
            className="w-full"
          >
            {isResending ? 'Sending...' : 'Resend verification email'}
          </Button>
          
          {resendStatus === 'success' && (
            <p className="text-sm text-green-600">
              Verification email has been resent successfully!
            </p>
          )}
          
          {resendStatus === 'error' && (
            <p className="text-sm text-red-600">
              Failed to resend verification email. Please try again.
            </p>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Didn't receive an email? Check your spam folder or{' '}
          <button
            onClick={handleResendEmail}
            className="text-primary underline-offset-4 hover:underline"
          >
            request another email
          </button>
        </p>
      </div>
    </div>
  );
}