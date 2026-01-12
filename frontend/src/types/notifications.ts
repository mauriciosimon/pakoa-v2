// Notification Types

export type NotificationType =
  | 'campaign_invitation'      // Someone invited you to their campaign
  | 'invitation_accepted'      // Someone accepted your invitation
  | 'invitation_declined'      // Someone declined your invitation
  | 'new_message'              // New message received
  | 'team_member_llave'        // Team member gained/lost Llave
  | 'campaign_overflow'        // Campaign overflowed, new one created
  | 'system'                   // System notification

export type NotificationStatus = 'unread' | 'read'

export interface Notification {
  id: string
  userId: string              // Who this notification is for
  type: NotificationType
  title: string
  message: string
  data?: {                    // Extra data depending on type
    campaignId?: string
    campaignName?: string
    invitationId?: string
    senderId?: string
    senderName?: string
    conversationId?: string
  }
  status: NotificationStatus
  createdAt: string
}

// Campaign Invitation Types
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export interface CampaignInvitation {
  id: string
  campaignId: string
  campaignName: string
  inviterId: string           // Who sent the invitation
  inviterName: string
  inviteeId: string           // Who is being invited
  inviteeName: string
  status: InvitationStatus
  message?: string            // Optional message from inviter
  createdAt: string
  respondedAt?: string        // When they accepted/declined
}

// Messaging Types
export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  isRead: boolean
  createdAt: string
}

export interface Conversation {
  id: string
  participants: {
    userId: string
    userName: string
  }[]
  lastMessage?: {
    content: string
    senderId: string
    createdAt: string
  }
  unreadCount: number
  createdAt: string
  updatedAt: string
}

// Context Types
export interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  invitations: CampaignInvitation[]
  pendingInvitationsCount: number
  conversations: Conversation[]
  unreadMessagesCount: number

  // Notification actions
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  clearNotification: (notificationId: string) => void

  // Invitation actions
  sendInvitation: (campaignId: string, inviteeId: string, message?: string) => void
  acceptInvitation: (invitationId: string) => void
  declineInvitation: (invitationId: string) => void
  cancelInvitation: (invitationId: string) => void
  getPendingInvitationsForCampaign: (campaignId: string) => CampaignInvitation[]

  // Message actions
  sendMessage: (conversationId: string, content: string) => void
  startConversation: (userId: string) => string // Returns conversation ID
  markConversationAsRead: (conversationId: string) => void
  getMessages: (conversationId: string) => Message[]
}
