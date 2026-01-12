import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ImpersonationBanner } from './ImpersonationBanner'
import { useAuth } from '@/contexts/AuthContext'
import { NotificationBell, NotificationCenter } from '@/components/notifications'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const { isImpersonating } = useAuth()
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <ImpersonationBanner />
      <Sidebar />

      {/* Top bar for language and notifications */}
      <div className={cn(
        'fixed top-0 right-0 z-30',
        'md:right-4 md:top-4',
        'p-2 flex items-center gap-1',
        isImpersonating && 'top-10'
      )}>
        <ThemeToggle />
        <LanguageSwitcher />
        <NotificationBell onClick={() => setIsNotificationCenterOpen(true)} />
      </div>

      <main className={cn(
        'md:pl-64',
        isImpersonating && 'pt-10'
      )}>
        <div className="container mx-auto p-4 pt-16 md:p-6 md:pt-6">
          <Outlet />
        </div>
      </main>

      {/* Notification Center Panel */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </div>
  )
}
