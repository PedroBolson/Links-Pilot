import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDays, format } from 'date-fns'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createLinkSchema, type CreateLinkFormValues } from '../schemas/link.schema'
import { useCreateLink } from '../hooks/useCreateLink'
import { cn } from '@/lib/utils'

const EXPIRY_PRESETS = [
  { label: '1d',  days: 1 },
  { label: '7d',  days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
]

interface CreateLinkFormProps {
  onSuccess?: (shortUrl: string) => void
}

export function CreateLinkForm({ onSuccess }: CreateLinkFormProps) {
  const { t } = useTranslation()
  const { mutate: createLink, isPending } = useCreateLink()
  const [selectedPreset, setSelectedPreset] = useState<number>(7)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateLinkFormValues>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      expiresAt: addDays(new Date(), 7),
      slug: '',
      title: '',
    },
  })

  const expiresAt = watch('expiresAt')

  function setPreset(days: number) {
    setSelectedPreset(days)
    setValue('expiresAt', addDays(new Date(), days), { shouldValidate: true })
  }

  function onSubmit(values: CreateLinkFormValues) {
    createLink(
      {
        originalUrl: values.originalUrl,
        slug: values.slug || undefined,
        title: values.title || undefined,
        expiresAt: values.expiresAt,
      },
      {
        onSuccess: (data) => {
          reset()
          setSelectedPreset(7)
          toast.success('Link created!')
          onSuccess?.(data.shortUrl)
        },
        onError: (err) => {
          const e = err as { code?: string; message?: string }
          if (e.code === 'functions/already-exists') {
            toast.error(t('errors.slugTaken'))
          } else if (e.code === 'functions/resource-exhausted') {
            toast.error(t('errors.limitReached'))
          } else if (e.code === 'functions/not-found') {
            toast.error('User profile not found. Please sign out and sign in again.')
          } else {
            toast.error(e.message ?? t('errors.generic'))
          }
        },
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('links.createNew')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="originalUrl">{t('links.originalUrl')}</Label>
            <Input
              id="originalUrl"
              placeholder={t('links.urlPlaceholder')}
              {...register('originalUrl')}
              aria-invalid={Boolean(errors.originalUrl)}
            />
            {errors.originalUrl && (
              <p className="text-xs text-destructive">{t(errors.originalUrl.message as string)}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">{t('links.customSlug')}</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">/r/</span>
              <Input
                id="slug"
                placeholder={t('links.slugPlaceholder')}
                {...register('slug')}
                aria-invalid={Boolean(errors.slug)}
              />
            </div>
            {errors.slug ? (
              <p className="text-xs text-destructive">{t(errors.slug.message as string)}</p>
            ) : (
              <p className="text-xs text-muted-foreground">{t('links.slugHint')}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="My link title"
              {...register('title')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('links.expiresAt')}</Label>

            {/* Preset buttons */}
            <div className="flex flex-wrap gap-2">
              {EXPIRY_PRESETS.map((p) => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => setPreset(p.days)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                    selectedPreset === p.days
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:bg-muted',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Selected expiration highlight */}
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
              <CalendarClock className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground">
                  {t('links.expiresIn')}{' '}
                  <span className="text-primary">
                    {selectedPreset === 1
                      ? '1 day'
                      : selectedPreset < 60
                        ? `${selectedPreset} days`
                        : null}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {expiresAt ? format(expiresAt, 'PPP p') : '—'}
                </p>
              </div>
            </div>

            {errors.expiresAt && (
              <p className="text-xs text-destructive">{errors.expiresAt.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? t('common.loading') : t('common.create')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
