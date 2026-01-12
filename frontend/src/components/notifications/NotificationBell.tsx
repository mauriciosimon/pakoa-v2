/**
 * NotificationBell - Bell icon with badge for unread notifications
 * Triggers opening the NotificationCenter panel
 */
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/contexts/NotificationContext'
import { cn } from '@/lib/utils'

interface NotificationBellProps {
  onClick: () => void
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const { unreadCount, pendingInvitationsCount, unreadMessagesCount } = useNotifications()

  const totalUnread = unreadCount + pendingInvitationsCount + unreadMessagesCount

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="relative"
      aria-label={`Notificaciones${totalUnread > 0 ? ` (${totalUnread} sin leer)` : ''}`}
    >
      <Bell className="h-5 w-5" />
      {totalUnread > 0 && (
        <span
          className={cn(
            'absolute -top-1 -right-1 flex items-center justify-center',
            'min-w-[18px] h-[18px] px-1 text-xs font-medium',
            'bg-red-500 text-white rounded-full',
            'animate-in fade-in zoom-in duration-200'
          )}
        >
          {totalUnread > 99 ? '99+' : totalUnread}
        </span>
      )}
    </Button>
  )
}
