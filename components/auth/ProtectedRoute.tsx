"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  redirectTo 
}: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, isAuthenticated } = useAuth(true)

  useEffect(() => {
    if (loading) return

    // Se não está autenticado, já foi redirecionado pelo useAuth
    if (!isAuthenticated) return

    // Se tem redirectTo customizado
    if (redirectTo && !loading && isAuthenticated) {
      router.push(redirectTo)
    }
  }, [loading, isAuthenticated, pathname, router, redirectTo])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
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

