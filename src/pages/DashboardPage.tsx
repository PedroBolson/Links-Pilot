import { useMemo, useEffect } from 'react'
import { Link2, MousePointerClick, Activity } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { AppLayout } from '@/components/layout/AppLayout'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatsCard } from '@/features/dashboard/components/StatsCard'
import { LinkCard } from '@/features/links/components/LinkCard'
import { CreateLinkForm } from '@/features/links/components/CreateLinkForm'
import { useLinks } from '@/features/links/hooks/useLinks'
import { isExpired } from '@/lib/utils'

const SHORT_BASE_URL = import.meta.env.VITE_SHORT_BASE_URL ?? 'https://linkspilot.web.app'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { data: links, isLoading, isError } = useLinks()

  useEffect(() => { document.title = t('dashboard.pageTitle') }, [t])

  const stats = useMemo(() => {
    if (!links) return { total: 0, active: 0, totalClicks: 0 }
    return {
      total: links.length,
      active: links.filter((l) => !isExpired(l.expiresAt)).length,
      totalClicks: links.reduce((acc, l) => acc + l.clickCount, 0),
    }
  }, [links])

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatsCard
            label={t('dashboard.totalLinks')}
            value={stats.total}
            icon={Link2}
            loading={isLoading}
          />
          <StatsCard
            label={t('dashboard.activeLinks')}
            value={stats.active}
            icon={Activity}
            loading={isLoading}
          />
          <StatsCard
            label={t('dashboard.totalClicks')}
            value={stats.totalClicks}
            icon={MousePointerClick}
            loading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Create form */}
          <div className="lg:col-span-1">
            <CreateLinkForm />
          </div>

          {/* Link list */}
          <div className="space-y-3 lg:col-span-2">
            <h2 className="text-sm font-medium text-foreground">{t('dashboard.recentLinks')}</h2>

            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            )}

            {isError && (
              <p className="text-sm text-destructive">{t('errors.generic')}</p>
            )}

            {!isLoading && !isError && links?.length === 0 && (
              <EmptyState
                title={t('links.empty')}
                description={t('links.emptyDescription')}
              />
            )}

            {!isLoading && links && links.length > 0 && (
              <div className="space-y-3">
                {links.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    shortBaseUrl={SHORT_BASE_URL}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
