import type { ReactNode } from 'react'
import { Header } from './Header'
import { LegalFooter } from '@/components/shared/LegalFooter'

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border py-6">
        <LegalFooter />
      </footer>
    </div>
  )
}
