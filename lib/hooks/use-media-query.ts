"use client"

import { useState, useEffect } from "react"

/**
 * Hook para detectar se a tela é mobile ou desktop
 * @param breakpoint - Breakpoint em pixels (padrão: 768px para md do Tailwind)
 * @returns true se for mobile (menor que breakpoint), false se for desktop
 */
export function useMediaQuery(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Verificar se está no cliente
    if (typeof window === "undefined") {
      return
    }

    setMounted(true)
    
    const checkMobile = () => {
      try {
        setIsMobile(window.innerWidth < breakpoint)
      } catch (error) {
        setIsMobile(false)
      }
    }
    
    // Verificar inicialmente
    checkMobile()
    
    // Listener para mudanças de tamanho
    const handleResize = () => {
      checkMobile()
    }
    
    window.addEventListener("resize", handleResize)
    
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [breakpoint])

  // Retornar false durante SSR para evitar mismatch
  return { isMobile: mounted ? isMobile : false, mounted }
}

