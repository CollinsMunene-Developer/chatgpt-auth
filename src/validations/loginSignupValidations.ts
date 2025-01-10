import { useState } from "react";

export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

export function useAuthenticationFlow() {
  const emailValidates = (email: string): ValidationResult => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return {
      isValid: emailRegex.test(email),
      message: emailRegex.test(email) ? undefined : "Invalid email address",
    };
  };

  const passwordValidates = (password: string): ValidationResult => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return {
      isValid: passwordRegex.test(password),
      message: passwordRegex.test(password)
        ? undefined
        : "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character",
    };
  };

  const fullNameValidates = (fullName: string): ValidationResult => {
    const fullNameRegex = /^[a-zA-Z\s]{2,}$/;
    return {
      isValid: fullNameRegex.test(fullName),
      message: fullNameRegex.test(fullName)
        ? undefined
        : "Full name must contain only letters and spaces, and be at least 2 characters long",
    };
  };

  const validateSignup = (
    email: string,
    password: string,
    fullName: string
  ): ValidationResult => {
    const emailValidation = emailValidates(email);
    const passwordValidation = passwordValidates(password);
    const fullNameValidation = fullNameValidates(fullName);

    if (!emailValidation.isValid) return emailValidation;
    if (!passwordValidation.isValid) return passwordValidation;
    if (!fullNameValidation.isValid) return fullNameValidation;

    return { isValid: true };
  };

  const validateLogin = (email: string, password: string): ValidationResult => {
    const emailValidation = emailValidates(email);
    const passwordValidation = passwordValidates(password);

    if (!emailValidation.isValid) return emailValidation;
    if (!passwordValidation.isValid) return passwordValidation;

    return { isValid: true };
  };

  return {
    emailValidates,
    passwordValidates,
    fullNameValidates,
    validateSignup,
    validateLogin,
  };
}
