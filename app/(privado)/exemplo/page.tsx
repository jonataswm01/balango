"use client"

/**
 * PÁGINA DE EXEMPLO / BASE
 * 
 * Esta página serve como template/base para criar novas páginas no sistema.
 * Copie este arquivo e adapte conforme necessário.
 * 
 * Estrutura básica:
 * - Imports necessários
 * - Estados (useState)
 * - Efeitos (useEffect)
 * - Funções auxiliares
 * - Renderização
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Edit, Trash2, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// ============================================
// TIPOS E INTERFACES
// ============================================
// Defina aqui os tipos TypeScript que sua página vai usar
interface ExemploItem {
  id: string
  nome: string
  descricao?: string
  created_at: string
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function ExemploPage() {
  // ============================================
  // ESTADOS (useState)
  // ============================================
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [items, setItems] = useState<ExemploItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [itemEditando, setItemEditando] = useState<string | null>(null)
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
  })

  // ============================================
  // HOOKS E CLIENTES
  // ============================================
  const supabase = createClient()
  const { toast } = useToast()

  // ============================================
  // FUNÇÕES DE BUSCA DE DADOS
  // ============================================
  /**
   * Busca dados do banco de dados
   * Adapte esta função conforme sua necessidade
   */
  const fetchData = async () => {
    try {
      setLoading(true)

      // Obter usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("Erro ao obter usuário:", userError)
        setLoading(false)
        return
      }

      // Exemplo: Buscar dados de uma tabela
      // Substitua "tabela_exemplo" pela sua tabela real
      const { data, error } = await supabase
        .from("tabela_exemplo") // ← ALTERE AQUI
        .select("*")
        .eq("user_id", user.id) // ou "usuario_id" dependendo do seu schema
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar dados:", error)
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os dados.",
        })
        return
      }

      setItems(data || [])
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao carregar dados.",
      })
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // FUNÇÕES DE AÇÃO (CRUD)
  // ============================================
  /**
   * Abre o formulário para criar novo item
   */
  const handleNovoItem = () => {
    setItemEditando(null)
    setFormData({
      nome: "",
      descricao: "",
    })
    setShowForm(true)
  }

  /**
   * Abre o formulário para editar item existente
   */
  const handleEditar = (item: ExemploItem) => {
    setItemEditando(item.id)
    setFormData({
      nome: item.nome,
      descricao: item.descricao || "",
    })
    setShowForm(true)
  }

  /**
   * Salva o item (cria ou atualiza)
   */
  const handleSalvar = async () => {
    // Validação básica
    if (!formData.nome.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
      })
      return
    }

    try {
      setSalvando(true)

      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao obter usuário.",
        })
        setSalvando(false)
        return
      }

      const itemData = {
        user_id: user.id, // ou "usuario_id" dependendo do seu schema
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
      }

      if (itemEditando) {
        // Atualizar item existente
        const { error } = await supabase
          .from("tabela_exemplo") // ← ALTERE AQUI
          .update(itemData)
          .eq("id", itemEditando)
          .eq("user_id", user.id)

        if (error) throw error

        toast({
          title: "Sucesso!",
          description: "Item atualizado com sucesso.",
        })
      } else {
        // Criar novo item
        const { error } = await supabase
          .from("tabela_exemplo") // ← ALTERE AQUI
          .insert(itemData)

        if (error) throw error

        toast({
          title: "Sucesso!",
          description: "Item criado com sucesso.",
        })
      }

      // Recarregar dados
      await fetchData()

      // Fechar formulário
      setShowForm(false)
      setItemEditando(null)
      setFormData({
        nome: "",
        descricao: "",
      })
    } catch (error: any) {
      console.error("Erro ao salvar item:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível salvar o item.",
      })
    } finally {
      setSalvando(false)
    }
  }

  /**
   * Exclui um item
   */
  const handleExcluir = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) {
      return
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao obter usuário.",
        })
        return
      }

      const { error } = await supabase
        .from("tabela_exemplo") // ← ALTERE AQUI
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Sucesso!",
        description: "Item excluído com sucesso.",
      })

      // Recarregar dados
      await fetchData()
    } catch (error: any) {
      console.error("Erro ao excluir item:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível excluir o item.",
      })
    }
  }

  // ============================================
  // EFEITOS (useEffect)
  // ============================================
  /**
   * Busca dados quando o componente montar
   */
  useEffect(() => {
    fetchData()
  }, [supabase, toast])

  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================
  /**
   * Filtra itens baseado no termo de busca
   */
  const itemsFiltrados = items.filter((item) => {
    if (!searchTerm) return true
    const termo = searchTerm.toLowerCase()
    return (
      item.nome.toLowerCase().includes(termo) ||
      item.descricao?.toLowerCase().includes(termo)
    )
  })

  // ============================================
  // RENDERIZAÇÃO
  // ============================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Título da Página</h1>
          <p className="text-slate-600 mt-1">
            Descrição da página ou instruções
          </p>
        </div>
        <Button onClick={handleNovoItem} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Item
        </Button>
      </div>

      {/* Barra de Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-slate-500">Carregando...</p>
            </div>
          </CardContent>
        </Card>
      ) : itemsFiltrados.length === 0 ? (
        /* Estado Vazio */
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-500 mb-4">Nenhum item encontrado</p>
            <Button onClick={handleNovoItem}>Criar Primeiro Item</Button>
          </CardContent>
        </Card>
      ) : (
        /* Lista de Itens */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {itemsFiltrados.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{item.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                {item.descricao && (
                  <p className="text-sm text-slate-600 mb-4">{item.descricao}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditar(item)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExcluir(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal/Dialog de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {itemEditando ? "Editar Item" : "Novo Item"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Digite o nome..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  placeholder="Digite a descrição..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setItemEditando(null)
                  }}
                  disabled={salvando}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSalvar} disabled={salvando}>
                  {salvando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    itemEditando ? "Atualizar" : "Criar"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

