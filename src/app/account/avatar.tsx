'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '../utils/supabase/server'
import { Camera } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface AvatarUploadProps {
  uid: string | null
  url: string | null
  size: number
  onUpload: (url: string) => void
}

export function AvatarUpload({ uid, url, size, onUpload }: AvatarUploadProps) {
  const supabase = createClient()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  async function downloadImage(path: string) {
    try {
      const { data, error } = await (await supabase).storage
        .from('avatars')
        .download(path)
      if (error) {
        throw error
      }

      const url = URL.createObjectURL(data)
      setAvatarUrl(url)
    } catch (error) {
      console.log('Error downloading image: ', error)
    }
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${uid}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await (await supabase).storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
    } catch (error) {
      alert('Error uploading avatar!')
      console.log(error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Camera className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update profile picture</DialogTitle>
          <DialogDescription>
            Choose a new avatar to update your profile picture
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center py-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback>
              <Camera className="h-12 w-12 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="avatar">Profile Picture</Label>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}