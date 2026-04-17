import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Link } from '@/types/link.types'

function toLink(id: string, data: Record<string, unknown>): Link {
  return { id, ...data } as Link
}

export function subscribeToUserLinks(
  userId: string,
  callback: (links: Link[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'links'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  )

  return onSnapshot(q, (snap) => {
    const links = snap.docs.map((d) => toLink(d.id, d.data()))
    callback(links)
  })
}

export async function getUserLinks(userId: string): Promise<Link[]> {
  const q = query(
    collection(db, 'links'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => toLink(d.id, d.data()))
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const ref = doc(db, 'slugs', slug)
  const snap = await getDoc(ref)
  return !snap.exists()
}
