"use client"

import { ServiceWithRelations } from "@/lib/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TeamSectionProps {
  service: ServiceWithRelations
}

export function TeamSection({ service }: TeamSectionProps) {
  const technician = service.technician
  const technicianName = technician?.nickname || technician?.name || "Técnico não informado"
  const technicianPhone = technician?.phone

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleWhatsApp = () => {
    if (!technicianPhone) return

    // Remove caracteres não numéricos
    const cleanPhone = technicianPhone.replace(/\D/g, "")
    const whatsappUrl = `https://wa.me/55${cleanPhone}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <Card className="bg-slate-900 border-slate-800 h-full">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="h-5 w-5" />
          Equipe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {technician ? (
          <>
            {/* Technician Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 bg-slate-800 border border-slate-700">
                <AvatarFallback className="text-lg font-semibold text-white">
                  {getInitials(technicianName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-white font-semibold text-lg">{technicianName}</p>
                {technician.email && (
                  <p className="text-sm text-slate-400">{technician.email}</p>
                )}
                {technicianPhone && (
                  <p className="text-sm text-slate-400">{technicianPhone}</p>
                )}
              </div>
            </div>

            {/* WhatsApp Button */}
            {technicianPhone && (
              <Button
                onClick={handleWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400">Nenhum técnico atribuído</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

