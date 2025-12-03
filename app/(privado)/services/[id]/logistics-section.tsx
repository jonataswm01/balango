"use client"

import { ServiceWithRelations } from "@/lib/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, ExternalLink } from "lucide-react"

interface LogisticsSectionProps {
  service: ServiceWithRelations
}

export function LogisticsSection({ service }: LogisticsSectionProps) {
  const location = service.location || "Local não informado"

  const handleOpenMaps = () => {
    const encodedLocation = encodeURIComponent(location)
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`,
      "_blank"
    )
  }

  return (
    <Card className="bg-slate-900 border-slate-800 h-full">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Logística
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address */}
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Endereço</p>
          <p className="text-white font-medium">{location}</p>
        </div>

        {/* Map Placeholder */}
        <div className="relative w-full h-48 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Mapa</p>
            </div>
          </div>
        </div>

        {/* Google Maps Button */}
        <Button
          onClick={handleOpenMaps}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Abrir no Google Maps
        </Button>
      </CardContent>
    </Card>
  )
}

