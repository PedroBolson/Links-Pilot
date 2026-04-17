import type {Timestamp} from "firebase-admin/firestore";

export type LinkStatus = "active" | "expired"

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
  ttl: Timestamp
}

export interface SlugIndex {
  linkId: string
  userId: string
  expiresAt: Timestamp
}

export interface UserProfile {
  uid: string
  email: string
  plan: "free" | "pro"
  linkCount: number
}

export const PLAN_LIMITS: Record<UserProfile["plan"], number> = {
  free: 10,
  pro: Infinity,
};

export const RESERVED_SLUGS = new Set([
  "auth", "dashboard", "expired", "api", "r", "admin",
  "login", "register", "settings", "health", "static", "assets",
]);

export const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/;
