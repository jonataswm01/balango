"use client"

import { usePathname, useRouter } from "next/navigation"
import { User, Lock, Bell, CreditCard, Users, Cog, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

type SettingsSection = "perfil" | "seguranca" | "notificacoes" | "faturamento" | "membros" | "impostos"

const settingsSections = [
  {
    category: "Conta",
    items: [
      { id: "perfil" as SettingsSection, label: "Perfil", icon: User },
      { id: "seguranca" as SettingsSection, label: "Segurança", icon: Lock },
      { id: "notificacoes" as SettingsSection, label: "Notificações", icon: Bell },
    ],
  },
  {
    category: "Organização",
    items: [
      { id: "faturamento" as SettingsSection, label: "Faturamento", icon: CreditCard },
      { id: "membros" as SettingsSection, label: "Membros", icon: Users },
    ],
  },
  {
    category: "Balango",
    items: [
      { id: "impostos" as SettingsSection, label: "Impostos e Taxas", icon: Cog },
    ],
  },
]

interface MobileSettingsMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeSection: SettingsSection
  onSectionChange: (section: SettingsSection) => void
}

export function MobileSettingsMenu({
  open,
  onOpenChange,
  activeSection,
  onSectionChange,
}: MobileSettingsMenuProps) {
  const router = useRouter()

  const handleSectionClick = (section: SettingsSection) => {
    onSectionChange(section)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header do Menu */}
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/dashboard")}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <SheetTitle className="text-lg font-semibold text-slate-900">
                  Configurações
                </SheetTitle>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-5 w-5 text-slate-600" />
                <span className="sr-only">Fechar menu</span>
              </button>
            </div>
            <SheetDescription className="sr-only">
              Menu de configurações e preferências
            </SheetDescription>
          </SheetHeader>

          {/* Navegação */}
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {settingsSections.map((section, sectionIndex) => (
              <div key={section.category}>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                  {section.category}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = activeSection === item.id
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSectionClick(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-blue-500 text-white shadow-md"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}

