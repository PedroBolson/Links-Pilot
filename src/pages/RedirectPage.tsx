import { useTranslation } from 'react-i18next'

export default function RedirectPage() {
  const { t } = useTranslation()
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      <p className="text-neutral-600 dark:text-neutral-400">{t('redirect.wait')}</p>
    </main>
  )
}
