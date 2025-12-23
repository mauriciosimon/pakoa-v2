import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ImpersonationBanner } from './ImpersonationBanner'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const { isImpersonating } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <ImpersonationBanner />
      <Sidebar />
      <main className={cn(
        'md:pl-64',
        isImpersonating && 'pt-10'
      )}>
        <div className="container mx-auto p-4 pt-16 md:p-6 md:pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
