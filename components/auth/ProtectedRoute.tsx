"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"
import { createClient } from "@/lib/supabase/client"

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requireOnboarding?: boolean
}

export function ProtectedRoute({ 
  children, 
  redirectTo,
  requireOnboarding = true
}: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, isAuthenticated } = useAuth(true)
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (loading || !isAuthenticated) {
      setCheckingOnboarding(false)
      return
    }

    // Verificar onboarding apenas se necessário e não estiver na página de onboarding
    if (requireOnboarding && pathname !== "/onboarding") {
      const checkOnboarding = async () => {
        try {
          // Buscar organização do usuário
          const { data: userProfile } = await supabase
            .from("users")
            .select("organization_id")
            .eq("id", user?.id)
            .maybeSingle()

          // Se não tem organização, precisa fazer onboarding
          if (!userProfile?.organization_id) {
            router.push("/onboarding")
            return
          }

          // Verificar se organização completou onboarding
          const { data: organization } = await supabase
            .from("organizations")
            .select("onboarding_completo")
            .eq("id", userProfile.organization_id)
            .maybeSingle()

          if (!organization?.onboarding_completo) {
            router.push("/onboarding")
            return
          }
        } catch (error) {
          console.error("Erro ao verificar onboarding:", error)
          // Em caso de erro, permitir acesso (não bloquear)
        } finally {
          setCheckingOnboarding(false)
        }
      }

      checkOnboarding()
    } else {
      setCheckingOnboarding(false)
    }
  }, [loading, isAuthenticated, user, pathname, router, requireOnboarding, supabase])

  useEffect(() => {
    if (loading || checkingOnboarding) return

    // Se não está autenticado, já foi redirecionado pelo useAuth
    if (!isAuthenticated) return

    // Se tem redirectTo customizado
    if (redirectTo && !loading && !checkingOnboarding && isAuthenticated) {
      router.push(redirectTo)
    }
  }, [loading, checkingOnboarding, isAuthenticated, pathname, router, redirectTo])

  // Mostrar loading enquanto verifica autenticação ou onboarding
  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não está autenticado, não renderiza nada (já foi redirecionado)
  if (!isAuthenticated) {
    return null
  }

  // Renderiza o conteúdo protegido
  return <>{children}</>
}

