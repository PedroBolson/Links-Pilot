import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LEGAL_CONFIG } from '@/config/legal'

interface LegalFooterProps {
  /** 'hero' uses the homepage dark-themed CSS variables; 'app' uses standard theme tokens. */
  variant?: 'app' | 'hero'
}

export function LegalFooter({ variant = 'app' }: LegalFooterProps) {
  const { t } = useTranslation()
  const isHero = variant === 'hero'

  const wrapperCn = isHero ? 'text-hero-fg-muted' : 'text-muted-foreground'
  const linkCn = isHero
    ? 'text-hero-fg-muted underline underline-offset-2 transition-colors hover:text-hero-fg'
    : 'underline underline-offset-2 transition-colors hover:text-foreground'

  const abuseHref = `mailto:${LEGAL_CONFIG.abuseEmail}?subject=${encodeURIComponent(`[Abuso] ${LEGAL_CONFIG.productName}`)}`

  return (
    <div className={`text-center text-xs ${wrapperCn}`}>
      <p>© {new Date().getFullYear()} {LEGAL_CONFIG.controllerName} · {LEGAL_CONFIG.productName}</p>
      <nav className="mt-1.5 flex flex-wrap justify-center gap-x-3 gap-y-1" aria-label="Legal">
        <Link to="/terms" className={linkCn}>{t('legal.termsOfUse')}</Link>
        <span aria-hidden="true">·</span>
        <Link to="/privacy" className={linkCn}>{t('legal.privacyPolicy')}</Link>
        <span aria-hidden="true">·</span>
        <a href={abuseHref} className={linkCn}>{t('legal.reportAbuse')}</a>
      </nav>
    </div>
  )
}
