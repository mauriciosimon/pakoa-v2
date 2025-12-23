import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Users, UserPlus, TrendingUp, Copy, List, Hexagon, ChevronRight, ChevronDown, Globe } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { HoneycombMap } from '@/components/HoneycombMap'
import { WorldMap } from '@/components/WorldMap'
import {
  mockUsers,
  getUserById,
  getTeamMembers,
  hasLlave,
  type MockUser,
} from '@/data/mockData'

// Tree node type for display
interface TeamTreeNode {
  id: string
  name: string
  email: string
  isActive: boolean
  totalRevenue: number
  sales30d: number
  salesThisWeek: number
  level: number // relative level (0 = current user, 1 = hijo, etc.)
  children: TeamTreeNode[]
}

// Build a tree structure from flat mockUsers data starting from a user
function buildTeamTree(userId: string, currentUserLevel: number = 0): TeamTreeNode | null {
  const user = getUserById(userId)
  if (!user) return null

  // Get direct children
  const directChildren = mockUsers.filter(u => u.parentId === userId)

  // Build tree recursively (limit to 3 levels of depth for display)
  const relativeLevel = user.level - currentUserLevel

  const node: TeamTreeNode = {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: hasLlave(user.sales30d),
    totalRevenue: user.totalRevenue,
    sales30d: user.sales30d,
    salesThisWeek: Math.floor(user.sales30d / 4), // approximate weekly
    level: relativeLevel,
    children: relativeLevel < 3
      ? directChildren.map(child => buildTeamTree(child.id, currentUserLevel)!).filter(Boolean)
      : [],
  }

  return node
}

// Calculate team stats
function calculateTeamStats(teamMembers: MockUser[]) {
  const activeMembers = teamMembers.filter(m => hasLlave(m.sales30d))
  const totalSales30d = teamMembers.reduce((sum, m) => sum + m.sales30d, 0)

  // Calculate max depth
  const teamIds = new Set(teamMembers.map(m => m.id))
  let maxDepth = 0
  teamMembers.forEach(member => {
    let depth = 0
    let current: MockUser | undefined = member
    while (current && teamIds.has(current.id)) {
      depth++
      current = mockUsers.find(u => u.id === current?.parentId)
    }
    maxDepth = Math.max(maxDepth, depth)
  })

  return {
    totalTeamSize: teamMembers.length,
    activeMembers: activeMembers.length,
    teamSalesThisWeek: Math.floor(totalSales30d / 4), // approximate
    teamRevenueThisWeek: totalSales30d / 4,
    maxDepth,
  }
}

const levelColors = [
  'border-l-blue-500',
  'border-l-green-500',
  'border-l-purple-500',
  'border-l-orange-500',
]

interface TeamMemberProps {
  member: TeamTreeNode
  isRoot?: boolean
  defaultExpanded?: boolean
}

function TeamMember({ member, isRoot = false, defaultExpanded = true }: TeamMemberProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const hasChildren = member.children && member.children.length > 0

  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center gap-3 rounded-lg border-l-4 bg-card p-3 shadow-sm ${levelColors[Math.min(member.level, levelColors.length - 1)]} transition-all hover:shadow-md`}
      >
        {/* Expand/Collapse Toggle */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors"
            aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-8" />
        )}

        <Avatar className="h-10 w-10">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{member.name}</span>
            {isRoot && (
              <Badge variant="outline" className="text-xs">
                Tú
              </Badge>
            )}
            <Badge variant={member.isActive ? 'success' : 'secondary'}>
              {member.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
            {hasChildren && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {member.children.length} referido{member.children.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{member.email}</p>
        </div>
        <div className="text-right">
          <p className="font-medium">${member.sales30d.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">
            Ventas 30 días
          </p>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-6 space-y-2 border-l-2 border-dashed border-muted pl-4 animate-in slide-in-from-top-2 duration-200">
          {member.children.map((child) => (
            <TeamMember key={child.id} member={child} defaultExpanded={false} />
          ))}
        </div>
      )}
    </div>
  )
}

type TabType = 'lista' | 'mapa' | 'mundo'

export function Team() {
  const { effectiveUser } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('lista')
  const referralLink = `https://pakoa.com/ref/${effectiveUser?.id || 'abc123'}`

  // Get current user data from centralized mock data
  const currentUserData = useMemo(() => {
    if (!effectiveUser) return null
    return getUserById(effectiveUser.id) ||
           mockUsers.find(u => u.email === effectiveUser.email) ||
           mockUsers[0]
  }, [effectiveUser])

  // Build team tree starting from current user
  const teamTree = useMemo(() => {
    if (!currentUserData) return null
    return buildTeamTree(currentUserData.id, currentUserData.level)
  }, [currentUserData])

  // Get flat list of team members for stats
  const teamMembers = useMemo(() => {
    if (!currentUserData) return []
    return getTeamMembers(currentUserData.id)
  }, [currentUserData])

  // Calculate stats
  const stats = useMemo(() => {
    return calculateTeamStats(teamMembers)
  }, [teamMembers])

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    // TODO: Show toast notification
  }

  if (!currentUserData || !teamTree) {
    return <div className="p-4">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Equipo</h1>
          <p className="text-muted-foreground">
            Visualiza y gestiona tu red de referidos
          </p>
        </div>
        <Button onClick={copyReferralLink}>
          <UserPlus className="mr-2 h-4 w-4" />
          Copiar Link de Referido
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tamaño del Equipo
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeamSize}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeMembers} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ventas del Equipo
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.teamSalesThisWeek.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Esta semana (aprox)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos del Equipo
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.teamRevenueThisWeek.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 30 días / 4</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tu Red</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maxDepth} niveles</div>
            <p className="text-xs text-muted-foreground">Profundidad máxima</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        <button
          onClick={() => setActiveTab('lista')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'lista'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <List className="h-4 w-4" />
          Lista
        </button>
        <button
          onClick={() => setActiveTab('mapa')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'mapa'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Hexagon className="h-4 w-4" />
          Mapa de Comunidad
        </button>
        <button
          onClick={() => setActiveTab('mundo')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'mundo'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Globe className="h-4 w-4" />
          Mundo
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'lista' && (
        <Card>
          <CardHeader>
            <CardTitle>Árbol de Referidos</CardTitle>
            <CardDescription>
              Estructura completa de tu red (máximo 3 niveles para comisiones)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Level Legend */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-blue-500" />
                  <span>Tú (Nivel 0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-green-500" />
                  <span>Hijos - Nivel 1 (8%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-purple-500" />
                  <span>Nietos - Nivel 2 (12%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-orange-500" />
                  <span>Bisnietos - Nivel 3 (20%)</span>
                </div>
              </div>

              {/* Tree Visualization */}
              <div className="rounded-lg border p-4">
                {teamTree.children.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No tienes referidos aún</p>
                    <p className="text-sm">Comparte tu link para comenzar a construir tu equipo</p>
                  </div>
                ) : (
                  <TeamMember member={teamTree} isRoot />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'mapa' && <HoneycombMap rootUserId={currentUserData.id} />}

      {activeTab === 'mundo' && <WorldMap />}

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Tu Link de Referido
          </CardTitle>
          <CardDescription>
            Comparte este link para invitar nuevos vendedores a tu equipo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm">
              {referralLink}
            </div>
            <Button variant="outline" size="icon" onClick={copyReferralLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Recibirás comisiones de hasta 3 niveles de profundidad: 8% (Hijos), 12%
            (Nietos), 20% (Bisnietos)
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
