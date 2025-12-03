"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm, Controller, type FieldPath } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { X, ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { parseCurrencyInput, formatCurrencyInput } from "@/lib/utils/currency"
import { useToast } from "@/components/ui/use-toast"
import { servicesApi } from "@/lib/api/client"
import type { ServiceInsert, ServiceUpdate, ServiceWithRelations } from "@/lib/types/database"

interface ServiceWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  initialDate?: string
  serviceToEdit?: ServiceWithRelations | null
}

export function ServiceWizard({
  open,
  onOpenChange,
  onSuccess,
  initialDate,
  serviceToEdit,
}: ServiceWizardProps) {
  const { toast } = useToast()
  const today = useMemo(() => new Date().toISOString().split("T")[0], [])
  const formSchema = z
    .object({
      date: z.string().min(1, "Data é obrigatória"),
      start_time: z.string().optional(),
      description: z.string().min(1, "Descrição é obrigatória"),
      location: z.string().min(1, "Local é obrigatório"),
      client_id: z.string().min(1, "Cliente é obrigatório"),
      technician_id: z.string().min(1, "Técnico é obrigatório"),
      gross_value: z
        .string()
        .min(1, "Valor bruto é obrigatório")
        .regex(/^\d*([.,]\d{0,2})?$/, "Use apenas números e vírgula/ponto"),
      operational_cost: z
        .string()
        .min(1, "Custo operacional é obrigatório")
        .regex(/^\d*([.,]\d{0,2})?$/, "Use apenas números e vírgula/ponto"),
      has_invoice: z.boolean().default(false),
      invoice_number: z.string().optional(),
      payment_status: z.enum(["pendente", "pago"]),
      payment_date: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.payment_status === "pago" && !data.payment_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["payment_date"],
          message: "Informe a data do pagamento",
        })
      }
    })

  type FormValues = z.infer<typeof formSchema>

  // Memoizar valores padrão baseados em serviceToEdit
  const defaultValues = useMemo((): FormValues => {
    // Se estiver editando, preencher com dados do serviço
    if (serviceToEdit) {
      // Formatar payment_date para YYYY-MM-DD se existir
      let formattedPaymentDate = ""
      if (serviceToEdit.payment_date) {
        const paymentDate = new Date(serviceToEdit.payment_date)
        if (!isNaN(paymentDate.getTime())) {
          formattedPaymentDate = paymentDate.toISOString().split("T")[0]
        }
      }

      // Formatar start_time se start_date existir
      let formattedStartTime = ""
      if (serviceToEdit.start_date) {
        const startDate = new Date(serviceToEdit.start_date)
        if (!isNaN(startDate.getTime())) {
          const hours = String(startDate.getHours()).padStart(2, "0")
          const minutes = String(startDate.getMinutes()).padStart(2, "0")
          formattedStartTime = `${hours}:${minutes}`
        }
      }

      return {
        date: serviceToEdit.date || initialDate || today,
        start_time: formattedStartTime,
        description: serviceToEdit.description || "",
        location: serviceToEdit.location || "",
        client_id: serviceToEdit.client_id || "",
        technician_id: serviceToEdit.technician_id || "",
        gross_value: serviceToEdit.gross_value
          ? formatCurrencyInput(serviceToEdit.gross_value)
          : "",
        operational_cost: serviceToEdit.operational_cost
          ? formatCurrencyInput(serviceToEdit.operational_cost)
          : "",
        has_invoice: serviceToEdit.has_invoice || false,
        invoice_number: serviceToEdit.invoice_number || "",
        payment_status: (serviceToEdit.payment_status === "pago" ? "pago" : "pendente") as "pendente" | "pago",
        payment_date: formattedPaymentDate,
      }
    }

    // Valores padrão para novo serviço
    return {
      date: initialDate || today,
      start_time: "",
      description: "",
      location: "",
      client_id: "",
      technician_id: "",
      gross_value: "",
      operational_cost: "",
      has_invoice: false,
      invoice_number: "",
      payment_status: "pendente",
      payment_date: "",
    }
  }, [serviceToEdit, initialDate, today])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  })

  const {
    register,
    control,
    watch,
    trigger,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  const [isValidating, setIsValidating] = useState(false)

  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])
  const [technicians, setTechnicians] = useState<
    Array<{ id: string; name: string; nickname: string | null }>
  >([])
  const [loadingResources, setLoadingResources] = useState(false)

  // Reset form when modal opens or serviceToEdit changes
  useEffect(() => {
    if (open) {
      setCurrentStep(1)
      reset(defaultValues)
      
      // Se estiver editando e payment_status for 'pago', garantir que payment_date esteja preenchido
      if (serviceToEdit && serviceToEdit.payment_status === 'pago' && defaultValues.payment_date) {
        // Usar setTimeout para garantir que o reset aconteceu primeiro
        setTimeout(() => {
          setValue("payment_status", "pago", { shouldDirty: false, shouldValidate: false })
          setValue("payment_date", defaultValues.payment_date, { shouldDirty: false, shouldValidate: false })
        }, 0)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, serviceToEdit?.id]) // Apenas quando o modal abre ou o serviço muda

  useEffect(() => {
    if (!open) return

    let isMounted = true
    const loadResources = async () => {
      try {
        setLoadingResources(true)
        const [clientsData, techniciansData] = await Promise.all([
          servicesApi.getClients(),
          servicesApi.getTechnicians(),
        ])

        if (!isMounted) return
        setClients(clientsData)
        setTechnicians(techniciansData)
      } catch (error: any) {
        if (!isMounted) return
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: error.message || "Não foi possível carregar clientes e técnicos.",
        })
      } finally {
        if (isMounted) {
          setLoadingResources(false)
        }
      }
    }

    loadResources()
    return () => {
      isMounted = false
    }
  }, [open, toast])

  // Progress calculation
  const progress = (currentStep / totalSteps) * 100

  const stepFields: Record<number, FieldPath<FormValues>[]> = {
    1: ["date", "location", "description"],
    2: ["client_id", "technician_id"],
    3: ["gross_value", "operational_cost", "payment_status", "payment_date"],
  }

  const paymentStatus = watch("payment_status")

  const handlePaymentToggle = (status: "pendente" | "pago") => {
    setValue("payment_status", status, { shouldDirty: true, shouldValidate: true })
    if (status === "pago") {
      const currentDate = getValues("payment_date") || today
      setValue("payment_date", currentDate, { shouldDirty: true })
    } else {
      setValue("payment_date", "", { shouldDirty: true })
    }
  }

  // Navigation handlers
  const handleNext = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // Garantir que não estamos no último passo antes de validar
    if (currentStep >= totalSteps) {
      return
    }
    
    // Usar estado local para validação, não isSubmitting
    setIsValidating(true)
    try {
      // Validar campos do passo atual
      const fields = stepFields[currentStep] || []
      const isValid = await trigger(fields, { shouldFocus: true })
      
      if (!isValid) {
        return
      }
      
      // Só avançar se não estiver no último passo
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1)
      }
    } finally {
      setIsValidating(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    // Resetar para valores padrão (sem serviceToEdit)
    reset({
      date: initialDate || today,
      start_time: "",
      description: "",
      location: "",
      client_id: "",
      technician_id: "",
      gross_value: "",
      operational_cost: "",
      has_invoice: false,
      invoice_number: "",
      payment_status: "pendente",
      payment_date: "",
    })
    onOpenChange(false)
  }

  // Prevenir submit quando não estiver no último passo
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Sempre prevenir o comportamento padrão primeiro
    e.preventDefault()
    e.stopPropagation()
    
    // IMPORTANTE: Só submeter se estiver no último passo
    // Se não estiver no último passo, apenas prevenir e retornar
    if (currentStep !== totalSteps) {
      return
    }
    
    // Só chegar aqui se estiver no último passo
    // Usar handleSubmit do react-hook-form que já gerencia o isSubmitting
    handleSubmit(onSubmit)(e)
  }

  const onSubmit = async (values: FormValues) => {
    try {
      if (serviceToEdit) {
        // Atualizar serviço existente
        const updatePayload: ServiceUpdate = {
          date: values.date,
          description: values.description || null,
          location: values.location,
          client_id: values.client_id,
          technician_id: values.technician_id,
          gross_value: parseCurrencyInput(values.gross_value),
          operational_cost: values.operational_cost
            ? parseCurrencyInput(values.operational_cost)
            : 0,
          has_invoice: values.has_invoice,
          invoice_number: values.has_invoice && values.invoice_number ? values.invoice_number : null,
          payment_status: values.payment_status,
          payment_date: values.payment_status === "pago" ? values.payment_date || null : null,
        }

        // Se start_time foi preenchido, criar start_date
        if (values.start_time) {
          const [hours, minutes] = values.start_time.split(":")
          const startDate = new Date(values.date)
          startDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
          updatePayload.start_date = startDate.toISOString()
        }

        await servicesApi.update(serviceToEdit.id, updatePayload)
        toast({
          title: "Serviço atualizado!",
          description: "O serviço foi atualizado com sucesso.",
        })
      } else {
        // Criar novo serviço
        const createPayload: ServiceInsert = {
          date: values.date,
          description: values.description || undefined,
          location: values.location,
          client_id: values.client_id,
          technician_id: values.technician_id,
          gross_value: parseCurrencyInput(values.gross_value),
          operational_cost: values.operational_cost
            ? parseCurrencyInput(values.operational_cost)
            : 0,
          has_invoice: values.has_invoice,
          invoice_number: values.has_invoice && values.invoice_number ? values.invoice_number : null,
          payment_status: values.payment_status,
          payment_date: values.payment_status === "pago" ? values.payment_date : null,
          status: "pendente",
          priority: "media",
        }

        // Se start_time foi preenchido, criar start_date
        if (values.start_time) {
          const [hours, minutes] = values.start_time.split(":")
          const startDate = new Date(values.date)
          startDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
          createPayload.start_date = startDate.toISOString()
        }

        await servicesApi.create(createPayload)
        toast({
          title: "Serviço criado!",
          description: "O serviço foi criado com sucesso.",
        })
      }

      handleClose()
      onSuccess?.()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description:
          error?.message ||
          `Não foi possível ${serviceToEdit ? "atualizar" : "criar"} o serviço.`,
      })
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-background md:bg-black/50 md:backdrop-blur-sm md:flex md:items-center md:justify-center">
      {/* Mobile: Full Screen Container */}
      <form
        onSubmit={handleFormSubmit}
        onKeyDown={(e) => {
          // Prevenir submit ao pressionar Enter quando não estiver no último passo
          if (e.key === 'Enter' && currentStep < totalSteps) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
        className="flex flex-col h-full w-full md:h-auto md:w-full md:max-w-2xl md:max-h-[90vh] md:rounded-lg md:shadow-lg bg-background"
      >
        {/* Header with Progress Bar */}
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {serviceToEdit ? "Editar Serviço" : "Novo Serviço"}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Segmented Progress Bar */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={cn(
                  "flex-1 h-2 rounded-full transition-all duration-300",
                  currentStep >= step
                    ? "bg-blue-600"
                    : "bg-slate-200 dark:bg-slate-700"
                )}
              />
            ))}
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          {/* Step 1: Data & Hora */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-4">Data e Hora</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1 mb-2 block">
                      Data do Serviço
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-700"
                      {...register("date")}
                    />
                    {errors.date && (
                      <p className="text-sm text-red-500">{errors.date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_time" className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1 mb-2 block">
                      Horário de Início
                    </Label>
                    <Input
                      id="start_time"
                      type="time"
                      className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-700"
                      {...register("start_time")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1 mb-2 block">
                      Local do Evento
                    </Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="Ex: Rua Exemplo, 123"
                      className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-700"
                      {...register("location")}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500">{errors.location.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1 mb-2 block">
                      Descrição
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva o serviço..."
                      rows={4}
                      className="resize-none rounded-2xl bg-slate-50 border-transparent focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-700 min-h-[120px]"
                      {...register("description")}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Recursos */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-4">Recursos</h3>
                {loadingResources && (
                  <p className="text-sm text-slate-500">Carregando clientes e técnicos...</p>
                )}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_id" className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1 mb-2 block">
                      Cliente
                    </Label>
                    <Controller
                      name="client_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loadingResources}
                        >
                          <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-700" disabled={loadingResources}>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.client_id && (
                      <p className="text-sm text-red-500">{errors.client_id.message}</p>
                    )}
                    {!loadingResources && clients.length === 0 && (
                      <p className="text-xs text-slate-500">Nenhum cliente disponível.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="technician_id" className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1 mb-2 block">
                      Técnico
                    </Label>
                    <Controller
                      name="technician_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loadingResources}
                        >
                          <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-700" disabled={loadingResources}>
                            <SelectValue placeholder="Selecione um técnico" />
                          </SelectTrigger>
                          <SelectContent>
                            {technicians.map((technician) => (
                              <SelectItem
                                key={technician.id}
                                value={technician.id}
                              >
                                {technician.nickname || technician.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.technician_id && (
                      <p className="text-sm text-red-500">{errors.technician_id.message}</p>
                    )}
                    {!loadingResources && technicians.length === 0 && (
                      <p className="text-xs text-slate-500">Nenhum técnico disponível.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Financeiro */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-4">Financeiro</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gross_value" className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1 mb-2 block">
                      Valor Bruto
                    </Label>
                    <Input
                      id="gross_value"
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-700"
                      {...register("gross_value")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && currentStep < totalSteps) {
                          e.preventDefault()
                        }
                      }}
                    />
                    {errors.gross_value && (
                      <p className="text-sm text-red-500">{errors.gross_value.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="operational_cost" className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1 mb-2 block">
                      Custo Operacional
                    </Label>
                    <Input
                      id="operational_cost"
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-700"
                      {...register("operational_cost")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && currentStep < totalSteps) {
                          e.preventDefault()
                        }
                      }}
                    />
                    {errors.operational_cost && (
                      <p className="text-sm text-red-500">
                        {errors.operational_cost.message}
                      </p>
                    )}
                  </div>

                  {/* Nota Fiscal */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1 mb-2 block">
                      Nota Fiscal
                    </Label>
                    <button
                      type="button"
                      onClick={() => {
                        const currentValue = watch("has_invoice")
                        setValue("has_invoice", !currentValue, { shouldDirty: true, shouldValidate: true })
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-md border-2 transition-all font-medium text-left",
                        watch("has_invoice")
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-slate-200 dark:border-slate-700 bg-background text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center w-5 h-5 rounded border-2 transition-all flex-shrink-0",
                          watch("has_invoice")
                            ? "border-primary bg-primary"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        )}
                      >
                        {watch("has_invoice") && (
                          <svg
                            className="w-3.5 h-3.5 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <FileText className="h-4 w-4" />
                        <span>Possui Nota Fiscal</span>
                      </div>
                    </button>

                    {watch("has_invoice") && (
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="invoice_number" className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1 mb-2 block">
                          Número da NF
                        </Label>
                        <Input
                          id="invoice_number"
                          type="text"
                          placeholder="Número da nota fiscal"
                          className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-700"
                          {...register("invoice_number")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && currentStep < totalSteps) {
                              e.preventDefault()
                            }
                          }}
                        />
                        {errors.invoice_number && (
                          <p className="text-sm text-red-500">
                            {errors.invoice_number.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment Status Toggle */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1 mb-2 block">
                      Status do Pagamento
                    </Label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handlePaymentToggle("pendente")}
                        className={cn(
                          "flex-1 px-4 py-3 rounded-md border-2 transition-all font-medium",
                          paymentStatus === "pendente"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-slate-200 dark:border-slate-700 bg-background text-slate-600 dark:text-slate-400"
                        )}
                      >
                        Pendente
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePaymentToggle("pago")}
                        className={cn(
                          "flex-1 px-4 py-3 rounded-md border-2 transition-all font-medium",
                          paymentStatus === "pago"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-slate-200 dark:border-slate-700 bg-background text-slate-600 dark:text-slate-400"
                        )}
                      >
                        Já Recebi
                      </button>
                    </div>
                    {paymentStatus === "pago" && (
                      <div className="space-y-2 pt-3">
                        <Label htmlFor="payment_date" className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1 mb-2 block">
                          Data do Pagamento
                        </Label>
                        <Input
                          id="payment_date"
                          type="date"
                          className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-700"
                          {...register("payment_date")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && currentStep < totalSteps) {
                              e.preventDefault()
                            }
                          }}
                        />
                        {errors.payment_date && (
                          <p className="text-sm text-red-500">
                            {errors.payment_date.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer with Navigation */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 z-10 md:relative md:bg-transparent md:backdrop-blur-none md:border-t md:border-slate-200">
          <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto md:max-w-none">
            {/* Back Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={cn(
                "flex-1 md:flex-initial h-12",
                currentStep === 1 && "invisible"
              )}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            {/* Next/Save Button */}
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleNext(e)
                }}
                className="flex-1 md:flex-initial h-12 bg-blue-600 hover:bg-blue-700"
                disabled={isValidating || isSubmitting}
              >
                {isValidating ? "Validando..." : "Próximo"}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" className="flex-1 md:flex-initial h-12 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting
                  ? "Salvando..."
                  : serviceToEdit
                    ? "Atualizar"
                    : "Salvar"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

