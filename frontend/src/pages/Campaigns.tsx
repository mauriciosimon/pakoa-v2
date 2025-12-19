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
import { Megaphone, Plus, Calendar, DollarSign, Target } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// Mock data
const mockCampaigns = [
  {
    id: '1',
    name: 'María - Diciembre Semana 3',
    totalBudget: 800,
    spentBudget: 150,
    remainingBudget: 650,
    weekStartDate: '2024-12-16',
    weekEndDate: '2024-12-22',
    isActive: true,
    salesCount: 3,
  },
  {
    id: '2',
    name: 'María - Diciembre Semana 2',
    totalBudget: 800,
    spentBudget: 620,
    remainingBudget: 180,
    weekStartDate: '2024-12-09',
    weekEndDate: '2024-12-15',
    isActive: false,
    salesCount: 8,
  },
  {
    id: '3',
    name: 'María - Diciembre Semana 1',
    totalBudget: 800,
    spentBudget: 800,
    remainingBudget: 0,
    weekStartDate: '2024-12-02',
    weekEndDate: '2024-12-08',
    isActive: false,
    salesCount: 12,
  },
]

const mockBudgetInfo = {
  totalRevenue: 15000,
  calculatedBudget: 6000, // 15000 / 2.5
  actualBudget: 800, // Capped at max
  minBudget: 200,
  maxBudget: 800,
}

export function Campaigns() {
  const { user } = useAuth()
  const isActivated = user?.isActive ?? false

  if (!isActivated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campañas</h1>
          <p className="text-muted-foreground">
            Sistema de presupuesto para campañas de ventas
          </p>
        </div>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Target className="h-5 w-5" />
              Función Bloqueada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              Necesitas activar tu cuenta alcanzando $1,000 en ventas para
              desbloquear el sistema de campañas.
            </p>
            <p className="mt-2 text-sm text-yellow-600">
              Progreso actual: ${user?.totalRevenue?.toLocaleString() || 0} /
              $1,000
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeCampaign = mockCampaigns.find((c) => c.isActive)
  const pastCampaigns = mockCampaigns.filter((c) => !c.isActive)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis Campañas</h1>
          <p className="text-muted-foreground">
            Gestiona tu presupuesto semanal de campañas
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Campaña
        </Button>
      </div>

      {/* Budget Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Tu Presupuesto
          </CardTitle>
          <CardDescription>
            Cómo se calcula tu presupuesto de campaña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tus Ingresos</p>
              <p className="text-xl font-bold">
                ${mockBudgetInfo.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Cálculo (÷ 2.5)
              </p>
              <p className="text-xl font-bold">
                ${mockBudgetInfo.calculatedBudget.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Límites (min/max)
              </p>
              <p className="text-xl font-bold">
                ${mockBudgetInfo.minBudget} - ${mockBudgetInfo.maxBudget}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Tu Presupuesto Final
              </p>
              <p className="text-xl font-bold text-primary">
                ${mockBudgetInfo.actualBudget}/semana
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Tu presupuesto se renueva cada semana. Fórmula: Ingresos ÷ 2.5,
            mínimo $200, máximo $800.
          </p>
        </CardContent>
      </Card>

      {/* Active Campaign */}
      {activeCampaign && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  Campaña Activa
                </CardTitle>
                <CardDescription>{activeCampaign.name}</CardDescription>
              </div>
              <Badge variant="success">Activa</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(activeCampaign.weekStartDate).toLocaleDateString(
                'es-MX'
              )}{' '}
              -{' '}
              {new Date(activeCampaign.weekEndDate).toLocaleDateString('es-MX')}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Presupuesto usado</span>
                <span>
                  ${activeCampaign.spentBudget} / ${activeCampaign.totalBudget}
                </span>
              </div>
              <Progress
                value={
                  (activeCampaign.spentBudget / activeCampaign.totalBudget) *
                  100
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  ${activeCampaign.remainingBudget}
                </p>
                <p className="text-xs text-muted-foreground">Disponible</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  ${activeCampaign.spentBudget}
                </p>
                <p className="text-xs text-muted-foreground">Gastado</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{activeCampaign.salesCount}</p>
                <p className="text-xs text-muted-foreground">Ventas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Campañas</CardTitle>
          <CardDescription>Campañas de semanas anteriores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pastCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <p className="font-medium">{campaign.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(campaign.weekStartDate).toLocaleDateString(
                      'es-MX'
                    )}{' '}
                    -{' '}
                    {new Date(campaign.weekEndDate).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${campaign.spentBudget} / ${campaign.totalBudget}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {campaign.salesCount} ventas
                  </p>
                </div>
                <Badge variant="secondary">Finalizada</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
