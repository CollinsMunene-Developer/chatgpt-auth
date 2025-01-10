" use client";
import ForgotPasswordForm from "@/components/forgot-password"

import { ModeToggle } from "@/components/mode-toggle"
import ResetPasswordForm from "@/components/reset-password";

import { CloudCogIcon } from "lucide-react"




export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-svh">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <CloudCogIcon className="size-4" />
            </div>
          <span> <strong>CLOUD</strong>MAGIC</span>
          </a>
        </div>
        <div className="">
          <ModeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <ResetPasswordForm />
          </div>
        </div>
      </div>
    </div>
  )
}
