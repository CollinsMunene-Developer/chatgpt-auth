'use client'

// Assuming you moved the form to a separate component
import { createClient } from '@/app/utils/supabase/client'
import { useEffect, useState } from 'react'
import { type User } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'
import AccountForm from '@/components/AccountForm'
import { ArrowLeftSquare } from 'lucide-react'

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        setUser(user)
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <AccountForm user={user} />
}
