"use client"

import { useParams } from "next/navigation"

export default function ServiceDetailPage() {
  const params = useParams()
  const serviceId = params.id as string

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detalhes do Serviço</h1>
      <p className="text-slate-600">Página de detalhes do serviço - Em desenvolvimento</p>
      <p className="text-sm text-slate-500 mt-2">ID: {serviceId}</p>
    </div>
  )
}

