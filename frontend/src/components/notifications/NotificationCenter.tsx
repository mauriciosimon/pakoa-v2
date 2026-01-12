/**
 * NotificationCenter - Main panel with tabs for notifications, invitations, and messages
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Bell, Mail, UserPlus, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/contexts/NotificationContext'
import { cn } from '@/lib/utils'
import { NotificationsList } from './NotificationsList'
import { InvitationsList } from './InvitationsList'
import { MessageInbox } from './MessageInbox'

type Tab = 'notifications' | 'invitations' | 'messages'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('notifications')
  const {
    unreadCount,
    pendingInvitationsCount,
    unreadMessagesCount,
    markAllAsRead,
  } = useNotifications()

  if (!isOpen) return null

  const tabs = [
    {
      id: 'notifications' as const,
      label: t('notifications.title'),
      icon: Bell,
      count: unreadCount,
    },
    {
      id: 'invitations' as const,
      label: t('notifications.invitations'),
      icon: UserPlus,
      count: pendingInvitationsCount,
    },
    {
      id: 'messages' as const,
      label: t('notifications.messages'),
      icon: Mail,
      count: unreadMessagesCount,
    },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-md bg-background z-50',
          'shadow-xl border-l',
          'animate-in slide-in-from-right duration-300'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t('notifications.center')}</h2>
          <div className="flex items-center gap-2">
            {activeTab === 'notifications' && unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                {t('notifications.markAllRead')}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium',
                'transition-colors relative',
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={cn(
                    'min-w-[18px] h-[18px] px-1 text-xs font-medium rounded-full',
                    'flex items-center justify-center',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted-foreground/20 text-muted-foreground'
                  )}
                >
                  {tab.count > 99 ? '99+' : tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="h-[calc(100%-8rem)] overflow-y-auto">
          {activeTab === 'notifications' && <NotificationsList />}
          {activeTab === 'invitations' && <InvitationsList />}
          {activeTab === 'messages' && <MessageInbox />}
        </div>
      </div>
    </>
  )
}
