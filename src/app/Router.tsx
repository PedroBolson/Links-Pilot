/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const HomePage = lazy(() => import('@/pages/HomePage'))
const AuthPage = lazy(() => import('@/pages/AuthPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const RedirectPage = lazy(() => import('@/pages/RedirectPage'))
const ExpiredLinkPage = lazy(() => import('@/pages/ExpiredLinkPage'))

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<FullPageSpinner />}>{children}</Suspense>
}

function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  if (!user) return <Navigate to="/" replace />
  return <Outlet />
}

function HomeRoute() {
  const { user, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function FullPageSpinner() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[oklch(0.10_0.02_280)]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  )
}

export const router = createBrowserRouter([
  {
    element: <HomeRoute />,
    children: [
      { path: '/', element: <LazyPage><HomePage /></LazyPage> },
      { path: '/auth', element: <LazyPage><AuthPage /></LazyPage> },
    ],
  },
  {
    path: '/expired',
    element: <LazyPage><ExpiredLinkPage /></LazyPage>,
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <LazyPage><DashboardPage /></LazyPage> },
    ],
  },
  {
    path: '/r/:slug',
    element: <LazyPage><RedirectPage /></LazyPage>,
  },
])
