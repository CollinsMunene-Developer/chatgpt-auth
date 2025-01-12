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
import Link from "next/link";

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
    <div className=" flex flex-col gap-4">  
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
    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
    <div className="gap-4 flex flex-col">
          <Button
            variant="outline"
            className="w-full"
            type="button"
            disabled={isSubmitting}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="mr-2 h-4 w-4"
            >
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Login with GitHub
          </Button>
          <Button
            variant="outline"
            className="w-full"
            type="button"
            disabled={isSubmitting}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              ></path>
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              ></path>
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
            </svg>
            Login with Google
          </Button>
          <Button variant="outline" className="w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="100"
              height="100"
              viewBox="0 0 48 48"
            >
              <path
                fill="#ff5722"
                d="M6 6H22V22H6z"
                transform="rotate(-180 14 14)"
              ></path>
              <path
                fill="#4caf50"
                d="M26 6H42V22H26z"
                transform="rotate(-180 34 14)"
              ></path>
              <path
                fill="#ffc107"
                d="M26 26H42V42H26z"
                transform="rotate(-180 34 34)"
              ></path>
              <path
                fill="#03a9f4"
                d="M6 26H22V42H6z"
                transform="rotate(-180 14 34)"
              ></path>
            </svg>
            Sign up with Microsoft
          </Button>
        </div>
        <div className="" >
        Already  have an account?{" "}
        <Link href="/auth/login" className="underline underline-offset-4">
          Log in
        </Link>
      </div>
        
    </div>

    
  );
}
