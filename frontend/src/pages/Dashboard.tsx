import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Trophy,
  Target,
} from 'lucide-react'

// Mock data - will be replaced with real API calls
const mockStats = {
  totalRevenue: 15000,
  thisWeekSales: 3,
  thisWeekRevenue: 329.95,
  teamSize: 4,
  activeTeamMembers: 3,
  pendingCommissions: 56.99,
}

const mockRecentSales = [
  {
    id: '1',
    customerName: 'Juan Pérez',
    product: 'Plan Premium',
    amount: 179.98,
    status: 'CONFIRMED',
    date: '2024-12-15',
  },
  {
    id: '2',
    customerName: 'Rosa Díaz',
    product: 'Plan Plus',
    amount: 149.97,
    status: 'CONFIRMED',
    date: '2024-12-14',
  },
  {
    id: '3',
    customerName: 'Luis Moreno',
    product: 'Plan Básico',
    amount: 29.99,
    status: 'PENDING',
    date: '2024-12-13',
  },
]

const mockAchievements = [
  { name: 'Primera Venta', earned: true, icon: '🎯' },
  { name: 'Activado', earned: true, icon: '⚡' },
  { name: 'Club 5K', earned: true, icon: '💎' },
  { name: 'Constructor de Equipo', earned: false, progress: 66, icon: '👥' },
]

export function Dashboard() {
  const { user } = useAuth()

  const activationProgress = Math.min((mockStats.totalRevenue / 1000) * 100, 100)
  const isActivated = mockStats.totalRevenue >= 1000

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenido, {user?.name.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground">
          Aquí tienes un resumen de tu actividad
        </p>
      </div>

      {/* Activation Status */}
      {!isActivated && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Target className="h-5 w-5" />
              Progreso de Activación
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Alcanza $1,000 en ventas para desbloquear campañas y comisiones de
              equipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-yellow-700">
                  ${mockStats.totalRevenue.toLocaleString()} / $1,000
                </span>
                <span className="font-medium text-yellow-800">
                  {activationProgress.toFixed(0)}%
                </span>
              </div>
              <Progress value={activationProgress} className="bg-yellow-200" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockStats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +${mockStats.thisWeekRevenue} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ventas Esta Semana
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.thisWeekSales}</div>
            <p className="text-xs text-muted-foreground">
              ${mockStats.thisWeekRevenue} en ventas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mi Equipo</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.teamSize}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.activeTeamMembers} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Comisiones Pendientes
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockStats.pendingCommissions}
            </div>
            <p className="text-xs text-muted-foreground">
              Se pagan al cierre del ciclo
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Ventas Recientes
            </CardTitle>
            <CardDescription>Tus últimas transacciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{sale.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {sale.product}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${sale.amount}</p>
                    <Badge
                      variant={
                        sale.status === 'CONFIRMED' ? 'success' : 'warning'
                      }
                    >
                      {sale.status === 'CONFIRMED' ? 'Confirmado' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Logros
            </CardTitle>
            <CardDescription>Tu progreso en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAchievements.map((achievement) => (
                <div
                  key={achievement.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <p className="font-medium">{achievement.name}</p>
                      {!achievement.earned && achievement.progress && (
                        <p className="text-sm text-muted-foreground">
                          {achievement.progress}% completado
                        </p>
                      )}
                    </div>
                  </div>
                  {achievement.earned ? (
                    <Badge variant="success">Obtenido</Badge>
                  ) : (
                    <Badge variant="outline">En progreso</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
