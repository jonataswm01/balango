"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Settings,
  HelpCircle,
  Sparkles,
  Calendar,
  Users,
  Briefcase,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Serviços", href: "/services", icon: Briefcase },
  { name: "Calendário", href: "/calendar", icon: Calendar },
  { name: "Cadastros", href: "/cadastros", icon: Users },
  { name: "Ajuda", href: "/ajuda", icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-20 lg:border-r lg:border-slate-200 lg:bg-white dark:bg-slate-950 dark:border-slate-800 fixed left-0 top-0 h-screen z-30">
      <div className="flex flex-col h-full items-center py-6">
        {/* Logo - Topo */}
        <div className="mb-8">
          <Link href="/dashboard">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white font-bold text-xl shadow-md hover:shadow-lg transition-shadow">
              B
            </div>
          </Link>
        </div>

        {/* Navegação - Meio (ocupa espaço disponível) */}
        <nav className="flex-1 flex flex-col items-center justify-center gap-4 w-full overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 group flex-shrink-0",
                  isActive
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                )}
                title={item.name}
              >
                {/* Fundo com padrão de ondas para item ativo */}
                {isActive && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md" />
                    {/* Padrão de ondas SVG decorativo */}
                    <svg
                      className="absolute inset-0 w-full h-full rounded-full"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="xMidYMid slice"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                          <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                          <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,50 Q25,35 50,50 T100,50 L100,100 L0,100 Z"
                        fill="url(#waveGradient)"
                        opacity="0.4"
                      />
                      <path
                        d="M0,50 Q25,45 50,50 T100,50 L100,100 L0,100 Z"
                        fill="url(#waveGradient)"
                        opacity="0.3"
                      />
                    </svg>
                  </>
                )}
                
                {/* Ícone */}
                <Icon className={cn(
                  "relative z-10 h-5 w-5 transition-transform",
                  isActive && "scale-110"
                )} />
              </Link>
            )
          })}
        </nav>

        {/* Assistente IA - Antes do rodapé */}
        <div className="mb-4">
          <Link
            href="/assistente"
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 group flex-shrink-0",
              pathname === "/assistente" || pathname.startsWith("/assistente/")
                ? "bg-orange-500 text-white shadow-md"
                : "text-slate-500 hover:text-orange-500 hover:bg-orange-50"
            )}
            title="Assistente IA"
          >
            <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
          </Link>
        </div>

        {/* Configurações - Rodapé fixo */}
        <div className="mt-auto pt-4 border-t border-slate-200 w-full flex justify-center">
          <Link
            href="/configuracoes"
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 flex-shrink-0",
              pathname === "/configuracoes" || pathname.startsWith("/configuracoes/")
                ? "text-blue-600 bg-blue-50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            )}
            title="Configurações"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

