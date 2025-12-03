"use client"

import { useState, useEffect } from "react"
import { Plus, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { servicesApi } from "@/lib/api/client"
import { ServiceWithRelations } from "@/lib/types/database"
import { ServiceCard } from "@/components/services/service-card"
import { ServiceSheet } from "@/components/services/service-sheet"
import { ServiceWizard } from "@/components/services/service-wizard"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"

export default function ServicesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<ServiceWithRelations[]>([])
  const [selectedService, setSelectedService] = useState<ServiceWithRelations | null>(null)
  const [showServiceSheet, setShowServiceSheet] = useState(false)
  const [showServiceWizard, setShowServiceWizard] = useState(false)
  const [editingService, setEditingService] = useState<ServiceWithRelations | null>(null)
  const [deletingService, setDeletingService] = useState<ServiceWithRelations | null>(null)

  // Carregar serviços
  const loadServices = async () => {
    try {
      setLoading(true)
      const data = await servicesApi.getAll()
      // Ordenar por data (mais recentes primeiro)
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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

  // Carregar dados iniciais
  useEffect(() => {
    loadServices()
  }, [])

  // Handlers
  const handleCardClick = (service: ServiceWithRelations) => {
    setSelectedService(service)
    setShowServiceSheet(true)
  }

  const handleEdit = () => {
    if (selectedService) {
      setEditingService(selectedService)
      setShowServiceWizard(true)
    }
  }

  const handleDelete = () => {
    if (selectedService) {
      setDeletingService(selectedService)
    }
  }

  const confirmDelete = async () => {
    if (!deletingService) return

    try {
      await servicesApi.delete(deletingService.id)
      toast({
        title: "Serviço excluído!",
        description: "O serviço foi excluído com sucesso.",
      })
      // Recarregar serviços
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

  const handleWizardSuccess = () => {
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

  const handleNewService = () => {
    setEditingService(null)
    setShowServiceWizard(true)
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Serviços
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {services.length} {services.length === 1 ? "serviço" : "serviços"}
            </p>
          </div>
          <Button onClick={handleNewService}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Serviço
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" text="Carregando serviços..." />
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Nenhum serviço encontrado"
            description="Comece criando seu primeiro serviço."
            actionLabel="Novo Serviço"
            onAction={handleNewService}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={() => handleCardClick(service)}
              />
            ))}
          </div>
        )}
      </div>

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
        onSuccess={handleWizardSuccess}
        serviceToEdit={editingService}
      />

      {/* Confirm Delete Dialog */}
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

