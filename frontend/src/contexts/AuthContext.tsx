import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User } from '@/types'
import { getUserById } from '@/data/mockData'

interface ImpersonationState {
  isImpersonating: boolean
  originalAdmin: User | null
  impersonatedUser: User | null
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isImpersonating: boolean
  impersonatedUser: User | null
  originalAdmin: User | null
  effectiveUser: User | null // The user whose perspective we're viewing
  login: (email: string, password: string) => Promise<void>
  loginAsAdmin: () => void
  loginAsAgent: () => void
  loginAsUser: (userId: string) => void // Direct login as any user (for testing)
  logout: () => void
  startImpersonation: (targetUser: User) => void
  stopImpersonation: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock admin user
const mockAdminUser: User = {
  id: 'mock-admin-id',
  email: 'admin@pakoa.com',
  phone: '+521234560001',
  name: 'Admin Principal',
  isActive: true,
  activatedAt: '2024-01-01T00:00:00Z',
  totalRevenue: 0,
  role: 'admin',
  createdAt: '2024-01-01T00:00:00Z',
}

// Mock agent user (María - the root agent)
// ID must match mockUsers 'user-maria' for data consistency
const mockAgentUser: User = {
  id: 'user-maria',
  email: 'maria@pakoa.com',
  phone: '+521234567001',
  name: 'María García',
  isActive: true,
  activatedAt: '2024-01-01T00:00:00Z',
  totalRevenue: 45000,
  role: 'agent',
  createdAt: '2024-01-01T00:00:00Z',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start as admin for development
  const [user, setUser] = useState<User | null>(mockAdminUser)

  const [impersonation, setImpersonation] = useState<ImpersonationState>({
    isImpersonating: false,
    originalAdmin: null,
    impersonatedUser: null,
  })

  const login = async (_email: string, _password: string) => {
    // Mock login - in production this would call the API
    // For now, default to admin login
    setUser(mockAdminUser)
  }

  const loginAsAdmin = useCallback(() => {
    setUser(mockAdminUser)
    setImpersonation({
      isImpersonating: false,
      originalAdmin: null,
      impersonatedUser: null,
    })
  }, [])

  const loginAsAgent = useCallback(() => {
    setUser(mockAgentUser)
    setImpersonation({
      isImpersonating: false,
      originalAdmin: null,
      impersonatedUser: null,
    })
  }, [])

  // Login directly as any user (for testing full user experience)
  const loginAsUser = useCallback((userId: string) => {
    const targetUser = getUserById(userId)
    if (!targetUser) {
      console.error('User not found:', userId)
      return
    }

    // Create a User object from MockUser
    const userObject: User = {
      id: targetUser.id,
      email: targetUser.email,
      phone: targetUser.phone,
      name: targetUser.name,
      isActive: targetUser.isActive,
      activatedAt: targetUser.activatedAt,
      totalRevenue: targetUser.totalRevenue,
      role: targetUser.role,
      createdAt: targetUser.createdAt,
      parentId: targetUser.parentId,
    }

    setUser(userObject)
    setImpersonation({
      isImpersonating: false,
      originalAdmin: null,
      impersonatedUser: null,
    })

    console.log(`[DEV] Logged in directly as ${targetUser.name}`)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setImpersonation({
      isImpersonating: false,
      originalAdmin: null,
      impersonatedUser: null,
    })
  }, [])

  const startImpersonation = useCallback((targetUser: User) => {
    if (user?.role !== 'admin') {
      console.error('Only admins can impersonate users')
      return
    }

    setImpersonation({
      isImpersonating: true,
      originalAdmin: user,
      impersonatedUser: targetUser,
    })

    // Log the impersonation session (would be API call in production)
    console.log(`[AUDIT] Admin ${user.name} started impersonation of ${targetUser.name}`)
  }, [user])

  const stopImpersonation = useCallback(() => {
    if (impersonation.originalAdmin) {
      console.log(`[AUDIT] Admin ${impersonation.originalAdmin.name} stopped impersonation of ${impersonation.impersonatedUser?.name}`)
    }

    setImpersonation({
      isImpersonating: false,
      originalAdmin: null,
      impersonatedUser: null,
    })
  }, [impersonation])

  // The effective user is the one whose perspective we're viewing
  // When impersonating, it's the impersonated user; otherwise, it's the logged-in user
  const effectiveUser = impersonation.isImpersonating
    ? impersonation.impersonatedUser
    : user

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isImpersonating: impersonation.isImpersonating,
    impersonatedUser: impersonation.impersonatedUser,
    originalAdmin: impersonation.originalAdmin,
    effectiveUser,
    login,
    loginAsAdmin,
    loginAsAgent,
    loginAsUser,
    logout,
    startImpersonation,
    stopImpersonation,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
