"use client"

import { useState } from "react"
import { HelpCircle, Search, MessageCircle, Mail, FileText, ChevronDown, ChevronUp, BookOpen, Video, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

// Dados mockados de FAQ
const faqCategories = [
  {
    id: "geral",
    nome: "Lorem",
    icon: HelpCircle
  },
  {
    id: "transacoes",
    nome: "Ipsum",
    icon: FileText
  },
  {
    id: "contas-fixas",
    nome: "Dolor",
    icon: BookOpen
  },
  {
    id: "configuracoes",
    nome: "Sit",
    icon: MessageCircle
  }
]

const faqItems = [
  {
    id: "1",
    categoria: "geral",
    pergunta: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
    resposta: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  },
  {
    id: "2",
    categoria: "geral",
    pergunta: "Duis aute irure dolor in reprehenderit?",
    resposta: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  },
  {
    id: "3",
    categoria: "transacoes",
    pergunta: "Sed ut perspiciatis unde omnis iste natus?",
    resposta: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."
  },
  {
    id: "4",
    categoria: "transacoes",
    pergunta: "Nemo enim ipsam voluptatem quia voluptas?",
    resposta: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt."
  },
  {
    id: "5",
    categoria: "contas-fixas",
    pergunta: "Neque porro quisquam est qui dolorem?",
    resposta: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem."
  },
  {
    id: "6",
    categoria: "contas-fixas",
    pergunta: "Ut enim ad minima veniam, quis nostrum?",
    resposta: "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur."
  },
  {
    id: "7",
    categoria: "configuracoes",
    pergunta: "At vero eos et accusamus et iusto odio?",
    resposta: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident."
  },
  {
    id: "8",
    categoria: "configuracoes",
    pergunta: "Similique sunt in culpa qui officia?",
    resposta: "Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio."
  }
]

export default function AjudaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null)
  const [perguntaAberta, setPerguntaAberta] = useState<string | null>(null)

  // Filtrar FAQs
  const faqsFiltrados = faqItems.filter(faq => {
    const matchSearch = searchTerm === "" || 
      faq.pergunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.resposta.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchCategoria = categoriaSelecionada === null || faq.categoria === categoriaSelecionada
    
    return matchSearch && matchCategoria
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <HelpCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Lorem Ipsum Dolor</h1>
        <p className="text-lg text-slate-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit
        </p>
      </div>

      {/* Busca */}
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Lorem ipsum..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cards de Acesso Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Lorem Ipsum</h3>
            <p className="text-sm text-slate-600 mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Lorem Ipsum
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Dolor</h3>
            <p className="text-sm text-slate-600 mb-4">
              Lorem ipsum dolor sit amet
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Lorem Ipsum
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <Video className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Sit</h3>
            <p className="text-sm text-slate-600 mb-4">
              Lorem ipsum dolor sit amet
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Lorem Ipsum
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Categorias */}
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900">Lorem</h2>
            {categoriaSelecionada && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCategoriaSelecionada(null)}
                className="text-slate-500"
              >
                Lorem ipsum
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {faqCategories.map((categoria) => {
              const Icon = categoria.icon
              const isSelected = categoriaSelecionada === categoria.id
              return (
                <Button
                  key={categoria.id}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setCategoriaSelecionada(isSelected ? null : categoria.id)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {categoria.nome}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-5xl mx-auto space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Lorem Ipsum
          {faqsFiltrados.length > 0 && (
            <span className="text-sm font-normal text-slate-500 ml-2">
              ({faqsFiltrados.length} {faqsFiltrados.length === 1 ? "lorem" : "ipsum"})
            </span>
          )}
        </h2>

        {faqsFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-slate-500">Lorem ipsum dolor sit amet</p>
              <p className="text-sm text-slate-400 mt-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {faqsFiltrados.map((faq) => {
              const isOpen = perguntaAberta === faq.id
              return (
                <Card key={faq.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setPerguntaAberta(isOpen ? null : faq.id)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-medium text-slate-900 pr-4">
                        {faq.pergunta}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-slate-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-500 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="pt-4 border-t border-slate-200">
                          <p className="text-slate-600 leading-relaxed">
                            {faq.resposta}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Seção de Contato */}
      <Card className="max-w-5xl mx-auto bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Lorem ipsum dolor sit amet?
            </h2>
            <p className="text-slate-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <MessageCircle className="h-4 w-4" />
                Lorem Ipsum
              </Button>
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                lorem@ipsum.com
              </Button>
              <Button variant="outline" className="gap-2">
                <Phone className="h-4 w-4" />
                (11) 9999-9999
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

