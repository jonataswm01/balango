"use client"

import { DayCell } from "./day-cell"
import { DayView } from "./day-view"
import { cn } from "@/lib/utils"
import { ServiceWithRelations } from "@/lib/types/database"

export interface CalendarDay {
  day: number | null
  date: Date | null
  serviceCount: number
  totalValue: number
  hasInvoice: boolean
  services?: ServiceWithRelations[]
}

interface CalendarGridProps {
  currentDate: Date
  days: CalendarDay[]
  selectedDate: Date | null
  onDayClick: (date: Date) => void
  onAddService?: (date: Date) => void
  onEditService?: (service: ServiceWithRelations) => void
  onDeleteService?: (service: ServiceWithRelations) => void
}

export function CalendarGrid({
  currentDate,
  days,
  selectedDate,
  onDayClick,
  onAddService,
  onEditService,
  onDeleteService,
}: CalendarGridProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  const isSelectedDay = (date: Date | null) => {
    if (!date || !selectedDate) return false
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isOtherMonth = (date: Date | null) => {
    if (!date) return true
    return (
      date.getMonth() !== currentDate.getMonth() ||
      date.getFullYear() !== currentDate.getFullYear()
    )
  }

  return (
    <div className="bg-white dark:bg-slate-950 h-full flex flex-col">
      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 gap-0.5 bg-slate-50 dark:bg-slate-900 px-2 py-3 flex-shrink-0">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid do calendário - Ocupa o espaço restante */}
      <div className="grid grid-cols-7 gap-0.5 p-2 flex-1 auto-rows-fr">
        {days.map((calendarDay, index) => {
          const date = calendarDay.date
          const isSelected = isSelectedDay(date)
          const isTodayDay = isToday(date)
          const isOther = isOtherMonth(date)

          if (!date) {
            return (
              <DayCell
                key={index}
                day={calendarDay.day}
                isToday={false}
                isSelected={false}
                serviceCount={0}
                totalValue={0}
                hasInvoice={false}
                isOtherMonth={true}
              />
            )
          }

          const dayServices = calendarDay.services || []

          return (
            <DayView
              key={index}
              date={date}
              services={dayServices}
              totalValue={calendarDay.totalValue}
              onAddService={onAddService || (() => {})}
              onEditService={onEditService}
              onDeleteService={onDeleteService}
              onDayClick={() => onDayClick(date)}
            >
              <DayCell
                day={calendarDay.day}
                isToday={isTodayDay}
                isSelected={isSelected}
                serviceCount={calendarDay.serviceCount}
                totalValue={calendarDay.totalValue}
                hasInvoice={calendarDay.hasInvoice}
                isOtherMonth={isOther}
              />
            </DayView>
          )
        })}
      </div>
    </div>
  )
}

