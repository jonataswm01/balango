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
  const [showServiceWizard, setShowServiceWizard] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceWithRelations | null>(null)
  const [showServiceSheet, setShowServiceSheet] = useState(false)
  const [editingService, setEditingService] = useState<ServiceWithRelations | null>(null)
  const [deletingService, setDeletingService] = useState<ServiceWithRelations | null>(null)

  // Carregar serviços
  const loadServices = async () => {
    try {
      setLoading(true)
      // Timeout de segurança (30 segundos)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout ao carregar serviços")), 30000)
      )
      
      const data = await Promise.race([
        servicesApi.getAll(),
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

  // Carregar dados iniciais
  useEffect(() => {
    let mounted = true
    
    const loadData = async () => {
      if (!mounted) return
      await loadServices()
    }
    
    loadData()
    
    return () => {
      mounted = false
    }
  }, [])

  // Calcular KPIs
  const { balance, pending, expenses, taxes } = useMemo(() => {
    let balanceValue = 0
    let pendingValue = 0
    let expensesValue = 0
    let taxesValue = 0

    services.forEach((service) => {
      const grossValue = Number(service.gross_value) || 0
      const operationalCost = Number(service.operational_cost) || 0
      const taxAmount = Number(service.tax_amount) || 0
      const paymentStatus = service.payment_status

      // Balance: Net Cash (Gross Paid - Costs)
      if (paymentStatus === 'pago') {
        balanceValue += grossValue - operationalCost
      }

      // Pending: Sum of gross_value where payment_status === 'pendente'
      if (paymentStatus === 'pendente') {
        pendingValue += grossValue
      }

      // Expenses: Sum of all operational_cost
      expensesValue += operationalCost

      // Taxes: Sum of all tax_amount
      taxesValue += taxAmount
    })

    return {
      balance: balanceValue,
      pending: pendingValue,
      expenses: expensesValue,
      taxes: taxesValue,
    }
  }, [services])

  // Preparar dados do gráfico (últimos 6 meses)
  const chartData = useMemo(() => {
    const months: { [key: string]: number } = {}
    const now = new Date()
    
    // Inicializar últimos 6 meses com 0
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      months[monthKey] = 0
    }

    // Agrupar serviços por mês
    services.forEach((service) => {
      const serviceDate = new Date(service.date)
      const monthKey = serviceDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      
      if (months.hasOwnProperty(monthKey)) {
        months[monthKey] += Number(service.gross_value) || 0
      }
    })

    return Object.entries(months).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
    }))
  }, [services])

  // Serviços recentes (últimos 5)
  const recentServices = useMemo(() => {
    return [...services]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [services])

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
      await loadServices()
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
    loadServices()
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
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Dashboard
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 capitalize">
            {currentDate}
          </p>
        </div>
        <Button
          onClick={handleCreateService}
          className="hidden md:flex gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Serviço</span>
        </Button>
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
            <RevenueChart data={chartData} />
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
