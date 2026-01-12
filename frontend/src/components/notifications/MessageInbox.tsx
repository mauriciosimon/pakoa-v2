/**
 * MessageInbox - Display conversations and chat interface
 */
import { useState, useRef, useEffect } from 'react'
import { Mail, ArrowLeft, Send, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNotifications } from '@/contexts/NotificationContext'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/types/notifications'

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

function formatMessageTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface ConversationItemProps {
  conversation: Conversation
  currentUserId: string
  onClick: () => void
}

function ConversationItem({ conversation, currentUserId, onClick }: ConversationItemProps) {
  const otherParticipant = conversation.participants.find(p => p.userId !== currentUserId)
  const hasUnread = conversation.lastMessage && conversation.lastMessage.senderId !== currentUserId && conversation.unreadCount > 0

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 text-left border-b transition-colors',
        hasUnread ? 'bg-primary/5' : 'bg-background',
        'hover:bg-muted/50'
      )}
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={cn('text-sm truncate', hasUnread && 'font-semibold')}>
              {otherParticipant?.userName || 'Usuario'}
            </h4>
            {conversation.lastMessage && (
              <span className="text-xs text-muted-foreground shrink-0">
                {formatTimeAgo(conversation.lastMessage.createdAt)}
              </span>
            )}
          </div>
          {conversation.lastMessage && (
            <p className={cn('text-sm truncate mt-0.5', hasUnread ? 'text-foreground' : 'text-muted-foreground')}>
              {conversation.lastMessage.senderId === currentUserId && (
                <span className="text-muted-foreground">Tú: </span>
              )}
              {conversation.lastMessage.content}
            </p>
          )}
        </div>
        {hasUnread && conversation.unreadCount > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center shrink-0">
            {conversation.unreadCount}
          </span>
        )}
      </div>
    </button>
  )
}

interface ChatViewProps {
  conversation: Conversation
  currentUserId: string
  onBack: () => void
}

function ChatView({ conversation, currentUserId, onBack }: ChatViewProps) {
  const { getMessages, sendMessage, markConversationAsRead } = useNotifications()
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messages = getMessages(conversation.id)
  const otherParticipant = conversation.participants.find(p => p.userId !== currentUserId)

  // Mark as read when opening
  useEffect(() => {
    markConversationAsRead(conversation.id)
  }, [conversation.id, markConversationAsRead])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (newMessage.trim()) {
      sendMessage(conversation.id, newMessage)
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-3 border-b bg-muted/30">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-medium text-sm">{otherParticipant?.userName || 'Usuario'}</h3>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message, index) => {
          const isOwnMessage = message.senderId === currentUserId
          const showDate = index === 0 ||
            new Date(messages[index - 1].createdAt).toDateString() !== new Date(message.createdAt).toDateString()

          return (
            <div key={message.id}>
              {showDate && (
                <div className="text-center my-4">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {new Date(message.createdAt).toLocaleDateString('es-MX', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>
              )}
              <div className={cn('flex', isOwnMessage ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[80%] px-3 py-2 rounded-lg',
                    isOwnMessage
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted rounded-bl-none'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <span
                    className={cn(
                      'text-xs mt-1 block',
                      isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}
                  >
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 border-t bg-background">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function MessageInbox() {
  const { conversations } = useNotifications()
  const { effectiveUser } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  const currentUserId = effectiveUser?.id || ''

  if (selectedConversation) {
    return (
      <ChatView
        conversation={selectedConversation}
        currentUserId={currentUserId}
        onBack={() => setSelectedConversation(null)}
      />
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <Mail className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <h3 className="font-medium text-muted-foreground">Sin conversaciones</h3>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Tus conversaciones aparecerán aquí
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {conversations.map(conversation => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          currentUserId={currentUserId}
          onClick={() => setSelectedConversation(conversation)}
        />
      ))}
    </div>
  )
}
