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
              L
            </div>
            <span className="font-display text-xl font-bold text-white">LOREM</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
              Lorem
            </Link>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/cadastro">Lorem ipsum</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container relative z-10 flex flex-col items-center justify-center gap-12 py-20 md:py-32">
        <div className="flex flex-col items-center gap-8 text-center max-w-6xl">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Lorem ipsum dolor sit amet.
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
              Consectetur adipiscing elit.
            </span>
          </h1>
          
          <p className="max-w-3xl text-xl md:text-2xl text-slate-300 font-light leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>

          {/* Features Icons */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-4">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-lg backdrop-blur-xl bg-blue-500/10 border border-blue-500/20">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-sm text-slate-400">Lorem</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-lg backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/20">
                <Sparkles className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-400">Ipsum</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-lg backdrop-blur-xl bg-purple-500/10 border border-purple-500/20">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-sm text-slate-400">Dolor</span>
            </div>
          </div>

          {/* Floating Cards */}
          <div className="relative w-full max-w-4xl mt-12">
            {/* Card 1 */}
            <div className="absolute -top-10 -left-10 backdrop-blur-2xl bg-slate-900/60 border border-blue-500/30 rounded-2xl p-4 shadow-2xl transform rotate-[-2deg] hidden md:block">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30"></div>
                <span className="text-xs text-slate-400">LOREM</span>
              </div>
              <p className="text-sm text-blue-300 font-mono">"Lorem ipsum dolor sit amet"</p>
              <p className="text-xs text-emerald-400 mt-2">✓ Lorem ipsum</p>
            </div>

            {/* Card 2 */}
            <div className="absolute top-20 right-0 backdrop-blur-2xl bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-4 shadow-2xl transform rotate-[2deg] hidden md:block">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">Lorem Ipsum</span>
              </div>
              <p className="text-sm text-white">Lorem ipsum dolor sit amet, consectetur adipiscing elit! 🎉</p>
            </div>

            {/* Card 3 */}
            <div className="absolute -bottom-10 left-1/4 backdrop-blur-2xl bg-slate-900/60 border border-purple-500/30 rounded-2xl p-4 shadow-2xl transform rotate-[-1deg] hidden lg:block">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-semibold text-purple-300">Lorem</span>
              </div>
              <p className="text-lg font-bold text-white">R$ 1.250,00</p>
            </div>
          </div>

          {/* CTA Principal */}
          <div className="mt-16 flex flex-col items-center gap-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-12 py-8 h-auto shadow-2xl">
              <Link href="/cadastro" className="flex items-center gap-3">
                LOREM IPSUM
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <span>💳</span> Lorem ipsum dolor sit amet.
            </p>
          </div>
        </div>
      </section>

      {/* Seção: Por que seu dinheiro continua sumindo? */}
      <section className="container relative z-10 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Lorem ipsum dolor sit amet?
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-slate-300 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8 shadow-xl">
              <div className="w-12 h-12 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                Lorem ipsum
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8 shadow-xl">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-4">
                <XCircle className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                Dolor sit amet
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8 shadow-xl">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mb-4">
                <TrendingDown className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                Consectetur
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8 shadow-xl">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                Adipiscing elit
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Como o CONTRAL transforma suas conversas em controle */}
      <section className="container relative z-10 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Lorem ipsum dolor sit amet
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-slate-300 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, 
              ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Passo 1 */}
            <div className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/20 via-slate-900/60 to-slate-900/60 border-2 border-blue-500/40 rounded-3xl p-10 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/30 border-2 border-blue-500/50 flex items-center justify-center mb-6">
                <Smartphone className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-4">
                Lorem ipsum dolor
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20"></div>
                  <span className="text-xs text-slate-400">LOREM</span>
                </div>
                <p className="text-sm text-blue-300">Lorem ipsum dolor sit amet! 👋</p>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/20 via-slate-900/60 to-slate-900/60 border-2 border-blue-500/40 rounded-3xl p-10 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/30 border-2 border-emerald-500/50 flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-4">
                Consectetur adipiscing
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20"></div>
                  <span className="text-xs text-slate-400">Lorem</span>
                </div>
                <p className="text-sm text-white">"Lorem ipsum dolor sit amet"</p>
                <p className="text-xs text-emerald-400 mt-2">✓ Lorem ipsum</p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/20 via-slate-900/60 to-slate-900/60 border-2 border-blue-500/40 rounded-3xl p-10 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/30 border-2 border-purple-500/50 flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-4">
                Sed do eiusmod
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">Lorem</span>
                </div>
                <p className="text-sm text-white">Lorem ipsum dolor sit amet! 🎯</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-12 py-8 h-auto shadow-2xl">
              <Link href="/cadastro" className="flex items-center gap-3">
                LOREM IPSUM
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-slate-400 mt-4 flex items-center justify-center gap-2">
              <span>💳</span> Lorem ipsum dolor sit amet.
            </p>
          </div>
        </div>
      </section>

      {/* Seção: Veja o que o CONTRAL tem a dizer sobre suas finanças */}
      <section className="container relative z-10 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Lorem ipsum dolor sit amet
            </h2>
          </div>

          <div className="text-center mb-16">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-12 py-8 h-auto shadow-2xl">
              <Link href="/cadastro" className="flex items-center gap-3">
                LOREM IPSUM
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-slate-400 mt-4 flex items-center justify-center gap-2">
              <span>💳</span> Lorem ipsum dolor sit amet.
            </p>
          </div>
        </div>
      </section>

      {/* Seção: Veja o CONTRAL em ação - Grid de Insights */}
      <section className="container relative z-10 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Lorem ipsum dolor sit
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-slate-300 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, 
              ut enim ad minim veniam, quis nostrud exercitation.
            </p>
          </div>

          {/* Grid de Insights */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Insight 1 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-orange-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                <span className="text-xs font-semibold text-orange-300">Lorem Ipsum</span>
              </div>
              <p className="text-white font-semibold mb-2">Lorem ipsum dolor sit amet</p>
              <p className="text-slate-400 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
            </div>

            {/* Insight 2 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-emerald-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">Dolor Sit</span>
              </div>
              <p className="text-white font-semibold mb-2">"Lorem ipsum" consectetur adipiscing elit</p>
              <p className="text-slate-400 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
            </div>

            {/* Insight 3 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-blue-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="h-5 w-5 text-blue-400" />
                <span className="text-xs font-semibold text-blue-300">Amet Consectetur</span>
              </div>
              <p className="text-white font-semibold mb-2">Lorem ipsum vence em 3 dias</p>
              <p className="text-slate-400 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
            </div>

            {/* Insight 4 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-purple-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="h-5 w-5 text-purple-400" />
                <span className="text-xs font-semibold text-purple-300">Adipiscing Elit</span>
              </div>
              <p className="text-white font-semibold mb-2">Lorem ipsum representa 35% do dolor</p>
              <p className="text-slate-400 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
            </div>

            {/* Insight 5 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-emerald-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">Sed Do</span>
              </div>
              <p className="text-white font-semibold mb-2">Lorem ipsum dolor sit amet</p>
              <p className="text-slate-400 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
            </div>

            {/* Insight 6 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-yellow-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-yellow-400" />
                <span className="text-xs font-semibold text-yellow-300">Eiusmod Tempor</span>
              </div>
              <p className="text-white font-semibold mb-2">Lorem ipsum aumenta 40% adipiscing elit</p>
              <p className="text-slate-400 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
            </div>

            {/* Insight 7 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-blue-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-blue-400" />
                <span className="text-xs font-semibold text-blue-300">Incididunt Ut</span>
              </div>
              <p className="text-white font-semibold mb-2">Lorem ipsum 18% labore et dolore</p>
              <p className="text-slate-400 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
            </div>

            {/* Insight 8 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-red-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-xs font-semibold text-red-300">Labore Et</span>
              </div>
              <p className="text-white font-semibold mb-2">Lorem ipsum dolor sit amet</p>
              <p className="text-slate-400 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
            </div>

            {/* Insight 9 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-emerald-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">Dolore Magna</span>
              </div>
              <p className="text-white font-semibold mb-2">Lorem ipsum dolor sit amet</p>
              <p className="text-slate-400 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container relative z-10 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white text-center mb-6">
            Lorem Ipsum
          </h2>
          <p className="text-center text-slate-400 mb-12">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          
          <div className="space-y-3">
            {[
              {
                q: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
                a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
              },
              {
                q: "Duis aute irure dolor in reprehenderit?",
                a: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
              },
              {
                q: "Sed ut perspiciatis unde omnis iste natus?",
                a: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."
              },
              {
                q: "Nemo enim ipsam voluptatem quia voluptas?",
                a: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt."
              },
              {
                q: "Neque porro quisquam est qui dolorem?",
                a: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem."
              },
              {
                q: "Ut enim ad minima veniam, quis nostrum?",
                a: "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur."
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
                  L
                </div>
                <span className="font-display text-xl font-bold text-white">LOREM</span>
              </div>
              <p className="text-slate-400 max-w-md">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Lorem</h4>
              <div className="flex flex-col gap-2 text-sm text-slate-400">
                <Link href="#" className="hover:text-white transition-colors">Lorem ipsum</Link>
                <Link href="#" className="hover:text-white transition-colors">Dolor sit amet</Link>
                <Link href="#" className="hover:text-white transition-colors">Consectetur</Link>
                <Link href="#" className="hover:text-white transition-colors">Adipiscing</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>© {new Date().getFullYear()} LOREM. Lorem ipsum dolor sit amet.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

