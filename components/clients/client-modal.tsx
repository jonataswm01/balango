"use client"

import { useState, useEffect } from "react"
import { Loader2, User } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"
import { clientsApi } from "@/lib/api/client"
import { Client, ClientInsert, ClientUpdate } from "@/lib/types/database"
import { validateClient } from "@/lib/utils/validations"

interface ClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  client?: Client | null
}

export function ClientModal({
  open,
  onOpenChange,
  onSuccess,
  client,
}: ClientModalProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<ClientInsert>({
    name: "",
    phone: "",
    email: "",
    document: "",
    address: "",
    active: true,
  })

  // Preencher formulário quando estiver editando
  useEffect(() => {
    if (client && open) {
      setFormData({
        name: client.name,
        phone: client.phone || "",
        email: client.email || "",
        document: client.document || "",
        address: client.address || "",
        active: client.active,
      })
    } else if (!client && open) {
      // Resetar formulário para novo cliente
      setFormData({
        name: "",
        phone: "",
        email: "",
        document: "",
        address: "",
        active: true,
      })
    }
  }, [client, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar dados
    const validation = validateClient(formData)
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

      if (client) {
        // Atualizar cliente existente
        const updateData: ClientUpdate = { ...formData }
        await clientsApi.update(client.id, updateData)

        toast({
          title: "Cliente atualizado!",
          description: "O cliente foi atualizado com sucesso.",
        })
      } else {
        // Criar novo cliente
        await clientsApi.create(formData)

        toast({
          title: "Cliente criado!",
          description: "O cliente foi criado com sucesso.",
        })
      }

      // Resetar formulário
      setFormData({
        name: "",
        phone: "",
        email: "",
        document: "",
        address: "",
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
        description: error.message || "Não foi possível salvar o cliente.",
      })
    } finally {
      setSaving(false)
    }
  }

  const canSave = formData.name.trim().length >= 2

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {client ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {client
              ? "Atualize as informações do cliente abaixo."
              : "Preencha os dados para criar um novo cliente."}
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
              placeholder="Nome completo do cliente"
              required
            />
          </div>

          {/* Email e Telefone */}
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* Documento */}
          <div className="space-y-2">
            <Label htmlFor="document">CPF/CNPJ</Label>
            <Input
              id="document"
              value={formData.document || ""}
              onChange={(e) =>
                setFormData({ ...formData, document: e.target.value })
              }
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
            />
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              value={formData.address || ""}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Endereço completo"
              rows={3}
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
              Cliente ativo
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
              ) : client ? (
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
