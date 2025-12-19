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
import { Package, Plus, Search, Edit, Trash2 } from 'lucide-react'

// Mock data from seeded database
const mockProducts = [
  {
    id: '1',
    sku: 'PLAN-BASIC',
    name: 'Plan Básico',
    description: 'Internet 50Mbps + 500 min llamadas',
    basePrice: 29.99,
    isActive: true,
    salesCount: 45,
    revenue: 1349.55,
  },
  {
    id: '2',
    sku: 'PLAN-PLUS',
    name: 'Plan Plus',
    description: 'Internet 100Mbps + llamadas ilimitadas',
    basePrice: 49.99,
    isActive: true,
    salesCount: 78,
    revenue: 3899.22,
  },
  {
    id: '3',
    sku: 'PLAN-PREMIUM',
    name: 'Plan Premium',
    description: 'Internet 300Mbps + llamadas + TV',
    basePrice: 89.99,
    isActive: true,
    salesCount: 32,
    revenue: 2879.68,
  },
  {
    id: '4',
    sku: 'ADDON-TV',
    name: 'Pack TV Extra',
    description: '50 canales adicionales HD',
    basePrice: 15.99,
    isActive: true,
    salesCount: 25,
    revenue: 399.75,
  },
]

export function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)

  const filteredProducts = mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: mockProducts.length,
    active: mockProducts.filter((p) => p.isActive).length,
    totalRevenue: mockProducts.reduce((acc, p) => acc + p.revenue, 0),
    totalSales: mockProducts.reduce((acc, p) => acc + p.salesCount, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestión de Productos
          </h1>
          <p className="text-muted-foreground">
            Administra el catálogo de productos telecom
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Productos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Product Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Producto</CardTitle>
            <CardDescription>
              Agrega un nuevo producto al catálogo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">SKU</label>
                <Input placeholder="PLAN-XXX" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input placeholder="Nombre del producto" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Descripción</label>
                <Input placeholder="Descripción del producto" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Precio Base ($)</label>
                <Input type="number" step="0.01" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Input placeholder="Activo" disabled />
              </div>
              <div className="col-span-full flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear Producto</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Catálogo de Productos</CardTitle>
              <CardDescription>
                {filteredProducts.length} productos encontrados
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
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
                <TableHead>SKU</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-center">Ventas</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-sm">
                    {product.sku}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${product.basePrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    {product.salesCount}
                  </TableCell>
                  <TableCell className="text-right">
                    ${product.revenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={product.isActive ? 'success' : 'secondary'}>
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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
