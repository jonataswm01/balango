"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: number
  icon: LucideIcon
  color?: "emerald" | "blue" | "amber" | "red" | "purple"
  subtitle?: string
  highlight?: boolean
  large?: boolean
}

const colorClasses = {
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-900/20",
    icon: "text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-600 dark:text-emerald-400",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400",
    value: "text-blue-600 dark:text-blue-400",
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-900/20",
    icon: "text-amber-600 dark:text-amber-400",
    value: "text-amber-600 dark:text-amber-400",
  },
  red: {
    bg: "bg-red-100 dark:bg-red-900/20",
    icon: "text-red-600 dark:text-red-400",
    value: "text-red-600 dark:text-red-400",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/20",
    icon: "text-purple-600 dark:text-purple-400",
    value: "text-purple-600 dark:text-purple-400",
  },
}

export function KPICard({
  title,
  value,
  icon: Icon,
  color = "blue",
  subtitle,
  highlight = false,
  large = false,
}: KPICardProps) {
  const colors = colorClasses[color]

  return (
    <Card
      className={cn(
        "border-slate-200 hover:shadow-md transition-shadow",
        highlight &&
          "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-500"
      )}
    >
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between space-y-0 pb-2",
          highlight && "text-white"
        )}
      >
        <CardTitle
          className={cn(
            large ? "text-lg font-semibold" : "text-sm font-medium",
            highlight ? "text-white" : "text-slate-600 dark:text-slate-400"
          )}
        >
          {title}
        </CardTitle>
        <div
          className={cn(
            large ? "h-14 w-14" : "h-10 w-10",
            "rounded-full flex items-center justify-center",
            highlight ? "bg-white/20" : colors.bg
          )}
        >
          <Icon
            className={cn(
              large ? "h-7 w-7" : "h-5 w-5",
              highlight ? "text-white" : colors.icon
            )}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            large ? "text-3xl font-bold" : "text-2xl font-bold",
            highlight ? "text-white" : colors.value
          )}
        >
          {formatCurrency(value)}
        </div>
        {subtitle && (
          <p
            className={cn(
              large ? "text-sm mt-2" : "text-xs mt-1",
              highlight
                ? "text-white/80"
                : "text-slate-500 dark:text-slate-400"
            )}
          >
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
