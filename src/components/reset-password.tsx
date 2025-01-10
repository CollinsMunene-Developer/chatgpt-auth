"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import {
  ValidationFeedback,
  passwordRules,
} from "./auth-validation-alert";
import { SuccessIndicator } from "./success-indicator";

export function ResetPasswordForm({
  className,
  onSubmit,
  ...props
}: React.ComponentPropsWithoutRef<"form"> & {
  onSubmit?: (password: string, confirmPassword: string) => Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [showValidation, setShowValidation] = useState({
    password: false,
    confirmPassword: false,
  });

  const isPasswordValid = passwordRules.every((rule) => rule.validate(password));
  const isConfirmPasswordValid = password === confirmPassword && confirmPassword !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    if (!isPasswordValid) {
      setError("Please enter a valid password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.(password, confirmPassword);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() =>
              setShowValidation((prev) => ({ ...prev, password: true }))
            }
            className={cn(isPasswordValid && password && "border-green-500")}
          />
          {showValidation.password && !isPasswordValid && (
            <ValidationFeedback
              value={password}
              rules={passwordRules}
              type="password"
            />
          )}
          <SuccessIndicator show={isPasswordValid && password !== ""} fieldName="Password" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={() =>
              setShowValidation((prev) => ({ ...prev, confirmPassword: true }))
            }
            className={cn(isConfirmPasswordValid && "border-green-500")}
          />
          {showValidation.confirmPassword && !isConfirmPasswordValid && (
            <div className="text-sm text-red-500">Passwords must match</div>
          )}
          <SuccessIndicator show={isConfirmPasswordValid} fieldName="Password Confirmation" />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={
            isSubmitting ||
            !isPasswordValid ||
            !isConfirmPasswordValid
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-3" />
              Resetting password...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </div>
    </form>
  );
}

export default ResetPasswordForm;