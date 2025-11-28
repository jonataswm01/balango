"use client"

import { useState, useEffect } from "react"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useOrganization } from "@/lib/contexts/organization-context"
import { organizationsApi } from "@/lib/api/client"

export function MembrosSection() {
  const { currentOrganization } = useOrganization()
  const { toast } = useToast()
  const [members, setMembers] = useState<Array<any>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentOrganization) {
      loadMembers()
    }
  }, [currentOrganization])

  const loadMembers = async () => {
    if (!currentOrganization) return

    try {
      setLoading(true)
      const membersData = await organizationsApi.getMembers(currentOrganization.id)
      setMembers(membersData)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar membros",
        description: error.message || "Não foi possível carregar os membros.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'member') => {
    if (!currentOrganization) return

    try {
      await organizationsApi.updateMember(currentOrganization.id, memberId, { role: newRole })
      toast({
        title: "Permissão atualizada!",
        description: "A permissão do membro foi atualizada com sucesso.",
      })
      loadMembers()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar a permissão.",
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!currentOrganization) return

    if (!confirm("Tem certeza que deseja remover este membro?")) return

    try {
      await organizationsApi.removeMember(currentOrganization.id, memberId)
      toast({
        title: "Membro removido!",
        description: "O membro foi removido da organização com sucesso.",
      })
      loadMembers()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover",
        description: error.message || "Não foi possível remover o membro.",
      })
    }
  }

  if (!currentOrganization) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Selecione uma organização para gerenciar membros.</p>
      </div>
    )
  }

  // Verificar se usuário é admin (simplificado - precisa buscar do contexto)
  const isAdmin = true // TODO: Buscar do contexto

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Membros</h1>
        <p className="text-slate-600">
          Gerencie membros da equipe, permissões e convites para colaborar no Balango.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Membros da Organização</h2>
          <p className="text-sm text-slate-600">
            Visualize e gerencie os membros da sua organização. Apenas administradores podem alterar permissões.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-0">
                  {members.length === 0 ? (
                    <div className="p-6">
                      <p className="text-center text-slate-500 py-8">Nenhum membro encontrado.</p>
                    </div>
                  ) : (
                    members.map((member: any) => (
                      <div
                        key={member.id}
                        className="w-full border-b border-slate-200 last:border-b-0"
                      >
                        {/* Card do usuário - ocupa 100% da largura */}
                        <div className="p-4 bg-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                              {member.nome?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 truncate">{member.nome || "Usuário"}</p>
                              <p className="text-sm text-slate-500 truncate">{member.email}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Card de ações - ocupa 100% da largura */}
                        <div className="p-4 bg-white">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                            <select
                              value={member.role}
                              onChange={(e) => handleUpdateRole(member.id, e.target.value as 'admin' | 'member')}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              disabled={!isAdmin}
                            >
                              <option value="member">Membro</option>
                              <option value="admin">Admin</option>
                            </select>
                            {isAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveMember(member.id)}
                                className="w-full sm:w-auto"
                              >
                                Remover
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

