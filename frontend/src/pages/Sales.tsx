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
import { Plus, Search } from 'lucide-react'

// Mock data
const mockSales = [
  {
    id: '1',
    customerName: 'Juan Pérez',
    customerPhone: '+1234560001',
    product: 'Plan Premium',
    quantity: 2,
    totalPrice: 179.98,
    status: 'CONFIRMED' as const,
    createdAt: '2024-12-15T10:30:00Z',
  },
  {
    id: '2',
    customerName: 'Rosa Díaz',
    customerEmail: 'rosa@email.com',
    product: 'Plan Plus',
    quantity: 3,
    totalPrice: 149.97,
    status: 'CONFIRMED' as const,
    createdAt: '2024-12-14T14:15:00Z',
  },
  {
    id: '3',
    customerName: 'Luis Moreno',
    product: 'Plan Básico',
    quantity: 1,
    totalPrice: 29.99,
    status: 'PENDING' as const,
    createdAt: '2024-12-13T09:00:00Z',
  },
  {
    id: '4',
    customerName: 'Ana Gómez',
    customerPhone: '+1234560005',
    product: 'Plan Premium',
    quantity: 1,
    totalPrice: 89.99,
    status: 'CANCELLED' as const,
    createdAt: '2024-12-10T16:45:00Z',
  },
]

const statusConfig = {
  PENDING: { label: 'Pendiente', variant: 'warning' as const },
  CONFIRMED: { label: 'Confirmado', variant: 'success' as const },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' as const },
  REFUNDED: { label: 'Reembolsado', variant: 'secondary' as const },
}

export function Sales() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewSaleForm, setShowNewSaleForm] = useState(false)

  const filteredSales = mockSales.filter(
    (sale) =>
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.product.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis Ventas</h1>
          <p className="text-muted-foreground">
            Gestiona y registra tus ventas
          </p>
        </div>
        <Button onClick={() => setShowNewSaleForm(!showNewSaleForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Venta
        </Button>
      </div>

      {/* New Sale Form (Shell) */}
      {showNewSaleForm && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nueva Venta</CardTitle>
            <CardDescription>
              Completa los datos del cliente y el producto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Nombre del Cliente
                </label>
                <Input placeholder="Juan Pérez" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono</label>
                <Input placeholder="+52 555 123 4567" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email (opcional)</label>
                <Input type="email" placeholder="cliente@email.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Producto</label>
                <Input placeholder="Seleccionar producto..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cantidad</label>
                <Input type="number" defaultValue={1} min={1} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Precio Total</label>
                <Input type="number" placeholder="0.00" disabled />
              </div>
              <div className="col-span-full flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewSaleForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Registrar Venta</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sales List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Historial de Ventas</CardTitle>
              <CardDescription>
                {filteredSales.length} ventas encontradas
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar ventas..."
                className="pl-9 sm:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="text-center">Cant.</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sale.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {sale.customerPhone || sale.customerEmail || '-'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{sale.product}</TableCell>
                  <TableCell className="text-center">{sale.quantity}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${sale.totalPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusConfig[sale.status].variant}>
                      {statusConfig[sale.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date(sale.createdAt).toLocaleDateString('es-MX')}
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
