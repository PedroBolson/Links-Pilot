import { Link, useNavigate } from 'react-router-dom'
import { Moon, Sun, Monitor, LogOut, Globe, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/app/providers/ThemeProvider'
import { useAuth } from '@/hooks/useAuth'
import { useSignOut } from '@/features/auth/hooks/useAuthActions'
import { useUserProfile } from '@/features/auth/hooks/useUserProfile'
import { useBillingPlans } from '@/features/billing/hooks/useBillingPlans'
import { cn } from '@/lib/utils'
import { formatCurrencyCents, isProEntitled } from '@/types/billing.types'
import { Button } from '@/components/ui/button'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' },
]

const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

const triggerCn = cn(
  'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm',
  'transition-colors hover:bg-accent hover:text-accent-foreground',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  'disabled:pointer-events-none disabled:opacity-50',
)

export function Header() {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const { data: profile, isLoading: profileLoading } = useUserProfile()
  const { data: billingPlans } = useBillingPlans()
  const navigate = useNavigate()
  const { mutate: signOut } = useSignOut()

  const ThemeIcon = THEME_ICONS[theme]
  const proPlan = billingPlans.pro
  const freeLimit = billingPlans.free.includedLinksLifetime ?? 10
  const usedLinks = profile?.linkCount ?? 0
  const quotaPercent = Math.min((usedLinks / Math.max(freeLimit, 1)) * 100, 100)
  const hasPro = isProEntitled(profile?.plan, profile?.billingStatus)

  function handleSignOut() {
    signOut(undefined, {
      onSuccess: () => navigate('/', { replace: true }),
      onError: () => toast.error(t('errors.generic')),
    })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          to={user ? '/dashboard' : '/'}
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
            L
          </span>
          <span>LinksPilot</span>
        </Link>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger className={triggerCn} aria-label={t('common.changeLanguage')}>
              <Globe className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={i18n.language === lang.code ? 'font-medium' : ''}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className={triggerCn} aria-label={t('common.toggleTheme')}>
              <ThemeIcon className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" /> {t('home.themeLight')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" /> {t('home.themeDark')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" /> {t('home.themeSystem')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user && (
            <>
              <div className="mx-1 h-5 w-px bg-border" />
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName ?? t('nav.user')}
                      className="h-7 w-7 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
                    </span>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                    {user.displayName ?? user.email}
                  </div>
                  <div className="px-2 py-2">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-muted-foreground">{t('nav.linksUsed')}</span>
                      <span className="font-medium text-foreground">
                        {profileLoading
                          ? t('common.loading')
                          : hasPro
                            ? t('nav.linksUsedPro', { count: usedLinks })
                            : t('nav.linksUsedQuota', { count: usedLinks, limit: freeLimit })}
                      </span>
                    </div>
                    {!hasPro && !profileLoading && (
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${quotaPercent}%` }}
                        />
                      </div>
                    )}
                    {!hasPro && !profileLoading && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full justify-start"
                        onClick={() => toast.info(t('billing.proManualNotice'))}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {t('billing.upgradeForPrice', {
                          price: formatCurrencyCents(proPlan.monthlyPriceCents, i18n.language),
                        })}
                      </Button>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('nav.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
