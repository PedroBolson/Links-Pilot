import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function ExpiredLinkPage() {
  const { t } = useTranslation()
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center">
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
    </main>
  )
}
