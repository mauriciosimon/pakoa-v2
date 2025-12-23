import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Key,
  AlertTriangle,
  Calendar,
  Eye,
  ChevronRight,
  Crown,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import type { User } from '@/types'

// =============================================================================
// CONSTANTS
// =============================================================================
const LLAVE_THRESHOLD = 15000

// =============================================================================
// MOCK DATA
// =============================================================================

// Platform-wide weekly stats
const mockWeeklyStats = {
  totalSalesThisWeek: 245800,
  totalSalesLastWeek: 198500,
  totalCommissionsThisWeek: 32450,
  usersWithLlave: 14,
  usersWithoutLlave: 8,
  totalUsers: 22,
}

// Global metrics
const mockGlobalMetrics = {
  totalUsers: 22,
  activeUsers: 14,
  activePercentage: 63.6,
  sales30Days: 892450,
  commissionsThisWeek: 32450,
}

// Daily sales data for last 30 days
const mockDailySales = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  return {
    date: date.toISOString().split('T')[0],
    amount: 15000 + Math.random() * 25000,
  }
})

// Top performers this week
const mockTopPerformers: Array<{
  id: string
  rank: number
  name: string
  salesThisWeek: number
  sales30Days: number
  hasLlave: boolean
  communitySize: number
  email: string
  phone: string
  role: 'agent' | 'admin'
  isActive: boolean
  totalRevenue: number
  createdAt: string
}> = [
  { id: '1', rank: 1, name: 'Carlos Rodríguez', salesThisWeek: 28500, sales30Days: 22000, hasLlave: true, communitySize: 8, email: 'carlos@pakoa.com', phone: '+521234567002', role: 'agent', isActive: true, totalRevenue: 22000, createdAt: '2024-02-01' },
  { id: '2', rank: 2, name: 'Sofía Hernández', salesThisWeek: 24200, sales30Days: 21000, hasLlave: true, communitySize: 3, email: 'sofia@pakoa.com', phone: '+521234567009', role: 'agent', isActive: true, totalRevenue: 21000, createdAt: '2024-04-15' },
  { id: '3', rank: 3, name: 'Pedro López', salesThisWeek: 21800, sales30Days: 19000, hasLlave: true, communitySize: 5, email: 'pedro@pakoa.com', phone: '+521234567007', role: 'agent', isActive: true, totalRevenue: 19000, createdAt: '2024-04-01' },
  { id: '4', rank: 4, name: 'Ana Martínez', salesThisWeek: 19500, sales30Days: 18500, hasLlave: true, communitySize: 4, email: 'ana@pakoa.com', phone: '+521234567003', role: 'agent', isActive: true, totalRevenue: 18500, createdAt: '2024-02-15' },
  { id: '5', rank: 5, name: 'Diego Ramírez', salesThisWeek: 18200, sales30Days: 18200, hasLlave: true, communitySize: 2, email: 'diego@pakoa.com', phone: '+521234567013', role: 'agent', isActive: true, totalRevenue: 18200, createdAt: '2024-07-01' },
  { id: '6', rank: 6, name: 'Mónica Castillo', salesThisWeek: 17800, sales30Days: 17800, hasLlave: true, communitySize: 1, email: 'monica@pakoa.com', phone: '+521234567016', role: 'agent', isActive: true, totalRevenue: 17800, createdAt: '2024-08-01' },
  { id: '7', rank: 7, name: 'Elena Vázquez', salesThisWeek: 16500, sales30Days: 16200, hasLlave: true, communitySize: 2, email: 'elena@pakoa.com', phone: '+521234567005', role: 'agent', isActive: true, totalRevenue: 16200, createdAt: '2024-03-01' },
  { id: '8', rank: 8, name: 'Jorge Ortiz', salesThisWeek: 16200, sales30Days: 16000, hasLlave: true, communitySize: 0, email: 'jorge@pakoa.com', phone: '+521234567015', role: 'agent', isActive: true, totalRevenue: 16000, createdAt: '2024-07-15' },
  { id: '9', rank: 9, name: 'Daniela Cruz', salesThisWeek: 15800, sales30Days: 15500, hasLlave: true, communitySize: 1, email: 'daniela@pakoa.com', phone: '+521234567012', role: 'agent', isActive: true, totalRevenue: 15500, createdAt: '2024-06-01' },
  { id: '10', rank: 10, name: 'Alejandro Flores', salesThisWeek: 14200, sales30Days: 13800, hasLlave: false, communitySize: 0, email: 'alejandro@pakoa.com', phone: '+521234567010', role: 'agent', isActive: false, totalRevenue: 13800, createdAt: '2024-05-01' },
]

// Users at risk (had Llave last week but below threshold now)
const mockUsersAtRisk: Array<{
  id: string
  name: string
  current30dSales: number
  gapToThreshold: number
  email: string
  phone: string
  role: 'agent' | 'admin'
  isActive: boolean
  totalRevenue: number
  createdAt: string
}> = [
  { id: '1', name: 'Alejandro Flores', current30dSales: 13800, gapToThreshold: 1200, email: 'alejandro@pakoa.com', phone: '+521234567010', role: 'agent', isActive: false, totalRevenue: 13800, createdAt: '2024-05-01' },
  { id: '2', name: 'Mónica Castillo', current30dSales: 14200, gapToThreshold: 800, email: 'monica2@pakoa.com', phone: '+521234567020', role: 'agent', isActive: false, totalRevenue: 14200, createdAt: '2024-08-01' },
  { id: '3', name: 'Laura Sánchez', current30dSales: 7500, gapToThreshold: 7500, email: 'laura@pakoa.com', phone: '+521234567008', role: 'agent', isActive: false, totalRevenue: 7500, createdAt: '2024-04-01' },
]

// Sales by level distribution
const mockSalesByLevel = [
  { level: 'Nivel 1', sales: 285000, percentage: 32 },
  { level: 'Nivel 2', sales: 225000, percentage: 25 },
  { level: 'Nivel 3', sales: 198000, percentage: 22 },
  { level: 'Nivel 4+', sales: 184450, percentage: 21 },
]

// Helper functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getDaysUntilWednesday(): number {
  const now = new Date()
  const currentDay = now.getDay()
  let daysUntil = (3 - currentDay + 7) % 7
  if (daysUntil === 0) daysUntil = 7
  return daysUntil
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AdminDashboard() {
  const navigate = useNavigate()
  const { startImpersonation } = useAuth()
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)

  const weekChange = useMemo(() => {
    if (mockWeeklyStats.totalSalesLastWeek === 0) return 100
    return ((mockWeeklyStats.totalSalesThisWeek - mockWeeklyStats.totalSalesLastWeek) / mockWeeklyStats.totalSalesLastWeek * 100)
  }, [])

  const maxDailySales = Math.max(...mockDailySales.map(d => d.amount))
  const daysUntilEval = getDaysUntilWednesday()

  const handleImpersonate = (user: typeof mockTopPerformers[0] | typeof mockUsersAtRisk[0]) => {
    const userToImpersonate: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      totalRevenue: user.totalRevenue,
      createdAt: user.createdAt,
    }
    startImpersonation(userToImpersonate)
    navigate('/dashboard')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Crown className="h-6 w-6 text-amber-500" />
          Dashboard Global
        </h1>
        <p className="text-muted-foreground">
          Vista panorámica de la plataforma Pakoa
        </p>
      </div>

      {/* Section A: Resumen de la Semana */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales This Week */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Ventas Esta Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {formatCurrency(mockWeeklyStats.totalSalesThisWeek)}
            </div>
            <div className={`flex items-center gap-1 text-sm ${weekChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {weekChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {weekChange >= 0 ? '+' : ''}{weekChange.toFixed(1)}% vs semana pasada
            </div>
          </CardContent>
        </Card>

        {/* Commissions Paid */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Comisiones Esta Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(mockWeeklyStats.totalCommissionsThisWeek)}</div>
            <p className="text-sm text-muted-foreground">Comisiones generadas</p>
          </CardContent>
        </Card>

        {/* Users with Llave */}
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Key className="h-4 w-4 text-amber-500" />
              Con Llave del Reino
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{mockWeeklyStats.usersWithLlave}</div>
            <Progress
              value={(mockWeeklyStats.usersWithLlave / mockWeeklyStats.totalUsers) * 100}
              className="mt-2 h-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {((mockWeeklyStats.usersWithLlave / mockWeeklyStats.totalUsers) * 100).toFixed(0)}% del total
            </p>
          </CardContent>
        </Card>

        {/* Users without Llave */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sin Llave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground">{mockWeeklyStats.usersWithoutLlave}</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="h-4 w-4" />
              <span>Próxima evaluación en {daysUntilEval} días</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section B: Métricas Globales */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas Globales</CardTitle>
          <CardDescription>Resumen de la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <div className="text-2xl font-bold">{mockGlobalMetrics.totalUsers}</div>
              <div className="text-sm text-muted-foreground">Total Usuarios</div>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <Key className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <div className="text-2xl font-bold text-amber-500">{mockGlobalMetrics.activeUsers}</div>
              <div className="text-sm text-muted-foreground">Usuarios Activos ({mockGlobalMetrics.activePercentage.toFixed(0)}%)</div>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-500">{formatCurrency(mockGlobalMetrics.sales30Days)}</div>
              <div className="text-sm text-muted-foreground">Ventas 30 Días</div>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-blue-500">{formatCurrency(mockGlobalMetrics.commissionsThisWeek)}</div>
              <div className="text-sm text-muted-foreground">Comisiones Semana</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section C: Ventas por Día */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas por Día (Últimos 30 días)</CardTitle>
          <CardDescription>Tendencia de ventas instaladas en toda la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end gap-1">
            {mockDailySales.map((day, i) => {
              const height = (day.amount / maxDailySales) * 100
              const isHovered = hoveredDay === i

              return (
                <div
                  key={day.date}
                  className="relative flex-1 group"
                  onMouseEnter={() => setHoveredDay(i)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <div
                    className={`w-full rounded-t transition-all cursor-pointer ${
                      isHovered ? 'bg-primary' : 'bg-primary/60'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  {isHovered && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10">
                      <div className="rounded bg-popover px-2 py-1 text-xs shadow-lg whitespace-nowrap border">
                        <div className="font-medium">{new Date(day.date).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                        <div className="text-green-500">{formatCurrency(day.amount)}</div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>30 días atrás</span>
            <span>Hoy</span>
          </div>
        </CardContent>
      </Card>

      {/* Section D & E: Top Performers & Users at Risk */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Top Performers Esta Semana
            </CardTitle>
            <CardDescription>Los 10 vendedores con más ventas esta semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockTopPerformers.map((performer) => (
                <div
                  key={performer.id}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    performer.rank === 1 ? 'bg-amber-500/20 text-amber-500' :
                    performer.rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                    performer.rank === 3 ? 'bg-orange-500/20 text-orange-500' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {performer.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{performer.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Comunidad: {performer.communitySize}</span>
                      {performer.hasLlave ? (
                        <Badge variant="success" className="text-[10px] px-1 py-0">Llave</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px] px-1 py-0">Sin Llave</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-500">{formatCurrency(performer.salesThisWeek)}</p>
                    <p className="text-xs text-muted-foreground">30d: {formatCurrency(performer.sales30Days)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleImpersonate(performer)}
                    title="Ver como este usuario"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/admin/users')}
            >
              Ver todos los usuarios
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Users at Risk */}
        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Usuarios en Riesgo
            </CardTitle>
            <CardDescription>
              Usuarios que tuvieron Llave pero ahora están por debajo del umbral de $15,000
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mockUsersAtRisk.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Key className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No hay usuarios en riesgo actualmente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mockUsersAtRisk.map((user) => {
                  const progressToThreshold = (user.current30dSales / LLAVE_THRESHOLD) * 100

                  return (
                    <div
                      key={user.id}
                      className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">{user.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleImpersonate(user)}
                          title="Ver como este usuario"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Ventas 30d: {formatCurrency(user.current30dSales)}</span>
                          <span className="text-amber-600 font-medium">Faltan: {formatCurrency(user.gapToThreshold)}</span>
                        </div>
                        <Progress value={progressToThreshold} className="h-2" />
                      </div>
                    </div>
                  )
                })}

                <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Próxima evaluación: en {daysUntilEval} días (Miércoles 00:00 CST)</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section F: Distribución de Ventas */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Ventas por Nivel</CardTitle>
          <CardDescription>Ventas agrupadas por nivel en el árbol MLM</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {mockSalesByLevel.map((level, i) => {
              const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500']
              return (
                <div key={level.level} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{level.level}</span>
                    <span className="text-sm text-muted-foreground">{level.percentage}%</span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${colors[i]} transition-all`}
                      style={{ width: `${level.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{formatCurrency(level.sales)}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
