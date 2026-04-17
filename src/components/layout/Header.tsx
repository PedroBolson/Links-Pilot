import { Link, useNavigate } from 'react-router-dom'
import { Moon, Sun, Monitor, LogOut, Globe } from 'lucide-react'
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
import { cn } from '@/lib/utils'

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
  const navigate = useNavigate()
  const { mutate: signOut } = useSignOut()

  const ThemeIcon = THEME_ICONS[theme]

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
          LinksPilot
        </Link>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger className={triggerCn} aria-label="Change language">
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
            <DropdownMenuTrigger className={triggerCn} aria-label="Toggle theme">
              <ThemeIcon className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" /> System
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
                      alt={user.displayName ?? 'User'}
                      className="h-7 w-7 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
                    </span>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                    {user.displayName ?? user.email}
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
