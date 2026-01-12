/**
 * NotificationsList - Display list of notifications
 */
import { Bell, CheckCircle, XCircle, MessageSquare, Users, ArrowUpDown, Info, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/contexts/NotificationContext'
import { cn } from '@/lib/utils'
import type { Notification, NotificationType } from '@/types/notifications'

const typeIcons: Record<NotificationType, typeof Bell> = {
  campaign_invitation: Users,
  invitation_accepted: CheckCircle,
  invitation_declined: XCircle,
  new_message: MessageSquare,
  team_member_llave: Users,
  campaign_overflow: ArrowUpDown,
  system: Info,
}

const typeColors: Record<NotificationType, string> = {
  campaign_invitation: 'text-blue-500 bg-blue-50',
  invitation_accepted: 'text-green-500 bg-green-50',
  invitation_declined: 'text-red-500 bg-red-50',
  new_message: 'text-purple-500 bg-purple-50',
  team_member_llave: 'text-amber-500 bg-amber-50',
  campaign_overflow: 'text-orange-500 bg-orange-50',
  system: 'text-gray-500 bg-gray-50',
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins}m`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
  onClear: (id: string) => void
}

function NotificationItem({ notification, onMarkRead, onClear }: NotificationItemProps) {
  const Icon = typeIcons[notification.type]
  const colorClass = typeColors[notification.type]
  const isUnread = notification.status === 'unread'

  const handleClick = () => {
    if (isUnread) {
      onMarkRead(notification.id)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'p-4 border-b last:border-b-0 cursor-pointer transition-colors',
        isUnread ? 'bg-primary/5' : 'bg-background',
        'hover:bg-muted/50'
      )}
    >
      <div className="flex gap-3">
        <div className={cn('p-2 rounded-full shrink-0', colorClass)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn('text-sm', isUnread && 'font-semibold')}>
              {notification.title}
            </h4>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatTimeAgo(notification.createdAt)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            onClear(notification.id)
          }}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      {isUnread && (
        <div className="flex justify-end mt-2">
          <span className="w-2 h-2 bg-primary rounded-full" />
        </div>
      )}
    </div>
  )
}

export function NotificationsList() {
  const { notifications, markAsRead, clearNotification } = useNotifications()

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <h3 className="font-medium text-muted-foreground">Sin notificaciones</h3>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Las notificaciones aparecerán aquí
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {notifications.map(notification => (
        <div key={notification.id} className="group">
          <NotificationItem
            notification={notification}
            onMarkRead={markAsRead}
            onClear={clearNotification}
          />
        </div>
      ))}
    </div>
  )
}
