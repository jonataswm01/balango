"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Validação em tempo real
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const emailValid = email === "" || emailRegex.test(email)

  const getErrorMessage = (error: any): string => {
    if (!error) return "Ocorreu um erro ao fazer login. Tente novamente."
    
    const errorCode = error.code || error.message || ""
    const errorMessage = error.message || ""
    
    // Mensagens amigáveis baseadas no tipo de erro
    if (errorCode.includes("invalid_credentials") || errorCode.includes("invalid_grant") || errorMessage.includes("Invalid login credentials")) {
      return "Email ou senha incorretos. Verifique suas credenciais e tente novamente."
    }
    
    if (errorCode.includes("email_not_confirmed") || errorCode.includes("email_not_verified") || errorMessage.includes("Email not confirmed")) {
      return "Seu email ainda não foi verificado. Verifique sua caixa de entrada e clique no link de confirmação."
    }
    
    if (errorCode.includes("too_many_requests") || errorMessage.includes("too many")) {
      return "Muitas tentativas de login. Aguarde alguns minutos e tente novamente."
    }
    
    if (errorCode.includes("email_address_invalid") || errorCode.includes("invalid_email") || errorMessage.includes("invalid email")) {
      return "Email inválido. Verifique o endereço de email informado."
    }
    
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return "Erro de conexão. Verifique sua internet e tente novamente."
    }
    
    // Mensagem genérica amigável para outros erros
    return "Ocorreu um erro ao fazer login. Tente novamente."
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Verificar se Supabase está configurado
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
      setError("Sistema temporariamente indisponível. Tente novamente em alguns instantes.")
      setLoading(false)
      return
    }

    // Validação de email
    if (!emailValid) {
      setError("Por favor, informe um email válido.")
      setLoading(false)
      return
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        const errorMsg = getErrorMessage(signInError)
        setError(errorMsg)
        setLoading(false)
        return
      }

      if (data.user) {
        // Verificar se o email foi confirmado
        if (!data.user.email_confirmed_at) {
          setError("Seu email ainda não foi verificado. Verifique sua caixa de entrada e clique no link de confirmação.")
          setLoading(false)
          return
        }

        // Login bem-sucedido, redirecionar para dashboard
        setLoading(false)
        await new Promise(resolve => setTimeout(resolve, 300))
        router.push("/dashboard")
        return
      } else {
        setError("Erro ao fazer login. Tente novamente.")
        setLoading(false)
        return
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err)
      setError(errorMsg)
      setLoading(false)
    }
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
        <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta</h1>
        <p className="text-slate-400 mb-8">Entre na sua conta para continuar organizando suas finanças.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
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
                placeholder="seu@email.com"
              />
            </div>
            {email && !emailValid && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Por favor, informe um email válido
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white">Senha</Label>
              <Link
                href="/esqueci-senha"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="pl-10 pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
            />
            <Label htmlFor="remember-me" className="ml-2 text-sm text-slate-300 cursor-pointer">
              Lembrar de mim
            </Label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-400 font-semibold">{error}</p>
                {(error.includes("não foi verificado") || error.includes("verifique sua caixa")) && (
                  <Link href={`/verificar-email?email=${encodeURIComponent(email)}`} className="text-sm text-blue-400 hover:text-blue-300 underline mt-2 block">
                    Reenviar email de verificação
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading || !emailValid}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        {/* Separator */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-slate-900 text-slate-400">ou</span>
          </div>
        </div>

        {/* Google Button - Desabilitado */}
        <Button
          type="button"
          variant="outline"
          disabled
          className="w-full bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-800 py-6 cursor-not-allowed opacity-50"
        >
          <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Entrar com Google (em breve)
        </Button>

        {/* Register Link */}
        <div className="mt-6 text-center text-slate-400">
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="text-blue-400 hover:text-blue-300 underline transition-colors">
            Cadastre-se grátis
          </Link>
        </div>
      </div>
    </div>
  )
}

