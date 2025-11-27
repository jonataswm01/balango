"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  // Validações
  const passwordHasMinLength = password.length >= 8
  const passwordHasNumber = /\d/.test(password)
  const passwordValid = passwordHasMinLength && passwordHasNumber
  const passwordsMatch = password === "" || confirmPassword === "" || password === confirmPassword

  useEffect(() => {
    // Verificar se há um token de redefinição na URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    
    if (!accessToken) {
      // Se não houver token, redirecionar para esqueci-senha
      router.push('/esqueci-senha')
    }
  }, [router])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!passwordValid) {
      setError("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
      setLoading(false)
      return
    }

    if (!passwordsMatch) {
      setError("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
      setLoading(false)
      return
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        setError("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setError("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 rounded-2xl p-8 md:p-10 shadow-2xl text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-emerald-500/20 p-4">
              <CheckCircle className="h-12 w-12 text-emerald-400" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Lorem ipsum dolor!</h2>
            <p className="text-slate-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </div>
      </div>
    )
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
        <h1 className="text-3xl font-bold text-white mb-2">Lorem ipsum dolor</h1>
        <p className="text-slate-400 mb-8">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>

        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Lorem *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className={`pl-10 pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 ${
                  password && !passwordValid ? "border-red-500" : ""
                }`}
                placeholder="Lorem ipsum"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {/* Password Validation */}
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {passwordHasMinLength ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
                <span className={passwordHasMinLength ? "text-emerald-400" : "text-slate-400"}>
                  Lorem ipsum dolor
                </span>
              </div>
              <div className="flex items-center gap-2">
                {passwordHasNumber ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
                <span className={passwordHasNumber ? "text-emerald-400" : "text-slate-400"}>
                  Lorem ipsum dolor
                </span>
              </div>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">Lorem ipsum *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className={`pl-10 pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 ${
                  confirmPassword && !passwordsMatch ? "border-red-500" : ""
                }`}
                placeholder="Lorem ipsum"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
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

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !passwordValid || !passwordsMatch}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Lorem ipsum..." : "Lorem ipsum"}
          </Button>
        </form>
      </div>
    </div>
  )
}

