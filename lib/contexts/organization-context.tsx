"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Organization } from "@/lib/types/database"
import { organizationsApi } from "@/lib/api/client"

interface OrganizationContextType {
  currentOrganization: Organization | null
  organizations: Organization[]
  loading: boolean
  setCurrentOrganization: (org: Organization | null) => void
  refreshOrganizations: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  const refreshOrganizations = async () => {
    try {
      setLoading(true)
      const orgs = await organizationsApi.getAll()
      setOrganizations(orgs)

      // Se não há organização selecionada e há organizações, selecionar a primeira
      if (!currentOrganization && orgs.length > 0) {
        const savedOrgId = localStorage.getItem("currentOrganizationId")
        const orgToSelect = savedOrgId
          ? orgs.find((o) => o.id === savedOrgId) || orgs[0]
          : orgs[0]
        setCurrentOrganization(orgToSelect)
        localStorage.setItem("currentOrganizationId", orgToSelect.id)
      }
    } catch (error: any) {
      console.error("Erro ao carregar organizações:", error)
      // Se não houver organizações, não é erro crítico - apenas não há organizações ainda
      setOrganizations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshOrganizations()
  }, [])

  // Sincronizar com localStorage
  useEffect(() => {
    if (currentOrganization) {
      localStorage.setItem("currentOrganizationId", currentOrganization.id)
    }
  }, [currentOrganization])

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        organizations,
        loading,
        setCurrentOrganization,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider")
  }
  return context
}

