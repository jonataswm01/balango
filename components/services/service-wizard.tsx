"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm, Controller, type FieldPath } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
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
import { parseCurrencyInput } from "@/lib/utils/currency"
import { useToast } from "@/components/ui/use-toast"
import { servicesApi } from "@/lib/api/client"
import type { ServiceInsert } from "@/lib/types/database"

interface ServiceWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  initialDate?: string
}

export function ServiceWizard({
  open,
  onOpenChange,
  onSuccess,
  initialDate,
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

  const createDefaultValues = (): FormValues => ({
    date: initialDate || today,
    start_time: "",
    description: "",
    location: "",
    client_id: "",
    technician_id: "",
    gross_value: "",
    operational_cost: "",
    payment_status: "pendente",
    payment_date: "",
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: createDefaultValues(),
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

  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])
  const [technicians, setTechnicians] = useState<
    Array<{ id: string; name: string; nickname: string | null }>
  >([])
  const [loadingResources, setLoadingResources] = useState(false)

  useEffect(() => {
    if (open) {
      setCurrentStep(1)
      reset(createDefaultValues())
    }
  }, [open, initialDate, reset])

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
  const handleNext = async () => {
    const fields = stepFields[currentStep] || []
    const isValid = await trigger(fields)
    if (!isValid) return
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    reset(createDefaultValues())
    onOpenChange(false)
  }

  const onSubmit = async (values: FormValues) => {
    const payload: ServiceInsert = {
      date: values.date,
      description: values.description || undefined,
      location: values.location,
      client_id: values.client_id,
      technician_id: values.technician_id,
      gross_value: parseCurrencyInput(values.gross_value),
      operational_cost: values.operational_cost
        ? parseCurrencyInput(values.operational_cost)
        : 0,
      payment_status: values.payment_status,
      payment_date: values.payment_status === "pago" ? values.payment_date : null,
      status: "pendente",
      priority: "media",
    }

    try {
      await servicesApi.create(payload)
      toast({
        title: "Serviço criado!",
        description: "O serviço foi criado com sucesso.",
      })
      handleClose()
      onSuccess?.()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error?.message || "Não foi possível criar o serviço.",
      })
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-background md:bg-black/50 md:backdrop-blur-sm md:flex md:items-center md:justify-center">
      {/* Mobile: Full Screen Container */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col h-full w-full md:h-auto md:w-full md:max-w-2xl md:max-h-[90vh] md:rounded-lg md:shadow-lg bg-background"
      >
        {/* Header with Progress Bar */}
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Novo Serviço</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Passo {currentStep} de {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Step 1: Data & Hora */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-4">Data e Hora</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data do Serviço</Label>
                    <Input
                      id="date"
                      type="date"
                      className="h-12 md:h-10"
                      {...register("date")}
                    />
                    {errors.date && (
                      <p className="text-sm text-red-500">{errors.date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_time">Horário de Início</Label>
                    <Input
                      id="start_time"
                      type="time"
                      className="h-12 md:h-10"
                      {...register("start_time")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Local do Evento</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="Ex: Rua Exemplo, 123"
                      className="h-12 md:h-10"
                      {...register("location")}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500">{errors.location.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva o serviço..."
                      rows={4}
                      className="resize-none"
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
                    <Label htmlFor="client_id">Cliente</Label>
                    <Controller
                      name="client_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loadingResources}
                        >
                          <SelectTrigger className="h-12 md:h-10" disabled={loadingResources}>
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
                    <Label htmlFor="technician_id">Técnico</Label>
                    <Controller
                      name="technician_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loadingResources}
                        >
                          <SelectTrigger className="h-12 md:h-10" disabled={loadingResources}>
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
                    <Label htmlFor="gross_value">Valor Bruto</Label>
                    <Input
                      id="gross_value"
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      className="h-12 md:h-10"
                      {...register("gross_value")}
                    />
                    {errors.gross_value && (
                      <p className="text-sm text-red-500">{errors.gross_value.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="operational_cost">Custo Operacional</Label>
                    <Input
                      id="operational_cost"
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      className="h-12 md:h-10"
                      {...register("operational_cost")}
                    />
                    {errors.operational_cost && (
                      <p className="text-sm text-red-500">
                        {errors.operational_cost.message}
                      </p>
                    )}
                  </div>

                  {/* Payment Status Toggle */}
                  <div className="space-y-2">
                    <Label>Status do Pagamento</Label>
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
                        <Label htmlFor="payment_date">Data do Pagamento</Label>
                        <Input
                          id="payment_date"
                          type="date"
                          className="h-12 md:h-10"
                          {...register("payment_date")}
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

        {/* Footer with Navigation */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between gap-3">
            {/* Back Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={cn(
                "flex-1 md:flex-initial",
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
                onClick={handleNext}
                className="flex-1 md:flex-initial"
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" className="flex-1 md:flex-initial" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

