"use client"

import { useState, useEffect } from "react"
import { Plus, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { servicesApi } from "@/lib/api/client"
import { ServiceWithRelations } from "@/lib/types/database"
import { ServiceFilters, filterServices, countActiveFilters, clearFilters } from "@/lib/utils/filters"
import { calculateKPIs } from "@/lib/utils/services"
import { KPICard } from "@/components/shared/kpi-card"
import { ServiceCard } from "@/components/services/service-card"
import { ServiceModal } from "@/components/services/service-modal"
import { FiltersPanel } from "@/components/shared/filters-panel"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { TrendingUp, DollarSign, FileText, Receipt, Sparkles } from "lucide-react"

export default function DashboardPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<ServiceWithRelations[]>([])
  const [filteredServices, setFilteredServices] = useState<ServiceWithRelations[]>([])
  const [filters, setFilters] = useState<ServiceFilters>({})
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [editingService, setEditingService] = useState<ServiceWithRelations | null>(null)
  const [deletingService, setDeletingService] = useState<ServiceWithRelations | null>(null)
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])
  const [technicians, setTechnicians] = useState<
    Array<{ id: string; name: string; nickname: string | null }>
  >([])

  // Carregar serviços
  const loadServices = async () => {
    try {
      setLoading(true)
      const data = await servicesApi.getAll()
      setServices(data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar serviços",
        description: error.message || "Não foi possível carregar os serviços.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Carregar clientes e técnicos para filtros
  const loadFilterData = async () => {
    try {
      const [clientsData, techniciansData] = await Promise.all([
        servicesApi.getClients(),
        servicesApi.getTechnicians(),
      ])
      setClients(clientsData)
      setTechnicians(techniciansData)
    } catch (error) {
      console.error("Erro ao carregar dados para filtros:", error)
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    loadServices()
    loadFilterData()
  }, [])

  // Aplicar filtros quando mudarem
  useEffect(() => {
    const filtered = filterServices(services, filters)
    // Ordenar por data (mais recentes primeiro)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setFilteredServices(filtered)
  }, [services, filters])

  // Calcular KPIs dos serviços filtrados
  const kpis = calculateKPIs(filteredServices)

  // Handlers
  const handleCreateService = () => {
    setEditingService(null)
    setShowServiceModal(true)
  }

  const handleEditService = (service: ServiceWithRelations) => {
    setEditingService(service)
    setShowServiceModal(true)
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
      loadServices()
      setDeletingService(null)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir o serviço.",
      })
    }
  }

  const handleServiceModalSuccess = () => {
    loadServices()
    setShowServiceModal(false)
    setEditingService(null)
  }

  const handleFiltersChange = (newFilters: ServiceFilters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters(clearFilters())
  }

  const activeFiltersCount = countActiveFilters(filters)
  const totalServices = services.length
  const showingServices = filteredServices.length

  return (
    <div className="p-6 space-y-6">
      {/* Header com Filtros e Novo Serviço */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Dashboard
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {activeFiltersCount > 0
              ? `Mostrando ${showingServices} de ${totalServices} serviços`
              : `${totalServices} serviço${totalServices !== 1 ? "s" : ""} cadastrado${totalServices !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <FiltersPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClear={handleClearFilters}
            clients={clients}
            technicians={technicians}
          />
          <Button
            onClick={handleCreateService}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Serviço</span>
          </Button>
        </div>
      </div>

      {/* Cards de KPI */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Receita Bruta"
          value={kpis.receitaBruta}
          icon={DollarSign}
          color="blue"
        />
        <KPICard
          title="Sem Custos"
          value={kpis.receitaSemCustos}
          icon={TrendingUp}
          color="emerald"
        />
        <KPICard
          title="Base NF"
          value={kpis.baseNF}
          icon={FileText}
          color="amber"
        />
        <KPICard
          title="Impostos"
          value={kpis.impostos}
          icon={Receipt}
          color="red"
        />
      </div>

      {/* Card Destaque - Lucro Líquido */}
      <div className="w-full">
        <KPICard
          title="Lucro Líquido Total"
          value={kpis.lucroLiquido}
          icon={Sparkles}
          color="emerald"
          highlight={true}
          subtitle="Receita bruta menos custos e impostos"
        />
      </div>

      {/* Lista de Serviços */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Carregando serviços..." />
        </div>
      ) : filteredServices.length === 0 ? (
        <EmptyState
          title="Nenhum serviço encontrado"
          description={
            activeFiltersCount > 0
              ? "Tente ajustar os filtros para ver mais resultados."
              : "Comece criando seu primeiro serviço."
          }
          icon={Briefcase}
          actionLabel={activeFiltersCount > 0 ? undefined : "Criar Serviço"}
          onAction={activeFiltersCount > 0 ? undefined : handleCreateService}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Serviços
            </h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={() => handleEditService(service)}
                onDelete={() => handleDeleteService(service)}
              />
            ))}
          </div>
        </div>
      )}

      {/* FAB para Mobile */}
      <Button
        onClick={handleCreateService}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg lg:hidden bg-blue-600 hover:bg-blue-700 text-white z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Modais */}
      <ServiceModal
        open={showServiceModal}
        onOpenChange={setShowServiceModal}
        onSuccess={handleServiceModalSuccess}
        service={editingService}
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
