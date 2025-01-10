"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { SuccessIndicator } from "./success-indicator";
import {
  ValidationFeedback,
  emailRules,
  passwordRules,
  fullNameRules,
} from "./auth-validation-alert";
import { useState } from "react";
import { signup } from "@/actions/auth-service";
import { useRouter } from "next/navigation";

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [showValidation, setShowValidation] = useState({
    email: false,
    password: false,
    fullName: false,
  });

  const isEmailValid = emailRules.every((rule) => rule.validate(email));
  const isPasswordValid = passwordRules.every((rule) => rule.validate(password));
  const isFullNameValid = fullNameRules.every((rule) => rule.validate(fullName));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!isEmailValid || !isPasswordValid || !isFullNameValid) {
      setError("Please ensure all fields are valid.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("fullname", fullName);

      const response = await signup(formData);

      if (response?.error) {
        setError(response.error.message || "Registration failed. Try again.");
        return;
      }

      setSuccess(true);
      setEmail("");
      setPassword("");
      setFullName("");

      // Redirect after successful signup
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
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
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your details below to create your account
        </p>
      </div>

      {error && <div className="text-sm text-red-500 text-center">{error}</div>}
      {success && (
        <div className="text-sm text-green-500 text-center">
          Account created successfully! Redirecting to login...
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="fullname">Full Name</Label>
          <Input
            id="fullname"
            type="text"
            placeholder="John Doe"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onFocus={() =>
              setShowValidation((prev) => ({ ...prev, fullName: true }))
            }
            className={cn(isFullNameValid && fullName && "border-green-500")}
          />
          {showValidation.fullName && !isFullNameValid && (
            <ValidationFeedback
              value={fullName}
              rules={fullNameRules}
              type="fullname"
            />
          )}
          <SuccessIndicator
            show={isFullNameValid && fullName !== ""}
            fieldName="Name"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() =>
              setShowValidation((prev) => ({ ...prev, email: true }))
            }
            className={cn(isEmailValid && email && "border-green-500")}
          />
          {showValidation.email && !isEmailValid && (
            <ValidationFeedback
              value={email}
              rules={emailRules}
              type="email"
            />
          )}
          <SuccessIndicator
            show={isEmailValid && email !== ""}
            fieldName="Email"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
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
          <SuccessIndicator
            show={isPasswordValid && password !== ""}
            fieldName="Password"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !isEmailValid || !isPasswordValid || !isFullNameValid}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-3" />
              Creating account...
            </>
          ) : (
            "Sign up"
          )}
        </Button>
      </div>
    </form>
  );
}
