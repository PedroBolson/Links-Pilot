import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserProfile } from '@/types/user.types'

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return { uid, ...snap.data() } as UserProfile
}

export async function ensureUserProfile(
  uid: string,
  email: string,
): Promise<void> {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      email,
      plan: 'free',
      linkCount: 0,
      createdAt: serverTimestamp(),
    })
  }
}
