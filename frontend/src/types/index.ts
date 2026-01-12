export type UserRole = 'agent' | 'admin'

export interface User {
  id: string
  email: string
  phone?: string
  name: string
  avatarUrl?: string
  parentId?: string
  isActive: boolean
  activatedAt?: string
  totalRevenue: number
  role: UserRole
  createdAt: string
  // Extended fields for admin views
  parentName?: string
  communitySize?: number
  level?: number
}

export interface ImpersonationSession {
  id: string
  adminId: string
  targetUserId: string
  targetUser: User
  startedAt: string
  endedAt?: string
}

export interface Sale {
  id: string
  userId: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  totalPrice: number
  cycleId: string
  campaignId?: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED'
  createdAt: string
}

export interface Product {
  id: string
  sku: string
  name: string
  description?: string
  basePrice: number
  isActive: boolean
}

export interface Commission {
  id: string
  userId: string
  saleId: string
  type: 'PERSONAL' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3'
  level?: number
  rate: number
  amount: number
  cycleId: string
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED'
  createdAt: string
}

// Campaign status
export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED'

// Core Campaign interface - cascade/overflow model
export interface Campaign {
  id: string
  ownerId: string              // User who owns this campaign (earned Llave to create it)
  ownerName: string            // Denormalized for display
  name: string                 // e.g., "María - Campaña 1"
  status: CampaignStatus
  createdAt: string            // ISO date when campaign was created (first Llave)
  initialPeriodEndsAt: string  // 2 weeks after createdAt
  parentCampaignId: string | null   // The campaign this overflowed FROM
  childCampaignId: string | null    // The campaign this overflows TO
  chainPosition: number        // 1 = root, 2 = first child, etc.
}

// Weekly snapshot for a campaign's budget calculation
export interface CampaignWeeklySnapshot {
  id: string
  campaignId: string
  weekDate: string             // ISO date of the week start (Wednesday)
  totalSales: number           // Sum of all sales attributed to this campaign that week
  baseBudget: number           // sales / 2.5 or $200 if initial period
  cappedBudget: number         // min(baseBudget, 800)
  overflowOut: number          // Amount sent to child: max(0, baseBudget - 800)
  overflowIn: number           // Amount received from parent campaign
  totalBudget: number          // cappedBudget + overflowIn
  isInitialPeriod: boolean     // True if within first 2 weeks of campaign creation
}

// Participant role in a campaign
export type ParticipantRole = 'owner' | 'participant'

// Campaign participant - up to 4 users per campaign (1 owner + 3 participants)
export interface CampaignParticipant {
  id: string
  campaignId: string
  userId: string
  userName: string             // Denormalized for display
  userEmail: string            // Denormalized for search
  role: ParticipantRole
  joinedAt: string
  removedAt: string | null     // null = active, timestamp = removed
}

export interface Cycle {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'OPEN' | 'CLOSED' | 'PROCESSING' | 'COMPLETED'
  totalSales: number
  totalCommissions: number
}

export interface Achievement {
  id: string
  code: string
  name: string
  description: string
  iconUrl?: string
  criteria: Record<string, unknown>
  rewardType?: 'BONUS_COMMISSION' | 'BUDGET_BOOST' | 'BADGE_ONLY'
  rewardValue?: number
}

export interface UserAchievement {
  id: string
  achievementId: string
  achievement: Achievement
  earnedAt: string
  progress?: number
}

// Trophy System
export type TrophyCategory = 'ventas' | 'legado' | 'campanas' | 'consistencia' | 'ingresos'

export type TrophyConditionType =
  | 'first_sale'
  | 'sales_30d'
  | 'child_has_llave'
  | 'grandchild_has_llave'
  | 'children_with_llave'
  | 'campaign_count'
  | 'consecutive_llave_weeks'
  | 'weekly_income'
  | 'top_earner'

export interface Trophy {
  id: string
  slug: string
  name: string
  description: string
  category: TrophyCategory
  imagePath: string
  conditionType: TrophyConditionType
  conditionValue: number
  sortOrder: number
  isSpecial?: boolean  // For rotating trophies like Penacho de Pakoa
}

export interface UserTrophy {
  userId: string
  trophyId: string
  earnedAt: string
  isCurrentHolder?: boolean  // For rotating trophies
}

export interface TeamMember extends User {
  level: number
  children?: TeamMember[]
  salesCount?: number
}
