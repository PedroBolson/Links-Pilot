import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { subscribeToUserProfile } from '@/services/users.service'
import type { UserProfile } from '@/types/user.types'

export function useUserProfile() {
  const { user } = useAuth()
  const [state, setState] = useState<{
    userId: string | null
    profile: UserProfile | null
    isError: boolean
  }>({
    userId: null,
    profile: null,
    isError: false,
  })

  useEffect(() => {
    if (!user) return undefined

    return subscribeToUserProfile(
      user.uid,
      (profile) => {
        setState({
          userId: user.uid,
          profile,
          isError: false,
        })
      },
      () => {
        setState({
          userId: user.uid,
          profile: null,
          isError: true,
        })
      },
    )
  }, [user])

  const hasCurrentUserData = Boolean(user && state.userId === user.uid)

  return {
    data: hasCurrentUserData ? state.profile : null,
    isLoading: Boolean(user && !hasCurrentUserData && !state.isError),
    isError: Boolean(user && state.userId === user.uid && state.isError),
  }
}
