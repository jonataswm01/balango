"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { OrganizationProvider } from "@/lib/contexts/organization-context"
import { usePathname } from "next/navigation"

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isConfiguracoes = pathname === "/configuracoes" || pathname.startsWith("/configuracoes/")
  const isOnboarding = pathname === "/onboarding"
  const isCalendar = pathname === "/calendar"

  // Se for onboarding, não mostrar sidebar/header
  if (isOnboarding) {
    return (
      <ProtectedRoute requireOnboarding={false}>
        {children}
      </ProtectedRoute>
    )
  }

  // Se for calendário, layout fullscreen
  if (isCalendar) {
    return (
      <ProtectedRoute>
        <OrganizationProvider>
          <div className="fixed inset-0 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col lg:ml-20 w-full overflow-hidden">
              {children}
            </div>
          </div>
        </OrganizationProvider>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <OrganizationProvider>
        <div className="min-h-screen flex">
          <Sidebar />
          <div className="flex-1 flex flex-col lg:ml-20 w-full">
            {!isConfiguracoes && <Header />}
            <main className="flex-1 bg-slate-50 dark:bg-slate-900">{children}</main>
          </div>
        </div>
      </OrganizationProvider>
    </ProtectedRoute>
  )
}

