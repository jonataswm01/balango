"use client"

import { Wallet, Clock, TrendingDown } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface WalletStatsProps {
  balance: number
  pending: number
  expenses: number
}

export function WalletStats({ balance, pending, expenses }: WalletStatsProps) {
  return (
    <div>
      {/* Hero Card - Saldo Real */}
      <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl shadow-blue-900/20 p-6 overflow-hidden">
        {/* Background Icon */}
        <Wallet className="absolute top-4 right-4 h-24 w-24 text-white opacity-20" />
        
        <div className="relative z-10">
          <p className="text-sm font-medium text-blue-100 mb-2">
            Saldo em Caixa
          </p>
          <p className="text-3xl md:text-4xl font-bold text-white">
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Card 1 - A Receber */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {formatCurrency(pending)}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Pendente
          </p>
        </div>

        {/* Card 2 - Custos */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {formatCurrency(expenses)}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Custos
          </p>
        </div>
      </div>
    </div>
  )
}

