import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { subscribeToUserLinks } from '@/services/links.service'
import type { Link } from '@/types/link.types'

export function useLinks() {
  const { user } = useAuth()
  const [state, setState] = useState<{
    userId: string | null
    links: Link[]
    isError: boolean
  }>({
    userId: null,
    links: [],
    isError: false,
  })

  useEffect(() => {
    if (!user) return undefined

    return subscribeToUserLinks(
      user.uid,
      (nextLinks) => {
        setState({
          userId: user.uid,
          links: nextLinks,
          isError: false,
        })
      },
      () => {
        setState((current) => ({
          userId: user.uid,
          links: current.userId === user.uid ? current.links : [],
          isError: true,
        }))
      },
    )
  }, [user])

  const hasCurrentUserData = Boolean(user && state.userId === user.uid)

  return {
    data: hasCurrentUserData ? state.links : [],
    isLoading: Boolean(user && !hasCurrentUserData && !state.isError),
    isError: Boolean(user && state.userId === user.uid && state.isError),
  }
}
