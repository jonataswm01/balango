"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  // Validação em tempo real
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const emailValid = email === "" || emailRegex.test(email)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Verificar se Supabase está configurado
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
      setError("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
      setLoading(false)
      return
    }

    if (!emailValid) {
      setError("Lorem ipsum dolor sit amet.")
      setLoading(false)
      return
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      })

      if (resetError) {
        // Mesmo em caso de erro, mostramos sucesso por segurança (não revelar se o email existe)
        setSuccess(true)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch (err: any) {
      // Por segurança, sempre mostramos sucesso
      setSuccess(true)
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

      {/* Form Container */}
      <div className="w-full max-w-md bg-slate-900 rounded-2xl p-8 md:p-10 shadow-2xl">
        {!success ? (
          <>
            <h1 className="text-3xl font-bold text-white mb-2">Lorem ipsum dolor sit amet?</h1>
            <p className="text-slate-400 mb-8">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Lorem</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className={`pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 ${
                      email && !emailValid ? "border-red-500" : ""
                    }`}
                    placeholder="lorem@ipsum.com"
                  />
                </div>
                {email && !emailValid && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Lorem ipsum dolor sit amet
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Send Button */}
              <Button
                type="submit"
                disabled={loading || !emailValid}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Lorem ipsum..." : "Lorem ipsum dolor"}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Lorem ipsum dolor
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-emerald-500/20 p-4">
                <CheckCircle className="h-12 w-12 text-emerald-400" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Lorem ipsum dolor!</h2>
              <p className="text-slate-400">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit <strong className="text-white">{email}</strong>
              </p>
            </div>
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-left">
              <p className="text-sm text-blue-300">
                <strong className="text-white">Lorem ipsum:</strong>
                <br />
                1. Lorem ipsum dolor sit amet, consectetur adipiscing elit
                <br />
                2. Lorem ipsum dolor sit amet, consectetur adipiscing elit
                <br />
                3. Lorem ipsum dolor sit amet, consectetur adipiscing elit
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <Button
                onClick={() => {
                  setSuccess(false)
                  setEmail("")
                }}
                variant="outline"
                className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              >
                Lorem ipsum dolor
              </Button>
              <Link
                href="/login"
                className="block text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Lorem ipsum dolor
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

