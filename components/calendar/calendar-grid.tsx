"use client"

import { DayCell } from "./day-cell"
import { ServiceWithRelations } from "@/lib/types/database"

export interface CalendarDay {
  day: number | null
  date: Date | null
  serviceCount: number
  totalValue: number
  hasInvoice: boolean
  services?: ServiceWithRelations[]
  hasPaid?: boolean
  hasPending?: boolean
}

interface CalendarGridProps {
  currentDate: Date
  days: CalendarDay[]
  selectedDate: Date | null
  onDayClick: (date: Date) => void
}

export function CalendarGrid({
  currentDate,
  days,
  selectedDate,
  onDayClick,
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
    <div className="bg-slate-50 dark:bg-slate-950 flex flex-col p-2 md:p-4">
      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid do calendário */}
      <div className="grid grid-cols-7 gap-2">
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

          return (
            <button
              key={index}
              type="button"
              onClick={() => onDayClick(date)}
              className="w-full text-left focus:outline-none focus:ring-0"
            >
              <DayCell
                day={calendarDay.day}
                isToday={isTodayDay}
                isSelected={isSelected}
                serviceCount={calendarDay.serviceCount}
                totalValue={calendarDay.totalValue}
                hasInvoice={calendarDay.hasInvoice}
                isOtherMonth={isOther}
                hasPaid={calendarDay.hasPaid}
                hasPending={calendarDay.hasPending}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

