"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function VerificarEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleResendEmail = async () => {
    if (!email) return
    
    setLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup&next=/onboarding`,
        },
      })

      if (error) {
        console.error("Erro ao reenviar email:", error)
      }
    } catch (err) {
      console.error("Erro ao reenviar email:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">
          L
        </div>
        <span className="font-display text-2xl font-bold text-white">LOREM</span>
      </div>

      {/* Container */}
      <div className="w-full max-w-md bg-slate-900 rounded-2xl p-8 md:p-10 shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-blue-500/20 p-4">
            <Mail className="h-12 w-12 text-blue-400" />
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Lorem ipsum dolor</h1>
          <p className="text-slate-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        {email && (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              <strong className="text-white">Lorem:</strong> {email}
            </p>
          </div>
        )}

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-left space-y-2">
          <p className="text-sm text-slate-300">
            <strong className="text-white">Lorem ipsum:</strong>
          </p>
          <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
          </ol>
        </div>

        <div className="space-y-3">
          {email && (
            <Button
              onClick={handleResendEmail}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Lorem ipsum..." : "Lorem ipsum dolor"}
            </Button>
          )}
          <Link
            href="/login"
            className="block text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="inline h-4 w-4 mr-2" />
            Lorem ipsum dolor
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 rounded-2xl p-8 md:p-10 shadow-2xl text-center">
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-slate-700 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-slate-700 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-slate-700 rounded w-full"></div>
          </div>
        </div>
      </div>
    }>
      <VerificarEmailContent />
    </Suspense>
  )
}

