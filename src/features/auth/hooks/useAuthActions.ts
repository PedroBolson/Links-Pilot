import { useMutation } from '@tanstack/react-query'
import { httpsCallableFromURL } from 'firebase/functions'
import { signInWithGoogle, signOut } from '@/services/auth.service'
import { functions, cloudRunUrl } from '@/lib/firebase'

const ensureProfileFn = httpsCallableFromURL(functions, cloudRunUrl('ensureProfile'))

export function useSignInWithGoogle() {
  return useMutation({
    mutationFn: async () => {
      const credential = await signInWithGoogle()
      await ensureProfileFn()
      return credential
    },
  })
}

export function useSignOut() {
  return useMutation({
    mutationFn: signOut,
  })
}
