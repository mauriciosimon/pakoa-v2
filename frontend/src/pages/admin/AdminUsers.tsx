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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users, Search, Plus, MoreHorizontal } from 'lucide-react'

// Mock data from seeded database
const mockUsers = [
  {
    id: '1',
    name: 'María García',
    email: 'maria@pakoa.com',
    phone: '+1234567001',
    isActive: true,
    totalRevenue: 15000,
    role: 'admin',
    parentName: null,
    childrenCount: 2,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    email: 'carlos@pakoa.com',
    phone: '+1234567002',
    isActive: true,
    totalRevenue: 5200,
    role: 'user',
    parentName: 'María García',
    childrenCount: 2,
    createdAt: '2024-02-15',
  },
  {
    id: '3',
    name: 'Ana Martínez',
    email: 'ana@pakoa.com',
    phone: '+1234567003',
    isActive: true,
    totalRevenue: 3800,
    role: 'user',
    parentName: 'María García',
    childrenCount: 1,
    createdAt: '2024-03-01',
  },
  {
    id: '4',
    name: 'Pedro López',
    email: 'pedro@pakoa.com',
    phone: '+1234567004',
    isActive: true,
    totalRevenue: 2100,
    role: 'user',
    parentName: 'Carlos Rodríguez',
    childrenCount: 1,
    createdAt: '2024-04-10',
  },
  {
    id: '5',
    name: 'Laura Sánchez',
    email: 'laura@pakoa.com',
    phone: '+1234567005',
    isActive: false,
    totalRevenue: 750,
    role: 'user',
    parentName: 'Carlos Rodríguez',
    childrenCount: 0,
    createdAt: '2024-04-20',
  },
  {
    id: '6',
    name: 'Sofía Hernández',
    email: 'sofia@pakoa.com',
    phone: '+1234567006',
    isActive: true,
    totalRevenue: 1200,
    role: 'user',
    parentName: 'Ana Martínez',
    childrenCount: 0,
    createdAt: '2024-05-20',
  },
  {
    id: '7',
    name: 'Diego Ramírez',
    email: 'diego@pakoa.com',
    phone: '+1234567007',
    isActive: false,
    totalRevenue: 400,
    role: 'user',
    parentName: 'Pedro López',
    childrenCount: 0,
    createdAt: '2024-06-01',
  },
]

export function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: mockUsers.length,
    active: mockUsers.filter((u) => u.isActive).length,
    inactive: mockUsers.filter((u) => !u.isActive).length,
    admins: mockUsers.filter((u) => u.role === 'admin').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestión de Usuarios
          </h1>
          <p className="text-muted-foreground">
            Administra todos los usuarios de la plataforma
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Usuarios
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.inactive}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.admins}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Todos los Usuarios</CardTitle>
              <CardDescription>
                {filteredUsers.length} usuarios encontrados
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
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
                <TableHead>Usuario</TableHead>
                <TableHead>Referido por</TableHead>
                <TableHead className="text-center">Equipo</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Rol</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.parentName || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {user.childrenCount}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${user.totalRevenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={user.isActive ? 'success' : 'secondary'}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={user.role === 'admin' ? 'default' : 'outline'}
                    >
                      {user.role === 'admin' ? 'Admin' : 'Usuario'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
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
