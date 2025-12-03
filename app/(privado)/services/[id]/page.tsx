"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { servicesApi } from "@/lib/api/client"
import { ServiceWithRelations } from "@/lib/types/database"
import { formatDateLong } from "@/lib/utils"
import {
  getPaymentStatusLabel,
  getPaymentStatusBadgeClasses,
} from "@/lib/utils/status"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { ArrowLeft, MapPin, ExternalLink, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { FinancialSummary } from "./financial-summary"
import { LogisticsSection } from "./logistics-section"
import { TeamSection } from "./team-section"

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const serviceId = params.id as string

  const [loading, setLoading] = useState(true)
  const [service, setService] = useState<ServiceWithRelations | null>(null)

  useEffect(() => {
    const loadService = async () => {
      try {
        setLoading(true)
        const data = await servicesApi.getById(serviceId)
        setService(data)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar serviço",
          description: error.message || "Não foi possível carregar os detalhes do serviço.",
        })
        router.push("/services")
      } finally {
        setLoading(false)
      }
    }

    if (serviceId) {
      loadService()
    }
  }, [serviceId, router, toast])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-950">
        <LoadingSpinner size="lg" text="Carregando detalhes do serviço..." />
      </div>
    )
  }

  if (!service) {
    return null
  }

  const clientName = service.client?.name || "Cliente não informado"

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{clientName}</h1>
              <p className="text-slate-400">{formatDateLong(service.date)}</p>
            </div>
            <Badge
              className={cn(
                "text-lg px-4 py-2 font-semibold",
                getPaymentStatusBadgeClasses(service.payment_status)
              )}
            >
              {getPaymentStatusLabel(service.payment_status)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section A: Logistics */}
          <div className="lg:col-span-1">
            <LogisticsSection service={service} />
          </div>

          {/* Section B: Financials */}
          <div className="lg:col-span-1">
            <FinancialSummary service={service} />
          </div>

          {/* Section C: Team */}
          <div className="lg:col-span-1">
            <TeamSection service={service} />
          </div>
        </div>

        {/* Additional Info Card */}
        {service.description && (
          <Card className="mt-6 bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3 text-white">Descrição</h3>
              <p className="text-slate-300 whitespace-pre-wrap">{service.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
