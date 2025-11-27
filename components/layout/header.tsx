"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Bell, HelpCircle, Settings, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string; nome?: string; avatar_url?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Buscar dados do usuário
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          // Buscar dados do perfil
          const { data: userData } = await supabase
            .from("users")
            .select("nome, avatar_url")
            .eq("id", authUser.id)
            .single()

          setUser({
            id: authUser.id,
            email: authUser.email,
            nome: userData?.nome || authUser.email?.split("@")[0] || "Usuário",
            avatar_url: userData?.avatar_url || null,
          })
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [supabase])

  // Handler para logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error("Erro ao fazer logout:", error)
        alert("Erro ao fazer logout. Tente novamente.")
        return
      }

      // Redirecionar para login
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      alert("Erro ao fazer logout. Tente novamente.")
    }
  }

  // Iniciais do nome para o avatar
  const getInitials = (name?: string) => {
    if (!name) return "L"
    const parts = name.trim().split(" ")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-end px-6">
        {/* Ações do Header */}
        <div className="flex items-center gap-3">
          {/* Notificações */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-slate-600" />
            <Badge className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-orange-500 text-white">
              3
            </Badge>
          </Button>

          {/* Ajuda */}
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5 text-slate-600" />
          </Button>

          {/* Menu do Usuário */}
          {!loading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-auto py-1.5 px-2 hover:bg-slate-100 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || undefined} alt={user.nome} />
                    <AvatarFallback className="bg-blue-500 text-white text-xs">
                      {getInitials(user.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    {user.nome}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.nome}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/configuracoes")}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}

