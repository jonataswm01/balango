"use client"

import { User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ServiceWithRelations } from "@/lib/types/database"
import { formatDate } from "@/lib/utils"
import { getStatusColor } from "@/lib/utils/status"
import { cn } from "@/lib/utils"

interface ServiceCardProps {
  service: ServiceWithRelations
  onClick?: () => void
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
  const clientName = service.client?.name || "N/A"
  const technicianName = service.technician?.nickname || service.technician?.name || null
  const statusColor = getStatusColor(service.status)

  // Mapear cores para classes Tailwind
  const statusDotClasses = {
    yellow: "bg-yellow-500",
    green: "bg-green-500",
    blue: "bg-blue-500",
    red: "bg-red-500",
    gray: "bg-gray-500",
  }

  if (!onClick) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {formatDate(service.date)}
                </span>
                <div
                  className={cn(
                    "h-2 w-2 rounded-full flex-shrink-0",
                    statusDotClasses[statusColor as keyof typeof statusDotClasses] ||
                      statusDotClasses.gray
                  )}
                  aria-label={`Status: ${service.status}`}
                />
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {clientName}
              </p>
              {technicianName && (
                <div className="flex items-center gap-1 mt-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {technicianName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg border border-slate-200 bg-card text-card-foreground shadow-sm",
        "hover:shadow-md transition-all cursor-pointer",
        "hover:border-slate-300 dark:hover:border-slate-700",
        "select-none active:scale-[0.98]"
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Date and Client */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {formatDate(service.date)}
              </span>
              {/* Status Dot */}
              <div
                className={cn(
                  "h-2 w-2 rounded-full flex-shrink-0",
                  statusDotClasses[statusColor as keyof typeof statusDotClasses] ||
                    statusDotClasses.gray
                )}
                aria-label={`Status: ${service.status}`}
              />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {clientName}
            </p>
            {technicianName && (
              <div className="flex items-center gap-1 mt-1">
                <User className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {technicianName}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
