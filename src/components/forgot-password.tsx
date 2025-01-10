"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2,  Mail } from "lucide-react";
import { emailRules } from "./auth-validation-alert";
import Link from 'next/link';
import { forgotPassword } from "@/actions/auth-service";


export function ForgotPasswordForm({
  className,
  onSubmit,
  ...props
}: React.ComponentPropsWithoutRef<"form"> & {
  onSubmit?: (email: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [isSuccess, setIsSuccess] = useState(false);

  const isEmailValid = emailRules.every(rule => rule.validate(email));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    if (!isEmailValid) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await forgotPassword(email);
      
      if (response.error) {
        setError(response.error.message);
        return;
      }
      
      setIsSuccess(true);
      setEmail(""); // Clear the form after successful submission
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    setIsSubmitting(true);
    try {
      const response = await forgotPassword(email);
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
    <div className="w-full max-w-md space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      {isSuccess ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Check your email</AlertTitle>
          <AlertDescription className="text-green-700">
            We've sent password reset instructions to your email address. Please check your inbox.
          </AlertDescription>

          <div className=" flex justify-between">
            <Link href="/auth/login" >
            <Button variant="outline"  className="text-primary" disabled={isSubmitting} >
            Back to login
          </Button>
            </Link>
            <Button variant="outline" className="text-primary" onClick={handleResendEmail} disabled={isSubmitting} >
            Resend email
          </Button>
          </div>


        </Alert>
      ) : (
        <form
          className={cn("space-y-4", className)}
          onSubmit={handleSubmit}
          {...props}
        >
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !isEmailValid}
          >
            {isSubmitting ? (
              "Sending instructions..."
            ) : (
              "Send reset instructions"
            )}
          </Button>

          <div className="text-center text-sm">
            Remember your password?{" "}
            <a href="/auth/login" className="font-medium underline underline-offset-4 hover:text-primary">
              Back to login
            </a>
          </div>
        </form>
      )}
    </div>
  );
}

export default ForgotPasswordForm;