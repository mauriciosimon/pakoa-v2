import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DollarSign, TrendingUp, Users, Wallet } from 'lucide-react'

// Mock data
const mockCommissionSummary = {
  totalEarned: 2450.75,
  pendingPayout: 156.99,
  personal: 1850.50,
  level1: 280.25,
  level2: 220.00,
  level3: 100.00,
}

const mockCommissions = [
  {
    id: '1',
    type: 'PERSONAL' as const,
    salesperson: 'Tú',
    customer: 'Juan Pérez',
    saleAmount: 179.98,
    rate: 0.30,
    amount: 53.99,
    status: 'PENDING' as const,
    date: '2024-12-15',
  },
  {
    id: '2',
    type: 'LEVEL_1' as const,
    salesperson: 'Carlos Rodríguez',
    customer: 'Rosa Díaz',
    saleAmount: 149.97,
    rate: 0.08,
    amount: 12.00,
    status: 'PENDING' as const,
    date: '2024-12-14',
  },
  {
    id: '3',
    type: 'LEVEL_2' as const,
    salesperson: 'Pedro López',
    customer: 'Luis Moreno',
    saleAmount: 29.99,
    rate: 0.12,
    amount: 3.60,
    status: 'APPROVED' as const,
    date: '2024-12-13',
  },
  {
    id: '4',
    type: 'PERSONAL' as const,
    salesperson: 'Tú',
    customer: 'Carmen Vega',
    saleAmount: 89.99,
    rate: 0.30,
    amount: 27.00,
    status: 'PAID' as const,
    date: '2024-12-08',
  },
]

const typeConfig = {
  PERSONAL: { label: 'Personal', color: 'bg-blue-500', rate: '30%' },
  LEVEL_1: { label: 'Nivel 1', color: 'bg-green-500', rate: '8%' },
  LEVEL_2: { label: 'Nivel 2', color: 'bg-purple-500', rate: '12%' },
  LEVEL_3: { label: 'Nivel 3', color: 'bg-orange-500', rate: '20%' },
}

const statusConfig = {
  PENDING: { label: 'Pendiente', variant: 'warning' as const },
  APPROVED: { label: 'Aprobado', variant: 'default' as const },
  PAID: { label: 'Pagado', variant: 'success' as const },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' as const },
}

export function Income() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis Ingresos</h1>
        <p className="text-muted-foreground">
          Desglose de comisiones personales y de equipo
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ganado</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockCommissionSummary.totalEarned.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Histórico total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockCommissionSummary.pendingPayout.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Se paga al cierre del ciclo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Comisiones Personales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockCommissionSummary.personal.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">30% de tus ventas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Comisiones de Equipo
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {(
                mockCommissionSummary.level1 +
                mockCommissionSummary.level2 +
                mockCommissionSummary.level3
              ).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Niveles 1, 2 y 3
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Desglose por Nivel</CardTitle>
            <CardDescription>
              Distribución de comisiones de equipo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Personal (30%)</span>
                </div>
                <span className="font-medium">
                  ${mockCommissionSummary.personal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm">Nivel 1 (8%)</span>
                </div>
                <span className="font-medium">
                  ${mockCommissionSummary.level1.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500" />
                  <span className="text-sm">Nivel 2 (12%)</span>
                </div>
                <span className="font-medium">
                  ${mockCommissionSummary.level2.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500" />
                  <span className="text-sm">Nivel 3 (20%)</span>
                </div>
                <span className="font-medium">
                  ${mockCommissionSummary.level3.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between font-medium">
                <span>Total</span>
                <span>${mockCommissionSummary.totalEarned.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Commissions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Comisiones Recientes</CardTitle>
            <CardDescription>
              Historial detallado de tus comisiones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead className="text-right">Venta</TableHead>
                  <TableHead className="text-right">Comisión</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCommissions.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${typeConfig[commission.type].color}`}
                        />
                        <span className="text-sm">
                          {typeConfig[commission.type].label}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{commission.salesperson}</p>
                        <p className="text-sm text-muted-foreground">
                          → {commission.customer}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ${commission.saleAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${commission.amount.toFixed(2)}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({(commission.rate * 100).toFixed(0)}%)
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={statusConfig[commission.status].variant}>
                        {statusConfig[commission.status].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
