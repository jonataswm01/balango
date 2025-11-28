"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Lock, Bell, CreditCard, Users, Eye, EyeOff, Lock as LockIcon, Mail, Phone, Camera, Globe, Moon, Sun, Monitor, Search, MoreVertical, CheckCircle2, Cog, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { MembrosSection } from "@/components/settings/membros-section"
import { MobileSettingsMenu } from "@/components/settings/mobile-settings-menu"

type SettingsSection = "perfil" | "seguranca" | "notificacoes" | "faturamento" | "membros" | "impostos"

const settingsSections = [
  {
    category: "Conta",
    items: [
      { id: "perfil" as SettingsSection, label: "Perfil", icon: User },
      { id: "seguranca" as SettingsSection, label: "Segurança", icon: Lock },
      { id: "notificacoes" as SettingsSection, label: "Notificações", icon: Bell },
    ],
  },
  {
    category: "Organização",
    items: [
      { id: "faturamento" as SettingsSection, label: "Faturamento", icon: CreditCard },
      { id: "membros" as SettingsSection, label: "Membros", icon: Users },
    ],
  },
  {
    category: "Balango",
    items: [
      { id: "impostos" as SettingsSection, label: "Impostos e Taxas", icon: Cog },
    ],
  },
]

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<SettingsSection>("perfil")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Abrir menu automaticamente em mobile quando entrar na página
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 1024) {
        setMobileMenuOpen(true)
      }
    }
    
    // Verificar no mount
    checkMobile()
    
    // Opcional: também verificar em resize (mas só abrir se ainda não foi fechado manualmente)
    // window.addEventListener('resize', checkMobile)
    // return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
    return { category: "Configurações", title: "Configurações" }
  }

  const sectionInfo = getSectionInfo()

  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar Secundária - Desktop */}
        <div className="hidden lg:flex w-64 border-r border-slate-200 bg-white flex-col">
          {/* Header da Sidebar */}
          <div className="p-4 border-b border-slate-200">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Configurações</h2>
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
          {/* Header Mobile */}
          <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(true)}
                  className="h-9 w-9"
                >
                  <Menu className="h-5 w-5 text-slate-600" />
                </Button>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Configurações</h2>
                  <p className="text-xs text-slate-500">{sectionInfo.title}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard")}
                className="h-9 w-9"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </Button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto p-4 lg:p-6">
            {/* Breadcrumbs - Desktop */}
            <div className="hidden lg:block mb-6">
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
              {activeSection === "impostos" && <ImpostosSection />}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <MobileSettingsMenu
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
    </>
  )
}

// Componente: Seção Perfil
function PerfilSection() {
  const supabase = createClient()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")
  const [email, setEmail] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [idioma, setIdioma] = useState("pt-BR")
  const [tema, setTema] = useState("light")

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          // Buscar dados do perfil da tabela users
          const { data: userData } = await supabase
            .from("users")
            .select("nome, telefone, avatar_url")
            .eq("id", authUser.id)
            .single()

          setUser(authUser)
          setEmail(authUser.email || "")
          setNome(userData?.nome || "")
          setTelefone(userData?.telefone || "")
          setAvatarUrl(userData?.avatar_url || null)
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
      } finally {
        setLoading(false)
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Informações Pessoais</h1>
          <p className="text-sm text-slate-600">
            Atualize suas informações pessoais, como nome, telefone e email. Essas informações serão usadas em toda a aplicação.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4 lg:p-8 flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
              <div className="w-full max-w-md mx-auto space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback className="bg-slate-200 text-slate-700 text-2xl font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Camera className="h-4 w-4" />
                        Alterar Foto
                      </Button>
                    </div>
                  </>
                )}
                {!loading && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome" className="text-sm font-medium text-slate-700">
                        Nome Completo *
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
                        Telefone
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
                        Email
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
                          Verificar Email
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        Salvar Alterações
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preferências */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Preferências</h2>
          <p className="text-sm text-slate-600">
            Configure o idioma e o tema da aplicação de acordo com suas preferências.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4 lg:p-8 flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
              <div className="w-full max-w-md mx-auto space-y-6">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Idioma
                  </Label>
                  <p className="text-xs text-slate-500 mb-3">
                    Selecione o idioma que será usado na aplicação.
                  </p>
                  <select
                    value={idioma}
                    onChange={(e) => setIdioma(e.target.value)}
                    disabled
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-500 cursor-not-allowed opacity-60"
                  >
                    <option value="pt-BR">BR Português (Brasil)</option>
                    <option value="en-US">English (United States)</option>
                    <option value="es-ES">Español (España)</option>
                  </select>
                  <p className="text-xs text-slate-400 mt-1 italic">Funcionalidade em desenvolvimento</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Tema
                  </Label>
                  <p className="text-xs text-slate-500 mb-3">
                    Escolha entre tema claro, escuro ou seguir as preferências do sistema.
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
                          disabled
                          className={cn(
                            "relative p-4 rounded-lg border-2 transition-all opacity-60 cursor-not-allowed",
                            isSelected
                              ? "border-slate-300 bg-slate-100"
                              : "border-slate-200 bg-slate-50"
                          )}
                        >
                          {isSelected && (
                            <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-slate-400" />
                          )}
                          <div className={cn(
                            "flex items-center justify-center h-12 rounded mb-2 opacity-50",
                            option.id === "light" ? "bg-white text-slate-900" :
                            option.id === "dark" ? "bg-slate-900 text-white" :
                            "bg-gradient-to-r from-white to-slate-900 text-slate-900"
                          )}>
                            <span className="text-lg font-semibold">Aa</span>
                          </div>
                          <p className="text-sm font-medium text-slate-500">{option.label}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button disabled className="bg-slate-300 text-slate-500 cursor-not-allowed">
                    Salvar Alterações
                  </Button>
                </div>
                <p className="text-xs text-slate-400 italic text-center">Funcionalidade em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Zona de perigo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Zona de Perigo</h2>
          <p className="text-sm text-slate-600">
            Ações irreversíveis relacionadas à sua conta. Use com cuidado.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card className="border-2 border-red-200">
            <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
              <div className="w-full max-w-md mx-auto">
                <p className="text-sm text-red-600 mb-4">
                  Ao excluir sua conta, todos os seus dados serão permanentemente removidos. Esta ação não pode ser desfeita.
                </p>
                <Button variant="destructive" disabled>
                  Excluir Conta
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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Segurança</h1>
        <p className="text-slate-600">
          Gerencie sua senha, autenticação de dois fatores e sessões ativas para manter sua conta segura.
        </p>
      </div>

      {/* Alterar senha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Alterar Senha</h2>
          <p className="text-sm text-slate-600">
            Mantenha sua conta segura alterando sua senha regularmente. Use uma senha forte com pelo menos 8 caracteres.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4 lg:p-8 flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
              <div className="w-full max-w-md mx-auto space-y-4">
                <div>
                  <Label htmlFor="current-password" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <LockIcon className="h-4 w-4" />
                    Senha Atual
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
                    Nova Senha
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
                      A senha deve ter pelo menos 8 caracteres
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm-password" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <LockIcon className="h-4 w-4" />
                    Confirmar Nova Senha
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
                    Alterar Senha
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contas conectadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Contas conectadas</h2>
          <p className="text-sm text-slate-600">
            Acesse sua conta mais rapidamente vinculando-a ao Google ou Microsoft.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card className="opacity-60">
            <CardContent className="p-4 lg:p-8 flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
              <div className="w-full max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      G
                    </div>
                    <div>
                      <p className="font-medium text-slate-500">Google</p>
                      <p className="text-sm text-slate-400">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled className="cursor-not-allowed">
                    Connect
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg opacity-60">
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
                      <p className="font-medium text-slate-500">Microsoft</p>
                      <p className="text-sm text-slate-400">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled className="cursor-not-allowed">
                    Connect
                  </Button>
                </div>
                <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 text-sm">ℹ️</span>
                  <p className="text-xs text-slate-500 italic">
                    Funcionalidade em desenvolvimento
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2FA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Autenticação de dois fatores</h2>
          <p className="text-sm text-slate-600">
            Adicione uma camada extra de segurança ao seu login exigindo um fator adicional.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4 lg:p-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Gerenciar sessões</h2>
          <p className="text-sm text-slate-600">
            Encerre suas sessões ativas em outros navegadores e dispositivos.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4 lg:p-6">
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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Notificações</h1>
        <p className="text-slate-600">
          Configure como e quando você deseja receber notificações sobre atividades importantes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Preferências de Notificação</h2>
          <p className="text-sm text-slate-600">
            Em breve você poderá personalizar suas preferências de notificação por email, push e SMS.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4 lg:p-8 flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
              <div className="w-full max-w-md mx-auto text-center">
                <p className="text-sm text-slate-500">
                  Em desenvolvimento. Em breve disponível.
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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Faturamento</h1>
        <p className="text-slate-600">
          Gerencie seu plano, método de pagamento e histórico de faturas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Plano</h2>
          <p className="text-sm text-slate-600">
            Visualize, atualize ou cancele seu plano. A faturação é gerenciada por nosso parceiro de pagamento.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4 lg:p-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">E-mail destinatário</h2>
          <p className="text-sm text-slate-600">
            Todas as correspondências de faturamento serão enviadas para este email.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4 lg:p-8 flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
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
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Endereço de faturamento</h2>
          <p className="text-sm text-slate-600">
            Isso será refletido em todas as faturas futuras, as faturas passadas não são afetadas.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4 lg:p-8 flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
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
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Faturas</h2>
          <p className="text-sm text-slate-600">
            Faturas são enviadas automaticamente para seu email de faturamento.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4 lg:p-6">
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

// Componente: Seção Impostos
function ImpostosSection() {
  const { toast } = useToast()
  const [taxRatePercent, setTaxRatePercent] = useState<number>(0) // Valor em porcentagem (0-100)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadTaxRate()
  }, [])

  const loadTaxRate = async () => {
    try {
      setLoading(true)
      const { settingsApi } = await import('@/lib/api/client')
      const setting = await settingsApi.getByKey('tax_rate')
      // Converter de decimal (0.15) para porcentagem (15)
      setTaxRatePercent((setting.value || 0) * 100)
    } catch (error: any) {
      // Se não encontrar, mantém 0
      setTaxRatePercent(0)
      console.log('Taxa de imposto não configurada, usando padrão: 0')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (taxRatePercent < 0 || taxRatePercent > 100) {
      toast({
        variant: "destructive",
        title: "Valor inválido",
        description: "A taxa de imposto deve estar entre 0% e 100%.",
      })
      return
    }

    try {
      setSaving(true)
      const { settingsApi } = await import('@/lib/api/client')
      // Converter de porcentagem (15) para decimal (0.15) ao salvar
      const taxRateDecimal = taxRatePercent / 100
      await settingsApi.set('tax_rate', taxRateDecimal, 'Taxa de imposto aplicada aos serviços com nota fiscal')
      
      toast({
        title: "Configuração salva!",
        description: `Taxa de imposto de ${taxRatePercent.toFixed(2)}% foi salva com sucesso.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar a configuração.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Impostos e Taxas</h1>
        <p className="text-slate-600">
          Configure as taxas de impostos que serão aplicadas automaticamente aos serviços com nota fiscal.
        </p>
      </div>

      {/* Taxa de Imposto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Taxa de Imposto</h2>
          <p className="text-sm text-slate-600">
            Configure a taxa de imposto que será aplicada automaticamente aos serviços que possuem nota fiscal.
          </p>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8">
              <div className="w-full max-w-md mx-auto space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="tax-rate" className="text-sm font-medium text-slate-700 mb-1.5 block">
                        Taxa de Imposto (%)
                      </Label>
                      <p className="text-xs text-slate-500 mb-3">
                        Digite o valor em porcentagem. Exemplo: 15 para 15%, 18 para 18%
                      </p>
                      <div className="relative">
                        <Input
                          id="tax-rate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={taxRatePercent}
                          onChange={(e) => setTaxRatePercent(parseFloat(e.target.value) || 0)}
                          disabled={saving}
                          className="text-lg pr-8"
                          placeholder="15"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                          %
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-2">
                        Taxa atual: <span className="font-semibold text-slate-900">{taxRatePercent.toFixed(2)}%</span>
                      </p>
                      {taxRatePercent > 0 && (
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Esta taxa será aplicada automaticamente aos serviços com nota fiscal
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button 
                        onClick={handleSave}
                        disabled={saving || taxRatePercent < 0 || taxRatePercent > 100}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {saving ? "Salvando..." : "Salvar Configuração"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
