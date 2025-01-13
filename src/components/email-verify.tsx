"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { checkEmailVerification, resendVerificationEmail } from "@/actions/auth-service";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const checkVerification = async () => {
      const response = await checkEmailVerification();
      
      if (response.error) {
        setError(response.error.message);
        return;
      }

      setEmail(response.email || "");
      
      if (response.isVerified) {
        setIsVerified(true);
        // Redirect to login after showing success message
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    };

    const interval = setInterval(checkVerification, 3000);
    checkVerification();

    return () => clearInterval(interval);
  }, [router]);

  const handleResendEmail = async () => {
    setIsSubmitting(true);
    setError(undefined);

    try {
      const response = await resendVerificationEmail();
      if (response.error) {
        setError(response.error.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-sm text-muted-foreground">
            We've sent a verification link to {email}
          </p>
        </div>

        {isVerified ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Email verified successfully!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your email has been verified. You will be redirected to login.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertTitle>Check your inbox</AlertTitle>
              <AlertDescription>
                Click the link in the verification email to confirm your account.
                The link will expire in 24 hours.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Didn't receive the email? Check your spam folder or click below to resend.
              </p>
              
              <Button 
                onClick={handleResendEmail} 
                disabled={isSubmitting}
                variant="outline"
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend verification email"
                )}
              </Button>

              <Link href="/auth/login">
                <Button variant="ghost" className="w-full">
                  Back to login
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}