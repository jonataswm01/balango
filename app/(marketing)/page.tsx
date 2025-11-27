"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, TrendingUp, BarChart3, Wallet, Bell, Shield, Zap, CheckCircle2, ArrowRight, Sparkles, XCircle, Smartphone, AlertCircle, TrendingDown, DollarSign, Calendar, PieChart, Target, ChevronDown } from "lucide-react"

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)]" />

      {/* Header */}
      <header className="container relative z-20 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">
              B
            </div>
            <span className="font-display text-xl font-bold text-white">BALANGO</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
              Entrar
            </Link>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/cadastro">Começar grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container relative z-10 flex flex-col items-center justify-center gap-12 py-20 md:py-32">
        <div className="flex flex-col items-center gap-8 text-center max-w-6xl">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Controle financeiro simples
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
              para quem trabalha com eventos.
            </span>
          </h1>
          
          <p className="max-w-3xl text-xl md:text-2xl text-slate-300 font-light leading-relaxed">
            Pare de perder o controle das suas finanças. O BALANGO organiza cada evento como uma venda, 
            te dando insights claros sobre quanto você realmente ganha e gasta.
          </p>

          {/* Features Icons */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-4">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-lg backdrop-blur-xl bg-blue-500/10 border border-blue-500/20">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-sm text-slate-400">Gestão de Eventos</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-lg backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-400">Insights Inteligentes</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-lg backdrop-blur-xl bg-purple-500/10 border border-purple-500/20">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-sm text-slate-400">Relatórios Completos</span>
            </div>
          </div>

          {/* Floating Cards */}
          <div className="relative w-full max-w-4xl mt-12">
            {/* Card 1 */}
            <div className="absolute -top-10 -left-10 backdrop-blur-2xl bg-slate-900/60 border border-blue-500/30 rounded-2xl p-4 shadow-2xl transform rotate-[-2deg] hidden md:block">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30"></div>
                <span className="text-xs text-slate-400">BALANGO</span>
              </div>
              <p className="text-sm text-blue-300 font-mono">"Evento de casamento registrado"</p>
              <p className="text-xs text-emerald-400 mt-2">✓ Receita: R$ 2.500,00</p>
            </div>

            {/* Card 2 */}
            <div className="absolute top-20 right-0 backdrop-blur-2xl bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-4 shadow-2xl transform rotate-[2deg] hidden md:block">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">Resultado do Mês</span>
              </div>
              <p className="text-sm text-white">Você teve um lucro de R$ 8.200,00! 🎉</p>
            </div>

            {/* Card 3 */}
            <div className="absolute -bottom-10 left-1/4 backdrop-blur-2xl bg-slate-900/60 border border-purple-500/30 rounded-2xl p-4 shadow-2xl transform rotate-[-1deg] hidden lg:block">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-semibold text-purple-300">Saldo Atual</span>
              </div>
              <p className="text-lg font-bold text-white">R$ 12.450,00</p>
            </div>
          </div>

          {/* CTA Principal */}
          <div className="mt-16 flex flex-col items-center gap-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-12 py-8 h-auto shadow-2xl">
              <Link href="/cadastro" className="flex items-center gap-3">
                TESTE GRÁTIS POR 7 DIAS
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <span>💳</span> Sem cartão de crédito. Cancele quando quiser.
            </p>
          </div>
        </div>
      </section>

      {/* Seção: Por que seu dinheiro continua sumindo? */}
      <section className="container relative z-10 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Por que você perde o controle das suas finanças?
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-slate-300 leading-relaxed">
              Se você trabalha com eventos, sabe como é difícil manter tudo organizado. 
              Anotar de cabeça ou em cadernos vira uma bagunça e você nunca sabe quanto realmente ganhou no mês.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8 shadow-xl">
              <div className="w-12 h-12 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                Anotações bagunçadas
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Você anota eventos em cadernos, planilhas soltas ou até de cabeça. 
                Quando precisa ver o resultado do mês, não encontra nada organizado.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8 shadow-xl">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-4">
                <XCircle className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                Não sabe quanto ganhou
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Você faz vários eventos no mês, mas no final não consegue calcular 
                quanto realmente lucrou depois de descontar os custos.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8 shadow-xl">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mb-4">
                <TrendingDown className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                Perde recebimentos
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Esquece de cobrar clientes ou perde a noção de quem já pagou e quem ainda está devendo. 
                O dinheiro some e você não sabe para onde foi.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8 shadow-xl">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                Sem planejamento
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Sem controle, fica difícil planejar o futuro. Você não sabe se pode investir 
                em novos equipamentos ou se precisa economizar mais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Como o BALANGO transforma seus eventos em controle */}
      <section className="container relative z-10 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Como o BALANGO organiza suas finanças
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-slate-300 leading-relaxed">
              Simples, rápido e organizado. Em três passos você tem controle total 
              das suas receitas, despesas e lucros de cada evento.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Passo 1 */}
            <div className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/20 via-slate-900/60 to-slate-900/60 border-2 border-blue-500/40 rounded-3xl p-10 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/30 border-2 border-blue-500/50 flex items-center justify-center mb-6">
                <Smartphone className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-4">
                1. Cadastre cada evento
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Registre cada evento como uma venda. Informe o cliente, data, valor recebido 
                e os custos operacionais. Tudo em um só lugar, organizado e acessível.
              </p>
              <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20"></div>
                  <span className="text-xs text-slate-400">BALANGO</span>
                </div>
                <p className="text-sm text-blue-300">Evento de casamento cadastrado! 👋</p>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/20 via-slate-900/60 to-slate-900/60 border-2 border-blue-500/40 rounded-3xl p-10 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/30 border-2 border-emerald-500/50 flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-4">
                2. Organização automática
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                O sistema organiza tudo automaticamente. Receitas, despesas, lucros e 
                pendências ficam separados e fáceis de encontrar quando você precisar.
              </p>
              <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20"></div>
                  <span className="text-xs text-slate-400">BALANGO</span>
                </div>
                <p className="text-sm text-white">"Receita de R$ 2.500 registrada"</p>
                <p className="text-xs text-emerald-400 mt-2">✓ Lucro calculado automaticamente</p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/20 via-slate-900/60 to-slate-900/60 border-2 border-blue-500/40 rounded-3xl p-10 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/30 border-2 border-purple-500/50 flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-4">
                3. Insights e relatórios
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Veja gráficos, relatórios e insights sobre seus resultados. Saiba quanto 
                ganhou no mês, quais eventos foram mais lucrativos e onde pode melhorar.
              </p>
              <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">Resultado do Mês</span>
                </div>
                <p className="text-sm text-white">Lucro de R$ 8.200,00! 🎯</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-12 py-8 h-auto shadow-2xl">
              <Link href="/cadastro" className="flex items-center gap-3">
                TESTE GRÁTIS POR 7 DIAS
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-slate-400 mt-4 flex items-center justify-center gap-2">
              <span>💳</span> Sem cartão de crédito. Depois apenas R$ 15,90/mês.
            </p>
          </div>
        </div>
      </section>

      {/* Seção: Depoimento do Jaime */}
      <section className="container relative z-10 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Quem já usa o BALANGO
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-slate-300 leading-relaxed">
              Veja como o BALANGO está transformando a gestão financeira de profissionais como você.
            </p>
          </div>

          <div className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/20 via-slate-900/60 to-slate-900/60 border-2 border-blue-500/40 rounded-3xl p-12 shadow-2xl max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-500/30 border-2 border-blue-500/50 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-400">J</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">Jaime</h3>
                <p className="text-slate-400">Técnico de Som em Eventos</p>
              </div>
            </div>
            <p className="text-slate-200 text-lg leading-relaxed mb-6">
              "Antes do BALANGO, eu anotava tudo em um caderno e no final do mês não sabia 
              quanto tinha realmente ganhado. Agora, cada evento que faço fica registrado como 
              uma venda, e eu vejo na hora quanto lucrei. Em menos de 2 meses já consegui 
              organizar minhas finanças e até planejar a compra de novos equipamentos. 
              Vale muito a pena!"
            </p>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-semibold">Economizou 8 horas por mês em organização</span>
            </div>
          </div>

          <div className="text-center mt-16">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-12 py-8 h-auto shadow-2xl">
              <Link href="/cadastro" className="flex items-center gap-3">
                TESTE GRÁTIS POR 7 DIAS
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-slate-400 mt-4 flex items-center justify-center gap-2">
              <span>💳</span> Sem cartão de crédito. Depois apenas R$ 15,90/mês.
            </p>
          </div>
        </div>
      </section>

      {/* Seção: Veja o BALANGO em ação - Grid de Insights */}
      <section className="container relative z-10 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Veja o BALANGO em ação
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-slate-300 leading-relaxed">
              Insights inteligentes que te ajudam a entender suas finanças e tomar 
              decisões melhores para o seu negócio.
            </p>
          </div>

          {/* Grid de Insights */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Insight 1 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-orange-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                <span className="text-xs font-semibold text-orange-300">Atenção</span>
              </div>
              <p className="text-white font-semibold mb-2">Recebimento pendente</p>
              <p className="text-slate-400 text-sm">Você tem R$ 1.200,00 para receber do evento de casamento</p>
            </div>

            {/* Insight 2 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-emerald-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">Crescimento</span>
              </div>
              <p className="text-white font-semibold mb-2">"Maio foi seu melhor mês"</p>
              <p className="text-slate-400 text-sm">Você teve 40% mais lucro comparado ao mês anterior</p>
            </div>

            {/* Insight 3 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-blue-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="h-5 w-5 text-blue-400" />
                <span className="text-xs font-semibold text-blue-300">Lembrete</span>
              </div>
              <p className="text-white font-semibold mb-2">Pagamento vence em 3 dias</p>
              <p className="text-slate-400 text-sm">Não esqueça de cobrar o cliente do evento de aniversário</p>
            </div>

            {/* Insight 4 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-purple-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="h-5 w-5 text-purple-400" />
                <span className="text-xs font-semibold text-purple-300">Análise</span>
              </div>
              <p className="text-white font-semibold mb-2">Eventos de casamento representam 45% da receita</p>
              <p className="text-slate-400 text-sm">Seu tipo de evento mais lucrativo este mês</p>
            </div>

            {/* Insight 5 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-emerald-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">Meta Alcançada</span>
              </div>
              <p className="text-white font-semibold mb-2">Você atingiu sua meta de economia</p>
              <p className="text-slate-400 text-sm">Parabéns! Você economizou R$ 2.500 este mês</p>
            </div>

            {/* Insight 6 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-yellow-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-yellow-400" />
                <span className="text-xs font-semibold text-yellow-300">Tendência</span>
              </div>
              <p className="text-white font-semibold mb-2">Receitas aumentaram 30% este trimestre</p>
              <p className="text-slate-400 text-sm">Seu negócio está em crescimento constante</p>
            </div>

            {/* Insight 7 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-blue-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-blue-400" />
                <span className="text-xs font-semibold text-blue-300">Saldo</span>
              </div>
              <p className="text-white font-semibold mb-2">Saldo atual: R$ 12.450,00</p>
              <p className="text-slate-400 text-sm">Disponível para investimentos e despesas</p>
            </div>

            {/* Insight 8 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-red-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-xs font-semibold text-red-300">Atenção</span>
              </div>
              <p className="text-white font-semibold mb-2">Custos operacionais acima da média</p>
              <p className="text-slate-400 text-sm">Considere revisar seus custos para aumentar o lucro</p>
            </div>

            {/* Insight 9 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-emerald-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">Recomendação</span>
              </div>
              <p className="text-white font-semibold mb-2">Você pode investir em novos equipamentos</p>
              <p className="text-slate-400 text-sm">Seu fluxo de caixa permite este investimento</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container relative z-10 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white text-center mb-6">
            Perguntas Frequentes
          </h2>
          <p className="text-center text-slate-400 mb-12">
            Tire suas dúvidas sobre o BALANGO e como ele pode ajudar você.
          </p>
          
          <div className="space-y-3">
            {[
              {
                q: "O BALANGO é só para quem trabalha com som em eventos?",
                a: "Não! O BALANGO é perfeito para qualquer profissional que trabalha com eventos ou serviços pontuais. Fotógrafos, DJs, decoradores, videomakers, técnicos de som e qualquer pessoa que precisa controlar receitas e despesas de eventos se beneficia do sistema."
              },
              {
                q: "Preciso de cartão de crédito para testar?",
                a: "Não! Você pode testar o BALANGO gratuitamente por 7 dias sem precisar informar nenhum cartão de crédito. Após o período de teste, se quiser continuar, o plano custa apenas R$ 15,90 por mês."
              },
              {
                q: "Como funciona o cadastro de eventos?",
                a: "É muito simples! Você cadastra cada evento como uma venda, informando o cliente, data, valor recebido e os custos operacionais. O sistema calcula automaticamente o lucro e organiza tudo para você ter controle total das suas finanças."
              },
              {
                q: "Posso cancelar quando quiser?",
                a: "Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas. Seus dados ficam salvos e você pode voltar quando quiser."
              },
              {
                q: "Meus dados estão seguros?",
                a: "Sim! Utilizamos criptografia e seguimos as melhores práticas de segurança para proteger suas informações financeiras. Seus dados são privados e nunca serão compartilhados com terceiros."
              },
              {
                q: "O sistema funciona no celular?",
                a: "Sim! O BALANGO é totalmente responsivo e funciona perfeitamente no celular, tablet e computador. Você pode cadastrar eventos e ver seus relatórios de qualquer lugar."
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 rounded-xl shadow-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-800/30 transition-colors"
                >
                  <h3 className="font-display text-lg md:text-xl font-bold text-white pr-4">
                    {faq.q}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 flex-shrink-0 transition-transform ${
                      openFaq === i ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-slate-300 text-base md:text-lg leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 relative z-10">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">
                  B
                </div>
                <span className="font-display text-xl font-bold text-white">BALANGO</span>
              </div>
              <p className="text-slate-400 max-w-md">
                Controle financeiro simples para quem trabalha com eventos. 
                Organize suas receitas, despesas e lucros de forma inteligente.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Links</h4>
              <div className="flex flex-col gap-2 text-sm text-slate-400">
                <Link href="/cadastro" className="hover:text-white transition-colors">Começar grátis</Link>
                <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
                <Link href="/ajuda" className="hover:text-white transition-colors">Ajuda</Link>
                <Link href="/configuracoes" className="hover:text-white transition-colors">Configurações</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>© {new Date().getFullYear()} BALANGO. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

