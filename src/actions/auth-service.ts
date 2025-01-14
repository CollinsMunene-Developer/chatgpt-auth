"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export type AuthError = {
  message: string;
  code?: string;
};

interface AuthResponse {
  error?: {
    message: string;
    code: string;
  };
  success?: boolean;
  email?: string;
  isVerified?: boolean;
}
export async function login(formData: FormData): Promise<AuthResponse> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      error: {
        message: "Email and password are required",
        code: "MISSING_FIELDS",
      },
    };
  }

  // Check if user exists
  const { data: userExists } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (!userExists) {
    return {
      error: {
        message: "Invalid credentials",
        code: "USER_NOT_FOUND",
      },
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: {
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      },
    };
  }

  revalidatePath("/", "layout");
  redirect("/account");
}

export async function signup(formData: FormData): Promise<AuthResponse> {
  cookies();
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullname") as string;

  if (!email || !password || !fullName) {
    return {
      error: {
        message: "All fields are required",
        code: "MISSING_FIELDS",
      },
    };
  }

  try {
    // Check if user exists
    const { data: existingUser, error: queryError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (queryError && queryError.code !== "PGRST116") {
      console.error("Error checking existing user:", queryError);
      return {
        error: {
          message: "Error checking user status",
          code: "STATUS_ERROR",
        },
      };
    }

    if (existingUser) {
      return {
        error: {
          message: "An account with this email already exists",
          code: "USER_EXISTS",
        },
      };
    }

    // Create the user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (signUpError) {
      console.error("Signup error:", signUpError);
      return {
        error: {
          message: signUpError.message,
          code: "SIGNUP_ERROR",
        },
      };
    }

    if (!data.user) {
      return {
        error: {
          message: "Failed to create user",
          code: "USER_CREATION_ERROR",
        },
      };
    }

    // Create user profile in users table
    const { error: profileError } = await supabase.from("users").insert([
      {
        id: data.user.id,
        email,
        full_name: fullName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return {
        error: {
          message: "Failed to create user profile",
          code: "PROFILE_ERROR",
        },
      };
    }

    return {
      success: true,
      email: email,
      isVerified: false,
    };
  } catch (error) {
    console.error("Unexpected error during signup:", error);
    return {
      error: {
        message: "An unexpected error occurred",
        code: "UNEXPECTED_ERROR",
      },
    };
  }
}

export async function forgotPassword(email: string): Promise<AuthResponse> {
  const supabase = await createClient();

  // Check if user exists
  const { data: userExists } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (!userExists) {
    return {
      error: {
        message: "No account found with this email",
        code: "USER_NOT_FOUND",
      },
    };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    return {
      error: {
        message: "Failed to send reset password email",
        code: "RESET_EMAIL_ERROR",
      },
    };
  }

  return {
    success: true,
  };
}
export async function resetPassword(formData: FormData): Promise<AuthResponse> {
  const supabase = await createClient();
  const password = formData.get("password") as string;

  if (!password) {
    return {
      error: {
        message: "Password is required",
        code: "INVALID_PASSWORD",
      },
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return {
      error: {
        message: "Failed to reset password",
        code: "RESET_PASSWORD_ERROR",
      },
    };
  }

  // Sign out the user after password reset
  await supabase.auth.signOut();

  return {
    success: true,
  };
}
export async function checkEmailVerification(): Promise<AuthResponse> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return {
      error: {
        message: "Error checking verification status",
        code: "VERIFICATION_ERROR",
      },
    };
  }

  if (!user) {
    return {
      error: {
        message: "No user found",
        code: "NO_USER",
      },
    };
  }

  return {
    success: true,
    email: user.email,
    isVerified: user.email_confirmed_at !== null,
  };
}

export async function resendVerificationEmail(): Promise<AuthResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      error: {
        message: "No email found",
        code: "NO_EMAIL",
      },
    };
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: user.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      error: {
        message: "Failed to resend verification email",
        code: "RESEND_ERROR",
      },
    };
  }

  return {
    success: true,
    email: user.email,
  };
}
//google signup
export async function signInWithGoogle(): Promise<
  AuthResponse & { url?: string }
> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback?type=oauth`,
      scopes: "email profile",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Google sign in error:", error);
    return {
      error: {
        message: "Failed to initiate Google sign in",
        code: "GOOGLE_SIGNIN_ERROR",
      },
    };
  }

  return {
    success: true,
    url: data?.url,
  };
}

// Create a new function to handle the OAuth callback
export async function handleOAuthCallback(code: string): Promise<AuthResponse> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        error: {
          message: "Failed to get user details",
          code: "USER_FETCH_ERROR",
        },
      };
    }

    // Check if user exists in our users table
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!existingUser) {
      // Create user profile in users table
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata.full_name || user.user_metadata.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (profileError) {
        console.error("Profile creation error:", profileError);
        return {
          error: {
            message: "Failed to create user profile",
            code: "PROFILE_ERROR",
          },
        };
      }
    }

    return {
      success: true,
      email: user.email,
    };
  } catch (error) {
    console.error("OAuth callback error:", error);
    return {
      error: {
        message: "Failed to process authentication",
        code: "OAUTH_CALLBACK_ERROR",
      },
    };
  }
}
