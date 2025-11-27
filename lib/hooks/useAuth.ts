"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      try {
        // Verificar sessão
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error("[useAuth] Erro ao obter sessão:", sessionError)
          if (mounted) {
            setLoading(false)
            if (requireAuth) {
              router.push("/login")
            }
          }
          return
        }

        if (!session?.user) {
          if (mounted) {
            setUser(null)
            setLoading(false)
            if (requireAuth) {
              router.push("/login")
            }
          }
          return
        }

        // Obter usuário atualizado
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()

        if (userError) {
          console.error("[useAuth] Erro ao obter usuário:", userError)
          if (mounted) {
            setLoading(false)
            if (requireAuth) {
              router.push("/login")
            }
          }
          return
        }

        if (mounted && currentUser) {
          setUser(currentUser)
        }

        if (mounted) {
          setLoading(false)
        }

        // Escutar mudanças na autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return

            if (event === "SIGNED_OUT" || !session) {
              setUser(null)
              if (requireAuth) {
                router.push("/login")
              }
            } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
              const { data: { user: updatedUser } } = await supabase.auth.getUser()
              if (updatedUser && mounted) {
                setUser(updatedUser)
              }
            }
          }
        )

        return () => {
          mounted = false
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error("[useAuth] Erro inesperado:", error)
        if (mounted) {
          setLoading(false)
          if (requireAuth) {
            router.push("/login")
          }
        }
      }
    }

    checkAuth()
  }, [router, supabase, requireAuth])

  return {
    user,
    loading,
    isAuthenticated: !!user,
  }
}

