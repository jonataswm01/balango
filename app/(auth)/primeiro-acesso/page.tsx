"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react"

function PrimeiroAcessoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validating, setValidating] = useState(true)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    const type = searchParams.get("type")

    if (!tokenParam) {
      setError("Token inválido ou expirado")
      setValidating(false)
      return
    }

    setToken(tokenParam)

    // Se for tipo recovery, trocar código por sessão primeiro
    if (type === "recovery") {
      const exchangeCode = async () => {
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(tokenParam)

          if (exchangeError) {
            console.error("Erro ao trocar código:", exchangeError)
            setError("Token inválido ou expirado")
            setValidating(false)
            return
          }

          // Verificar se usuário está autenticado
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            setError("Token inválido ou expirado")
            setValidating(false)
            return
          }

          setValidating(false)
        } catch (err) {
          console.error("Erro ao validar token:", err)
          setError("Erro ao validar token")
          setValidating(false)
        }
      }

      exchangeCode()
    } else {
      // Para outros tipos de token, apenas validar que existe
      setValidating(false)
    }
  }, [searchParams, supabase])

  const passwordHasMinLength = password.length >= 8
  const passwordHasNumber = /\d/.test(password)
  const passwordValid = passwordHasMinLength && passwordHasNumber
  const passwordsMatch = password === "" || confirmPassword === "" || password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!passwordValid) {
      setError("A senha deve ter no mínimo 8 caracteres e conter pelo menos um número.")
      setLoading(false)
      return
    }

    if (!passwordsMatch) {
      setError("As senhas não coincidem. Verifique e tente novamente.")
      setLoading(false)
      return
    }

    try {
      // Se já está autenticado (tipo recovery), apenas atualizar senha
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Atualizar senha
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        })

        if (updateError) {
          setError(updateError.message || "Erro ao atualizar senha")
          setLoading(false)
          return
        }

        // Verificar se precisa completar onboarding
        const { data: userProfile } = await supabase
          .from("users")
          .select("organization_id")
          .eq("id", user.id)
          .maybeSingle()

        // Verificar onboarding da organização antes de mostrar sucesso
        let redirectPath = "/onboarding"
        
        if (userProfile?.organization_id) {
          const { data: organization } = await supabase
            .from("organizations")
            .select("onboarding_completo")
            .eq("id", userProfile.organization_id)
            .maybeSingle()
          
          if (organization?.onboarding_completo) {
            redirectPath = "/dashboard"
          }
        }

        setSuccess(true)

        setTimeout(() => {
          router.push(redirectPath)
        }, 2000)
      } else {
        // Se não está autenticado, tentar usar o token para resetar senha
        setError("Token inválido. Por favor, solicite um novo link de acesso.")
        setLoading(false)
      }
    } catch (err: any) {
      console.error("Erro:", err)
      setError("Erro inesperado. Tente novamente.")
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Validando token...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 rounded-2xl p-8 md:p-10 shadow-2xl text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Senha definida com sucesso!</h1>
            <p className="text-slate-400">Redirecionando...</p>
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
          B
        </div>
        <span className="font-display text-2xl font-bold text-white">BALANGO</span>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-md bg-slate-900 rounded-2xl p-8 md:p-10 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2">Definir Senha</h1>
        <p className="text-slate-400 mb-8">
          Defina uma nova senha para acessar sua conta.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Nova Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className={`pl-10 pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500 ${
                  password && !passwordValid ? "border-red-500" : ""
                }`}
                placeholder="Digite sua nova senha"
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
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
                <span className={passwordHasMinLength ? "text-emerald-400" : "text-slate-400"}>
                  Mínimo de 8 caracteres
                </span>
              </div>
              <div className="flex items-center gap-2">
                {passwordHasNumber ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
                <span className={passwordHasNumber ? "text-emerald-400" : "text-slate-400"}>
                  Pelo menos um número
                </span>
              </div>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">Confirmar Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className={`pl-10 pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500 ${
                  confirmPassword && !passwordsMatch ? "border-red-500" : ""
                }`}
                placeholder="Confirme sua senha"
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
                As senhas não coincidem
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !passwordValid || !passwordsMatch}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Definindo senha..." : "Definir Senha"}
          </Button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-slate-400">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 underline transition-colors">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PrimeiroAcessoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Carregando...</p>
          </div>
        </div>
      }
    >
      <PrimeiroAcessoContent />
    </Suspense>
  )
}
