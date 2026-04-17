import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import HomePage from '@/pages/HomePage'
import AuthPage from '@/pages/AuthPage'
import DashboardPage from '@/pages/DashboardPage'
import RedirectPage from '@/pages/RedirectPage'
import ExpiredLinkPage from '@/pages/ExpiredLinkPage'

function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />
  return <Outlet />
}

function GuestRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/expired',
    element: <ExpiredLinkPage />,
  },
  {
    element: <GuestRoute />,
    children: [
      {
        path: '/auth',
        element: <AuthPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
    ],
  },
  {
    path: '/r/:slug',
    element: <RedirectPage />,
  },
])
