import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function RedirectPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (!slug) {
      navigate('/', { replace: true })
      return
    }
    // Firebase Hosting rewrite direciona /r/:slug para a Cloud Function.
    // Esta página só renderiza em dev local (sem o Hosting rewrite ativo).
    // Em produção, o browser já recebe o 302 da CF antes de carregar o React.
  }, [slug, navigate])

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">{t('redirect.wait')}</p>
    </main>
  )
}
