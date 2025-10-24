/**
 * Utilidades centralizadas para manejo de fechas y horas
 * 
 * Estrategia:
 * - El backend guarda todo en UTC (TIMESTAMPTZ)
 * - El frontend siempre trabaja en hora local de México (America/Mexico_City)
 * - Todas las conversiones pasan por estas funciones
 */

import { format as dateFnsFormat } from 'date-fns'
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz'
import { es } from 'date-fns/locale'

/**
 * Zona horaria de México (CST/CDT)
 * UTC-6 (hora estándar) o UTC-5 (horario de verano)
 */
export const TIMEZONE = 'America/Mexico_City'

/**
 * Formatea una fecha UTC a hora local de México con formato personalizado
 * 
 * @param date - Fecha en formato UTC (string ISO o Date)
 * @param formatStr - Formato deseado (ej: 'dd/MM/yyyy HH:mm')
 * @returns Fecha formateada en hora local
 * 
 * @example
 * formatLocalDateTime('2025-10-24T20:00:00Z', 'dd/MM/yyyy HH:mm')
 * // Returns: "24/10/2025 14:00" (CST es UTC-6)
 */
export function formatLocalDateTime(
  date: string | Date,
  formatStr: string = 'dd/MM/yyyy HH:mm'
): string {
  if (!date) return ''
  return formatInTimeZone(date, TIMEZONE, formatStr, { locale: es })
}

/**
 * Formatea solo la hora en formato 24h (HH:mm) en hora local de México
 * 
 * @param date - Fecha en formato UTC
 * @returns Hora formateada (ej: "14:00")
 * 
 * @example
 * formatLocalTime('2025-10-24T20:00:00Z')
 * // Returns: "14:00" (2:00 PM en CST)
 */
export function formatLocalTime(date: string | Date): string {
  if (!date) return ''
  return formatInTimeZone(date, TIMEZONE, 'HH:mm')
}

/**
 * Formatea solo la hora en formato 12h (h:mm a) en hora local de México
 * 
 * @param date - Fecha en formato UTC
 * @returns Hora formateada (ej: "2:00 PM")
 */
export function formatLocalTime12h(date: string | Date): string {
  if (!date) return ''
  return formatInTimeZone(date, TIMEZONE, 'h:mm a', { locale: es })
}

/**
 * Formatea solo la fecha en formato local de México
 * 
 * @param date - Fecha en formato UTC
 * @param formatStr - Formato deseado (default: 'dd/MM/yyyy')
 * @returns Fecha formateada
 * 
 * @example
 * formatLocalDate('2025-10-24T20:00:00Z')
 * // Returns: "24/10/2025"
 */
export function formatLocalDate(
  date: string | Date,
  formatStr: string = 'dd/MM/yyyy'
): string {
  if (!date) return ''
  return formatInTimeZone(date, TIMEZONE, formatStr, { locale: es })
}

/**
 * Formatea una fecha con nombre del día en español
 * 
 * @param date - Fecha en formato UTC
 * @returns Fecha formateada (ej: "Viernes, 24 de octubre de 2025")
 */
export function formatLocalDateFull(date: string | Date): string {
  if (!date) return ''
  return formatInTimeZone(
    date,
    TIMEZONE,
    "EEEE, d 'de' MMMM 'de' yyyy",
    { locale: es }
  )
}

/**
 * Convierte una fecha/hora local (sin timezone) a UTC para enviar al backend
 * 
 * Esta es la función más importante para GUARDAR datos
 * 
 * @param dateStr - Fecha en formato 'YYYY-MM-DD'
 * @param timeStr - Hora en formato 'HH:mm'
 * @returns String ISO en UTC (ej: '2025-10-24T20:00:00.000Z')
 * 
 * @example
 * localToUTC('2025-10-24', '14:00')
 * // Returns: "2025-10-24T20:00:00.000Z" (14:00 CST = 20:00 UTC)
 */
export function localToUTC(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) return ''
  const localDateTime = `${dateStr}T${timeStr}:00`
  // Interpretar como fecha en timezone de México y convertir a UTC
  const utcDate = fromZonedTime(localDateTime, TIMEZONE)
  return utcDate.toISOString()
}

/**
 * Obtiene la fecha/hora actual en la zona horaria de México
 * 
 * @returns Date object en hora local
 */
export function getCurrentLocalDate(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }))
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (para inputs type="date")
 * 
 * @returns String en formato YYYY-MM-DD
 */
export function getTodayLocalDateString(): string {
  const today = getCurrentLocalDate()
  return today.toISOString().split('T')[0]
}

/**
 * Obtiene la hora actual en formato HH:mm (para inputs type="time")
 * 
 * @returns String en formato HH:mm
 */
export function getCurrentLocalTimeString(): string {
  const now = getCurrentLocalDate()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Calcula la diferencia en minutos entre dos fechas
 * 
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns Diferencia en minutos
 */
export function getMinutesDifference(
  startDate: string | Date,
  endDate: string | Date
): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60))
}

/**
 * Convierte minutos a formato legible (ej: "2h 30min")
 * 
 * @param minutes - Número de minutos
 * @returns String formateado
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

/**
 * Verifica si una fecha es hoy (en hora local de México)
 * 
 * @param date - Fecha a verificar
 * @returns true si es hoy
 */
export function isToday(date: string | Date): boolean {
  const dateToCheck = formatLocalDate(date, 'yyyy-MM-dd')
  const today = getTodayLocalDateString()
  return dateToCheck === today
}

/**
 * Verifica si una fecha es en el pasado (en hora local de México)
 * 
 * @param date - Fecha a verificar
 * @returns true si es pasada
 */
export function isPast(date: string | Date): boolean {
  const dateToCheck = new Date(formatLocalDate(date, 'yyyy-MM-dd'))
  const today = new Date(getTodayLocalDateString())
  return dateToCheck < today
}

/**
 * Verifica si una fecha es en el futuro (en hora local de México)
 * 
 * @param date - Fecha a verificar
 * @returns true si es futura
 */
export function isFuture(date: string | Date): boolean {
  const dateToCheck = new Date(formatLocalDate(date, 'yyyy-MM-dd'))
  const today = new Date(getTodayLocalDateString())
  return dateToCheck > today
}

