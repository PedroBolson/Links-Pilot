import {z} from "zod";
import {RESERVED_SLUGS, SLUG_REGEX} from "../types/link.types.js";

export const createLinkSchema = z.object({
  originalUrl: z
    .string()
    .url()
    .refine((url) => url.startsWith("http://") || url.startsWith("https://")),

  slug: z
    .string()
    .min(4)
    .max(20)
    .regex(SLUG_REGEX)
    .refine((s) => !RESERVED_SLUGS.has(s.toLowerCase()))
    .optional()
    .nullable(),

  title: z.string().max(80).optional().nullable(),

  expiresAt: z.coerce.date(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>
