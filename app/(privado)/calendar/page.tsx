"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Briefcase } from "lucide-react"
import { CalendarHeader } from "@/components/calendar/calendar-header"
import { CalendarGrid, type CalendarDay } from "@/components/calendar/calendar-grid"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { servicesApi } from "@/lib/api/client"
import { ServiceWithRelations } from "@/lib/types/database"
import { ServiceCard } from "@/components/services/service-card"
import { ServiceSheet } from "@/components/services/service-sheet"
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
  const [selectedService, setSelectedService] = useState<ServiceWithRelations | null>(null)
  const [showServiceSheet, setShowServiceSheet] = useState(false)
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
      // Recarregar dados
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      await loadMonthServices(year, month)
      await loadAllServices()
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

  const handleServiceWizardSuccess = async () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Recarregar dados do calendário
    await loadMonthServices(year, month)
    await loadAllServices()
    
    setShowServiceWizard(false)
    setEditingService(null)
    setServiceDate(null)
    
    // Se estava editando o serviço selecionado, atualizar o sheet
    if (editingService && selectedService?.id === editingService.id) {
      try {
        const updated = await servicesApi.getById(editingService.id)
        setSelectedService(updated)
        // Reabrir o sheet com dados atualizados
        setShowServiceSheet(true)
      } catch {
        setShowServiceSheet(false)
        setSelectedService(null)
      }
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
      
      // Determinar status de pagamento para o dot
      const hasPaid = fullServices.some((s) => s.payment_status === 'pago')
      const hasPending = fullServices.some((s) => s.payment_status === 'pendente')
      
      days.push({
        day,
        date,
        serviceCount,
        totalValue,
        hasInvoice,
        services: fullServices,
        hasPaid,
        hasPending,
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

  // Serviços da data selecionada
  const selectedDateServices = useMemo(() => {
    if (!selectedDate) return []
    
    const selectedKey = selectedDate.getDate().toString()
    const dayServices = servicesByDay[selectedKey] || []
    
    return dayServices
      .map((dayService) => {
        return allServices.find((s) => s.id === dayService.id)
      })
      .filter((s): s is ServiceWithRelations => s !== undefined)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [selectedDate, servicesByDay, allServices])

  const handleCreateService = () => {
    setEditingService(null)
    setServiceDate(selectedDate || new Date())
    setShowServiceWizard(true)
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
      {/* Navegação do Calendário */}
      <CalendarHeader
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      {/* Top Section: Calendar Grid */}
      <div className="flex-shrink-0">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" text="Carregando calendário..." />
          </div>
        ) : (
          <CalendarGrid
            currentDate={currentDate}
            days={calendarDays}
            selectedDate={selectedDate}
            onDayClick={handleDayClick}
          />
        )}
      </div>

      {/* Bottom Section: Events for Selected Date */}
      <div className="flex-1 overflow-y-auto border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="p-4 md:p-6">
          {!selectedDate ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Selecione uma data para ver os eventos
              </p>
            </div>
          ) : selectedDateServices.length === 0 ? (
            <EmptyState
              title="Nenhum evento nesta data"
              description={`Não há serviços cadastrados para ${selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.`}
              icon={Briefcase}
              actionLabel="Adicionar Serviço"
              onAction={handleCreateService}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Eventos do Dia
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {selectedDate.toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <Button
                  onClick={handleCreateService}
                  className="hidden md:flex gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Novo Serviço
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {selectedDateServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onClick={() => handleCardClick(service)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAB para Mobile */}
      {selectedDate && (
        <Button
          onClick={handleCreateService}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden bg-blue-600 hover:bg-blue-700 text-white z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Service Sheet */}
      <ServiceSheet
        open={showServiceSheet}
        onOpenChange={(open) => {
          setShowServiceSheet(open)
          if (!open) {
            // Limpar selectedService quando fechar para evitar dados desatualizados
            setSelectedService(null)
          }
        }}
        service={selectedService}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Service Wizard */}
      <ServiceWizard
        open={showServiceWizard}
        onOpenChange={(open) => {
          setShowServiceWizard(open)
          if (!open) {
            setServiceDate(null)
            setEditingService(null)
          }
        }}
        onSuccess={handleServiceWizardSuccess}
        initialDate={serviceDate ? serviceDate.toISOString().split("T")[0] : undefined}
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
