import { useMutation } from '@tanstack/react-query'
import { httpsCallableFromURL } from 'firebase/functions'
import { functions, cloudRunUrl } from '@/lib/firebase'
import { queryClient } from '@/lib/query-client'

const deleteLinkFn = httpsCallableFromURL<{ linkId: string }, { success: boolean }>(
  functions,
  cloudRunUrl('deleteLink'),
)

export function useDeleteLink() {
  return useMutation({
    mutationFn: (linkId: string) => deleteLinkFn({ linkId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] })
    },
  })
}
