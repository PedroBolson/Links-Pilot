import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface StatsCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  loading?: boolean
  badge?: ReactNode
  description?: ReactNode
}

export function StatsCard({ label, value, icon: Icon, loading, badge, description }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            {badge}
          </div>
          {loading ? (
            <Skeleton className="mt-1 h-6 w-16" />
          ) : typeof value === 'number' ? (
            <p className="text-2xl font-semibold">
              <AnimatedNumber value={value} durationMs={1000} />
            </p>
          ) : (
            <p className="text-2xl font-semibold">{value}</p>
          )}
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
