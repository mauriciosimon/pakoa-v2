/**
 * NotificationContext - Manages notifications, invitations, and messaging
 */
import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import type {
  Notification,
  CampaignInvitation,
  Message,
  Conversation,
  NotificationContextType,
} from '@/types/notifications'
import {
  mockNotifications,
  mockCampaignInvitations,
  mockConversations,
  mockMessages,
} from '@/data/mockNotifications'
import { getUserById, addCampaignParticipant } from '@/data/mockData'

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { effectiveUser } = useAuth()
  const userId = effectiveUser?.id || ''

  // State - initialize from mock data
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [invitations, setInvitations] = useState<CampaignInvitation[]>(mockCampaignInvitations)
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
  const [messages, setMessages] = useState<Message[]>(mockMessages)

  // Computed values for current user
  const userNotifications = useMemo(
    () => notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications, userId]
  )

  const unreadCount = useMemo(
    () => notifications.filter(n => n.userId === userId && n.status === 'unread').length,
    [notifications, userId]
  )

  const userInvitations = useMemo(
    () => invitations
      .filter(i => i.inviteeId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [invitations, userId]
  )

  const pendingInvitationsCount = useMemo(
    () => invitations.filter(i => i.inviteeId === userId && i.status === 'pending').length,
    [invitations, userId]
  )

  const userConversations = useMemo(
    () => conversations
      .filter(c => c.participants.some(p => p.userId === userId))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [conversations, userId]
  )

  const unreadMessagesCount = useMemo(() => {
    let count = 0
    userConversations.forEach(conv => {
      const convMessages = messages.filter(m => m.conversationId === conv.id)
      count += convMessages.filter(m => m.senderId !== userId && !m.isRead).length
    })
    return count
  }, [userConversations, messages, userId])

  // Notification actions
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, status: 'read' as const } : n
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n =>
        n.userId === userId ? { ...n, status: 'read' as const } : n
      )
    )
  }, [userId])

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }, [])

  // Invitation actions
  const sendInvitation = useCallback((campaignId: string, inviteeId: string, message?: string) => {
    const inviter = effectiveUser
    const invitee = getUserById(inviteeId)

    if (!inviter || !invitee) {
      console.error('Invalid inviter or invitee')
      return
    }

    const newInvitation: CampaignInvitation = {
      id: `invite-${Date.now()}`,
      campaignId,
      campaignName: `Campaña de ${inviter.name}`, // Would come from campaign data
      inviterId: inviter.id,
      inviterName: inviter.name,
      inviteeId: invitee.id,
      inviteeName: invitee.name,
      status: 'pending',
      message,
      createdAt: new Date().toISOString(),
    }

    setInvitations(prev => [newInvitation, ...prev])

    // Create notification for invitee
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      userId: inviteeId,
      type: 'campaign_invitation',
      title: 'Invitación a campaña',
      message: `${inviter.name} te invitó a participar en su campaña`,
      data: {
        campaignId,
        campaignName: newInvitation.campaignName,
        invitationId: newInvitation.id,
        senderId: inviter.id,
        senderName: inviter.name,
      },
      status: 'unread',
      createdAt: new Date().toISOString(),
    }

    setNotifications(prev => [newNotification, ...prev])
    console.log(`[NOTIFICATION] Invitation sent to ${invitee.name}`)
  }, [effectiveUser])

  const acceptInvitation = useCallback((invitationId: string) => {
    const invitation = invitations.find(i => i.id === invitationId)
    if (!invitation) return

    // Get the invitee's full info
    const invitee = getUserById(invitation.inviteeId)
    if (!invitee) {
      console.error('Invitee not found:', invitation.inviteeId)
      return
    }

    // Add the invitee as a participant to the campaign
    const participant = addCampaignParticipant(
      invitation.campaignId,
      invitation.inviteeId,
      invitation.inviteeName,
      invitee.email
    )

    if (!participant) {
      console.error('Failed to add participant to campaign')
      return
    }

    // Update invitation status
    setInvitations(prev =>
      prev.map(i =>
        i.id === invitationId
          ? { ...i, status: 'accepted' as const, respondedAt: new Date().toISOString() }
          : i
      )
    )

    // Create notification for inviter
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      userId: invitation.inviterId,
      type: 'invitation_accepted',
      title: 'Invitación aceptada',
      message: `${invitation.inviteeName} aceptó tu invitación a ${invitation.campaignName}`,
      data: {
        campaignId: invitation.campaignId,
        campaignName: invitation.campaignName,
        senderId: invitation.inviteeId,
        senderName: invitation.inviteeName,
      },
      status: 'unread',
      createdAt: new Date().toISOString(),
    }

    setNotifications(prev => [newNotification, ...prev])
    console.log(`[NOTIFICATION] Invitation accepted by ${invitation.inviteeName}, added as participant`)
  }, [invitations])

  const declineInvitation = useCallback((invitationId: string) => {
    const invitation = invitations.find(i => i.id === invitationId)
    if (!invitation) return

    // Update invitation status
    setInvitations(prev =>
      prev.map(i =>
        i.id === invitationId
          ? { ...i, status: 'declined' as const, respondedAt: new Date().toISOString() }
          : i
      )
    )

    // Create notification for inviter
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      userId: invitation.inviterId,
      type: 'invitation_declined',
      title: 'Invitación rechazada',
      message: `${invitation.inviteeName} rechazó tu invitación a ${invitation.campaignName}`,
      data: {
        campaignId: invitation.campaignId,
        campaignName: invitation.campaignName,
        senderId: invitation.inviteeId,
        senderName: invitation.inviteeName,
      },
      status: 'unread',
      createdAt: new Date().toISOString(),
    }

    setNotifications(prev => [newNotification, ...prev])
    console.log(`[NOTIFICATION] Invitation declined by ${invitation.inviteeName}`)
  }, [invitations])

  const cancelInvitation = useCallback((invitationId: string) => {
    const invitation = invitations.find(i => i.id === invitationId)
    if (!invitation) return

    // Remove the invitation entirely (or could mark as 'cancelled')
    setInvitations(prev => prev.filter(i => i.id !== invitationId))

    // Also remove any pending notification for the invitee about this invitation
    setNotifications(prev =>
      prev.filter(n =>
        !(n.type === 'campaign_invitation' && n.data?.invitationId === invitationId)
      )
    )

    console.log(`[NOTIFICATION] Invitation to ${invitation.inviteeName} cancelled`)
  }, [invitations])

  const getPendingInvitationsForCampaign = useCallback((campaignId: string) => {
    return invitations
      .filter(i => i.campaignId === campaignId && i.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [invitations])

  // Message actions
  const sendMessage = useCallback((conversationId: string, content: string) => {
    if (!effectiveUser || !content.trim()) return

    const conversation = conversations.find(c => c.id === conversationId)
    if (!conversation) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: effectiveUser.id,
      senderName: effectiveUser.name,
      content: content.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
    }

    setMessages(prev => [...prev, newMessage])

    // Update conversation's lastMessage
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: {
                content: newMessage.content,
                senderId: newMessage.senderId,
                createdAt: newMessage.createdAt,
              },
              updatedAt: newMessage.createdAt,
            }
          : c
      )
    )

    // Create notification for other participant
    const otherParticipant = conversation.participants.find(p => p.userId !== effectiveUser.id)
    if (otherParticipant) {
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        userId: otherParticipant.userId,
        type: 'new_message',
        title: 'Nuevo mensaje',
        message: `${effectiveUser.name} te envió un mensaje`,
        data: {
          senderId: effectiveUser.id,
          senderName: effectiveUser.name,
          conversationId,
        },
        status: 'unread',
        createdAt: new Date().toISOString(),
      }
      setNotifications(prev => [newNotification, ...prev])
    }

    console.log(`[MESSAGE] Sent to conversation ${conversationId}`)
  }, [effectiveUser, conversations])

  const startConversation = useCallback((targetUserId: string): string => {
    if (!effectiveUser) return ''

    // Check if conversation already exists
    const existingConv = conversations.find(c =>
      c.participants.some(p => p.userId === effectiveUser.id) &&
      c.participants.some(p => p.userId === targetUserId)
    )

    if (existingConv) {
      return existingConv.id
    }

    // Create new conversation
    const targetUser = getUserById(targetUserId)
    if (!targetUser) return ''

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      participants: [
        { userId: effectiveUser.id, userName: effectiveUser.name },
        { userId: targetUser.id, userName: targetUser.name },
      ],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setConversations(prev => [newConversation, ...prev])
    console.log(`[CONVERSATION] Started with ${targetUser.name}`)

    return newConversation.id
  }, [effectiveUser, conversations])

  const markConversationAsRead = useCallback((conversationId: string) => {
    if (!effectiveUser) return

    // Mark all messages in conversation as read (for messages not sent by current user)
    setMessages(prev =>
      prev.map(m =>
        m.conversationId === conversationId && m.senderId !== effectiveUser.id
          ? { ...m, isRead: true }
          : m
      )
    )

    // Update conversation unread count
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      )
    )
  }, [effectiveUser])

  const getMessages = useCallback((conversationId: string): Message[] => {
    return messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [messages])

  const value: NotificationContextType = {
    notifications: userNotifications,
    unreadCount,
    invitations: userInvitations,
    pendingInvitationsCount,
    conversations: userConversations,
    unreadMessagesCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    sendInvitation,
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
    getPendingInvitationsForCampaign,
    sendMessage,
    startConversation,
    markConversationAsRead,
    getMessages,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
