import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  Link2, Clock, BarChart2, QrCode, ArrowRight, Moon, Sun, Monitor, Globe,
  Loader2, CheckCircle2, Copy, ArrowDown, Zap, Lock,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSignInWithGoogle } from '@/features/auth/hooks/useAuthActions'
import { useTheme } from '@/app/providers/ThemeProvider'
import { cn } from '@/lib/utils'

// ── Floating background elements — generated once, never re-rendered ────────
const FLOATING_ITEMS = [
  { id: 0, text: '/r/xK9mP2', left: '4%', dur: '22s', delay: '-3s', dx: '20px', op: '0.07', size: '11px' },
  { id: 1, text: 'https://example.com/very-long-path/to/article', left: '12%', dur: '28s', delay: '-11s', dx: '-15px', op: '0.04', size: '9px' },
  { id: 2, text: '/r/aB3zQw', left: '22%', dur: '20s', delay: '-7s', dx: '30px', op: '0.08', size: '12px' },
  { id: 3, text: '→', left: '31%', dur: '16s', delay: '-2s', dx: '10px', op: '0.06', size: '18px' },
  { id: 4, text: '/r/tY8nRv', left: '40%', dur: '24s', delay: '-15s', dx: '-25px', op: '0.07', size: '11px' },
  { id: 5, text: 'linkspilot.pedrobolson.com.br', left: '50%', dur: '30s', delay: '-5s', dx: '18px', op: '0.04', size: '10px' },
  { id: 6, text: '/r/cF5hJk', left: '58%', dur: '19s', delay: '-19s', dx: '-20px', op: '0.08', size: '12px' },
  { id: 7, text: '↗', left: '66%', dur: '15s', delay: '-8s', dx: '25px', op: '0.06', size: '20px' },
  { id: 8, text: '/r/mW2pLx', left: '74%', dur: '26s', delay: '-13s', dx: '-10px', op: '0.07', size: '11px' },
  { id: 9, text: 'https://docs.site.com/en/guide/getting-started', left: '83%', dur: '32s', delay: '-1s', dx: '15px', op: '0.04', size: '9px' },
  { id: 10, text: '/r/nZ6qSe', left: '91%', dur: '21s', delay: '-9s', dx: '-30px', op: '0.08', size: '12px' },
  { id: 11, text: '→', left: '7%', dur: '17s', delay: '-22s', dx: '12px', op: '0.05', size: '16px' },
  { id: 12, text: '/r/vH4bDr', left: '47%', dur: '23s', delay: '-17s', dx: '22px', op: '0.07', size: '11px' },
  { id: 13, text: '↗', left: '88%', dur: '18s', delay: '-6s', dx: '-18px', op: '0.06', size: '14px' },
]

// ── Demo URLs cycling through the staged widget ──────────────────────────────
const DEMO_URLS = [
  { long: 'https://youtube.com/watch?v=dQw4w9WgXcQ&list=PLrDnGoKPntlb', short: '/r/yt9mP2' },
  { long: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmU', short: '/r/doc3Kw' },
  { long: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abc', short: '/r/spt8Nv' },
] as const

// Translation keys — resolved inside the component via t()
const FEATURES = [
  { icon: Clock, titleKey: 'home.feature1Title', descKey: 'home.feature1Desc' },
  { icon: BarChart2, titleKey: 'home.feature2Title', descKey: 'home.feature2Desc' },
  { icon: QrCode, titleKey: 'home.feature3Title', descKey: 'home.feature3Desc' },
] as const

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor } as const

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' },
]

const navBtnCn = cn(
  'inline-flex h-9 w-9 items-center justify-center rounded-md',
  'text-hero-fg-dim transition-colors hover:bg-hero-card hover:text-hero-fg',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-hero-border',
)

// ── Staged demo widget ────────────────────────────────────────────────────────
type DemoPhase = 'input' | 'processing' | 'result'

function DemoWidget() {
  const { t } = useTranslation()
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<DemoPhase>('input')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('processing'), 2600)
    const t2 = setTimeout(() => setPhase('result'), 4100)
    const t3 = setTimeout(() => {
      setPhase('input')
      setIdx((i) => (i + 1) % DEMO_URLS.length)
    }, 7800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [idx])

  const { long, short } = DEMO_URLS[idx]
  const isProcessing = phase === 'processing'
  const hasResult = phase === 'result'

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-hero-border bg-hero-card shadow-xl shadow-black/6 backdrop-blur-sm">
      {/* macOS-style window chrome */}
      <div className="flex items-center gap-3 border-b border-hero-border px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#febb2e]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#27c840]" />
        </div>
        <div className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-hero-border bg-hero-card px-3 py-1 text-[10px] text-hero-fg-dim">
          <Link2 className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate font-mono">linkspilot.pedrobolson.com.br</span>
        </div>
        <span className="shrink-0 rounded border border-hero-border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-hero-fg-whisper">
          {t('home.demoBadge')}
        </span>
      </div>

      {/* Body */}
      <div className="space-y-3 p-5">

        {/* ── Step 1: Original URL ── */}
        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-hero-fg-dim">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-hero-border text-[8px] font-bold">
              1
            </span>
            {t('links.originalUrl')}
          </p>
          <div
            className={cn(
              'flex items-center gap-2.5 rounded-xl border border-hero-border px-3.5 py-2.5',
              'transition-all duration-700',
              hasResult ? 'opacity-40' : 'opacity-100',
            )}
          >
            <Link2 className="h-3.5 w-3.5 shrink-0 text-hero-fg-dim" />
            <span className="truncate font-mono text-xs text-hero-fg-muted">{long}</span>
          </div>
        </div>

        {/* ── Processing indicator ── */}
        <div className="flex items-center gap-3 px-1">
          <div className="h-px flex-1 bg-hero-border" />
          <div className="flex items-center gap-1.5 text-[11px] transition-all duration-300">
            {isProcessing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-400" />
                <span className="font-medium text-brand-400">{t('home.demoShortening')}</span>
              </>
            ) : hasResult ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <span className="font-medium text-green-500">{t('home.demoDone')}</span>
              </>
            ) : (
              <>
                <ArrowDown className="h-3.5 w-3.5 text-hero-fg-dim" />
                <span className="text-hero-fg-dim">{t('home.demoGenerating')}</span>
              </>
            )}
          </div>
          <div className="h-px flex-1 bg-hero-border" />
        </div>

        {/* ── Step 2: Short link result ── */}
        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-hero-fg-dim">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-hero-border text-[8px] font-bold">
              2
            </span>
            {t('home.demoShortLink')}
          </p>
          <div
            className={cn(
              'flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5',
              'border-brand-500/30 bg-brand-500/6',
              'transition-all duration-500',
              !hasResult
                ? 'pointer-events-none translate-y-1 opacity-0'
                : 'translate-y-0 opacity-100',
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              <Zap className="h-3.5 w-3.5 shrink-0 text-brand-400" />
              <span className="truncate font-mono text-xs font-semibold text-brand-300">
                linkspilot.pedrobolson.com.br{short}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                className="rounded-lg p-1.5 text-hero-fg-dim transition-colors hover:bg-brand-500/20 hover:text-brand-300"
                aria-label={t('links.copyLink')}
              >
                <Copy className="h-3 w-3" />
              </button>
              <button
                className="rounded-lg p-1.5 text-hero-fg-dim transition-colors hover:bg-brand-500/20 hover:text-brand-300"
                aria-label={t('links.viewQr')}
              >
                <QrCode className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Google logo ───────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const { mutate: signIn, isPending } = useSignInWithGoogle()

  useEffect(() => { document.title = t('home.pageTitle') }, [t])

  const ThemeIcon = THEME_ICONS[theme]

  function handleSignIn() {
    signIn(undefined, {
      onSuccess: () => navigate('/dashboard', { replace: true }),
      onError: (err) => {
        const code = (err as { code?: string }).code
        if (code !== 'auth/popup-closed-by-user') {
          toast.error(t('errors.generic'))
        }
      },
    })
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-hero-bg transition-colors duration-300">

      {/* ── Animated background ─────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {FLOATING_ITEMS.map((item) => (
          <span
            key={item.id}
            className="animate-float-up absolute bottom-0 select-none whitespace-nowrap font-mono text-hero-fg"
            style={{
              left: item.left,
              fontSize: item.size,
              '--float-dur': item.dur,
              '--float-delay': item.delay,
              '--float-dx': item.dx,
              '--float-op': item.op,
            } as React.CSSProperties}
          >
            {item.text}
          </span>
        ))}
        {/* Brand glow — more intense in dark, subtle in light */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.48_0.27_280/0.10),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.48_0.27_280/0.25),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_110%,oklch(0.56_0.26_280/0.05),transparent)] dark:bg-[radial-gradient(ellipse_40%_40%_at_50%_110%,oklch(0.56_0.26_280/0.14),transparent)]" />
      </div>

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <header className="relative z-10 mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold text-white shadow-lg shadow-brand-500/30">
            L
          </span>
          <span className="text-base font-semibold text-hero-fg">LinksPilot</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger className={navBtnCn} aria-label={t('common.changeLanguage')}>
              <Globe className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={i18n.language.startsWith(lang.code) ? 'font-medium' : ''}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger className={navBtnCn} aria-label={t('common.toggleTheme')}>
              <ThemeIcon className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                {t('home.themeLight')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                {t('home.themeDark')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" />
                {t('home.themeSystem')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pb-24 pt-16 text-center">

        {/* Badge */}
        <div className="animate-shimmer-in mb-6 inline-flex items-center gap-2 rounded-full border border-hero-border bg-hero-card px-4 py-1.5 text-xs text-hero-fg-dim backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
          {t('home.badge')}
        </div>

        {/* Headline */}
        <h1
          className="animate-shimmer-in mb-5 bg-linear-to-b from-hero-fg to-hero-fg-muted bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl"
          style={{ animationDelay: '0.1s' }}
        >
          {t('home.headlinePart1')}
          <br />
          <span className="bg-linear-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
            {t('home.headlinePart2')}
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="animate-shimmer-in mb-10 max-w-md text-base text-hero-fg-muted"
          style={{ animationDelay: '0.2s' }}
        >
          {t('home.subtitle')}
        </p>

        {/* ── Staged demo ── */}
        <div
          className="animate-shimmer-in mb-10 w-full max-w-lg"
          style={{ animationDelay: '0.3s' }}
        >
          <DemoWidget />
        </div>

        {/* Login required note */}
        <div
          className="animate-shimmer-in mb-5 flex items-center gap-1.5 rounded-full border border-hero-border bg-hero-card px-3.5 py-1.5 text-xs text-hero-fg-dim backdrop-blur-sm"
          style={{ animationDelay: '0.35s' }}
        >
          <Lock className="h-3 w-3 text-brand-400" />
          <span>{t('home.loginRequired')}</span>
        </div>

        {/* CTA button */}
        <button
          onClick={handleSignIn}
          disabled={isPending}
          style={{ animationDelay: '0.4s' }}
          className={cn(
            'animate-shimmer-in group flex items-center gap-3 rounded-xl px-7 py-3.5 text-sm font-semibold',
            'bg-hero-fg text-hero-bg shadow-lg shadow-black/10 transition-all',
            'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/15',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
            'disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70',
          )}
        >
          {isPending ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
          ) : (
            <GoogleIcon />
          )}
          {t('auth.signInWithGoogle')}
          {!isPending && (
            <ArrowRight className="h-4 w-4 opacity-40 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
          )}
        </button>

        <p className="mt-4 text-xs text-hero-fg-whisper">{t('home.ctaNote')}</p>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section className="relative z-10 border-t border-hero-border bg-hero-card backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {FEATURES.map((feat, i) => (
              <div
                key={feat.titleKey}
                className="animate-shimmer-in rounded-2xl border border-hero-border bg-hero-card p-6 backdrop-blur-sm"
                style={{ animationDelay: `${0.5 + i * 0.1}s` }}
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400">
                  <feat.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-hero-fg">
                  {t(feat.titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-hero-fg-muted">
                  {t(feat.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-hero-border py-8">
        <p className="text-center text-xs text-hero-fg-whisper">
          © {new Date().getFullYear()} Pedro Bolson · LinksPilot · {t('home.footer')}
        </p>
      </footer>
    </div>
  )
}
