import type { Timestamp } from 'firebase/firestore'

export interface ClickEvent {
  id: string
  linkId: string
  userId: string
  timestamp: Timestamp
  userAgent: string | null
  referer: string | null
}

export interface ApiError {
  code: string
  message: string
}
