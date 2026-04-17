import type { Timestamp } from 'firebase/firestore'

export type LinkStatus = 'active' | 'expired'

export interface Link {
  id: string
  slug: string
  originalUrl: string
  userId: string
  title: string | null
  customSlug: boolean
  createdAt: Timestamp
  expiresAt: Timestamp
  status: LinkStatus
  clickCount: number
}

export interface SlugIndex {
  linkId: string
  userId: string
  expiresAt: Timestamp
}

export type CreateLinkInput = {
  originalUrl: string
  slug?: string
  title?: string
  expiresAt: Date
}

export type CreateLinkResult = {
  linkId: string
  slug: string
  shortUrl: string
}
