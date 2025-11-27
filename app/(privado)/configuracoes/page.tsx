"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Lock, Bell, CreditCard, Users, Eye, EyeOff, Lock as LockIcon, Mail, Phone, Camera, Globe, Moon, Sun, Monitor, Search, MoreVertical, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

type SettingsSection = "perfil" | "seguranca" | "notificacoes" | "faturamento" | "membros"

const settingsSections = [
  {
    category: "Lorem ipsum",
    items: [
      { id: "perfil" as SettingsSection, label: "Lorem ipsum", icon: User },
      { id: "seguranca" as SettingsSection, label: "Lorem ipsum", icon: Lock },
      { id: "notificacoes" as SettingsSection, label: "Lorem ipsum", icon: Bell },
    ],
  },
  {
    category: "Lorem ipsum",
    items: [
      { id: "faturamento" as SettingsSection, label: "Lorem ipsum", icon: CreditCard },
      { id: "membros" as SettingsSection, label: "Lorem ipsum", icon: Users },
    ],
  },
]

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<SettingsSection>("perfil")

  const getSectionInfo = () => {
    for (const section of settingsSections) {
      const item = section.items.find((item) => item.id === activeSection)
      if (item) {
        return {
          category: section.category,
          title: item.label,
        }
      }
    }
    return { category: "Lorem ipsum", title: "Lorem ipsum" }
  }

  const sectionInfo = getSectionInfo()

  return (
    <div className="flex h-screen">
      {/* Sidebar Secundária */}
      <div className="w-64 border-r border-slate-200 bg-white flex flex-col">
        {/* Header da Sidebar */}
        <div className="p-4 border-b border-slate-200">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Lorem ipsum
          </Button>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Lorem ipsum</h2>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto p-4">
          {settingsSections.map((section, sectionIndex) => (
            <div key={section.category} className={cn(sectionIndex > 0 && "mt-8")}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {section.category}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-4xl mx-auto p-6">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <nav className="text-sm text-slate-500">
              <span>{sectionInfo.category}</span>
              <span className="mx-2">/</span>
              <span className="text-slate-900 font-medium">{sectionInfo.title}</span>
            </nav>
          </div>

          {/* Conteúdo da Seção Ativa */}
          <div className="space-y-8">
            {activeSection === "perfil" && <PerfilSection />}
            {activeSection === "seguranca" && <SegurancaSection />}
            {activeSection === "notificacoes" && <NotificacoesSection />}
            {activeSection === "faturamento" && <FaturamentoSection />}
            {activeSection === "membros" && <MembrosSection />}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente: Seção Perfil
function PerfilSection() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")
  const [email, setEmail] = useState("")
  const [idioma, setIdioma] = useState("pt-BR")
  const [tema, setTema] = useState("light")

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setEmail(user.email || "")
        setNome(user.user_metadata?.nome || "")
        setTelefone(user.user_metadata?.telefone || "")
      }
    }
    getUser()
  }, [supabase])

  const getUserInitials = () => {
    if (nome) {
      return nome.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    }
    return user?.email?.[0].toUpperCase() || "U"
  }

  return (
    <>
      {/* Detalhes pessoais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Lorem ipsum</h1>
          <p className="text-sm text-slate-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8 flex items-center justify-center min-h-[500px]">
              <div className="w-full max-w-md mx-auto space-y-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-slate-200 text-slate-700 text-2xl font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Camera className="h-4 w-4" />
                    Lorem ipsum
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome" className="text-sm font-medium text-slate-700">
                      Lorem ipsum *
                    </Label>
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="mt-1.5"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone" className="text-sm font-medium text-slate-700">
                      Lorem ipsum
                    </Label>
                    <Input
                      id="telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="mt-1.5"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                      Lorem ipsum
                    </Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1"
                        placeholder="seu@email.com"
                      />
                      <Button variant="outline" size="sm">
                        Lorem ipsum
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Lorem ipsum
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preferências */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Lorem ipsum</h2>
          <p className="text-sm text-slate-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8 flex items-center justify-center min-h-[500px]">
              <div className="w-full max-w-md mx-auto space-y-6">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Lorem ipsum
                  </Label>
                  <p className="text-xs text-slate-500 mb-3">
                    Este é o idioma que será usado na aplicação.
                  </p>
                  <select
                    value={idioma}
                    onChange={(e) => setIdioma(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <option value="pt-BR">BR Português (Brasil)</option>
                    <option value="en-US">English (United States)</option>
                    <option value="es-ES">Español (España)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Lorem ipsum
                  </Label>
                  <p className="text-xs text-slate-500 mb-3">
                    Selecione o tema da aplicação.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "light", label: "Light", icon: Sun },
                      { id: "dark", label: "Dark", icon: Moon },
                      { id: "system", label: "System", icon: Monitor },
                    ].map((option) => {
                      const Icon = option.icon
                      const isSelected = tema === option.id
                      return (
                        <button
                          key={option.id}
                          onClick={() => setTema(option.id)}
                          className={cn(
                            "relative p-4 rounded-lg border-2 transition-all",
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
                          )}
                        >
                          {isSelected && (
                            <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-blue-600" />
                          )}
                          <div className={cn(
                            "flex items-center justify-center h-12 rounded mb-2",
                            option.id === "light" ? "bg-white text-slate-900" :
                            option.id === "dark" ? "bg-slate-900 text-white" :
                            "bg-gradient-to-r from-white to-slate-900 text-slate-900"
                          )}>
                            <span className="text-lg font-semibold">Aa</span>
                          </div>
                          <p className="text-sm font-medium text-slate-700">{option.label}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Lorem ipsum
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Zona de perigo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Lorem ipsum</h2>
          <p className="text-sm text-slate-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card className="border-2 border-red-200">
            <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
              <div className="w-full max-w-md mx-auto">
                <p className="text-sm text-red-600 mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <Button variant="destructive" disabled>
                  Lorem ipsum
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

// Componente: Seção Segurança
function SegurancaSection() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Lorem ipsum</h1>
        <p className="text-slate-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>

      {/* Alterar senha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Lorem ipsum</h2>
          <p className="text-sm text-slate-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8 flex items-center justify-center min-h-[500px]">
              <div className="w-full max-w-md mx-auto space-y-4">
                <div>
                  <Label htmlFor="current-password" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <LockIcon className="h-4 w-4" />
                    Lorem ipsum
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="new-password" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <LockIcon className="h-4 w-4" />
                    Lorem ipsum
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {newPassword.length >= 8 ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border-2 border-red-500" />
                    )}
                    <span className={cn(
                      "text-xs",
                      newPassword.length >= 8 ? "text-emerald-600" : "text-red-600"
                    )}>
                      Lorem ipsum dolor sit amet
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm-password" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <LockIcon className="h-4 w-4" />
                    Lorem ipsum
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Lorem ipsum
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contas conectadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Contas conectadas</h2>
          <p className="text-sm text-slate-600">
            Acesse sua conta mais rapidamente vinculando-a ao Google ou Microsoft.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8 flex items-center justify-center min-h-[500px]">
              <div className="w-full max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      G
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Google</p>
                      <p className="text-sm text-slate-500">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded flex items-center justify-center bg-slate-900">
                      <div className="grid grid-cols-2 gap-0.5">
                        <div className="w-2 h-2 bg-blue-500"></div>
                        <div className="w-2 h-2 bg-green-500"></div>
                        <div className="w-2 h-2 bg-yellow-500"></div>
                        <div className="w-2 h-2 bg-red-500"></div>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Microsoft</p>
                      <p className="text-sm text-slate-500">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </div>
                <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 text-sm">ℹ️</span>
                  <p className="text-xs text-slate-600">
                    Regardless of connected accounts, you will always have a password login as well.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2FA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Autenticação de dois fatores</h2>
          <p className="text-sm text-slate-600">
            Adicione uma camada extra de segurança ao seu login exigindo um fator adicional.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8 flex items-center justify-center min-h-[500px]">
              <div className="w-full max-w-md mx-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Authenticator app</p>
                    <p className="text-sm text-slate-500">Not enabled</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sessões */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Gerenciar sessões</h2>
          <p className="text-sm text-slate-600">
            Encerre suas sessões ativas em outros navegadores e dispositivos.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8 flex items-center justify-center min-h-[500px]">
              <div className="w-full max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900">Current session</p>
                      <p className="text-sm text-slate-500">Expires on 12 Dec 2025</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Sign out
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900">Other session</p>
                      <p className="text-sm text-slate-500">Expires on 12 Dec 2025</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Sign out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

// Componente: Seção Notificações
function NotificacoesSection() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Lorem ipsum</h1>
        <p className="text-slate-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Lorem ipsum</h2>
          <p className="text-sm text-slate-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8 flex items-center justify-center min-h-[500px]">
              <div className="w-full max-w-md mx-auto">
                <p className="text-sm text-slate-500">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

// Componente: Seção Faturamento
function FaturamentoSection() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Lorem ipsum</h1>
        <p className="text-slate-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Plano</h2>
          <p className="text-sm text-slate-600">
            Visualize, atualize ou cancele seu plano. A faturação é gerenciada por nosso parceiro de pagamento.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8 flex items-center justify-center min-h-[500px]">
              <div className="w-full max-w-md mx-auto text-center space-y-4">
                <p className="text-sm text-slate-600">
                  Esta organização está atualmente no plano: <span className="font-semibold text-slate-900">Free</span>
                </p>
                <Button variant="outline">Atualizar plano</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">E-mail destinatário</h2>
          <p className="text-sm text-slate-600">
            Todas as correspondências de faturamento serão enviadas para este email.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8 flex items-center justify-center min-h-[500px]">
              <div className="w-full max-w-md mx-auto space-y-4">
                <div>
                  <Label htmlFor="billing-email" className="text-sm font-medium text-slate-700">
                    E-mail
                  </Label>
                  <Input
                    id="billing-email"
                    type="email"
                    defaultValue="jonataswm01@gmail.com"
                    className="mt-1.5"
                  />
                </div>
                <div className="flex justify-end">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Lorem ipsum
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Endereço de faturamento</h2>
          <p className="text-sm text-slate-600">
            Isso será refletido em todas as faturas futuras, as faturas passadas não são afetadas.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8 flex items-center justify-center min-h-[500px]">
              <div className="w-full max-w-md mx-auto space-y-4">
                <div>
                  <Label htmlFor="address-line-1" className="text-sm font-medium text-slate-700">
                    Linha de endereço 1
                  </Label>
                  <Input id="address-line-1" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="address-line-2" className="text-sm font-medium text-slate-700">
                    Linha de endereço 2
                  </Label>
                  <Input id="address-line-2" className="mt-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country" className="text-sm font-medium text-slate-700">
                      País
                    </Label>
                    <select
                      id="country"
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm mt-1.5"
                    >
                      <option>---</option>
                      <option>Brasil</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="postal-code" className="text-sm font-medium text-slate-700">
                      Código postal
                    </Label>
                    <Input id="postal-code" className="mt-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium text-slate-700">
                      Cidade
                    </Label>
                    <Input id="city" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm font-medium text-slate-700">
                      Estado
                    </Label>
                    <Input id="state" className="mt-1.5" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Lorem ipsum
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Faturas</h2>
          <p className="text-sm text-slate-600">
            Faturas são enviadas automaticamente para seu email de faturamento.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8 flex items-center justify-center min-h-[500px]">
              <div className="w-full max-w-md mx-auto text-center">
                <p className="text-sm text-slate-500">Nenhuma fatura recebida ainda.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

// Componente: Seção Membros
function MembrosSection() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Lorem ipsum</h1>
        <p className="text-slate-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Equipe</h2>
          <p className="text-sm text-slate-600">
            Gerencie e convide seus colegas.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8 flex items-center justify-center min-h-[500px]">
              <div className="w-full max-w-md mx-auto space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Filtrar por nome ou email"
                      className="pl-9"
                    />
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Convidar membro
                  </Button>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">J</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">Jonatas</p>
                        <p className="text-sm text-slate-500">jonataswm01@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">Owner</span>
                      <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded">Admin</span>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Convites</h2>
          <p className="text-sm text-slate-600">
            Gerencie convites de usuários que ainda não aceitaram.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8 flex items-center justify-center min-h-[500px]">
              <div className="w-full max-w-md mx-auto space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Filter by email"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex gap-2 border-b border-slate-200">
                  <button className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                    Pending
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">
                    Revoked
                  </button>
                </div>
                <div className="pt-4 text-center">
                  <p className="text-sm text-slate-500">No pending invitation found.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
