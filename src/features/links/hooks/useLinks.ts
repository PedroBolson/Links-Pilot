import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { getUserLinks } from '@/services/links.service'

export function useLinks() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['links', user?.uid],
    queryFn: () => getUserLinks(user!.uid),
    enabled: Boolean(user),
  })
}
