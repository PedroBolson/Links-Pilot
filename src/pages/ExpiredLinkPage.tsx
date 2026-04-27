import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LegalFooter } from '@/components/shared/LegalFooter'
import { LEGAL_CONFIG } from '@/config/legal'

export default function ExpiredLinkPage() {
  const { t } = useTranslation()

  const abuseHref = `mailto:${LEGAL_CONFIG.abuseEmail}?subject=${encodeURIComponent(`[Abuso] ${LEGAL_CONFIG.productName}`)}&body=${encodeURIComponent(`Link reportado: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="text-5xl">⏰</span>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {t('expired.title')}
        </h1>
        <p className="max-w-xs text-neutral-500 dark:text-neutral-400">
          {t('expired.description')}
        </p>
        <Link
          to="/"
          className="mt-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
        >
          {t('expired.cta')}
        </Link>
        {/* Abuse report — visible to victims who land on this page */}
        <a
          href={abuseHref}
          className="mt-1 text-xs text-destructive underline underline-offset-2 transition-opacity hover:opacity-80"
        >
          {t('expired.reportAbuse')}
        </a>
      </main>
      <footer className="border-t border-border py-6">
        <LegalFooter />
      </footer>
    </div>
  )
}
