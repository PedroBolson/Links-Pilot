import { doc, getDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserProfile } from '@/types/user.types'

function toUserProfile(uid: string, data: Record<string, unknown>): UserProfile {
  return { uid, ...data } as UserProfile
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return toUserProfile(uid, snap.data())
}

export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      callback(snap.exists() ? toUserProfile(uid, snap.data()) : null)
    },
    onError,
  )
}
