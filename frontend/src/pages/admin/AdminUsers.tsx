import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Select } from '@/components/ui/select'
import {
  Users,
  Search,
  Eye,
  ChevronUp,
  ChevronDown,
  Key,
  Lock,
  Phone,
  Mail,
  Calendar,
  Network,
  Clock,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  mockUsers,
  hasLlave,
  isAtRisk,
  getTeamMembers,
  type MockUser,
} from '@/data/mockData'

// Extended user type with calculated community size
interface ExtendedUser extends MockUser {
  calculatedCommunitySize: number
}

type SortField = 'name' | 'level' | 'communitySize' | 'sales30d' | 'lastSaleDate'
type SortDirection = 'asc' | 'desc'

export function AdminUsers() {
  const navigate = useNavigate()
  const { startImpersonation } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [llaveFilter, setLlaveFilter] = useState<'all' | 'yes' | 'no'>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null)

  // Calculate community sizes for all users (only up to 3 levels: hijos, nietos, bisnietos)
  const usersWithCommunitySize = useMemo((): ExtendedUser[] => {
    return mockUsers.map(user => ({
      ...user,
      calculatedCommunitySize: getTeamMembers(user.id, 3).length,
    }))
  }, [])

  // Filter and sort users from centralized data
  const filteredUsers = useMemo(() => {
    let result = [...usersWithCommunitySize]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          (user.phone && user.phone.includes(term))
      )
    }

    // Llave filter
    if (llaveFilter !== 'all') {
      const wantsLlave = llaveFilter === 'yes'
      result = result.filter((user) => hasLlave(user.sales30d) === wantsLlave)
    }

    // Level filter
    if (levelFilter !== 'all') {
      result = result.filter((user) => user.level === parseInt(levelFilter))
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'level':
          comparison = a.level - b.level
          break
        case 'communitySize':
          comparison = a.calculatedCommunitySize - b.calculatedCommunitySize
          break
        case 'sales30d':
          comparison = a.sales30d - b.sales30d
          break
        case 'lastSaleDate':
          comparison = (a.lastSaleDate || '').localeCompare(b.lastSaleDate || '')
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [usersWithCommunitySize, searchTerm, llaveFilter, levelFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        )}
      </div>
    </TableHead>
  )

  const handleImpersonate = (user: MockUser) => {
    startImpersonation({
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      isActive: user.isActive,
      activatedAt: user.activatedAt,
      totalRevenue: user.totalRevenue,
      role: user.role,
      createdAt: user.createdAt,
    })
    navigate('/dashboard')
  }

  const stats = {
    total: mockUsers.length,
    withLlave: mockUsers.filter((u) => hasLlave(u.sales30d)).length,
    withoutLlave: mockUsers.filter((u) => !hasLlave(u.sales30d)).length,
    atRisk: mockUsers.filter((u) => isAtRisk(u.sales30d)).length,
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">
          Administra todos los usuarios de la plataforma
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Llave</CardTitle>
            <Key className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.withLlave}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Llave</CardTitle>
            <Lock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.withoutLlave}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Riesgo</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.atRisk}</div>
            <p className="text-xs text-muted-foreground">$12k - $15k</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Todos los Usuarios</CardTitle>
              <CardDescription>
                {filteredUsers.length} usuarios encontrados
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email, teléfono..."
                  className="pl-9 sm:w-[280px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Llave Filter */}
              <Select
                value={llaveFilter}
                onChange={(e) => setLlaveFilter(e.target.value as typeof llaveFilter)}
                className="w-[140px]"
              >
                <option value="all">Todas</option>
                <option value="yes">Con Llave</option>
                <option value="no">Sin Llave</option>
              </Select>

              {/* Level Filter */}
              <Select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-[120px]"
              >
                <option value="all">Todos</option>
                <option value="0">Nivel 0</option>
                <option value="1">Nivel 1</option>
                <option value="2">Nivel 2</option>
                <option value="3">Nivel 3</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="name">Usuario</SortableHeader>
                <TableHead>Email</TableHead>
                <SortableHeader field="level">Nivel</SortableHeader>
                <TableHead>Padre</TableHead>
                <SortableHeader field="communitySize">Comunidad</SortableHeader>
                <SortableHeader field="sales30d">Ventas 30d</SortableHeader>
                <TableHead className="text-center">Llave</TableHead>
                <SortableHeader field="lastSaleDate">Última Venta</SortableHeader>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const userHasLlave = hasLlave(user.sales30d)
                const userAtRisk = isAtRisk(user.sales30d)

                return (
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
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Nivel {user.level}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.parentName || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-center">{user.calculatedCommunitySize}</TableCell>
                    <TableCell className={userAtRisk ? 'text-orange-500 font-medium' : ''}>
                      {formatCurrency(user.sales30d)}
                    </TableCell>
                    <TableCell className="text-center">
                      {userHasLlave ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <Key className="h-3 w-3 mr-1" />
                          Activa
                        </Badge>
                      ) : userAtRisk ? (
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                          <Clock className="h-3 w-3 mr-1" />
                          En Riesgo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Lock className="h-3 w-3 mr-1" />
                          Sin Llave
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.lastSaleDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          Ver Perfil
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleImpersonate(user)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver como Usuario
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg">
                    {selectedUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">Nivel {selectedUser.level}</Badge>
                    {hasLlave(selectedUser.sales30d) ? (
                      <Badge className="bg-green-100 text-green-700">
                        <Key className="h-3 w-3 mr-1" />
                        Con Llave
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Sin Llave</Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedUser(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Contacto</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {selectedUser.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {selectedUser.phone || '-'}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Miembro desde {formatDate(selectedUser.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Posición en el Árbol</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Network className="h-4 w-4 text-muted-foreground" />
                      Nivel {selectedUser.level}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {selectedUser.calculatedCommunitySize} en su comunidad
                    </div>
                    {selectedUser.parentName && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Referido por:</span>
                        {selectedUser.parentName}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sales Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Ventas</h4>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Ventas 30 días</div>
                    <div className="text-lg font-bold">{formatCurrency(selectedUser.sales30d)}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Total Histórico</div>
                    <div className="text-lg font-bold">{formatCurrency(selectedUser.totalRevenue)}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Última Venta</div>
                    <div className="text-lg font-bold">{formatDate(selectedUser.lastSaleDate)}</div>
                  </div>
                </div>
              </div>

              {/* Llave History */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Historial de Llave del Reino
                </h4>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Semana</TableHead>
                        <TableHead className="text-right">Ventas</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedUser.llaveHistory.map((week, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{formatDate(week.week)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(week.sales)}</TableCell>
                          <TableCell className="text-center">
                            {week.hasLlave ? (
                              <span className="inline-flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                Activa
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <XCircle className="h-4 w-4" />
                                Inactiva
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Cerrar
                </Button>
                <Button onClick={() => {
                  handleImpersonate(selectedUser)
                  setSelectedUser(null)
                }}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver como Usuario
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
