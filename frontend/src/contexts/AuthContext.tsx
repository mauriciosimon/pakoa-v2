import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data - matches the seeded María from the database
const mockUser: User = {
  id: 'mock-maria-id',
  email: 'maria@pakoa.com',
  phone: '+1234567001',
  name: 'María García',
  isActive: true,
  activatedAt: '2024-01-01T00:00:00Z',
  totalRevenue: 15000,
  role: 'admin', // María is an admin for demo purposes
  createdAt: '2024-01-01T00:00:00Z',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(mockUser) // Auto-logged in for dev

  const login = async (_email: string, _password: string) => {
    // Mock login - in production this would call the API
    setUser(mockUser)
  }

  const logout = () => {
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
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
