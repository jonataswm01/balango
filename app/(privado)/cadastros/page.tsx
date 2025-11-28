"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Users, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { clientsApi, techniciansApi } from "@/lib/api/client"
import { Client } from "@/lib/types/database"
import { Technician } from "@/lib/types/database"
import { ClientCard } from "@/components/clients/client-card"
import { ClientModal } from "@/components/clients/client-modal"
import { TechnicianCard } from "@/components/technicians/technician-card"
import { TechnicianModal } from "@/components/technicians/technician-modal"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { cn } from "@/lib/utils"

type TabType = "clients" | "technicians"

export default function CadastrosPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>("clients")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Estados para Clientes
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [showClientModal, setShowClientModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [togglingClient, setTogglingClient] = useState<Client | null>(null)
  
  // Estados para Técnicos
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>([])
  const [showTechnicianModal, setShowTechnicianModal] = useState(false)
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null)
  const [deletingTechnician, setDeletingTechnician] = useState<Technician | null>(null)
  const [togglingTechnician, setTogglingTechnician] = useState<Technician | null>(null)

  // Carregar clientes
  const loadClients = async () => {
    try {
      setLoading(true)
      const data = await clientsApi.getAll(true) // Incluir inativos
      setClients(data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar clientes",
        description: error.message || "Não foi possível carregar os clientes.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Carregar técnicos
  const loadTechnicians = async () => {
    try {
      setLoading(true)
      const data = await techniciansApi.getAll(true) // Incluir inativos
      setTechnicians(data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar técnicos",
        description: error.message || "Não foi possível carregar os técnicos.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    if (activeTab === "clients") {
      loadClients()
    } else {
      loadTechnicians()
    }
  }, [activeTab])

  // Filtrar clientes por busca
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClients(clients)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(term) ||
          client.email?.toLowerCase().includes(term) ||
          client.phone?.includes(term) ||
          client.document?.includes(term)
      )
      setFilteredClients(filtered)
    }
  }, [clients, searchTerm])

  // Filtrar técnicos por busca
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTechnicians(technicians)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = technicians.filter(
        (technician) =>
          technician.name.toLowerCase().includes(term) ||
          technician.nickname?.toLowerCase().includes(term) ||
          technician.email?.toLowerCase().includes(term) ||
          technician.phone?.includes(term) ||
          technician.document?.includes(term)
      )
      setFilteredTechnicians(filtered)
    }
  }, [technicians, searchTerm])

  // Handlers para Clientes
  const handleCreateClient = () => {
    setEditingClient(null)
    setShowClientModal(true)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setShowClientModal(true)
  }

  const handleDeleteClient = (client: Client) => {
    setDeletingClient(client)
  }

  const confirmDeleteClient = async () => {
    if (!deletingClient) return

    try {
      await clientsApi.delete(deletingClient.id)
      toast({
        title: "Cliente excluído!",
        description: "O cliente foi excluído com sucesso.",
      })
      loadClients()
      setDeletingClient(null)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir o cliente.",
      })
    }
  }

  const handleToggleClientActive = (client: Client) => {
    setTogglingClient(client)
  }

  const confirmToggleClientActive = async () => {
    if (!togglingClient) return

    try {
      await clientsApi.update(togglingClient.id, {
        active: !togglingClient.active,
      })
      toast({
        title: togglingClient.active ? "Cliente desativado!" : "Cliente ativado!",
        description: `O cliente foi ${togglingClient.active ? "desativado" : "ativado"} com sucesso.`,
      })
      loadClients()
      setTogglingClient(null)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar o cliente.",
      })
    }
  }

  const handleClientModalSuccess = () => {
    loadClients()
    setShowClientModal(false)
    setEditingClient(null)
  }

  // Handlers para Técnicos
  const handleCreateTechnician = () => {
    setEditingTechnician(null)
    setShowTechnicianModal(true)
  }

  const handleEditTechnician = (technician: Technician) => {
    setEditingTechnician(technician)
    setShowTechnicianModal(true)
  }

  const handleDeleteTechnician = (technician: Technician) => {
    setDeletingTechnician(technician)
  }

  const confirmDeleteTechnician = async () => {
    if (!deletingTechnician) return

    try {
      await techniciansApi.delete(deletingTechnician.id)
      toast({
        title: "Técnico excluído!",
        description: "O técnico foi excluído com sucesso.",
      })
      loadTechnicians()
      setDeletingTechnician(null)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir o técnico.",
      })
    }
  }

  const handleToggleTechnicianActive = (technician: Technician) => {
    setTogglingTechnician(technician)
  }

  const confirmToggleTechnicianActive = async () => {
    if (!togglingTechnician) return

    try {
      await techniciansApi.update(togglingTechnician.id, {
        active: !togglingTechnician.active,
      })
      toast({
        title: togglingTechnician.active ? "Técnico desativado!" : "Técnico ativado!",
        description: `O técnico foi ${togglingTechnician.active ? "desativado" : "ativado"} com sucesso.`,
      })
      loadTechnicians()
      setTogglingTechnician(null)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar o técnico.",
      })
    }
  }

  const handleTechnicianModalSuccess = () => {
    loadTechnicians()
    setShowTechnicianModal(false)
    setEditingTechnician(null)
  }

  // Resetar busca ao trocar de aba
  useEffect(() => {
    setSearchTerm("")
  }, [activeTab])

  const currentItemsCount = activeTab === "clients" ? filteredClients.length : filteredTechnicians.length
  const totalItemsCount = activeTab === "clients" ? clients.length : technicians.length

  return (
    // Container Principal da Página - Define padding e espaçamento vertical entre elementos
    <div className="p-6 space-y-6">
      {/* Header - Container do título e subtítulo da página */}
      {/* Container flexível responsivo: coluna no mobile, linha no desktop */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Container do texto - Título "Cadastros" e subtítulo */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Cadastros
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Gerencie seus clientes e técnicos
          </p>
        </div>
      </div>

      {/* Grupo Principal - Container que agrupa todo o conteúdo funcional da página */}
      {/* Ocupa 100% da largura, centraliza itens verticalmente, espaçamento entre elementos */}
      <div className="w-full flex flex-col items-center space-y-6">
        {/* Tabs - Container das abas de navegação (Clientes/Técnicos) */}
        {/* Flex horizontal, com gap entre abas, borda inferior, largura máxima 7xl, centralizado */}
        <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 w-full max-w-7xl justify-center">
        <button
          onClick={() => setActiveTab("clients")}
          className={cn(
            "flex-1 md:flex-none md:px-10 py-4 font-medium text-base transition-colors border-b-2 -mb-px text-center",
            activeTab === "clients"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          )}
        >
          {/* Container interno do botão - Organiza ícone, texto e badge de contador */}
          <div className="flex items-center justify-center gap-3">
            <Users className="h-5 w-5" />
            <span className="hidden sm:inline">Clientes</span>
            <span className="sm:hidden">Clientes</span>
            {/* Badge com contador - Só aparece se houver clientes cadastrados */}
            {clients.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-200 dark:bg-slate-700">
                {clients.length}
              </span>
            )}
          </div>
        </button>
        {/* Botão da aba Técnicos */}
        <button
          onClick={() => setActiveTab("technicians")}
          className={cn(
            "flex-1 md:flex-none md:px-10 py-4 font-medium text-base transition-colors border-b-2 -mb-px text-center",
            activeTab === "technicians"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          )}
        >
          {/* Container interno do botão - Organiza ícone, texto e badge de contador */}
          <div className="flex items-center justify-center gap-3">
            <Wrench className="h-5 w-5" />
            <span className="hidden sm:inline">Técnicos</span>
            <span className="sm:hidden">Técnicos</span>
            {/* Badge com contador - Só aparece se houver técnicos cadastrados */}
            {technicians.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-200 dark:bg-slate-700">
                {technicians.length}
              </span>
            )}
          </div>
        </button>
        </div>

        {/* Barra de Busca e Botão Adicionar - Container flexível responsivo */}
        {/* Coluna no mobile, linha no desktop, largura máxima 6xl, centralizado */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full max-w-4xl">
        {/* Container do campo de busca - Posição relativa para posicionar ícone de lupa */}
        <div className="relative w-full sm:flex-1 sm:max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-600" />
          <Input
            type="text"
            placeholder={
              activeTab === "clients"
                ? "Buscar clientes por nome, email, telefone..."
                : "Buscar técnicos por nome, apelido, email..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Button
          onClick={
            activeTab === "clients" ? handleCreateClient : handleCreateTechnician
          }
          className="hidden sm:flex gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          <Plus className="h-4 w-4" />
          {activeTab === "clients" ? "Novo Cliente" : "Novo Técnico"}
        </Button>
        </div>

        {/* Contador de resultados - Só aparece quando há busca ativa */}
        {/* Mostra quantos itens estão sendo exibidos vs total */}
        {searchTerm && (
          <p className="text-sm text-slate-600 dark:text-slate-400 w-full max-w-5xl">
          {currentItemsCount === totalItemsCount
            ? `Mostrando todos os ${totalItemsCount} ${activeTab === "clients" ? "clientes" : "técnicos"}`
            : `Mostrando ${currentItemsCount} de ${totalItemsCount} ${activeTab === "clients" ? "clientes" : "técnicos"}`}
          </p>
        )}

        {/* Lista de Clientes - Renderizada apenas quando a aba Clientes está ativa */}
        {activeTab === "clients" && (
        <>
          {/* Estado de Loading - Spinner centralizado enquanto carrega dados */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner size="lg" text="Carregando clientes..." />
            </div>
          ) : filteredClients.length === 0 ? (
            // Estado Vazio - Mensagem quando não há clientes ou busca não retornou resultados
            <EmptyState
              title={
                searchTerm
                  ? "Nenhum cliente encontrado"
                  : "Nenhum cliente cadastrado"
              }
              description={
                searchTerm
                  ? "Tente ajustar os termos de busca."
                  : "Comece criando seu primeiro cliente."
              }
              icon={Users}
              actionLabel={!searchTerm ? "Criar Cliente" : undefined}
              onAction={!searchTerm ? handleCreateClient : undefined}
            />
          ) : (
            // Grid de Cards de Clientes - Responsivo e centralizado
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto justify-items-center">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onEdit={() => handleEditClient(client)}
                  onDelete={() => handleDeleteClient(client)}
                  onToggleActive={() => handleToggleClientActive(client)}
                />
              ))}
            </div>
          )}
          </>
        )}

        {/* Lista de Técnicos - Renderizada apenas quando a aba Técnicos está ativa */}
        {activeTab === "technicians" && (
        <>
          {/* Estado de Loading - Spinner centralizado enquanto carrega dados */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner size="lg" text="Carregando técnicos..." />
            </div>
          ) : filteredTechnicians.length === 0 ? (
            // Estado Vazio - Mensagem quando não há técnicos ou busca não retornou resultados
            <EmptyState
              title={
                searchTerm
                  ? "Nenhum técnico encontrado"
                  : "Nenhum técnico cadastrado"
              }
              description={
                searchTerm
                  ? "Tente ajustar os termos de busca."
                  : "Comece criando seu primeiro técnico."
              }
              icon={Wrench}
              actionLabel={!searchTerm ? "Criar Técnico" : undefined}
              onAction={!searchTerm ? handleCreateTechnician : undefined}
            />
          ) : (
            // Grid de Cards de Técnicos - Responsivo e centralizado
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto justify-items-center">
              {filteredTechnicians.map((technician) => (
                <TechnicianCard
                  key={technician.id}
                  technician={technician}
                  onEdit={() => handleEditTechnician(technician)}
                  onDelete={() => handleDeleteTechnician(technician)}
                  onToggleActive={() => handleToggleTechnicianActive(technician)}
                />
              ))}
            </div>
          )}
          </>
        )}
      </div>

      {/* FAB (Floating Action Button) para Mobile - Botão flutuante fixo no canto inferior direito */}
      {/* Visível apenas em telas menores (lg:hidden) */}
      <Button
        onClick={
          activeTab === "clients" ? handleCreateClient : handleCreateTechnician
        }
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg lg:hidden bg-blue-600 hover:bg-blue-700 text-white z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Modais de Cliente */}
      <ClientModal
        open={showClientModal}
        onOpenChange={setShowClientModal}
        onSuccess={handleClientModalSuccess}
        client={editingClient}
      />

      <ConfirmDialog
        open={!!deletingClient}
        onOpenChange={(open) => !open && setDeletingClient(null)}
        title="Excluir Cliente"
        description="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmDeleteClient}
        variant="destructive"
      />

      <ConfirmDialog
        open={!!togglingClient}
        onOpenChange={(open) => !open && setTogglingClient(null)}
        title={togglingClient?.active ? "Desativar Cliente" : "Ativar Cliente"}
        description={
          togglingClient?.active
            ? "Tem certeza que deseja desativar este cliente? Ele não aparecerá mais nas listas de seleção."
            : "Tem certeza que deseja ativar este cliente? Ele voltará a aparecer nas listas de seleção."
        }
        confirmLabel={togglingClient?.active ? "Desativar" : "Ativar"}
        cancelLabel="Cancelar"
        onConfirm={confirmToggleClientActive}
        variant="default"
      />

      {/* Modais de Técnico */}
      <TechnicianModal
        open={showTechnicianModal}
        onOpenChange={setShowTechnicianModal}
        onSuccess={handleTechnicianModalSuccess}
        technician={editingTechnician}
      />

      <ConfirmDialog
        open={!!deletingTechnician}
        onOpenChange={(open) => !open && setDeletingTechnician(null)}
        title="Excluir Técnico"
        description="Tem certeza que deseja excluir este técnico? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmDeleteTechnician}
        variant="destructive"
      />

      <ConfirmDialog
        open={!!togglingTechnician}
        onOpenChange={(open) => !open && setTogglingTechnician(null)}
        title={togglingTechnician?.active ? "Desativar Técnico" : "Ativar Técnico"}
        description={
          togglingTechnician?.active
            ? "Tem certeza que deseja desativar este técnico? Ele não aparecerá mais nas listas de seleção."
            : "Tem certeza que deseja ativar este técnico? Ele voltará a aparecer nas listas de seleção."
        }
        confirmLabel={togglingTechnician?.active ? "Desativar" : "Ativar"}
        cancelLabel="Cancelar"
        onConfirm={confirmToggleTechnicianActive}
        variant="default"
      />
    </div>
  )
}
