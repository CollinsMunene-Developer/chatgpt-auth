import React from 'react';
import { Alert } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

type ValidationRule = {
  id: string;
  description: string;
  validate: (value: string) => boolean;
};

interface ValidationFeedbackProps {
  value: string;
  rules: ValidationRule[];
  type: 'password' | 'email' | 'fullname';
}

export function ValidationFeedback({ value, rules, type }: ValidationFeedbackProps) {
  const allValid = rules.every(rule => rule.validate(value));
  
  // Don't render anything if all conditions are met
  if (allValid) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Alert variant="default" className="bg-muted/50">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {type === 'password' && 'Password Requirements'}
              {type === 'email' && 'Email Requirements'}
              {type === 'fullname' && 'Name Requirements'}
            </span>
          </div>
          <div className="grid gap-2">
            {rules.map((rule) => {
              const isValid = rule.validate(value);
              if (isValid) return null; // Don't show rules that are already met
              return (
                <div
                  key={rule.id}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <XCircle className="h-4 w-4 text-red-500" />
                  {rule.description}
                </div>
              );
            })}
          </div>
        </div>
      </Alert>
    </div>
  );
}

// Keep the validation rules the same
export const passwordRules: ValidationRule[] = [
  {
    id: 'length',
    description: 'At least 8 characters long',
    validate: (password) => password.length >= 8,
  },
  {
    id: 'uppercase',
    description: 'Contains at least one uppercase letter',
    validate: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    description: 'Contains at least one lowercase letter',
    validate: (password) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    description: 'Contains at least one number',
    validate: (password) => /\d/.test(password),
  },
  {
    id: 'special',
    description: 'Contains at least one special character (@$!%*?&)',
    validate: (password) => /[@$!%*?&]/.test(password),
  },
];

export const emailRules: ValidationRule[] = [
  {
    id: 'format',
    description: 'Valid email format (e.g., user@example.com)',
    validate: (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email),
  },
];

export const fullNameRules: ValidationRule[] = [
  {
    id: 'length',
    description: 'At least 2 characters long',
    validate: (name) => name.length >= 2,
  },
  {
    id: 'lettersOnly',
    description: 'Contains only letters and spaces',
    validate: (name) => /^[a-zA-Z\s]+$/.test(name),
  },
];