"use client"

import { useState, useEffect } from "react"
import { Loader2, Wrench, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { techniciansApi } from "@/lib/api/client"
import { Technician, TechnicianInsert, TechnicianUpdate } from "@/lib/types/database"
import { validateTechnician } from "@/lib/utils/validations"

interface TechnicianSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  technician?: Technician | null
}

export function TechnicianSheet({
  open,
  onOpenChange,
  onSuccess,
  technician,
}: TechnicianSheetProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<TechnicianInsert>({
    name: "",
    nickname: "",
    phone: "",
    email: "",
    document: "",
    active: true,
  })

  // Preencher formulário quando estiver editando
  useEffect(() => {
    if (technician && open) {
      setFormData({
        name: technician.name,
        nickname: technician.nickname || "",
        phone: technician.phone || "",
        email: technician.email || "",
        document: technician.document || "",
        active: technician.active,
      })
    } else if (!technician && open) {
      // Resetar formulário para novo técnico
      setFormData({
        name: "",
        nickname: "",
        phone: "",
        email: "",
        document: "",
        active: true,
      })
    }
  }, [technician, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar dados
    const validation = validateTechnician(formData)
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

      if (technician) {
        // Atualizar técnico existente
        const updateData: TechnicianUpdate = { ...formData }
        await techniciansApi.update(technician.id, updateData)

        toast({
          title: "Técnico atualizado!",
          description: "O técnico foi atualizado com sucesso.",
        })
      } else {
        // Criar novo técnico
        await techniciansApi.create(formData)

        toast({
          title: "Técnico criado!",
          description: "O técnico foi criado com sucesso.",
        })
      }

      // Resetar formulário
      setFormData({
        name: "",
        nickname: "",
        phone: "",
        email: "",
        document: "",
        active: true,
      })

      // Fechar sheet
      onOpenChange(false)

      // Chamar callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o técnico.",
      })
    } finally {
      setSaving(false)
    }
  }

  const canSave = formData.name.trim().length >= 2

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] max-h-[90vh] flex flex-col p-0 rounded-t-3xl">
        <SheetHeader className="border-b border-slate-200 dark:border-slate-800 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Wrench className="h-6 w-6" />
              {technician ? "Editar Técnico" : "Novo Técnico"}
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1 mb-2 block">
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nome completo do técnico"
                className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-700"
                required
              />
            </div>

            {/* Apelido */}
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1 mb-2 block">
                Apelido
              </Label>
              <Input
                id="nickname"
                value={formData.nickname || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nickname: e.target.value })
                }
                placeholder="Como o técnico prefere ser chamado"
                className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-700"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1 mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@exemplo.com"
                className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-700"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1 mb-2 block">
                Telefone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(00) 00000-0000"
                className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-700"
              />
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="document" className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1 mb-2 block">
                CPF
              </Label>
              <Input
                id="document"
                value={formData.document || ""}
                onChange={(e) =>
                  setFormData({ ...formData, document: e.target.value })
                }
                placeholder="000.000.000-00"
                className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-700"
              />
            </div>

            {/* Status Ativo */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <input
                type="checkbox"
                id="active"
                checked={formData.active !== false}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <Label htmlFor="active" className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
                Técnico ativo
              </Label>
            </div>
          </div>

          {/* Footer Fixo */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 dark:bg-slate-950/90 dark:border-slate-800 z-10">
            <div className="flex gap-3 max-w-2xl mx-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
                className="flex-1 h-12 rounded-2xl"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!canSave || saving}
                className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : technician ? (
                  "Atualizar"
                ) : (
                  "Criar"
                )}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

