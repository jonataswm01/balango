"use client"

import { useState, useEffect } from "react"
import { ArrowDownCircle, ArrowUpCircle, Calendar, Wallet, Tag, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface Categoria {
  id: string
  nome: string
  tipo: "despesa" | "receita"
  cor: string
}

interface Conta {
  id: string
  nome: string
  tipo?: string
}

interface TransacaoEditando {
  id: string
  tipo: "despesa" | "receita"
  valor: number
  descricao: string
  categoria_id?: string
  conta_id?: string
  data: string
  observacoes?: string | null
}

interface NovaTransacaoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void // Callback para atualizar lista após salvar
  transacaoEditando?: TransacaoEditando | null // Transação sendo editada
}

export function NovaTransacaoDialog({ open, onOpenChange, onSuccess, transacaoEditando }: NovaTransacaoDialogProps) {
  const [formData, setFormData] = useState({
    tipo: "despesa" as "despesa" | "receita",
    valor: "",
    descricao: "",
    categoria_id: "",
    conta_id: "",
    data_transacao: new Date().toISOString().split("T")[0],
    observacoes: ""
  })
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [contas, setContas] = useState<Conta[]>([])
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // Preencher formulário quando estiver editando
  useEffect(() => {
    if (transacaoEditando && open) {
      setFormData({
        tipo: transacaoEditando.tipo,
        valor: transacaoEditando.valor.toString(),
        descricao: transacaoEditando.descricao,
        categoria_id: transacaoEditando.categoria_id || "",
        conta_id: transacaoEditando.conta_id || "",
        data_transacao: transacaoEditando.data,
        observacoes: transacaoEditando.observacoes || ""
      })
    } else if (!transacaoEditando && open) {
      // Resetar formulário para nova transação
      setFormData({
        tipo: "despesa",
        valor: "",
        descricao: "",
        categoria_id: "",
        conta_id: "",
        data_transacao: new Date().toISOString().split("T")[0],
        observacoes: ""
      })
    }
  }, [transacaoEditando, open])

  // Buscar categorias e contas do Supabase
  useEffect(() => {
    if (!open) return // Só buscar quando o dialog estiver aberto

    const fetchData = async () => {
      try {
        setLoading(true)
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error("Erro ao obter usuário:", userError)
          setLoading(false)
          return
        }

        // Buscar categorias
        const { data: categoriasData, error: categoriasError } = await supabase
          .from("categorias")
          .select("id, nome, tipo, cor")
          .eq("user_id", user.id)
          .order("ordem", { ascending: true })
          .order("nome", { ascending: true })

        if (categoriasError) {
          console.error("Erro ao buscar categorias:", categoriasError)
        } else {
          setCategorias(categoriasData || [])
        }

        // Buscar contas
        const { data: contasData, error: contasError } = await supabase
          .from("contas")
          .select("id, nome")
          .eq("user_id", user.id)
          .order("nome", { ascending: true })

        if (contasError) {
          console.error("Erro ao buscar contas:", contasError)
        } else {
          setContas(contasData || [])
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [open, supabase])

  // Resetar formulário quando o tipo muda
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      categoria_id: "" // Limpar categoria quando mudar tipo
    }))
  }, [formData.tipo])

  // Filtrar categorias por tipo
  const categoriasFiltradas = categorias.filter(
    cat => cat.tipo === formData.tipo
  )

  // Handler para salvar
  const handleSalvar = async () => {
    if (!podeSalvar) return

    try {
      setSalvando(true)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        toast({
          variant: "destructive",
          title: "Lorem",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        })
        setSalvando(false)
        return
      }

      // Preparar dados para inserção/atualização
      // O banco usa 'data' e 'user_id'
      const transacaoData: any = {
        tipo: formData.tipo,
        valor: parseFloat(formData.valor),
        descricao: formData.descricao.trim(),
        categoria_id: formData.categoria_id,
        conta_id: formData.conta_id,
        data: formData.data_transacao, // Usar 'data' que é o campo do banco
      }

      // Adicionar observações se houver
      if (formData.observacoes.trim()) {
        transacaoData.observacao = formData.observacoes.trim()
      } else {
        transacaoData.observacao = null
      }

      let error

      if (transacaoEditando) {
        // Atualizar transação existente
        const { error: updateError } = await supabase
          .from("transacoes")
          .update(transacaoData)
          .eq("id", transacaoEditando.id)
          .eq("user_id", user.id)
        
        error = updateError
      } else {
        // Criar nova transação
        transacaoData.user_id = user.id
        // Não incluir criado_via - deixar o DEFAULT do banco fazer isso
        // Se o campo não existir, não causará erro

        const { error: insertError } = await supabase
          .from("transacoes")
          .insert(transacaoData)
        
        error = insertError
      }

      if (error) {
        console.error("Erro ao salvar transação:", error)
        toast({
          variant: "destructive",
          title: "Lorem",
          description: error.message || "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        })
        setSalvando(false)
        return
      }

      // Sucesso
      toast({
        title: "Lorem!",
        description: transacaoEditando 
          ? `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`
          : `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      })

      // Resetar formulário
      setFormData({
        tipo: "despesa",
        valor: "",
        descricao: "",
        categoria_id: "",
        conta_id: "",
        data_transacao: new Date().toISOString().split("T")[0],
        observacoes: ""
      })

      // Fechar dialog
      onOpenChange(false)

      // Chamar callback para atualizar lista
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error("Erro ao salvar transação:", err)
      toast({
        variant: "destructive",
        title: "Lorem",
        description: err.message || "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      })
    } finally {
      setSalvando(false)
    }
  }

  // Validar se pode salvar
  const podeSalvar = 
    formData.valor && 
    parseFloat(formData.valor) > 0 &&
    formData.descricao.trim() !== "" &&
    formData.categoria_id !== "" &&
    formData.conta_id !== ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{transacaoEditando ? "Lorem ipsum" : "Lorem ipsum"}</DialogTitle>
          <DialogDescription>
            {transacaoEditando 
              ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
              : "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label>Lorem *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.tipo === "despesa" ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, tipo: "despesa", categoria_id: "" })}
                  className="flex-1"
                >
                  <ArrowDownCircle className="h-4 w-4 mr-1" />
                  Lorem
                </Button>
                <Button
                  type="button"
                  variant={formData.tipo === "receita" ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, tipo: "receita", categoria_id: "" })}
                  className="flex-1"
                >
                  <ArrowUpCircle className="h-4 w-4 mr-1" />
                  Ipsum
                </Button>
              </div>
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="valor">Lorem *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder="0,00"
                className="text-lg"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Lorem ipsum *</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Lorem ipsum dolor sit amet"
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="categoria">Lorem *</Label>
              <select
                id="categoria"
                value={formData.categoria_id}
                onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <option value="">Lorem ipsum</option>
                {categoriasFiltradas.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Conta */}
            <div className="space-y-2">
              <Label htmlFor="conta">Lorem *</Label>
              <select
                id="conta"
                value={formData.conta_id}
                onChange={(e) => setFormData({ ...formData, conta_id: e.target.value })}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <option value="">Lorem ipsum</option>
                {contas.map((conta) => (
                  <option key={conta.id} value={conta.id}>
                    {conta.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="data">Lorem *</Label>
              <Input
                id="data"
                type="date"
                value={formData.data_transacao}
                onChange={(e) => setFormData({ ...formData, data_transacao: e.target.value })}
              />
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Lorem ipsum</Label>
              <textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Lorem ipsum dolor sit amet"
                className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={salvando}
          >
            Lorem
          </Button>
          <Button
            onClick={handleSalvar}
            disabled={!podeSalvar || salvando || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {salvando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Lorem...
              </>
            ) : transacaoEditando ? (
              "Lorem ipsum"
            ) : (
              "Lorem ipsum"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

