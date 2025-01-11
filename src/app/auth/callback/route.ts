
import { NextResponse } from 'next/server'
import { AuthError } from '@supabase/supabase-js'
import { createClient } from '@/app/utils/supabase/server'

export async function  GET (request: Request) {
  const requestUrl = new URL(request.url)
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const email_verify = requestUrl.searchParams.get('email_verify')

  if (error && error_description?.includes('expired')) {
    if (email_verify) {
      const supabase = await createClient()
      const { data } = await supabase
        .rpc('check_user_verification', {
          user_email: email_verify
        })
      
      if (Array.isArray(data) && data[0]?.is_verified === true) {
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/login?message=already_verified&email=${email_verify}`
        )
      }
    }

    const redirectUrl = new URL(`${requestUrl.origin}/auth/login`)
    redirectUrl.searchParams.set('error', 'verification_expired')
    if (email_verify) {
      redirectUrl.searchParams.set('email', email_verify)
    }
    return NextResponse.redirect(redirectUrl)
  }

  if (code) {
    const supabase = await createClient()
    
    // First check if user is already verified
    const { data: { user } } = await supabase.auth.getUser(code)
    if (user?.email_confirmed_at) {
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?message=already_verified`
      )
    }
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        if (error instanceof AuthError && 
            (error.message.includes('flow state') || 
             error.message.includes('code verifier') ||
             error.message.includes('expired'))) {
          
          const email_verify = requestUrl.searchParams.get('email_verify')
          
          if (email_verify) {
            const { data } = await supabase.rpc('check_user_verification', {
              user_email: email_verify
            })
            
            if (process.env.NODE_ENV === 'development') {
              console.log('Verification status check:', { data, email_verify });
            }

            if (Array.isArray(data) && data[0]?.is_verified === true) {
              return NextResponse.redirect(
                `${requestUrl.origin}/auth/login?message=verified_different_browser&email=${email_verify}`
              )
            }
          }
        }

        if (error instanceof AuthError) {
          return NextResponse.redirect(
            `${requestUrl.origin}/auth/login?error=Could not verify email: ${error.message}`
          )
        }
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/login?error=Could not verify email: An unexpected error occurred`
        )
      }

      if (type === 'recovery') {
        return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password`)
      }

      if (type === 'oauth') {
        const next = requestUrl.searchParams.get('next') ?? '/'
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        // Get current user and session data
        const { data: { user } } = await supabase.auth.getUser()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[OAuth Callback] Provider:', user?.app_metadata?.provider)
          console.log('[OAuth Callback] Has provider token:', !!session?.provider_token)
        }
        
        // Handle provider-specific avatar URLs
        if (user?.app_metadata?.provider) {
          const baseUrl = isLocalEnv ? requestUrl.origin : `https://${forwardedHost}`
          let proxyUrl: string | undefined

          switch (user.app_metadata.provider) {
            case 'azure':
            case 'microsoft':
              proxyUrl = `${baseUrl}/api/auth/microsoft/photo`
              if (process.env.NODE_ENV === 'development') {
                console.log('[OAuth Callback] Setting Microsoft photo URL:', proxyUrl)
              }
              break;
            case 'google':
              // Google provides the avatar URL directly in user metadata
              proxyUrl = user.user_metadata?.avatar_url
              break;
          }
          
          if (proxyUrl) {
            if (process.env.NODE_ENV === 'development') {
              console.log('[OAuth Callback] Updating user with avatar URL:', proxyUrl)
            }
            await supabase.auth.updateUser({
              data: {
                avatar_url: proxyUrl
              }
            })
          }
        }

        // Handle load balancer redirects properly
        if (isLocalEnv) {
          return NextResponse.redirect(`${requestUrl.origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${requestUrl.origin}${next}`)
        }
      }

      await supabase.auth.signOut()
      
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?message=verification_success`
      )
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/login?error=Could not verify email: ${error.message}`
        )
      }
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=Could not verify email: An unexpected error occurred`
      )
    }
  }

    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=verification_expired`
    )
} 