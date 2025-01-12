'use client'

import { useCallback, useEffect, useState } from 'react'
import { type User } from '@supabase/supabase-js'
import { createClient } from '@/app/utils/supabase/client'
import { Camera, Loader2, LogOut, ArrowLeftSquare } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useRouter } from 'next/navigation'
import { ModeToggle } from './mode-toggle'

interface Profile {
  full_name: string | null
  email: string | null
}

export default function AccountForm({ user }: { user: User | null }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile>({
    full_name: null,
    email: null,
  })

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error, status } = await supabase
        .from('users')
        .select(`full_name, email`)
        .eq('id', user?.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setProfile(data)
      }
    } catch (error) {
      setError('Error loading user data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      getProfile()
    }
  }, [user, getProfile])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  async function updateProfile(formData: Profile) {
    try {
      setUpdating(true)
      setError(null)
      setSuccess(null)

      const { error } = await supabase.from('profiles').upsert({
        id: user?.id as string,
        ...formData,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
      setSuccess('Profile updated successfully!')
      setProfile(formData)
    } catch (error) {
      setError('Error updating profile')
      console.error(error)
    } finally {
      setUpdating(false)
    }
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-screen">
      <div className="flex w-full justify-between items-center mb-4">
        <Button variant="link" onClick={() => router.push('/')} className="p-0 text-lg">
          <ArrowLeftSquare className="h-6 w-6" />
        </Button>
        <ModeToggle />
      </div>

      <Card className="w-full max-w-4xl shadow-md mt-6">
        <CardHeader>
          <div className="flex items-center justify-center">
            <div>
              <CardTitle className="text-center">Profile Settings</CardTitle>
              <CardDescription className="text-center text-sm text-muted-foreground">
                Manage your account settings and profile information
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ''} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profile.full_name ?? ''}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, full_name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileEmail">Profile Email</Label>
              <Input
                id="profileEmail"
                value={profile.email ?? ''}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="flex flex-col sm:flex-row sm:justify-between p-6 space-y-4 sm:space-y-0">
          <Button variant="outline" onClick={handleSignOut} className="w-full sm:w-auto">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>

          <Button
            onClick={() => updateProfile(profile)}
            disabled={updating}
            className="w-full sm:w-auto"
          >
            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
