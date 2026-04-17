import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR, enUS, es, type Locale } from 'date-fns/locale'
import type { Timestamp } from 'firebase/firestore'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DATE_LOCALES: Record<string, Locale> = {
  pt: ptBR,
  en: enUS,
  es,
}

export function formatDate(
  date: Date | Timestamp,
  lang = 'en',
  pattern = 'PPP',
): string {
  const d = 'toDate' in date ? date.toDate() : date
  return format(d, pattern, { locale: DATE_LOCALES[lang] ?? enUS })
}

export function timeFromNow(date: Date | Timestamp, lang = 'en'): string {
  const d = 'toDate' in date ? date.toDate() : date
  return formatDistanceToNow(d, {
    addSuffix: true,
    locale: DATE_LOCALES[lang] ?? enUS,
  })
}

export function isExpired(expiresAt: Date | Timestamp): boolean {
  const d = 'toDate' in expiresAt ? expiresAt.toDate() : expiresAt
  return d < new Date()
}
