"use client"

import { useState, useEffect, useMemo } from "react"
import { CalendarHeader } from "@/components/calendar/calendar-header"
import { CalendarGrid, type CalendarDay } from "@/components/calendar/calendar-grid"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { useToast } from "@/components/ui/use-toast"
import { servicesApi } from "@/lib/api/client"
import { ServiceWithRelations } from "@/lib/types/database"
import { ServiceModal } from "@/components/services/service-modal"
import { ServiceWizard } from "@/components/services/service-wizard"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

// CalendarDay agora está definido em calendar-grid.tsx

interface DayServices {
  [day: string]: Array<{
    id: string
    date: string
    gross_value: number
    has_invoice: boolean
    client: { name: string } | null
    technician: { name: string } | null
  }>
}

export default function CalendarPage() {
  const { toast } = useToast()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [servicesByDay, setServicesByDay] = useState<DayServices>({})
  const [allServices, setAllServices] = useState<ServiceWithRelations[]>([])
  const [showServiceWizard, setShowServiceWizard] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [editingService, setEditingService] = useState<ServiceWithRelations | null>(null)
  const [deletingService, setDeletingService] = useState<ServiceWithRelations | null>(null)
  const [serviceDate, setServiceDate] = useState<Date | null>(null)

  // Carregar serviços do mês
  const loadMonthServices = async (year: number, month: number) => {
    try {
      setLoading(true)
      const data = await servicesApi.getCalendar(year, month + 1) // API espera 1-12
      setServicesByDay(data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar serviços",
        description: error.message || "Não foi possível carregar os serviços do calendário.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Carregar todos os serviços para o modal
  const loadAllServices = async () => {
    try {
      const data = await servicesApi.getAll()
      setAllServices(data)
    } catch (error) {
      console.error("Erro ao carregar todos os serviços:", error)
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    loadMonthServices(year, month)
    loadAllServices()
  }, [currentDate])

  // Handlers
  const handleAddService = (date: Date) => {
    setServiceDate(date)
    setEditingService(null)
    setShowServiceWizard(true)
  }

  const handleEditService = (service: ServiceWithRelations) => {
    setEditingService(service)
    setServiceDate(null)
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
      // Recarregar dados
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      await loadMonthServices(year, month)
      await loadAllServices()
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
    // Recarregar dados
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    loadMonthServices(year, month)
    loadAllServices()
    setShowServiceModal(false)
    setEditingService(null)
    setServiceDate(null)
  }

  const handleServiceWizardSuccess = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    loadMonthServices(year, month)
    loadAllServices()
    setShowServiceWizard(false)
    setServiceDate(null)
  }

  const handleWizardOpenChange = (open: boolean) => {
    setShowServiceWizard(open)
    if (!open) {
      setServiceDate(null)
    }
  }

  // Calcular dias do calendário
  const calendarDays = useMemo((): CalendarDay[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1)
    const firstDayOfWeek = firstDay.getDay() // 0 = Domingo, 6 = Sábado
    
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    // Dias do mês anterior (para preencher primeira semana)
    const prevMonth = new Date(year, month, 0)
    const daysInPrevMonth = prevMonth.getDate()
    
    const days: CalendarDay[] = []
    
    // Preencher dias do mês anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      const date = new Date(year, month - 1, day)
      days.push({
        day,
        date,
        serviceCount: 0,
        totalValue: 0,
        hasInvoice: false,
      })
    }
    
    // Preencher dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayKey = day.toString()
      const dayServices = servicesByDay[dayKey] || []
      
      const serviceCount = dayServices.length
      const totalValue = dayServices.reduce(
        (sum, s) => sum + (s.gross_value || 0),
        0
      )
      const hasInvoice = dayServices.some((s) => s.has_invoice)
      
      // Buscar serviços completos da lista geral
      const fullServices = dayServices
        .map((dayService) => {
          return allServices.find((s) => s.id === dayService.id)
        })
        .filter((s): s is ServiceWithRelations => s !== undefined)
      
      days.push({
        day,
        date,
        serviceCount,
        totalValue,
        hasInvoice,
        services: fullServices,
      })
    }
    
    // Preencher dias do próximo mês (para completar última semana)
    const remainingDays = 42 - days.length // 6 semanas * 7 dias = 42
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({
        day,
        date,
        serviceCount: 0,
        totalValue: 0,
        hasInvoice: false,
      })
    }
    
    return days
  }, [currentDate, servicesByDay, allServices])

  // Navegação
  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(null)
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
      {/* Navegação do Calendário (setas e nome do mês) */}
      <CalendarHeader
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      {/* Calendário ocupando o resto da tela */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" text="Carregando calendário..." />
          </div>
        ) : (
          <CalendarGrid
            currentDate={currentDate}
            days={calendarDays}
            selectedDate={selectedDate}
            onDayClick={handleDayClick}
            onAddService={handleAddService}
            onEditService={handleEditService}
            onDeleteService={handleDeleteService}
          />
        )}
      </div>

      <ServiceWizard
        open={showServiceWizard}
        onOpenChange={handleWizardOpenChange}
        onSuccess={handleServiceWizardSuccess}
        initialDate={serviceDate ? serviceDate.toISOString().split("T")[0] : undefined}
      />

      {/* Modal de criar/editar serviço */}
      <ServiceModal
        open={showServiceModal}
        onOpenChange={setShowServiceModal}
        onSuccess={handleServiceModalSuccess}
        service={editingService}
        initialDate={serviceDate ? serviceDate.toISOString().split("T")[0] : undefined}
      />

      {/* Dialog de confirmação de exclusão */}
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
