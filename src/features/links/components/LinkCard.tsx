import { lazy, Suspense, useState, useRef } from 'react'
import { Copy, Check, QrCode, Trash2, ExternalLink, MousePointerClick, Download, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn, timeFromNow, isExpired } from '@/lib/utils'
import { useDeleteLink } from '@/features/links/hooks/useDeleteLink'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import type { Link } from '@/types/link.types'

const QRCodeCanvas = lazy(() =>
  import('qrcode.react').then((mod) => ({ default: mod.QRCodeCanvas })),
)

interface LinkCardProps {
  link: Link
  shortBaseUrl: string
}

const iconButtonCn = cn(
  'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm',
  'transition-colors hover:bg-accent hover:text-accent-foreground',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  'disabled:pointer-events-none disabled:opacity-50',
)

export function LinkCard({ link, shortBaseUrl }: LinkCardProps) {
  const { t, i18n } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const qrWrapperRef = useRef<HTMLDivElement>(null)
  const { mutate: deleteLink, isPending: deleting } = useDeleteLink()

  const shortUrl = `${shortBaseUrl}/r/${link.slug}`
  const expired = isExpired(link.expiresAt)

  async function handleCopy() {
    await navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    toast.success(t('common.copied'))
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDelete() {
    deleteLink(link.id, {
      onSuccess: () => {
        setConfirmOpen(false)
        toast.success(t('links.deletedSuccess'))
      },
      onError: () => toast.error(t('errors.generic')),
    })
  }

  function getQrCanvas() {
    return qrWrapperRef.current?.querySelector('canvas') ?? null
  }

  function handleDownloadQr() {
    const canvas = getQrCanvas()
    if (!canvas) return
    const a = document.createElement('a')
    a.download = `qrcode-${link.slug}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  async function handleShareQr() {
    const canvas = getQrCanvas()
    if (!canvas) return
    try {
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject()), 'image/png'),
      )
      const file = new File([blob], `qrcode-${link.slug}.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: link.title ?? shortUrl, url: shortUrl })
      } else {
        handleDownloadQr()
      }
    } catch {
      handleDownloadQr()
    }
  }

  return (
    <>
      <Card className={expired ? 'opacity-60' : undefined}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              {link.title && (
                <p className="truncate text-sm font-medium text-foreground">
                  {link.title}
                </p>
              )}
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm font-mono text-primary hover:underline"
              >
                /r/{link.slug}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
              <p className="truncate text-xs text-muted-foreground">
                {link.originalUrl}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Badge variant={expired ? 'secondary' : 'default'} className="text-xs">
                {expired ? t('links.expired') : t('links.active')}
              </Badge>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MousePointerClick className="h-3.5 w-3.5" />
                <AnimatedNumber value={link.clickCount} durationMs={950} />
              </span>
              <span>
                {expired
                  ? t('links.expiredRelative', { time: timeFromNow(link.expiresAt, i18n.language) })
                  : t('links.expiresRelative', { time: timeFromNow(link.expiresAt, i18n.language) })}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger
                  className={cn(iconButtonCn, 'text-muted-foreground')}
                  onClick={handleCopy}
                  disabled={expired}
                  aria-label={t('links.copyLink')}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </TooltipTrigger>
                <TooltipContent>{t('links.copyLink')}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  className={cn(iconButtonCn, 'text-muted-foreground')}
                  onClick={() => setQrOpen(true)}
                  disabled={expired}
                  aria-label={t('links.viewQr')}
                >
                  <QrCode className="h-3.5 w-3.5" />
                </TooltipTrigger>
                <TooltipContent>{t('links.viewQr')}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  className={cn(iconButtonCn, 'text-destructive hover:text-destructive')}
                  onClick={() => setConfirmOpen(true)}
                  aria-label={t('links.deleteLink')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </TooltipTrigger>
                <TooltipContent>{t('links.deleteLink')}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('links.confirmDelete')}</DialogTitle>
            <DialogDescription>{t('links.confirmDeleteDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? t('common.loading') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="flex flex-col items-center gap-4">
          <DialogHeader>
            <DialogTitle>{t('links.qrCode')}</DialogTitle>
            <DialogDescription className="text-center">{shortUrl}</DialogDescription>
          </DialogHeader>
          <div ref={qrWrapperRef} className="rounded-xl border border-border bg-white p-4">
            <Suspense fallback={<div className="h-[200px] w-[200px] bg-white" />}>
              <QRCodeCanvas value={shortUrl} size={200} bgColor="#ffffff" fgColor="#000000" />
            </Suspense>
          </div>
          <DialogFooter className="w-full flex-row justify-center gap-2 sm:justify-center">
            <Button variant="outline" onClick={handleDownloadQr}>
              <Download className="mr-2 h-4 w-4" />
              {t('links.downloadPng')}
            </Button>
            <Button onClick={handleShareQr}>
              <Share2 className="mr-2 h-4 w-4" />
              {t('links.share')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
