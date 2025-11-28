"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ptBR } from "date-fns/locale"
import Cropper from "react-easy-crop"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  User,
  Camera,
  Building2,
  Settings,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Area } from "react-easy-crop"
import { useToast } from "@/components/ui/use-toast"

type Step = 1 | 2 | 3

// Configuração das etapas
const STEPS = [
  {
    id: 1,
    title: "Sua Organização",
    icon: Building2,
    description: "Configure os dados da sua empresa",
  },
  {
    id: 2,
    title: "Seu Perfil",
    icon: User,
    description: "Complete suas informações pessoais",
  },
  {
    id: 3,
    title: "Configurações",
    icon: Settings,
    description: "Defina as configurações iniciais",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Verificar se o usuário já completou o onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error("❌ [Onboarding] Erro ao obter usuário:", userError)
          router.push("/login")
          return
        }

        // Verificar se usuário tem organização e se ela já completou onboarding
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("organization_id")
          .eq("id", user.id)
          .maybeSingle()

        // Se não encontrou o usuário, isso é um problema (deveria ter sido criado no cadastro)
        // Mas permitimos continuar para que o usuário possa completar o onboarding
        // O erro será tratado no handleFinish
        if (profileError && profileError.code === 'PGRST116') {
          console.warn("[Onboarding] Usuário não encontrado na tabela users. O trigger handle_new_user() pode ter falhado.")
          setChecking(false)
          return
        }

        // Se houver erro, continuar (usuário pode não ter organização ainda)
        if (profileError) {
          console.warn("[Onboarding] Erro ao buscar perfil:", profileError)
          setChecking(false)
          return
        }

        // Se usuário tem organização, verificar se ela já completou onboarding
        if (userProfile?.organization_id) {
          const { data: organization, error: orgError } = await supabase
            .from("organizations")
            .select("onboarding_completo")
            .eq("id", userProfile.organization_id)
            .maybeSingle()

          if (!orgError && organization?.onboarding_completo === true) {
            router.push("/dashboard")
            return
          }
        }

        setChecking(false)
      } catch (err) {
        console.error("❌ [Onboarding] Erro ao verificar status:", err)
        setChecking(false)
      }
    }

    checkOnboardingStatus()
  }, [router, supabase])

  // ============================================
  // ESTADOS LOCAIS - Nenhum dado é salvo no banco até o final
  // ============================================
  
  // Etapa 1: Informações da Organização
  const [nomeOrganizacao, setNomeOrganizacao] = useState("")
  const [slugOrganizacao, setSlugOrganizacao] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [telefoneOrganizacao, setTelefoneOrganizacao] = useState("")
  const [emailOrganizacao, setEmailOrganizacao] = useState("")
  const [enderecoOrganizacao, setEnderecoOrganizacao] = useState("")
  const [logoOrganizacao, setLogoOrganizacao] = useState<string | null>(null)
  const [logoOrganizacaoFile, setLogoOrganizacaoFile] = useState<File | null>(null)
  
  // Estados para crop de imagem (logo)
  const [showCropModal, setShowCropModal] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isCropForLogo, setIsCropForLogo] = useState(true) // true = logo, false = foto perfil

  // Etapa 2: Perfil do Usuário
  const [nome, setNome] = useState("")
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null)
  const [fotoPerfilFile, setFotoPerfilFile] = useState<File | null>(null)
  const [telefone, setTelefone] = useState("")

  // Etapa 3: Configurações
  const [taxaImposto, setTaxaImposto] = useState<string>("")

  // Validações
  const canProceedStep1 = nomeOrganizacao.trim() !== "" && slugOrganizacao.trim() !== ""
  const canProceedStep2 = nome.trim() !== "" && telefone.replace(/\D/g, "").length >= 10
  const canProceedStep3 = taxaImposto !== "" && !isNaN(Number(taxaImposto)) && Number(taxaImposto) >= 0 && Number(taxaImposto) <= 100

  const canProceed = {
    1: canProceedStep1,
    2: canProceedStep2,
    3: canProceedStep3,
  }

  const handleNext = () => {
    if (currentStep < 3 && canProceed[currentStep]) {
      setCurrentStep((prev) => (prev + 1) as Step)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step)
    }
  }

  const handleStepClick = (step: Step) => {
    if (step < currentStep || (step === currentStep + 1 && canProceed[currentStep])) {
      setCurrentStep(step)
    }
  }

  const formatPhoneInput = (value: string): string => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  const handlePhoneChange = (value: string, setter: (value: string) => void) => {
    const formatted = formatPhoneInput(value)
    setter(formatted)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isLogo: boolean) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Por favor, selecione uma imagem válida",
        })
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
        })
        return
      }

      setIsCropForLogo(isLogo)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageToCrop(reader.result as string)
        setShowCropModal(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener("load", () => resolve(image))
      image.addEventListener("error", (error) => reject(error))
      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("No 2d context")
    }

    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    canvas.width = safeArea
    canvas.height = safeArea

    ctx.translate(safeArea / 2, safeArea / 2)
    ctx.translate(-safeArea / 2, -safeArea / 2)

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    )

    const data = ctx.getImageData(0, 0, safeArea, safeArea)

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        }
      }, "image/jpeg", 0.95)
    })
  }

  const handleCropComplete = async () => {
    if (!imageToCrop || !croppedAreaPixels) return

    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels)
      
      const file = new File([croppedImage], isCropForLogo ? "logo.jpg" : "profile.jpg", { type: "image/jpeg" })
      
      if (isCropForLogo) {
        setLogoOrganizacaoFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setLogoOrganizacao(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setFotoPerfilFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setFotoPerfil(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
      
      setShowCropModal(false)
      setImageToCrop(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
    } catch (error) {
      console.error("Erro ao processar imagem:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao processar a imagem. Tente novamente.",
      })
    }
  }

  const handleCancelCrop = () => {
    setShowCropModal(false)
    setImageToCrop(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Gerar slug a partir do nome
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  useEffect(() => {
    if (nomeOrganizacao && !slugOrganizacao) {
      setSlugOrganizacao(generateSlug(nomeOrganizacao))
    }
  }, [nomeOrganizacao, slugOrganizacao])

  // ============================================
  // FUNÇÃO PRINCIPAL: handleFinish
  // ============================================
  const handleFinish = async () => {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // Validações
      if (!nomeOrganizacao.trim()) {
        toast({
          variant: "destructive",
          title: "Campo obrigatório",
          description: "Por favor, preencha o nome da organização",
        })
        setLoading(false)
        return
      }

      if (!slugOrganizacao.trim()) {
        toast({
          variant: "destructive",
          title: "Campo obrigatório",
          description: "Por favor, preencha o slug da organização",
        })
        setLoading(false)
        return
      }

      if (!nome.trim()) {
        toast({
          variant: "destructive",
          title: "Campo obrigatório",
          description: "Por favor, preencha seu nome",
        })
        setLoading(false)
        return
      }

      if (!telefone.replace(/\D/g, "").length || telefone.replace(/\D/g, "").length < 10) {
        toast({
          variant: "destructive",
          title: "Telefone inválido",
          description: "Por favor, informe um número de telefone válido",
        })
        setLoading(false)
        return
      }

      if (!taxaImposto || isNaN(Number(taxaImposto)) || Number(taxaImposto) < 0 || Number(taxaImposto) > 100) {
        toast({
          variant: "destructive",
          title: "Taxa inválida",
          description: "Por favor, informe uma taxa de imposto válida (0-100%)",
        })
        setLoading(false)
        return
      }

      // Upload do logo da organização
      let logoUrl = null
      if (logoOrganizacaoFile) {
        try {
          const fileExt = logoOrganizacaoFile.name.split(".").pop()
          const fileName = `org-${user.id}-${Date.now()}.${fileExt}`
          const filePath = `logos/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, logoOrganizacaoFile, {
              cacheControl: "3600",
              upsert: false,
            })

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from("avatars")
              .getPublicUrl(filePath)
            logoUrl = publicUrl
          } else {
            console.warn("Erro ao fazer upload do logo:", uploadError)
            // Não bloquear o onboarding se o upload falhar
            if (uploadError.message?.includes("Bucket not found")) {
              console.warn("Bucket 'avatars' não encontrado. Crie o bucket no Supabase Storage. Veja docs/STORAGE_SETUP.md")
            }
          }
        } catch (err) {
          console.warn("Erro ao processar logo:", err)
          // Não bloquear o onboarding se o upload falhar
        }
      }

      // Upload da foto de perfil
      let fotoUrl = null
      if (fotoPerfilFile) {
        try {
          const fileExt = fotoPerfilFile.name.split(".").pop()
          const fileName = `${user.id}-${Date.now()}.${fileExt}`
          const filePath = `profiles/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, fotoPerfilFile, {
              cacheControl: "3600",
              upsert: false,
            })

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from("avatars")
              .getPublicUrl(filePath)
            fotoUrl = publicUrl
          } else {
            console.warn("Erro ao fazer upload da foto:", uploadError)
            // Não bloquear o onboarding se o upload falhar
            if (uploadError.message?.includes("Bucket not found")) {
              console.warn("Bucket 'avatars' não encontrado. Crie o bucket no Supabase Storage. Veja docs/STORAGE_SETUP.md")
            }
          }
        } catch (err) {
          console.warn("Erro ao processar foto:", err)
          // Não bloquear o onboarding se o upload falhar
        }
      }

      // Verificar autenticação antes de criar organização
      const { data: { user: authUser }, error: authCheckError } = await supabase.auth.getUser()
      
      if (authCheckError || !authUser) {
        console.error("❌ Usuário não autenticado:", authCheckError)
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Por favor, faça login novamente.",
        })
        router.push("/login")
        setLoading(false)
        return
      }

      console.log("✅ Usuário autenticado:", authUser.id)

      // Criar organização usando função RPC (bypass RLS)
      // Se a função não existir, tentar método direto
      let organization: any = null
      let orgError: any = null

      // Tentar usar função RPC primeiro
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_organization', {
        p_name: nomeOrganizacao.trim(),
        p_slug: slugOrganizacao.trim(),
        p_document: cnpj.trim() || null,
        p_phone: telefoneOrganizacao.replace(/\D/g, "") || null,
        p_email: emailOrganizacao.trim() || null,
        p_address: enderecoOrganizacao.trim() || null,
        p_logo_url: logoUrl || null,
      })

      if (!rpcError && rpcData && rpcData.length > 0) {
        // Função RPC funcionou
        organization = rpcData[0]
        console.log("✅ Organização criada via RPC:", organization.id)
      } else {
        // Se função não existe ou falhou, tentar método direto
        console.warn("⚠️ Função RPC não disponível, tentando método direto:", rpcError)
        
        const { data: directData, error: directError } = await supabase
          .from("organizations")
          .insert({
            name: nomeOrganizacao.trim(),
            slug: slugOrganizacao.trim(),
            document: cnpj.trim() || null,
            phone: telefoneOrganizacao.replace(/\D/g, "") || null,
            email: emailOrganizacao.trim() || null,
            address: enderecoOrganizacao.trim() || null,
            logo_url: logoUrl,
            active: true,
            onboarding_completo: false, // Será marcado como true ao finalizar
          })
          .select()
          .single()

        organization = directData
        orgError = directError
        
        if (organization) {
          console.log("✅ Organização criada via método direto:", organization.id)
        }
      }

      if (orgError || !organization) {
        console.error("❌ Erro ao criar organização:", orgError || rpcError)
        console.error("Detalhes do erro:", {
          code: (orgError || rpcError)?.code,
          message: (orgError || rpcError)?.message,
          details: (orgError || rpcError)?.details,
          hint: (orgError || rpcError)?.hint,
        })
        toast({
          variant: "destructive",
          title: "Erro ao criar organização",
          description: (orgError || rpcError)?.message || "Tente novamente. Verifique se executou a migration 016_create_organization_function.sql",
        })
        setLoading(false)
        return
      }

      // Atualizar usuário existente (usuário já foi criado no /cadastro)
      const telefoneLimpo = telefone.replace(/\D/g, "")
      
      // Verificar se o usuário existe na tabela users
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = não encontrado, mas outros erros são problemas
        console.error("Erro ao verificar usuário:", checkError)
        toast({
          variant: "destructive",
          title: "Erro ao verificar dados",
          description: "Erro ao verificar seu perfil. Tente novamente.",
        })
        setLoading(false)
        return
      }

      if (!existingUser) {
        // Usuário não existe na tabela users - isso não deveria acontecer
        // O trigger handle_new_user() deveria ter criado o registro no cadastro
        console.error("❌ Usuário não encontrado na tabela users. O trigger handle_new_user() pode ter falhado.")
        toast({
          variant: "destructive",
          title: "Erro no perfil",
          description: "Seu perfil não foi encontrado. Por favor, faça logout e cadastre-se novamente.",
        })
        setLoading(false)
        return
      }

      // Preparar dados do usuário para atualização
      const userData: any = {
        nome: nome.trim(),
        telefone: telefoneLimpo,
        organization_id: organization.id,
        role: "admin",
        active: true,
      }

      // Adicionar campos opcionais
      if (fotoUrl) {
        userData.avatar_url = fotoUrl
      }

      // Atualizar usuário existente
      const { error: userUpdateError } = await supabase
        .from("users")
        .update(userData)
        .eq("id", user.id)

      if (userUpdateError) {
        console.error("Erro ao atualizar usuário:", userUpdateError)
        toast({
          variant: "destructive",
          title: "Erro ao salvar dados",
          description: userUpdateError.message || "Tente novamente.",
        })
        setLoading(false)
        return
      }

      // Marcar organização como onboarding completo
      const { error: orgOnboardingError } = await supabase
        .from("organizations")
        .update({ onboarding_completo: true })
        .eq("id", organization.id)

      if (orgOnboardingError) {
        console.warn("Erro ao marcar onboarding como completo (não crítico):", orgOnboardingError)
        // Não bloquear se falhar, mas avisar
      } else {
        console.log("✅ Onboarding marcado como completo na organização")
      }

      // Criar configuração de taxa de imposto
      const { error: settingsError } = await supabase
        .from("app_settings")
        .insert({
          key: "taxa_imposto",
          value: Number(taxaImposto),
          description: "Taxa de imposto padrão (%)",
          organization_id: organization.id,
        })

      if (settingsError) {
        console.warn("Erro ao criar configuração (não crítico):", settingsError)
      }

      // Atualizar user_metadata (sem onboarding_completo, pois é da organização)
      await supabase.auth.updateUser({
        data: {
          nome: nome.trim(),
          avatar_url: fotoUrl || null,
        },
      })

      toast({
        title: "Onboarding concluído! 🎉",
        description: "Sua organização foi criada com sucesso.",
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error) {
      console.error("Erro:", error)
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Erro ao finalizar onboarding. Tente novamente.",
      })
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Esquerda - Fundo Escuro */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/3 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32">
          <svg
            className="absolute bottom-0 w-full"
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="rgb(15 23 42)"
              className="opacity-20"
            />
          </svg>
        </div>

        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.1) 10px,
              rgba(255, 255, 255, 0.1) 20px
            )`,
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-8">
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">
                B
              </div>
              <span className="font-display text-2xl font-bold text-white">BALANGO</span>
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Vamos começar! 🚀
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Configure sua organização e comece a gerenciar seus serviços de forma profissional.
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {STEPS.map((step) => {
              const IconComponent = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              const canClick = step.id <= currentStep || (step.id === currentStep + 1 && canProceed[currentStep])

              return (
                <button
                  key={step.id}
                  onClick={() => canClick && handleStepClick(step.id as Step)}
                  disabled={!canClick}
                  className={cn(
                    "relative flex items-center gap-4 p-6 rounded-lg border-2 transition-all duration-300 text-left",
                    isActive
                      ? "bg-white border-emerald-500 shadow-2xl scale-105 translate-x-2 z-10"
                      : isCompleted
                      ? "bg-slate-900 border-slate-700 hover:border-slate-600"
                      : "bg-slate-900 border-slate-700 opacity-60 cursor-not-allowed",
                    canClick && !isActive && "hover:border-slate-600 hover:opacity-100"
                  )}
                >
                  <div
                    className={cn(
                      "absolute right-0 top-0 bottom-0 w-1 rounded-r-lg transition-colors",
                      isActive ? "bg-emerald-500" : "bg-slate-700"
                    )}
                  />
                  <div
                    className={cn(
                      "flex-shrink-0 p-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-800 text-slate-400"
                    )}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={cn(
                        "font-semibold text-lg mb-1 transition-colors",
                        isActive ? "text-slate-900" : "text-white"
                      )}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={cn(
                        "text-sm transition-colors",
                        isActive ? "text-slate-600" : "text-slate-400"
                      )}
                    >
                      {step.description}
                    </p>
                  </div>
                  {isCompleted && (
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Card Branco à Direita - Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto bg-slate-50">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm transition-all",
                    currentStep === step.id
                      ? "bg-slate-900 text-white border-slate-900 scale-110"
                      : currentStep > step.id
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white text-slate-400 border-slate-300"
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    `0${step.id}`
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 mx-2 transition-colors",
                      currentStep > step.id ? "bg-emerald-500" : "bg-slate-300"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Conteúdo do Formulário */}
          <div className="space-y-8">
            {/* Etapa 1: Organização */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    Informações da Organização
                  </h2>
                  <p className="text-slate-600">
                    Configure os dados da sua empresa ou organização.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Logo */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-sm font-medium">
                      Logo da Organização
                    </Label>
                    <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors">
                      <div className="relative">
                        {logoOrganizacao ? (
                          <img
                            src={logoOrganizacao}
                            alt="Logo"
                            className="h-32 w-32 object-cover rounded-lg border-4 border-white shadow-lg"
                          />
                        ) : (
                          <div className="h-32 w-32 bg-slate-200 rounded-lg border-4 border-white shadow-lg flex items-center justify-center">
                            <Building2 className="h-12 w-12 text-slate-400" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center border-4 border-white shadow-lg transition-colors"
                        >
                          <Camera className="h-5 w-5 text-white" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, true)}
                          className="hidden"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-700 mb-1">
                          {logoOrganizacao ? "Logo adicionado" : "Adicione o logo da sua organização"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Clique no ícone da câmera para {logoOrganizacao ? "alterar" : "adicionar"} o logo
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Nome da Organização */}
                  <div className="space-y-2">
                    <Label htmlFor="nomeOrganizacao" className="text-slate-700 text-sm font-medium">
                      Nome da Organização *
                    </Label>
                    <Input
                      id="nomeOrganizacao"
                      type="text"
                      value={nomeOrganizacao}
                      onChange={(e) => setNomeOrganizacao(e.target.value)}
                      placeholder="Nome da sua empresa"
                      className="h-12 bg-white border-slate-300 text-slate-900 text-base focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Slug */}
                  <div className="space-y-2">
                    <Label htmlFor="slugOrganizacao" className="text-slate-700 text-sm font-medium">
                      Slug (Identificador único) *
                    </Label>
                    <Input
                      id="slugOrganizacao"
                      type="text"
                      value={slugOrganizacao}
                      onChange={(e) => setSlugOrganizacao(e.target.value)}
                      placeholder="empresa-exemplo"
                      className="h-12 bg-white border-slate-300 text-slate-900 text-base focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-slate-500">
                      Identificador único para sua organização (gerado automaticamente a partir do nome)
                    </p>
                  </div>

                  {/* CNPJ */}
                  <div className="space-y-2">
                    <Label htmlFor="cnpj" className="text-slate-700 text-sm font-medium">
                      CNPJ
                    </Label>
                    <Input
                      id="cnpj"
                      type="text"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      className="h-12 bg-white border-slate-300 text-slate-900 text-base focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Telefone Organização */}
                    <div className="space-y-2">
                      <Label htmlFor="telefoneOrganizacao" className="text-slate-700 text-sm font-medium">
                        Telefone
                      </Label>
                      <Input
                        id="telefoneOrganizacao"
                        type="text"
                        value={telefoneOrganizacao}
                        onChange={(e) => handlePhoneChange(e.target.value, setTelefoneOrganizacao)}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        className="h-12 bg-white border-slate-300 text-slate-900 text-base focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Email Organização */}
                    <div className="space-y-2">
                      <Label htmlFor="emailOrganizacao" className="text-slate-700 text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="emailOrganizacao"
                        type="email"
                        value={emailOrganizacao}
                        onChange={(e) => setEmailOrganizacao(e.target.value)}
                        placeholder="contato@empresa.com"
                        className="h-12 bg-white border-slate-300 text-slate-900 text-base focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="space-y-2">
                    <Label htmlFor="enderecoOrganizacao" className="text-slate-700 text-sm font-medium">
                      Endereço
                    </Label>
                    <Input
                      id="enderecoOrganizacao"
                      type="text"
                      value={enderecoOrganizacao}
                      onChange={(e) => setEnderecoOrganizacao(e.target.value)}
                      placeholder="Rua, número, bairro, cidade - UF"
                      className="h-12 bg-white border-slate-300 text-slate-900 text-base focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 2: Perfil */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    Seu Perfil
                  </h2>
                  <p className="text-slate-600">
                    Complete suas informações pessoais.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Foto de Perfil */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-sm font-medium">
                      Foto de Perfil
                    </Label>
                    <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors">
                      <div className="relative">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                          <AvatarImage src={fotoPerfil || ""} alt="Foto de perfil" />
                          <AvatarFallback className="bg-slate-200 text-slate-500 text-4xl">
                            {nome ? nome.charAt(0).toUpperCase() : <User className="h-12 w-12" />}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCropForLogo(false)
                            fileInputRef.current?.click()
                          }}
                          className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center border-4 border-white shadow-lg transition-colors"
                        >
                          <Camera className="h-5 w-5 text-white" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, false)}
                          className="hidden"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-700 mb-1">
                          {fotoPerfil ? "Foto adicionada" : "Adicione sua foto de perfil"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Clique no ícone da câmera para {fotoPerfil ? "alterar" : "adicionar"} sua foto
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-slate-700 text-sm font-medium">
                      Nome completo *
                    </Label>
                    <Input
                      id="nome"
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                      className="h-12 bg-white border-slate-300 text-slate-900 text-base focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Telefone */}
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-slate-700 text-sm font-medium">
                      Telefone/WhatsApp *
                    </Label>
                    <Input
                      id="telefone"
                      type="text"
                      value={telefone}
                      onChange={(e) => handlePhoneChange(e.target.value, setTelefone)}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      className="h-12 bg-white border-slate-300 text-slate-900 text-base focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-slate-500">
                      Usado para contato e notificações
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 3: Configurações */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    Configurações Iniciais
                  </h2>
                  <p className="text-slate-600">
                    Defina as configurações padrão da sua organização.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Taxa de Imposto */}
                  <div className="space-y-2">
                    <Label htmlFor="taxaImposto" className="text-slate-700 text-sm font-medium">
                      Taxa de Imposto Padrão (%) *
                    </Label>
                    <Input
                      id="taxaImposto"
                      type="number"
                      value={taxaImposto}
                      onChange={(e) => setTaxaImposto(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      max="100"
                      step="0.01"
                      className="h-12 bg-white border-slate-300 text-slate-900 text-base focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-slate-500">
                      Taxa de imposto padrão que será aplicada aos serviços (0-100%)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botões de Navegação */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
            {currentStep > 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="h-12 px-6 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
            <div className="flex-1" />
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed[currentStep] || loading}
                className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={loading}
                className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Finalizando..." : "Finalizar 🎉"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Crop de Imagem */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="max-w-2xl w-full p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl font-semibold text-slate-900">
              {isCropForLogo ? "Editar Logo" : "Editar Foto de Perfil"}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Ajuste o tamanho e posicionamento da imagem. Arraste para mover e use o zoom para aproximar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative w-full h-[400px] bg-slate-900">
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={false}
                style={{
                  containerStyle: {
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  },
                }}
              />
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <Label className="text-sm font-medium text-slate-700 min-w-[60px]">
                Zoom:
              </Label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <span className="text-sm text-slate-600 min-w-[40px] text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancelCrop}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCropComplete}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

