import { z } from 'zod'

const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/

const RESERVED_SLUGS = new Set([
  'auth', 'dashboard', 'expired', 'api', 'r', 'admin',
  'login', 'register', 'settings', 'health', 'static', 'assets',
])

export const createLinkSchema = z.object({
  originalUrl: z
    .string()
    .min(1, 'errors.invalidUrl')
    .url('errors.invalidUrl')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'errors.invalidUrl',
    ),

  slug: z
    .string()
    .min(4, 'errors.slugInvalid')
    .max(20, 'errors.slugInvalid')
    .regex(SLUG_REGEX, 'errors.slugInvalid')
    .refine((s) => !RESERVED_SLUGS.has(s.toLowerCase()), 'errors.slugReserved')
    .optional()
    .or(z.literal('')),

  title: z.string().max(80).optional().or(z.literal('')),

  expiresAt: z
    .date()
    .refine((date) => date.getTime() > Date.now(), 'errors.expirationFuture'),
})

export type CreateLinkFormValues = z.infer<typeof createLinkSchema>
