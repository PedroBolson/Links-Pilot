import type { ReactNode } from 'react'
import { Header } from './Header'

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        {children}
      </main>
    </div>
  )
}
