import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const { t } = useTranslation()
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        encurtaLink
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400">
        Short links. Real expiration. Full control.
      </p>
      <Link
        to="/auth"
        className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
      >
        {t('auth.signIn')}
      </Link>
    </main>
  )
}
