"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { servicesApi } from "@/lib/api/client"
import { ServiceWithRelations } from "@/lib/types/database"
import { ServiceCard } from "@/components/services/service-card"
import { ServiceSheet } from "@/components/services/service-sheet"
import { ServiceWizard } from "@/components/services/service-wizard"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { WalletStats } from "@/components/dashboard/wallet-stats"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { DateRangeFilter } from "@/components/dashboard/date-range-filter"
import { parseDateOnlyToLocal } from "@/lib/utils/dates"

interface DateRange {
  startDate: string
  endDate: string
}

export default function DashboardPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  
  // Fallback de segurança: desativar loading após 35 segundos
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 35000)
    
    return () => clearTimeout(timeout)
  }, [])
  
  const [services, setServices] = useState<ServiceWithRelations[]>([])
  const [allPendingServices, setAllPendingServices] = useState<ServiceWithRelations[]>([])
  const [recentServices, setRecentServices] = useState<ServiceWithRelations[]>([])
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [showServiceWizard, setShowServiceWizard] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceWithRelations | null>(null)
  const [showServiceSheet, setShowServiceSheet] = useState(false)
  const [editingService, setEditingService] = useState<ServiceWithRelations | null>(null)
  const [deletingService, setDeletingService] = useState<ServiceWithRelations | null>(null)

  // Carregar serviços com filtro de data
  const loadServices = async (range?: DateRange) => {
    try {
      setLoading(true)
      // Timeout de segurança (30 segundos)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout ao carregar serviços")), 30000)
      )
      
      const startDate = range?.startDate
      const endDate = range?.endDate
      
      const data = await Promise.race([
        servicesApi.getAll(startDate, endDate),
        timeoutPromise
      ]) as ServiceWithRelations[]
      
      setServices(data || [])
    } catch (error: any) {
      console.error("Erro ao carregar serviços:", error)
      setServices([]) // Garantir que sempre tenha um array vazio
      toast({
        variant: "destructive",
        title: "Erro ao carregar serviços",
        description: error.message || "Não foi possível carregar os serviços.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Carregar todos os serviços pendentes (para cálculo de KPI)
  const loadPendingServices = async () => {
    try {
      // Carregar todos os serviços pendentes (sem filtro de data)
      const data = await servicesApi.getAll() as ServiceWithRelations[]
      const pending = data.filter(s => s.payment_status === 'pendente')
      setAllPendingServices(pending)
    } catch (error: any) {
      console.error("Erro ao carregar serviços pendentes:", error)
      setAllPendingServices([])
    }
  }

  // Carregar os 6 últimos serviços adicionados (para Atividade Recente)
  const loadRecentServices = async () => {
    try {
      // Carregar todos os serviços (sem filtro de data) para pegar os últimos adicionados
      const data = await servicesApi.getAll() as ServiceWithRelations[]
      // Ordenar por created_at (mais recente primeiro) e pegar os 6 primeiros
      const recent = [...data]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6)
      setRecentServices(recent)
    } catch (error: any) {
      console.error("Erro ao carregar serviços recentes:", error)
      setRecentServices([])
    }
  }

  // Handler para mudança de período
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range)
    loadServices(range)
    // Recarregar pendentes e recentes também
    loadPendingServices()
    loadRecentServices()
  }

  // Carregar dados iniciais (o DateRangeFilter já carrega do localStorage e chama handleDateRangeChange)
  useEffect(() => {
    // O componente DateRangeFilter vai carregar o período do localStorage
    // e chamar handleDateRangeChange automaticamente
    // Mas também precisamos carregar os pendentes e recentes na primeira vez
    loadPendingServices()
    loadRecentServices()
  }, [])

  // Calcular KPIs
  const { balance, pending, expenses, taxes } = useMemo(() => {
    let balanceValue = 0
    let pendingValue = 0
    let expensesValue = 0
    let taxesValue = 0

    // Balance, Expenses e Taxes: calculados com base nos serviços do período
    services.forEach((service) => {
      const grossValue = Number(service.gross_value) || 0
      const operationalCost = Number(service.operational_cost) || 0
      const taxAmount = Number(service.tax_amount) || 0
      const paymentStatus = service.payment_status

      // Balance: True Net Cash (Gross Paid - Operational Costs - Paid Taxes)
      // Only deduct taxes for paid services (tax is withheld/paid upon receipt)
      if (paymentStatus === 'pago') {
        balanceValue += grossValue - operationalCost - taxAmount
      }

      // Expenses: Sum of all operational_cost (do período)
      expensesValue += operationalCost

      // Taxes: Sum of all tax_amount (do período)
      taxesValue += taxAmount
    })

    // Pending: Sum of ALL pending services (não apenas do período)
    allPendingServices.forEach((service) => {
      const grossValue = Number(service.gross_value) || 0
      pendingValue += grossValue
    })

    return {
      balance: balanceValue,
      pending: pendingValue,
      expenses: expensesValue,
      taxes: taxesValue,
    }
  }, [services, allPendingServices])

  // Preparar dados do gráfico baseado no período selecionado
  const chartData = useMemo(() => {
    if (services.length === 0) {
      return []
    }

    const months: { [key: string]: number } = {}
    
    // Se houver período selecionado, usar apenas os meses desse período
    if (dateRange) {
      const startDate = new Date(dateRange.startDate)
      const endDate = new Date(dateRange.endDate)
      
      // Criar array de meses entre startDate e endDate
      const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
      const lastDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      
      while (currentDate <= lastDate) {
        const monthKey = currentDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        months[monthKey] = 0
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
    } else {
      // Se não houver período, usar últimos 6 meses (fallback)
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        months[monthKey] = 0
      }
    }

    // Agrupar serviços por mês
    services.forEach((service) => {
      const serviceDate = parseDateOnlyToLocal(service.date)
      const monthKey = serviceDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      
      if (months.hasOwnProperty(monthKey)) {
        months[monthKey] += Number(service.gross_value) || 0
      }
    })

    return Object.entries(months).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
    }))
  }, [services, dateRange])


  // Handlers
  const handleCreateService = () => {
    setEditingService(null)
    setShowServiceWizard(true)
  }

  const handleCardClick = (service: ServiceWithRelations) => {
    setSelectedService(service)
    setShowServiceSheet(true)
  }
  
  const handleEdit = () => {
    if (selectedService) {
      setEditingService(selectedService)
      setShowServiceSheet(false)
      setShowServiceWizard(true)
    }
  }
  
  const handleDelete = () => {
    if (selectedService) {
      setDeletingService(selectedService)
    }
  }

  const handleDeleteService = (service: ServiceWithRelations) => {
    setDeletingService(service)
  }

  const confirmDelete = async () => {
    if (!deletingService) return

    try {
      await servicesApi.delete(deletingService.id)
      toast({
        title: "Serviço excluído!",
        description: "O serviço foi excluído com sucesso.",
      })
      // Recarregar serviços com o período atual
      await loadServices(dateRange || undefined)
      // Recarregar pendentes e recentes também
      await loadPendingServices()
      await loadRecentServices()
      // Fechar sheet se o serviço excluído estava selecionado
      if (selectedService?.id === deletingService.id) {
        setShowServiceSheet(false)
        setSelectedService(null)
      }
      setDeletingService(null)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir o serviço.",
      })
    }
  }

  const handleServiceWizardSuccess = () => {
    // Recarregar serviços com o período atual
    loadServices(dateRange || undefined)
    // Recarregar pendentes e recentes também
    loadPendingServices()
    loadRecentServices()
    setShowServiceWizard(false)
    setEditingService(null)
    // Se estava editando o serviço selecionado, atualizar o sheet
    if (editingService && selectedService?.id === editingService.id) {
      // Recarregar o serviço selecionado
      servicesApi
        .getById(editingService.id)
        .then((updated) => {
          setSelectedService(updated)
        })
        .catch(() => {
          // Se não conseguir carregar, fechar o sheet
          setShowServiceSheet(false)
          setSelectedService(null)
        })
    }
  }

  // Formatar data atual
  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Dashboard
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 capitalize">
            {currentDate}
          </p>
          {/* Filtro de período - Mobile: abaixo do título, Desktop: ao lado */}
          <div className="mt-3 md:hidden w-full hidden">
            <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Filtro de período - Desktop: ao lado do botão */}
          <div className="hidden">
            <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
          </div>
          <Button
            onClick={handleCreateService}
            className="hidden md:flex gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Serviço</span>
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Carregando serviços..." />
        </div>
      ) : (
        <>
          {/* Section 1: Wallet Stats */}
          <div>
            <WalletStats balance={balance} pending={pending} expenses={expenses} taxes={taxes} />
          </div>

          {/* Section 2: Revenue Chart */}
          <div>
            <RevenueChart 
              data={chartData} 
              startDate={dateRange?.startDate}
              endDate={dateRange?.endDate}
            />
          </div>

          {/* Section 3: Recent Activity */}
          {recentServices.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Atividade Recente
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onClick={() => handleCardClick(service)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* FAB para Mobile */}
      <Button
        onClick={handleCreateService}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden bg-blue-600 hover:bg-blue-700 text-white z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Service Sheet */}
      <ServiceSheet
        open={showServiceSheet}
        onOpenChange={setShowServiceSheet}
        service={selectedService}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Service Wizard */}
      <ServiceWizard
        open={showServiceWizard}
        onOpenChange={setShowServiceWizard}
        onSuccess={handleServiceWizardSuccess}
        serviceToEdit={editingService}
      />

      <ConfirmDialog
        open={!!deletingService}
        onOpenChange={(open) => !open && setDeletingService(null)}
        title="Excluir Serviço"
        description="Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  )
}
