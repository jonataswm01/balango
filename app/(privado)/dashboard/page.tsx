"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DonutChart } from "@/components/dashboard/donut-chart"
import { TrendLineChart } from "@/components/dashboard/line-chart"
import { AICard } from "@/components/dashboard/ai-card"
import { NovaTransacaoDialog } from "@/components/transacoes/nova-transacao-dialog"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Wallet, Target, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface CategoriaData {
  name: string
  value: number
  color: string
}

export default function DashboardPage() {
  const [showNovaTransacao, setShowNovaTransacao] = useState(false)
  const [loading, setLoading] = useState(true)
  const [receitasMes, setReceitasMes] = useState(0)
  const [despesasMes, setDespesasMes] = useState(0)
  const [metaEconomia, setMetaEconomia] = useState(0)
  const [categoriasData, setCategoriasData] = useState<CategoriaData[]>([])
  const [tendenciaData, setTendenciaData] = useState<Array<{ data: string; receitas: number; despesas: number }>>([])
  const [variacaoReceitas, setVariacaoReceitas] = useState<number | null>(null)
  const [variacaoDespesas, setVariacaoDespesas] = useState<number | null>(null)
  const [diasFiltro, setDiasFiltro] = useState<number>(5) // Padrão: 5 dias
  const supabase = createClient()
  const { toast } = useToast()

  // Calcular valores derivados
  const saldoAtual = receitasMes - despesasMes
  const economiaAtual = saldoAtual
  const percentualMeta = metaEconomia > 0 ? (economiaAtual / metaEconomia) * 100 : 0

  // Função para buscar dados (reutilizável)
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Obter usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error("Erro ao obter usuário:", userError)
        setLoading(false)
        return
      }

      // Data atual para filtrar o mês
      const hoje = new Date()
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

      // Buscar meta de economia do perfil
      const { data: perfil } = await supabase
        .from("users")
        .select("meta_economia_mensal")
        .eq("id", user.id)
        .single()

      if (perfil?.meta_economia_mensal) {
        setMetaEconomia(Number(perfil.meta_economia_mensal))
      }

      // Buscar transações do mês atual
      const { data: transacoes, error: transacoesError } = await supabase
        .from("transacoes")
        .select(`
          tipo,
          valor,
          categoria_id,
          categorias (
            nome,
            cor
          )
        `)
        .eq("user_id", user.id)
        .gte("data", primeiroDiaMes.toISOString().split("T")[0])
        .lte("data", ultimoDiaMes.toISOString().split("T")[0])

      if (transacoesError) {
        console.error("Erro ao buscar transações:", transacoesError)
        setLoading(false)
        return
      }

      // Calcular receitas e despesas
      let receitas = 0
      let despesas = 0
      const categoriasMap = new Map<string, { nome: string; valor: number; cor: string }>()

      transacoes?.forEach((transacao) => {
        const valor = Number(transacao.valor)
        
        if (transacao.tipo === "receita") {
          receitas += valor
        } else {
          despesas += valor
          
          // Agrupar por categoria para o gráfico
          if (transacao.categoria_id && transacao.categorias) {
            const categoriaId = transacao.categoria_id
            const categoriaNome = (transacao.categorias as any).nome
            const categoriaCor = (transacao.categorias as any).cor || "#6B7280"
            
            const atual = categoriasMap.get(categoriaId) || {
              nome: categoriaNome,
              valor: 0,
              cor: categoriaCor,
            }
            atual.valor += valor
            categoriasMap.set(categoriaId, atual)
          }
        }
      })

      setReceitasMes(receitas)
      setDespesasMes(despesas)

      // Converter map para array e ordenar por valor
      const categoriasArray: CategoriaData[] = Array.from(categoriasMap.values())
        .map((cat) => ({
          name: cat.nome,
          value: cat.valor,
          color: cat.cor,
        }))
        .sort((a, b) => b.value - a.value)

      setCategoriasData(categoriasArray)

      // Buscar dados para tendência (últimos N dias conforme filtro)
      // Reutilizar a variável 'hoje' já definida acima
      const diasAtras = new Date(hoje)
      diasAtras.setDate(diasAtras.getDate() - diasFiltro)
      
      const { data: transacoesTendencia, error: tendenciaError } = await supabase
        .from("transacoes")
        .select("tipo, valor, data")
        .eq("user_id", user.id)
        .gte("data", diasAtras.toISOString().split("T")[0])
        .lte("data", hoje.toISOString().split("T")[0])
        .order("data", { ascending: true })

      if (!tendenciaError && transacoesTendencia) {
        // Agrupar por dia
        const dadosPorDia = new Map<string, { receitas: number; despesas: number }>()
        
        // Inicializar todos os dias do período selecionado
        for (let i = diasFiltro - 1; i >= 0; i--) {
          const data = new Date(hoje)
          data.setDate(data.getDate() - i)
          const dataStr = data.toISOString().split("T")[0]
          dadosPorDia.set(dataStr, { receitas: 0, despesas: 0 })
        }

        // Preencher com dados reais
        transacoesTendencia.forEach((transacao) => {
          const dataStr = transacao.data
          const valor = Number(transacao.valor)
          const atual = dadosPorDia.get(dataStr) || { receitas: 0, despesas: 0 }
          
          if (transacao.tipo === "receita") {
            atual.receitas += valor
          } else {
            atual.despesas += valor
          }
          
          dadosPorDia.set(dataStr, atual)
        })

        // Converter para array e formatar
        const tendenciaArray = Array.from(dadosPorDia.entries())
          .map(([data, valores]) => ({
            data,
            receitas: valores.receitas,
            despesas: valores.despesas,
          }))
          .sort((a, b) => a.data.localeCompare(b.data))

        setTendenciaData(tendenciaArray)

        // Calcular variação: metade do período vs metade anterior
        const metade = Math.floor(diasFiltro / 2)
        const ultimaMetade = tendenciaArray.slice(-metade)
        const primeiraMetade = tendenciaArray.slice(0, metade)

        const receitasUltimaMetade = ultimaMetade.reduce((sum, d) => sum + d.receitas, 0)
        const receitasPrimeiraMetade = primeiraMetade.reduce((sum, d) => sum + d.receitas, 0)
        const despesasUltimaMetade = ultimaMetade.reduce((sum, d) => sum + d.despesas, 0)
        const despesasPrimeiraMetade = primeiraMetade.reduce((sum, d) => sum + d.despesas, 0)

        // Calcular variação percentual
        if (receitasPrimeiraMetade > 0) {
          const variacao = ((receitasUltimaMetade - receitasPrimeiraMetade) / receitasPrimeiraMetade) * 100
          setVariacaoReceitas(variacao)
        } else if (receitasUltimaMetade > 0) {
          setVariacaoReceitas(100) // 100% de aumento (de 0 para algo)
        } else {
          setVariacaoReceitas(0)
        }

        if (despesasPrimeiraMetade > 0) {
          const variacao = ((despesasUltimaMetade - despesasPrimeiraMetade) / despesasPrimeiraMetade) * 100
          setVariacaoDespesas(variacao)
        } else if (despesasUltimaMetade > 0) {
          setVariacaoDespesas(100) // 100% de aumento (de 0 para algo)
        } else {
          setVariacaoDespesas(0)
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error)
      toast({
        variant: "destructive",
        title: "Lorem",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Buscar dados quando o componente montar ou quando o filtro de dias mudar
  useEffect(() => {
    fetchDashboardData()
  }, [supabase, toast, diasFiltro])

  // Função para atualizar dados após salvar nova transação
  const handleTransacaoSalva = () => {
    fetchDashboardData()
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Lorem ipsum dolor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Botão de Ação Rápida */}
      <div className="flex justify-end">
        <Button 
          onClick={() => setShowNovaTransacao(true)}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" />
          Lorem ipsum
        </Button>
      </div>
      {/* Cards de Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Receitas do Mês */}
        <Card className="border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Lorem ipsum
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(receitasMes)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {variacaoReceitas !== null ? (
                <span className={variacaoReceitas >= 0 ? "text-emerald-600" : "text-red-600"}>
                  {variacaoReceitas >= 0 ? "+" : ""}
                  {variacaoReceitas.toFixed(1)}% vs lorem ipsum
                </span>
              ) : (
                "Lorem ipsum dolor sit amet"
              )}
            </p>
          </CardContent>
        </Card>

        {/* Despesas do Mês */}
        <Card className="border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Lorem ipsum
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(despesasMes)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {variacaoDespesas !== null ? (
                <span className={variacaoDespesas <= 0 ? "text-emerald-600" : "text-red-600"}>
                  {variacaoDespesas >= 0 ? "+" : ""}
                  {variacaoDespesas.toFixed(1)}% vs lorem ipsum
                </span>
              ) : (
                "Lorem ipsum dolor sit amet"
              )}
            </p>
          </CardContent>
        </Card>

        {/* Saldo Atual */}
        <Card className="border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Lorem ipsum
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                saldoAtual >= 0 ? "text-emerald-600" : "text-orange-600"
              }`}
            >
              {formatCurrency(saldoAtual)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {saldoAtual >= 0 ? "Lorem ipsum" : "Lorem ipsum"}
            </p>
          </CardContent>
        </Card>

        {/* Meta de Economia */}
        <Card className="border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Lorem ipsum
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(economiaAtual)}
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">Lorem</span>
                <span className="font-semibold text-slate-700">
                  {Math.min(percentualMeta, 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(percentualMeta, 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Gráficos e IA */}
      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        {/* Donut Chart - Categorias */}
        <div className="lg:col-span-2">
          <DonutChart
            data={categoriasData}
            title="Lorem ipsum dolor"
            height={400}
          />
        </div>

        {/* Card de IA */}
        <div className="lg:col-span-1">
          <AICard />
        </div>
      </div>

      {/* Gráfico de Tendência */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lorem ipsum dolor sit amet</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="dias-filtro" className="text-sm text-slate-600">
                Lorem:
              </Label>
              <select
                id="dias-filtro"
                value={diasFiltro}
                onChange={(e) => setDiasFiltro(Number(e.target.value))}
                className="flex h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <option value={3}>3 lorem</option>
                <option value={5}>5 lorem</option>
                <option value={7}>7 lorem</option>
                <option value={14}>14 lorem</option>
                <option value={30}>30 lorem</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TrendLineChart data={tendenciaData} />
        </CardContent>
      </Card>

      {/* Dialog Nova Transação */}
      <NovaTransacaoDialog 
        open={showNovaTransacao} 
        onOpenChange={setShowNovaTransacao}
        onSuccess={handleTransacaoSalva}
      />
    </div>
  )
}

