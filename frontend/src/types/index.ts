export type UserRole = 'user' | 'admin'

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

export interface Campaign {
  id: string
  userId: string
  name: string
  totalBudget: number
  spentBudget: number
  remainingBudget: number
  weekStartDate: string
  weekEndDate: string
  isActive: boolean
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

export interface TeamMember extends User {
  level: number
  children?: TeamMember[]
  salesCount?: number
}
