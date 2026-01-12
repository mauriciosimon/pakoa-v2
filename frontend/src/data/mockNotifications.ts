/**
 * Mock data for notifications, campaign invitations, and messages
 */

import type {
  Notification,
  CampaignInvitation,
  Message,
  Conversation,
} from '@/types/notifications'

// Sample notifications for different users
export const mockNotifications: Notification[] = [
  // For María García (user-maria)
  {
    id: 'notif-1',
    userId: 'user-maria',
    type: 'invitation_accepted',
    title: 'Invitación aceptada',
    message: 'Carlos Rodríguez aceptó tu invitación a Campaña 1',
    data: {
      campaignId: 'campaign-maria-1',
      campaignName: 'Campaña 1',
      senderId: 'user-carlos',
      senderName: 'Carlos Rodríguez',
    },
    status: 'unread',
    createdAt: '2024-12-20T14:30:00Z',
  },
  {
    id: 'notif-2',
    userId: 'user-maria',
    type: 'team_member_llave',
    title: 'Nuevo miembro con Llave',
    message: 'Pedro López de tu equipo acaba de obtener la Llave del Reino',
    data: {
      senderId: 'user-pedro',
      senderName: 'Pedro López',
    },
    status: 'unread',
    createdAt: '2024-12-19T10:15:00Z',
  },
  {
    id: 'notif-3',
    userId: 'user-maria',
    type: 'new_message',
    title: 'Nuevo mensaje',
    message: 'Ana Martínez te envió un mensaje',
    data: {
      senderId: 'user-ana',
      senderName: 'Ana Martínez',
      conversationId: 'conv-maria-ana',
    },
    status: 'read',
    createdAt: '2024-12-18T16:45:00Z',
  },

  // For Carlos Rodríguez (user-carlos)
  {
    id: 'notif-4',
    userId: 'user-carlos',
    type: 'campaign_invitation',
    title: 'Invitación a campaña',
    message: 'Patricia Navarro te invitó a participar en su Campaña 1',
    data: {
      campaignId: 'campaign-patricia-1',
      campaignName: 'Campaña 1',
      invitationId: 'invite-2',
      senderId: 'user-patricia',
      senderName: 'Patricia Navarro',
    },
    status: 'unread',
    createdAt: '2024-12-21T09:00:00Z',
  },
  {
    id: 'notif-5',
    userId: 'user-carlos',
    type: 'campaign_overflow',
    title: 'Nueva campaña creada',
    message: 'Tu Campaña 1 generó overflow y se creó Campaña 2 automáticamente',
    data: {
      campaignId: 'campaign-carlos-2',
      campaignName: 'Campaña 2',
    },
    status: 'read',
    createdAt: '2024-12-15T00:00:00Z',
  },

  // For Patricia Navarro (user-patricia)
  {
    id: 'notif-6',
    userId: 'user-patricia',
    type: 'invitation_declined',
    title: 'Invitación rechazada',
    message: 'Laura Sánchez rechazó tu invitación a Campaña 1',
    data: {
      campaignId: 'campaign-patricia-1',
      campaignName: 'Campaña 1',
      senderId: 'user-laura',
      senderName: 'Laura Sánchez',
    },
    status: 'unread',
    createdAt: '2024-12-20T11:30:00Z',
  },

  // For Roberto Mendoza (user-roberto)
  {
    id: 'notif-7',
    userId: 'user-roberto',
    type: 'system',
    title: 'Recordatorio',
    message: 'Faltan 2 días para el corte semanal. Tienes $19,500 en ventas.',
    status: 'unread',
    createdAt: '2024-12-21T08:00:00Z',
  },
]

// Campaign invitations
export const mockCampaignInvitations: CampaignInvitation[] = [
  // Pending invitation for Carlos from Patricia
  {
    id: 'invite-2',
    campaignId: 'campaign-patricia-1',
    campaignName: 'Campaña 1 de Patricia',
    inviterId: 'user-patricia',
    inviterName: 'Patricia Navarro',
    inviteeId: 'user-carlos',
    inviteeName: 'Carlos Rodríguez',
    status: 'pending',
    message: '¡Hola Carlos! Me gustaría que te unieras a mi campaña. Juntos podemos lograr más.',
    createdAt: '2024-12-21T09:00:00Z',
  },

  // Pending invitation for Pedro from María
  {
    id: 'invite-3',
    campaignId: 'campaign-maria-1',
    campaignName: 'Campaña 1 de María',
    inviterId: 'user-maria',
    inviterName: 'María García',
    inviteeId: 'user-pedro',
    inviteeName: 'Pedro López',
    status: 'pending',
    message: 'Pedro, ¿te gustaría unirte a mi campaña?',
    createdAt: '2024-12-20T15:00:00Z',
  },

  // Accepted invitation (historical)
  {
    id: 'invite-1',
    campaignId: 'campaign-maria-1',
    campaignName: 'Campaña 1 de María',
    inviterId: 'user-maria',
    inviterName: 'María García',
    inviteeId: 'user-carlos',
    inviteeName: 'Carlos Rodríguez',
    status: 'accepted',
    createdAt: '2024-12-18T10:00:00Z',
    respondedAt: '2024-12-18T14:30:00Z',
  },

  // Declined invitation (historical)
  {
    id: 'invite-4',
    campaignId: 'campaign-patricia-1',
    campaignName: 'Campaña 1 de Patricia',
    inviterId: 'user-patricia',
    inviterName: 'Patricia Navarro',
    inviteeId: 'user-laura',
    inviteeName: 'Laura Sánchez',
    status: 'declined',
    createdAt: '2024-12-19T11:00:00Z',
    respondedAt: '2024-12-20T11:30:00Z',
  },
]

// Conversations
export const mockConversations: Conversation[] = [
  {
    id: 'conv-maria-ana',
    participants: [
      { userId: 'user-maria', userName: 'María García' },
      { userId: 'user-ana', userName: 'Ana Martínez' },
    ],
    lastMessage: {
      content: '¿Cómo van tus ventas esta semana?',
      senderId: 'user-ana',
      createdAt: '2024-12-18T16:45:00Z',
    },
    unreadCount: 1,
    createdAt: '2024-12-15T10:00:00Z',
    updatedAt: '2024-12-18T16:45:00Z',
  },
  {
    id: 'conv-maria-carlos',
    participants: [
      { userId: 'user-maria', userName: 'María García' },
      { userId: 'user-carlos', userName: 'Carlos Rodríguez' },
    ],
    lastMessage: {
      content: 'Gracias por la invitación, ya acepté!',
      senderId: 'user-carlos',
      createdAt: '2024-12-20T14:35:00Z',
    },
    unreadCount: 0,
    createdAt: '2024-12-10T09:00:00Z',
    updatedAt: '2024-12-20T14:35:00Z',
  },
  {
    id: 'conv-carlos-pedro',
    participants: [
      { userId: 'user-carlos', userName: 'Carlos Rodríguez' },
      { userId: 'user-pedro', userName: 'Pedro López' },
    ],
    lastMessage: {
      content: 'Necesito ayuda con un cliente',
      senderId: 'user-pedro',
      createdAt: '2024-12-21T10:20:00Z',
    },
    unreadCount: 2,
    createdAt: '2024-12-01T14:00:00Z',
    updatedAt: '2024-12-21T10:20:00Z',
  },
  {
    id: 'conv-patricia-roberto',
    participants: [
      { userId: 'user-patricia', userName: 'Patricia Navarro' },
      { userId: 'user-roberto', userName: 'Roberto Mendoza' },
    ],
    lastMessage: {
      content: '¡Excelente trabajo esta semana!',
      senderId: 'user-roberto',
      createdAt: '2024-12-19T18:00:00Z',
    },
    unreadCount: 0,
    createdAt: '2024-11-20T11:00:00Z',
    updatedAt: '2024-12-19T18:00:00Z',
  },
]

// Messages for each conversation
export const mockMessages: Message[] = [
  // Conversation: María - Ana
  {
    id: 'msg-1',
    conversationId: 'conv-maria-ana',
    senderId: 'user-maria',
    senderName: 'María García',
    content: 'Hola Ana, ¿cómo estás?',
    isRead: true,
    createdAt: '2024-12-15T10:00:00Z',
  },
  {
    id: 'msg-2',
    conversationId: 'conv-maria-ana',
    senderId: 'user-ana',
    senderName: 'Ana Martínez',
    content: '¡Hola María! Muy bien, gracias. Trabajando duro.',
    isRead: true,
    createdAt: '2024-12-15T10:05:00Z',
  },
  {
    id: 'msg-3',
    conversationId: 'conv-maria-ana',
    senderId: 'user-maria',
    senderName: 'María García',
    content: 'Qué bueno. Vi que estás cerca de la Llave, ¡ánimo!',
    isRead: true,
    createdAt: '2024-12-18T14:30:00Z',
  },
  {
    id: 'msg-4',
    conversationId: 'conv-maria-ana',
    senderId: 'user-ana',
    senderName: 'Ana Martínez',
    content: '¿Cómo van tus ventas esta semana?',
    isRead: false,
    createdAt: '2024-12-18T16:45:00Z',
  },

  // Conversation: María - Carlos
  {
    id: 'msg-5',
    conversationId: 'conv-maria-carlos',
    senderId: 'user-maria',
    senderName: 'María García',
    content: 'Carlos, te envié una invitación para mi campaña',
    isRead: true,
    createdAt: '2024-12-18T10:05:00Z',
  },
  {
    id: 'msg-6',
    conversationId: 'conv-maria-carlos',
    senderId: 'user-carlos',
    senderName: 'Carlos Rodríguez',
    content: 'Gracias por la invitación, ya acepté!',
    isRead: true,
    createdAt: '2024-12-20T14:35:00Z',
  },

  // Conversation: Carlos - Pedro
  {
    id: 'msg-7',
    conversationId: 'conv-carlos-pedro',
    senderId: 'user-carlos',
    senderName: 'Carlos Rodríguez',
    content: 'Pedro, ¿cómo va todo?',
    isRead: true,
    createdAt: '2024-12-20T09:00:00Z',
  },
  {
    id: 'msg-8',
    conversationId: 'conv-carlos-pedro',
    senderId: 'user-pedro',
    senderName: 'Pedro López',
    content: 'Bien, tengo un cliente interesado en el plan premium',
    isRead: true,
    createdAt: '2024-12-20T09:30:00Z',
  },
  {
    id: 'msg-9',
    conversationId: 'conv-carlos-pedro',
    senderId: 'user-pedro',
    senderName: 'Pedro López',
    content: 'Necesito ayuda con un cliente',
    isRead: false,
    createdAt: '2024-12-21T10:20:00Z',
  },

  // Conversation: Patricia - Roberto
  {
    id: 'msg-10',
    conversationId: 'conv-patricia-roberto',
    senderId: 'user-patricia',
    senderName: 'Patricia Navarro',
    content: 'Roberto, ¿viste el overflow de esta semana?',
    isRead: true,
    createdAt: '2024-12-19T17:30:00Z',
  },
  {
    id: 'msg-11',
    conversationId: 'conv-patricia-roberto',
    senderId: 'user-roberto',
    senderName: 'Roberto Mendoza',
    content: '¡Excelente trabajo esta semana!',
    isRead: true,
    createdAt: '2024-12-19T18:00:00Z',
  },
]

// Helper functions
export function getNotificationsForUser(userId: string): Notification[] {
  return mockNotifications
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getUnreadNotificationCount(userId: string): number {
  return mockNotifications.filter(n => n.userId === userId && n.status === 'unread').length
}

export function getInvitationsForUser(userId: string): CampaignInvitation[] {
  return mockCampaignInvitations
    .filter(i => i.inviteeId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getPendingInvitationsForUser(userId: string): CampaignInvitation[] {
  return getInvitationsForUser(userId).filter(i => i.status === 'pending')
}

export function getSentInvitationsForUser(userId: string): CampaignInvitation[] {
  return mockCampaignInvitations
    .filter(i => i.inviterId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getPendingInvitationsForCampaign(campaignId: string): CampaignInvitation[] {
  return mockCampaignInvitations
    .filter(i => i.campaignId === campaignId && i.status === 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getConversationsForUser(userId: string): Conversation[] {
  return mockConversations
    .filter(c => c.participants.some(p => p.userId === userId))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function getMessagesForConversation(conversationId: string): Message[] {
  return mockMessages
    .filter(m => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export function getUnreadMessagesCount(userId: string): number {
  const userConversations = getConversationsForUser(userId)
  return userConversations.reduce((total, conv) => {
    const messages = getMessagesForConversation(conv.id)
    const unread = messages.filter(m => m.senderId !== userId && !m.isRead).length
    return total + unread
  }, 0)
}

export function getOtherParticipant(conversation: Conversation, currentUserId: string) {
  return conversation.participants.find(p => p.userId !== currentUserId)
}
