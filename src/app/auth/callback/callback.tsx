"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { handleOAuthCallback } from '@/actions/auth-service';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const processAuth = async () => {
      const code = searchParams.get('code');
      
      if (code) {
        const response = await handleOAuthCallback(code);
        
        if (response.success) {
          // Get the return URL from localStorage or default to '/'
          const returnTo = localStorage.getItem('returnTo') || '/';
          localStorage.removeItem('returnTo'); // Clean up
          router.push(returnTo);
        } else {
          router.push('/login?error=auth_failed');
        }
      } else {
        router.push('/login?error=no_code');
      }
    };

    processAuth();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Processing your login...</h2>
        <p className="text-muted-foreground">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}
