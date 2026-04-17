import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import HomePage from '@/pages/HomePage'
import AuthPage from '@/pages/AuthPage'
import DashboardPage from '@/pages/DashboardPage'
import RedirectPage from '@/pages/RedirectPage'
import ExpiredLinkPage from '@/pages/ExpiredLinkPage'

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
      { path: '/', element: <HomePage /> },
      { path: '/auth', element: <AuthPage /> },
    ],
  },
  {
    path: '/expired',
    element: <ExpiredLinkPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
    ],
  },
  {
    path: '/r/:slug',
    element: <RedirectPage />,
  },
])
