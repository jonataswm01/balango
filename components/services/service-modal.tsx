"use client"

import { useState, useEffect } from "react"
import {
  Loader2,
  Briefcase,
  Calendar,
  User,
  Wrench,
  DollarSign,
  FileText,
  CreditCard,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { useToast } from "@/components/ui/use-toast"
import { servicesApi } from "@/lib/api/client"
import { ServiceWithRelations, ServiceInsert, ServiceUpdate } from "@/lib/types/database"
import { validateService } from "@/lib/utils/validations"
import { calculateTaxAmount } from "@/lib/utils/services"
import { settingsApi } from "@/lib/api/client"
import { SelectWithSearch } from "@/components/ui/select-with-search"
import { formatCurrencyMask, parseCurrencyMask } from "@/lib/utils/currency"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface ServiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  service?: ServiceWithRelations | null
}

export function ServiceModal({
  open,
  onOpenChange,
  onSuccess,
  service,
}: ServiceModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])
  const [technicians, setTechnicians] = useState<
    Array<{ id: string; name: string; nickname: string | null }>
  >([])
  const [taxRate, setTaxRate] = useState<number>(0)
  const [showPayment, setShowPayment] = useState(false)
  const [showAdditional, setShowAdditional] = useState(false)

  // Estados para validação em tempo real
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Estados para formatação de moeda
  const [grossValueDisplay, setGrossValueDisplay] = useState("")
  const [operationalCostDisplay, setOperationalCostDisplay] = useState("")

  const [formData, setFormData] = useState<ServiceInsert>({
    date: new Date().toISOString().split("T")[0],
    status: "pendente",
    priority: "media",
    has_invoice: false,
    gross_value: 0,
    operational_cost: 0,
    tax_amount: 0,
  })

  // Carregar dados iniciais
  useEffect(() => {
    if (!open) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // Buscar clientes e técnicos
        const [clientsData, techniciansData, taxRateData] = await Promise.all([
          servicesApi.getClients(),
          servicesApi.getTechnicians(),
          settingsApi.getByKey("tax_rate").catch(() => ({ value: 0 })),
        ])

        setClients(clientsData)
        setTechnicians(techniciansData)
        setTaxRate(taxRateData.value || 0)

        // Preencher formulário se estiver editando
        if (service) {
          setFormData({
            description: service.description || "",
            date: service.date,
            status: service.status,
            priority: service.priority,
            service_type: service.service_type || "",
            technician_id: service.technician_id || "",
            client_id: service.client_id || "",
            gross_value: service.gross_value,
            operational_cost: service.operational_cost,
            tax_amount: service.tax_amount,
            has_invoice: service.has_invoice,
            invoice_number: service.invoice_number || "",
            payment_method: service.payment_method || "",
            payment_date: service.payment_date || "",
            location: service.location || "",
            notes: service.notes || "",
            estimated_hours: service.estimated_hours ?? null,
            actual_hours: service.actual_hours ?? null,
            contact_phone: service.contact_phone || "",
            contact_email: service.contact_email || "",
          })
          setGrossValueDisplay(formatCurrencyMask(service.gross_value.toString()))
          setOperationalCostDisplay(
            formatCurrencyMask(service.operational_cost.toString())
          )
          setShowPayment(true)
          setShowAdditional(true)
        } else {
          // Resetar formulário para novo serviço
          // Status sempre será "pendente" na criação (definido automaticamente pelo sistema)
          setFormData({
            date: new Date().toISOString().split("T")[0],
            status: "pendente", // Sempre pendente na criação
            priority: "media", // Valor padrão (não editável no formulário)
            has_invoice: false,
            gross_value: 0,
            operational_cost: 0,
            tax_amount: 0,
          })
          setGrossValueDisplay("")
          setOperationalCostDisplay("")
          setShowPayment(false)
          setShowAdditional(false)
        }
        setErrors({})
        setTouched({})
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: error.message || "Não foi possível carregar os dados necessários.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [open, service, toast])

  // Calcular imposto automaticamente quando valor bruto, NF ou número da NF mudar
  useEffect(() => {
    if (formData.gross_value && formData.gross_value > 0 && formData.has_invoice) {
      const calculatedTax = calculateTaxAmount(
        formData.gross_value,
        formData.has_invoice,
        taxRate
      )
      setFormData((prev) => ({ ...prev, tax_amount: calculatedTax }))
    } else {
      setFormData((prev) => ({ ...prev, tax_amount: 0 }))
    }
  }, [formData.gross_value, formData.has_invoice, formData.invoice_number, taxRate])

  // Validação em tempo real
  const validateField = (name: string, value: any) => {
    const newErrors = { ...errors }
    delete newErrors[name]

    if (name === "date" && !value) {
      newErrors.date = "Data é obrigatória"
    }
    if (name === "client_id" && !value) {
      newErrors.client_id = "Cliente é obrigatório"
    }
    if (name === "technician_id" && !value) {
      newErrors.technician_id = "Técnico é obrigatório"
    }
    if (name === "gross_value" && (value === undefined || value <= 0)) {
      newErrors.gross_value = "Valor bruto deve ser maior que zero"
    }

    setErrors(newErrors)
  }

  const handleBlur = (name: string) => {
    setTouched({ ...touched, [name]: true })
    validateField(name, formData[name as keyof ServiceInsert])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar todos os campos
    const validation = validateService(formData)
    if (!validation.valid) {
      toast({
        variant: "destructive",
        title: "Dados inválidos",
        description: validation.error,
      })
      return
    }

    try {
      setSaving(true)

      if (service) {
        // Atualizar serviço existente
        const updateData: ServiceUpdate = { ...formData }
        await servicesApi.update(service.id, updateData)

        toast({
          title: "Serviço atualizado!",
          description: "O serviço foi atualizado com sucesso.",
        })
      } else {
        // Criar novo serviço
        await servicesApi.create(formData)

        toast({
          title: "Serviço criado!",
          description: "O serviço foi criado com sucesso.",
        })
      }

      // Resetar formulário
      setFormData({
        date: new Date().toISOString().split("T")[0],
        status: "pendente",
        priority: "media",
        has_invoice: false,
        gross_value: 0,
        operational_cost: 0,
        tax_amount: 0,
      })
      setGrossValueDisplay("")
      setOperationalCostDisplay("")
      setErrors({})
      setTouched({})

      // Fechar modal
      onOpenChange(false)

      // Chamar callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o serviço.",
      })
    } finally {
      setSaving(false)
    }
  }

  const canSave =
    formData.date &&
    formData.client_id &&
    formData.technician_id &&
    formData.gross_value !== undefined &&
    formData.gross_value > 0

  // Preparar opções para selects com busca
  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const technicianOptions = technicians.map((t) => ({
    value: t.id,
    label: t.nickname || t.name,
  }))

  // Calcular lucro líquido para exibição
  const netProfit =
    (formData.gross_value || 0) - (formData.operational_cost || 0) - (formData.tax_amount || 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-w-[calc(100vw-1.5rem)] max-h-[90vh] overflow-y-auto mx-3 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {service ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
          <DialogDescription>
            {service
              ? "Atualize as informações do serviço abaixo."
              : "Preencha os dados para criar um novo serviço."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Informações Básicas
                </h3>
              </div>

              {/* Data */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  Data do Serviço <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value })
                    validateField("date", e.target.value)
                  }}
                  onBlur={() => handleBlur("date")}
                  required
                  className={cn(
                    touched.date && errors.date && "border-red-500"
                  )}
                />
                {touched.date && errors.date && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.date}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cliente */}
                <div className="space-y-2">
                  <Label htmlFor="client_id" className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    Cliente <span className="text-red-500">*</span>
                  </Label>
                  <SelectWithSearch
                    value={formData.client_id || ""}
                    onValueChange={(value) => {
                      setFormData({ ...formData, client_id: value })
                      validateField("client_id", value)
                    }}
                    options={clientOptions}
                    placeholder="Selecione um cliente"
                    searchPlaceholder="Buscar cliente..."
                    emptyMessage="Nenhum cliente encontrado"
                  />
                  {touched.client_id && errors.client_id && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.client_id}
                    </p>
                  )}
                </div>

                {/* Técnico */}
                <div className="space-y-2">
                  <Label htmlFor="technician_id" className="flex items-center gap-1">
                    <Wrench className="h-3.5 w-3.5 text-slate-500" />
                    Técnico <span className="text-red-500">*</span>
                  </Label>
                  <SelectWithSearch
                    value={formData.technician_id || ""}
                    onValueChange={(value) => {
                      setFormData({ ...formData, technician_id: value })
                      validateField("technician_id", value)
                    }}
                    options={technicianOptions}
                    placeholder="Selecione um técnico"
                    searchPlaceholder="Buscar técnico..."
                    emptyMessage="Nenhum técnico encontrado"
                  />
                  {touched.technician_id && errors.technician_id && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.technician_id}
                    </p>
                  )}
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descreva o serviço..."
                  rows={3}
                />
              </div>
            </div>

            {/* Valores Financeiros */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Valores Financeiros
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Valor Bruto */}
                <div className="space-y-2">
                  <Label htmlFor="gross_value" className="flex items-center gap-1">
                    Valor Bruto <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      R$
                    </span>
                    <Input
                      id="gross_value"
                      type="text"
                      value={grossValueDisplay}
                      onChange={(e) => {
                        const formatted = formatCurrencyMask(e.target.value)
                        setGrossValueDisplay(formatted)
                        const parsed = parseCurrencyMask(formatted)
                        setFormData({
                          ...formData,
                          gross_value: parsed,
                        })
                        validateField("gross_value", parsed)
                      }}
                      onBlur={() => handleBlur("gross_value")}
                      placeholder="0,00"
                      className={cn(
                        "pl-8",
                        touched.gross_value && errors.gross_value && "border-red-500"
                      )}
                      required
                    />
                  </div>
                  {touched.gross_value && errors.gross_value && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.gross_value}
                    </p>
                  )}
                  {formData.gross_value !== undefined && formData.gross_value > 0 && !errors.gross_value && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {formatCurrency(formData.gross_value)}
                    </p>
                  )}
                </div>

                {/* Custo Operacional */}
                <div className="space-y-2">
                  <Label htmlFor="operational_cost" className="flex items-center gap-1">
                    Custo Operacional
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      R$
                    </span>
                    <Input
                      id="operational_cost"
                      type="text"
                      value={operationalCostDisplay}
                      onChange={(e) => {
                        const formatted = formatCurrencyMask(e.target.value)
                        setOperationalCostDisplay(formatted)
                        const parsed = parseCurrencyMask(formatted)
                        setFormData({
                          ...formData,
                          operational_cost: parsed,
                        })
                      }}
                      placeholder="0,00"
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>

              {/* Resumo de Cálculos */}
              {formData.gross_value !== undefined && formData.gross_value > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-2 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Valor Bruto:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(formData.gross_value)}
                    </span>
                  </div>
                  {formData.operational_cost !== undefined && formData.operational_cost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        (-) Custos:
                      </span>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        -{formatCurrency(formData.operational_cost)}
                      </span>
                    </div>
                  )}
                  {formData.tax_amount !== undefined && formData.tax_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        (-) Impostos:
                      </span>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        -{formatCurrency(formData.tax_amount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-700 dark:text-slate-300">
                      Lucro Líquido:
                    </span>
                    <span
                      className={cn(
                        netProfit >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                    >
                      {formatCurrency(netProfit)}
                    </span>
                  </div>
                </div>
              )}

              {/* Nota Fiscal */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="has_invoice"
                    checked={formData.has_invoice || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        has_invoice: e.target.checked,
                        invoice_number: e.target.checked
                          ? formData.invoice_number
                          : "",
                      })
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <Label htmlFor="has_invoice" className="cursor-pointer flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                    Possui Nota Fiscal
                  </Label>
                </div>

                {formData.has_invoice && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoice_number">Número da NF</Label>
                      <Input
                        id="invoice_number"
                        value={formData.invoice_number || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            invoice_number: e.target.value,
                          })
                        }
                        placeholder="Número da nota fiscal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax_amount">Imposto</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                          R$
                        </span>
                        <Input
                          id="tax_amount"
                          type="text"
                          value={formatCurrency(formData.tax_amount || 0)}
                          disabled
                          className="pl-8 bg-slate-100 dark:bg-slate-800"
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        {taxRate > 0 ? (
                          <>Calculado automaticamente ({taxRate * 100}%)</>
                        ) : (
                          <>Configure a taxa de imposto em Configurações</>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pagamento - Colapsável */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowPayment(!showPayment)}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Pagamento
                  </h3>
                </div>
                {showPayment ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </button>

              {showPayment && (
                <div className="space-y-4">
                  {/* Método de Pagamento */}
                  <div className="space-y-2">
                    <Label htmlFor="payment_method">Método de Pagamento</Label>
                    <Input
                      id="payment_method"
                      value={formData.payment_method || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, payment_method: e.target.value })
                      }
                      placeholder="Ex: PIX, Cartão, Boleto..."
                    />
                  </div>

                  {/* Data de Pagamento */}
                  {formData.payment_method && (
                    <div className="space-y-2">
                      <Label htmlFor="payment_date">Data de Pagamento</Label>
                      <Input
                        id="payment_date"
                        type="date"
                        value={formData.payment_date || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, payment_date: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Informações Adicionais - Colapsável */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAdditional(!showAdditional)}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Informações Adicionais
                  </h3>
                </div>
                {showAdditional ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </button>

              {showAdditional && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Localização */}
                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        Localização
                      </Label>
                      <Input
                        id="location"
                        value={formData.location || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        placeholder="Endereço ou local"
                      />
                    </div>

                    {/* Horas Estimadas */}
                    <div className="space-y-2">
                      <Label htmlFor="estimated_hours" className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        Horas Estimadas
                      </Label>
                      <Input
                        id="estimated_hours"
                        type="number"
                        step="0.5"
                        min="0"
                        value={formData.estimated_hours?.toString() || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            estimated_hours: e.target.value ? parseFloat(e.target.value) : null,
                          })
                        }
                        placeholder="Ex: 2 ou 2.5"
                      />
                    </div>
                  </div>

                  {/* Observações */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Observações adicionais..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!canSave || saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : service ? (
                  "Atualizar"
                ) : (
                  "Criar"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
