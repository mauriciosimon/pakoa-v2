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
import { Users, UserPlus, TrendingUp, Copy } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// Mock team tree data
const mockTeamTree = {
  id: 'maria',
  name: 'María García',
  email: 'maria@pakoa.com',
  isActive: true,
  totalRevenue: 15000,
  salesThisWeek: 2,
  level: 0,
  children: [
    {
      id: 'carlos',
      name: 'Carlos Rodríguez',
      email: 'carlos@pakoa.com',
      isActive: true,
      totalRevenue: 5200,
      salesThisWeek: 3,
      level: 1,
      children: [
        {
          id: 'pedro',
          name: 'Pedro López',
          email: 'pedro@pakoa.com',
          isActive: true,
          totalRevenue: 2100,
          salesThisWeek: 1,
          level: 2,
          children: [
            {
              id: 'diego',
              name: 'Diego Ramírez',
              email: 'diego@pakoa.com',
              isActive: false,
              totalRevenue: 400,
              salesThisWeek: 0,
              level: 3,
              children: [],
            },
          ],
        },
        {
          id: 'laura',
          name: 'Laura Sánchez',
          email: 'laura@pakoa.com',
          isActive: false,
          totalRevenue: 750,
          salesThisWeek: 0,
          level: 2,
          children: [],
        },
      ],
    },
    {
      id: 'ana',
      name: 'Ana Martínez',
      email: 'ana@pakoa.com',
      isActive: true,
      totalRevenue: 3800,
      salesThisWeek: 1,
      level: 1,
      children: [
        {
          id: 'sofia',
          name: 'Sofía Hernández',
          email: 'sofia@pakoa.com',
          isActive: true,
          totalRevenue: 1200,
          salesThisWeek: 1,
          level: 2,
          children: [],
        },
      ],
    },
  ],
}

const mockStats = {
  totalTeamSize: 6,
  activeMembers: 4,
  teamSalesThisWeek: 8,
  teamRevenueThisWeek: 1250.50,
}

const levelColors = [
  'border-l-blue-500',
  'border-l-green-500',
  'border-l-purple-500',
  'border-l-orange-500',
]

interface TeamMemberProps {
  member: typeof mockTeamTree
  isRoot?: boolean
}

function TeamMember({ member, isRoot = false }: TeamMemberProps) {
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center gap-3 rounded-lg border-l-4 bg-card p-3 shadow-sm ${levelColors[member.level]}`}
      >
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
          </div>
          <p className="text-sm text-muted-foreground">{member.email}</p>
        </div>
        <div className="text-right">
          <p className="font-medium">${member.totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">
            {member.salesThisWeek} ventas esta semana
          </p>
        </div>
      </div>

      {member.children && member.children.length > 0 && (
        <div className="ml-6 space-y-2 border-l-2 border-dashed border-muted pl-4">
          {member.children.map((child) => (
            <TeamMember key={child.id} member={child} />
          ))}
        </div>
      )}
    </div>
  )
}

export function Team() {
  const { user } = useAuth()
  const referralLink = `https://pakoa.com/ref/${user?.id || 'abc123'}`

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    // TODO: Show toast notification
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
            <div className="text-2xl font-bold">{mockStats.totalTeamSize}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.activeMembers} activos
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
              {mockStats.teamSalesThisWeek}
            </div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
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
              ${mockStats.teamRevenueThisWeek.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tu Nivel</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 niveles</div>
            <p className="text-xs text-muted-foreground">Profundidad máxima</p>
          </CardContent>
        </Card>
      </div>

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
            Recibirás comisiones de hasta 3 niveles de profundidad: 8% (N1), 12%
            (N2), 20% (N3)
          </p>
        </CardContent>
      </Card>

      {/* Team Tree */}
      <Card>
        <CardHeader>
          <CardTitle>Árbol de Referidos</CardTitle>
          <CardDescription>
            Estructura completa de tu red (máximo 3 niveles)
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
                <span>Nivel 1 (8%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-purple-500" />
                <span>Nivel 2 (12%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-orange-500" />
                <span>Nivel 3 (20%)</span>
              </div>
            </div>

            {/* Tree Visualization */}
            <div className="rounded-lg border p-4">
              <TeamMember member={mockTeamTree} isRoot />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
