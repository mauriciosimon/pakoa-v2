import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  RefreshCcw,
  Plus,
  Play,
  CheckCircle,
  DollarSign,
  Calendar,
} from 'lucide-react'

// Mock data
const mockCycles = [
  {
    id: '1',
    name: '2024-W51',
    startDate: '2024-12-16',
    endDate: '2024-12-22',
    status: 'OPEN' as const,
    totalSales: 459.93,
    totalCommissions: 165.57,
    salesCount: 4,
    closedAt: null,
    paidAt: null,
  },
  {
    id: '2',
    name: '2024-W50',
    startDate: '2024-12-09',
    endDate: '2024-12-15',
    status: 'COMPLETED' as const,
    totalSales: 1250.5,
    totalCommissions: 450.25,
    salesCount: 12,
    closedAt: '2024-12-16',
    paidAt: '2024-12-18',
  },
  {
    id: '3',
    name: '2024-W49',
    startDate: '2024-12-02',
    endDate: '2024-12-08',
    status: 'COMPLETED' as const,
    totalSales: 980.75,
    totalCommissions: 352.27,
    salesCount: 9,
    closedAt: '2024-12-09',
    paidAt: '2024-12-11',
  },
  {
    id: '4',
    name: '2024-W48',
    startDate: '2024-11-25',
    endDate: '2024-12-01',
    status: 'COMPLETED' as const,
    totalSales: 1100.0,
    totalCommissions: 396.0,
    salesCount: 11,
    closedAt: '2024-12-02',
    paidAt: '2024-12-04',
  },
]

const statusConfig = {
  OPEN: { label: 'Abierto', variant: 'success' as const, icon: Play },
  CLOSED: { label: 'Cerrado', variant: 'warning' as const, icon: RefreshCcw },
  PROCESSING: {
    label: 'Procesando',
    variant: 'default' as const,
    icon: RefreshCcw,
  },
  COMPLETED: {
    label: 'Completado',
    variant: 'secondary' as const,
    icon: CheckCircle,
  },
}

export function AdminCycles() {
  const [showForm, setShowForm] = useState(false)

  const currentCycle = mockCycles.find((c) => c.status === 'OPEN')
  const pastCycles = mockCycles.filter((c) => c.status !== 'OPEN')

  const stats = {
    totalCycles: mockCycles.length,
    totalSales: mockCycles.reduce((acc, c) => acc + c.totalSales, 0),
    totalCommissions: mockCycles.reduce((acc, c) => acc + c.totalCommissions, 0),
    totalTransactions: mockCycles.reduce((acc, c) => acc + c.salesCount, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestión de Ciclos
          </h1>
          <p className="text-muted-foreground">
            Administra los períodos de comisiones
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Ciclo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ciclos</CardTitle>
            <RefreshCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCycles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ventas Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalSales.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Comisiones Pagadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalCommissions.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          </CardContent>
        </Card>
      </div>

      {/* New Cycle Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Ciclo</CardTitle>
            <CardDescription>
              Crea un nuevo período de comisiones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input placeholder="2024-W52" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha Inicio</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha Fin</label>
                <Input type="date" />
              </div>
              <div className="col-span-full flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear Ciclo</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Current Cycle */}
      {currentCycle && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Play className="h-5 w-5" />
                  Ciclo Activo: {currentCycle.name}
                </CardTitle>
                <CardDescription className="text-green-700">
                  {new Date(currentCycle.startDate).toLocaleDateString('es-MX')}{' '}
                  - {new Date(currentCycle.endDate).toLocaleDateString('es-MX')}
                </CardDescription>
              </div>
              <Badge variant="success">Abierto</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-white p-4 text-center">
                <p className="text-2xl font-bold text-green-700">
                  ${currentCycle.totalSales.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Ventas</p>
              </div>
              <div className="rounded-lg bg-white p-4 text-center">
                <p className="text-2xl font-bold text-green-700">
                  ${currentCycle.totalCommissions.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Comisiones Pendientes
                </p>
              </div>
              <div className="rounded-lg bg-white p-4 text-center">
                <p className="text-2xl font-bold text-green-700">
                  {currentCycle.salesCount}
                </p>
                <p className="text-sm text-muted-foreground">Transacciones</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline">Ver Detalles</Button>
              <Button variant="destructive">Cerrar Ciclo</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Cycles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historial de Ciclos
          </CardTitle>
          <CardDescription>Ciclos anteriores completados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ciclo</TableHead>
                <TableHead>Período</TableHead>
                <TableHead className="text-right">Ventas</TableHead>
                <TableHead className="text-right">Comisiones</TableHead>
                <TableHead className="text-center">Transacciones</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead>Pagado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pastCycles.map((cycle) => (
                <TableRow key={cycle.id}>
                  <TableCell className="font-medium">{cycle.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(cycle.startDate).toLocaleDateString('es-MX')} -{' '}
                      {new Date(cycle.endDate).toLocaleDateString('es-MX')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    ${cycle.totalSales.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${cycle.totalCommissions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {cycle.salesCount}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusConfig[cycle.status].variant}>
                      {statusConfig[cycle.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {cycle.paidAt
                      ? new Date(cycle.paidAt).toLocaleDateString('es-MX')
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
