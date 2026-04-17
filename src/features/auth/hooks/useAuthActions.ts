import { useMutation } from '@tanstack/react-query'
import { signInWithGoogle, signOut } from '@/services/auth.service'

export function useSignInWithGoogle() {
  return useMutation({
    mutationFn: signInWithGoogle,
  })
}

export function useSignOut() {
  return useMutation({
    mutationFn: signOut,
  })
}
