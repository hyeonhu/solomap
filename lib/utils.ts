import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return '미확인'
  return `${price.toLocaleString('ko-KR')}원`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  })
}

export function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return ''
  return timeStr.slice(0, 5)
}

export function isThisWeekend(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  const day = now.getDay()
  const saturday = new Date(now)
  saturday.setDate(now.getDate() + (6 - day))
  saturday.setHours(0, 0, 0, 0)
  const sunday = new Date(saturday)
  sunday.setDate(saturday.getDate() + 1)
  sunday.setHours(23, 59, 59, 999)
  return date >= saturday && date <= sunday
}

export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  return date.toDateString() === now.toDateString()
}

export function isTomorrow(dateStr: string): boolean {
  const date = new Date(dateStr)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return date.toDateString() === tomorrow.toDateString()
}

export function formatAgeRange(
  minMale: number | null,
  maxMale: number | null,
  minFemale: number | null,
  maxFemale: number | null
): string {
  const parts: string[] = []
  if (minMale && maxMale) parts.push(`남성 ${minMale}~${maxMale}세`)
  if (minFemale && maxFemale) parts.push(`여성 ${minFemale}~${maxFemale}세`)
  return parts.length > 0 ? parts.join(' / ') : '미기재'
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
