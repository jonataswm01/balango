"use client"

import { useState, useEffect } from "react"
import { Loader2, Wrench } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"
import { techniciansApi } from "@/lib/api/client"
import { Technician, TechnicianInsert, TechnicianUpdate } from "@/lib/types/database"
import { validateTechnician } from "@/lib/utils/validations"

interface TechnicianModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  technician?: Technician | null
}

export function TechnicianModal({
  open,
  onOpenChange,
  onSuccess,
  technician,
}: TechnicianModalProps) {
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
        description: error.message || "Não foi possível salvar o técnico.",
      })
    } finally {
      setSaving(false)
    }
  }

  const canSave = formData.name.trim().length >= 2

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] mx-4 my-4 max-w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {technician ? "Editar Técnico" : "Novo Técnico"}
          </DialogTitle>
          <DialogDescription>
            {technician
              ? "Atualize as informações do técnico abaixo."
              : "Preencha os dados para criar um novo técnico."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Nome completo do técnico"
              required
            />
          </div>

          {/* Apelido */}
          <div className="space-y-2">
            <Label htmlFor="nickname">Apelido</Label>
            <Input
              id="nickname"
              value={formData.nickname || ""}
              onChange={(e) =>
                setFormData({ ...formData, nickname: e.target.value })
              }
              placeholder="Como o técnico prefere ser chamado"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="email@exemplo.com"
            />
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* CPF */}
          <div className="space-y-2">
            <Label htmlFor="document">CPF</Label>
            <Input
              id="document"
              value={formData.document || ""}
              onChange={(e) =>
                setFormData({ ...formData, document: e.target.value })
              }
              placeholder="000.000.000-00"
            />
          </div>

          {/* Status Ativo */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active !== false}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300"
            />
            <Label htmlFor="active" className="cursor-pointer">
              Técnico ativo
            </Label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
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
              ) : technician ? (
                "Atualizar"
              ) : (
                "Criar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
