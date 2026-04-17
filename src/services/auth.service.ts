import {
  signInWithPopup,
  signOut as firebaseSignOut,
  type UserCredential,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'

export async function signInWithGoogle(): Promise<UserCredential> {
  googleProvider.setCustomParameters({ prompt: 'select_account' })
  return signInWithPopup(auth, googleProvider)
}

export async function signOut(): Promise<void> {
  return firebaseSignOut(auth)
}
