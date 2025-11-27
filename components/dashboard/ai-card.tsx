"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, MessageCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export function AICard() {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 h-full flex flex-col">
      {/* Padrão decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
      </div>

      <CardContent className="relative p-6 flex-1 flex flex-col">
        <div className="flex flex-col h-full flex-1">
          {/* Ícone e Título */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">
                Lorem Ipsum
              </h3>
              <p className="text-sm text-white/90 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
              </p>
            </div>
          </div>

          {/* Exemplos de Perguntas */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <MessageCircle className="h-4 w-4" />
              <span>"Lorem ipsum dolor sit amet?"</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <MessageCircle className="h-4 w-4" />
              <span>"Consectetur adipiscing elit?"</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <MessageCircle className="h-4 w-4" />
              <span>"Sed do eiusmod tempor?"</span>
            </div>
          </div>

          {/* Botão de Ação */}
          <Link href="/assistente" className="mt-auto">
            <Button
              size="lg"
              className="w-full bg-white text-orange-600 hover:bg-white/90 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              Lorem ipsum
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

