'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'

export type AuthError = {
  message: string
  code?: string
}

type AuthResponse = {
  error: AuthError | null
  success?: boolean
}

export async function login(formData: FormData): Promise<AuthResponse> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return {
      error: {
        message: 'Email and password are required',
        code: 'MISSING_FIELDS'
      }
    }
  }

  // Check if user exists
  const { data: userExists } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (!userExists) {
    return {
      error: {
        message: 'Account does not exist. Please sign up first.',
        code: 'USER_NOT_FOUND'
      }
    }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return {
      error: {
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/account')
}

    export async function signup(formData: FormData): Promise<AuthResponse> {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullname') as string

    if (!email || !password || !fullName) {
        return {
        error: {
            message: 'All fields are required',
            code: 'MISSING_FIELDS'
        }
        }
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

    if (existingUser) {
        return {
        error: {
            message: 'An account with this email already exists',
            code: 'USER_EXISTS'
        }
        }
    }

    // Create the user
    const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
        data: {
            full_name: fullName,
        }
        }
    })

    if (signUpError) {
        return {
        error: {
            message: signUpError.message,
            code: 'SIGNUP_ERROR'
        }
        }
    }

    // Create user profile in users table
    const { error: profileError } = await supabase
        .from('users')
        .insert([
        {
            id: data.user?.id,
            email,
            full_name: fullName,
        }
        ])

    if (profileError) {
        return {
        error: {
            message: 'Failed to create user profile',
            code: 'PROFILE_ERROR'
        }
        }
    }

    revalidatePath('/', 'layout')
    redirect('/account')
    }

export async function forgotPassword(email: string): Promise<AuthResponse> {
  const supabase = await createClient()

  // Check if user exists
  const { data: userExists } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (!userExists) {
    return {
      error: {
        message: 'No account found with this email',
        code: 'USER_NOT_FOUND'
      }
    }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  if (error) {
    return {
      error: {
        message: 'Failed to send reset password email',
        code: 'RESET_EMAIL_ERROR'
      }
    }
  }

  return {
    error: null,
    success: true
  }
}

export async function resetPassword(formData: FormData): Promise<AuthResponse> {
  const supabase = await createClient()
  
  const newPassword = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (newPassword !== confirmPassword) {
    return {
      error: {
        message: 'Passwords do not match',
        code: 'PASSWORD_MISMATCH'
      }
    }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    return {
      error: {
        message: 'Failed to reset password',
        code: 'RESET_PASSWORD_ERROR'
      }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/auth/login?reset=success')
}