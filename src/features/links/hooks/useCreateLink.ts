import { useMutation } from '@tanstack/react-query'
import { httpsCallableFromURL } from 'firebase/functions'
import { functions, cloudRunUrl } from '@/lib/firebase'
import { queryClient } from '@/lib/query-client'
import type { CreateLinkInput, CreateLinkResult } from '@/types/link.types'

type CreateLinkPayload = Omit<CreateLinkInput, 'expiresAt'> & { expiresAt: string }

const createLinkFn = httpsCallableFromURL<CreateLinkPayload, CreateLinkResult>(
  functions,
  cloudRunUrl('createLink'),
)

export function useCreateLink() {
  return useMutation({
    mutationFn: async (input: CreateLinkInput) => {
      const result = await createLinkFn({
        ...input,
        expiresAt: input.expiresAt instanceof Date
          ? input.expiresAt.toISOString()
          : String(input.expiresAt),
      })
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] })
    },
  })
}
