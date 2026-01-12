/**
 * Development-only component for quickly switching between users
 * This should be removed or disabled in production
 */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { mockUsers, hasLlave } from '@/data/mockData'
import { ChevronDown, ChevronUp, User, Shield, Key } from 'lucide-react'
import { cn } from '@/lib/utils'

// Only show in development
const isDev = import.meta.env.DEV

export function DevUserSwitcher() {
  const { loginAsAdmin, loginAsUser, user, isAdmin, isImpersonating } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!isDev) return null

  // Group users by level for easier navigation
  const usersByLevel = mockUsers.reduce((acc, u) => {
    const level = u.level
    if (!acc[level]) acc[level] = []
    acc[level].push(u)
    return acc
  }, {} as Record<number, typeof mockUsers>)

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Toggle button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="shadow-lg bg-background border-dashed border-amber-500 text-amber-700 hover:bg-amber-50"
      >
        <User className="h-4 w-4 mr-2" />
        DEV: {user?.name || 'Not logged in'}
        {isOpen ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronUp className="h-4 w-4 ml-2" />}
      </Button>

      {/* User list panel */}
      {isOpen && (
        <div className="absolute bottom-12 left-0 w-80 max-h-96 overflow-y-auto bg-background border border-amber-500 rounded-lg shadow-xl p-3">
          <div className="text-xs font-medium text-amber-700 mb-2 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Development User Switcher
          </div>

          {/* Admin button */}
          <button
            onClick={() => { loginAsAdmin(); setIsOpen(false) }}
            className={cn(
              'w-full text-left px-3 py-2 rounded text-sm mb-2',
              isAdmin && !isImpersonating
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">Admin Principal</span>
              <Shield className="h-3 w-3" />
            </div>
            <span className="text-xs opacity-70">admin@pakoa.com</span>
          </button>

          <div className="border-t my-2" />

          {/* Users by level */}
          {Object.entries(usersByLevel).map(([level, users]) => (
            <div key={level} className="mb-2">
              <div className="text-xs text-muted-foreground mb-1 px-1">
                Nivel {level} ({users.length} usuarios)
              </div>
              {users.slice(0, 5).map(u => (
                <button
                  key={u.id}
                  onClick={() => { loginAsUser(u.id); setIsOpen(false) }}
                  className={cn(
                    'w-full text-left px-3 py-1.5 rounded text-sm',
                    user?.id === u.id && !isImpersonating
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{u.name}</span>
                    {hasLlave(u.sales30d) && (
                      <Key className="h-3 w-3 text-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex justify-between text-xs opacity-70">
                    <span className="truncate">{u.email}</span>
                    <span>${u.sales30d.toLocaleString()}</span>
                  </div>
                </button>
              ))}
              {users.length > 5 && (
                <div className="text-xs text-muted-foreground px-3">
                  +{users.length - 5} más...
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
