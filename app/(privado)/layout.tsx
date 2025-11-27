"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { usePathname } from "next/navigation"

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isConfiguracoes = pathname === "/configuracoes" || pathname.startsWith("/configuracoes/")

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-20">
          {!isConfiguracoes && <Header />}
          <main className="flex-1 bg-slate-50">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

