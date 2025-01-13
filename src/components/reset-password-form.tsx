import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/actions/auth-service";

const passwordRules = [
  { validate: (password: string) => password.length >= 8, message: "At least 8 characters" },
  { validate: (password: string) => /[A-Z]/.test(password), message: "One uppercase letter" },
  { validate: (password: string) => /[a-z]/.test(password), message: "One lowercase letter" },
  { validate: (password: string) => /[0-9]/.test(password), message: "One number" },
  { validate: (password: string) => /[^A-Za-z0-9]/.test(password), message: "One special character" },
];

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [isSuccess, setIsSuccess] = useState(false);

  const isPasswordValid = passwordRules.every(rule => rule.validate(password));
  const doPasswordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements");
      return;
    }

    if (!doPasswordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("password", password);
      
      const response = await resetPassword(formData);
      
      if (response.error) {
        setError(response.error.message);
        return;
      }
      
      setIsSuccess(true);
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
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
          Enter your new password below.
        </p>
      </div>

      {isSuccess ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Password reset successful</AlertTitle>
          <AlertDescription className="text-green-700">
            Your password has been successfully reset. You will be redirected to the login page in a moment.
          </AlertDescription>
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

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                />
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">Password requirements:</p>
              <ul className="list-disc pl-4 space-y-1">
                {passwordRules.map((rule, index) => (
                  <li
                    key={index}
                    className={cn(
                      "text-sm",
                      rule.validate(password) ? "text-green-600" : "text-muted-foreground"
                    )}
                  >
                    {rule.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !isPasswordValid || !doPasswordsMatch}
          >
            {isSubmitting ? "Resetting password..." : "Reset password"}
          </Button>
        </form>
      )}
    </div>
  );
}

export default ResetPasswordForm;