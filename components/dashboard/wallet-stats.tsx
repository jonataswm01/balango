"use client"

import { useState } from "react"
import { Wallet, Clock, TrendingDown, Info } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface WalletStatsProps {
  balance: number
  pending: number
  expenses: number
  taxes: number
}

export function WalletStats({ balance, pending, expenses, taxes }: WalletStatsProps) {
  const [isExpensesFlipped, setIsExpensesFlipped] = useState(false)
  
  const totalOutflows = expenses + taxes
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

        {/* Card 2 - Saídas Totais (Flip Card) */}
        <div 
          className={cn(
            "relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm transition-all duration-300 cursor-pointer",
            isExpensesFlipped && "bg-slate-50 dark:bg-slate-700/50 border-blue-200 dark:border-blue-800"
          )}
          onClick={() => setIsExpensesFlipped(!isExpensesFlipped)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setIsExpensesFlipped(!isExpensesFlipped)
            }
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpensesFlipped(!isExpensesFlipped)
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
              aria-label="Ver detalhes"
            >
              <Info className={cn(
                "h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors",
                isExpensesFlipped && "text-blue-600 dark:text-blue-400 animate-pulse"
              )} />
            </button>
          </div>
          
          {/* Front State (Default) */}
          <div 
            className={cn(
              "transition-all duration-200",
              isExpensesFlipped ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
            )}
          >
            <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {formatCurrency(totalOutflows)}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Saídas Totais
            </p>
          </div>

          {/* Back State (Flipped) */}
          <div 
            className={cn(
              "transition-all duration-200 space-y-2",
              !isExpensesFlipped ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
            )}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Operacional:
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(expenses)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Impostos:
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(taxes)}
                </span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 mt-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Total:
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(totalOutflows)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

