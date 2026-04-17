import { RouterProvider } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './providers/AuthProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { router } from './Router'

export default function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <TooltipProvider>
            <RouterProvider router={router} />
            <Toaster richColors closeButton />
          </TooltipProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
