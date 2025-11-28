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
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Serviços", href: "/services", icon: Briefcase },
  { name: "Calendário", href: "/calendar", icon: Calendar },
  { name: "Cadastros", href: "/cadastros", icon: Users },
  { name: "Ajuda", href: "/ajuda", icon: HelpCircle },
]

interface MobileMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const pathname = usePathname()

  const handleLinkClick = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header do Menu */}
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" onClick={handleLinkClick}>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white font-bold text-xl shadow-md">
                  L
                </div>
              </Link>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-5 w-5 text-slate-600" />
                <span className="sr-only">Fechar menu</span>
              </button>
              <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
            </div>
          </SheetHeader>

          {/* Navegação */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Assistente IA */}
          <div className="px-4 py-4 border-t">
            <Link
              href="/assistente"
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                pathname === "/assistente" || pathname.startsWith("/assistente/")
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-slate-700 hover:bg-orange-50 hover:text-orange-500 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Assistente IA</span>
            </Link>
          </div>

          {/* Configurações */}
          <div className="px-4 py-4 border-t">
            <Link
              href="/configuracoes"
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                pathname === "/configuracoes" || pathname.startsWith("/configuracoes/")
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              <Settings className="h-5 w-5" />
              <span className="font-medium">Configurações</span>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

