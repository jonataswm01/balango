"use client"

import * as React from "react"
import { DayPopover } from "./day-popover"
import { DayModal } from "./day-modal"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { ServiceWithRelations } from "@/lib/types/database"

interface DayViewProps {
  date: Date
  services: ServiceWithRelations[]
  totalValue: number
  onAddService: (date: Date) => void
  onEditService?: (service: ServiceWithRelations) => void
  onDeleteService?: (service: ServiceWithRelations) => void
  onDayClick?: () => void
  children: React.ReactNode
}

/**
 * Componente adaptativo que usa:
 * - Popover no Desktop (aparece próximo ao dia clicado)
 * - Modal no Mobile (aparece no centro com backdrop)
 */
export function DayView({
  date,
  services,
  totalValue,
  onAddService,
  onEditService,
  onDeleteService,
  onDayClick,
  children,
}: DayViewProps) {
  const { isMobile, mounted } = useMediaQuery(768) // Breakpoint md do Tailwind
  const [modalOpen, setModalOpen] = React.useState(false)

  const handleClick = () => {
    if (onDayClick) {
      onDayClick()
    }
    if (isMobile) {
      setModalOpen(true)
    }
  }

  // Determinar se deve mostrar preview baseado em mobile/desktop
  const shouldShowPreview = mounted ? !isMobile : true // Durante SSR, assume desktop

  // Clonar children para passar showPreview
  const childrenWithProps = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        showPreview: shouldShowPreview,
      })
    : children

  // Durante SSR ou antes de montar, usar Popover (padrão desktop)
  if (!mounted) {
    return (
      <DayPopover
        date={date}
        services={services}
        totalValue={totalValue}
        onAddService={onAddService}
        onEditService={onEditService}
        onDeleteService={onDeleteService}
      >
        <button
          type="button"
          className="w-full text-left"
          onClick={handleClick}
        >
          {childrenWithProps}
        </button>
      </DayPopover>
    )
  }

  // No mobile, usar Modal com div clicável (sem preview)
  if (isMobile) {
    return (
      <>
        <div
          className="w-full cursor-pointer transition-transform duration-150 active:scale-95"
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleClick()
            }
          }}
        >
          {childrenWithProps}
        </div>
        <DayModal
          date={date}
          services={services}
          totalValue={totalValue}
          open={modalOpen}
          onOpenChange={setModalOpen}
          onAddService={onAddService}
          onEditService={onEditService}
          onDeleteService={onDeleteService}
        />
      </>
    )
  }

  // No desktop, usar Popover com button (com preview)
  return (
    <DayPopover
      date={date}
      services={services}
      totalValue={totalValue}
      onAddService={onAddService}
      onEditService={onEditService}
      onDeleteService={onDeleteService}
    >
      <button
        type="button"
        className="w-full text-left transition-transform duration-150 hover:scale-[1.02] active:scale-95"
        onClick={handleClick}
      >
        {childrenWithProps}
      </button>
    </DayPopover>
  )
}

