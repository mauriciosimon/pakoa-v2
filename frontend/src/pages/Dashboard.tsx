import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Calendar,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Phone,
  X,
} from 'lucide-react'
import {
  mockUsers,
  getUserById,
  getUserSales,
  getTeamMembers,
  getRelativeLevelLabel,
  mockWeeklyData,
  mockProductSalesData,
  LLAVE_THRESHOLD,
  hasLlave,
  type FunnelStatus,
} from '@/data/mockData'

// Helper functions
function getNextWednesday(): Date {
  const now = new Date()
  const daysUntilWednesday = (3 - now.getDay() + 7) % 7 || 7
  const nextWed = new Date(now)
  nextWed.setDate(now.getDate() + daysUntilWednesday)
  nextWed.setHours(0, 0, 0, 0)
  return nextWed
}

function getDaysUntilWednesday(): number {
  const now = new Date()
  const nextWed = getNextWednesday()
  return Math.ceil((nextWed.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Funnel config (labels will be translated dynamically in component)

// Team member type for display
interface TeamMemberDisplay {
  id: string
  name: string
  level: 'hijo' | 'nieto' | 'bisnieto' | 'tataranieto'
  ventas30Dias: number
  isActive: boolean
  pendingCount: number
  lastSaleDate: string | undefined
}

export function Dashboard() {
  const { t } = useTranslation()
  const { effectiveUser } = useAuth()
  const [teamFilter, setTeamFilter] = useState<'all' | 'hijo' | 'nieto' | 'bisnieto' | 'tataranieto'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'at-risk'>('all')
  const [teamSort, setTeamSort] = useState<'sales' | 'name' | 'date'>('sales')
  const [expandedSale, setExpandedSale] = useState<string | null>(null)
  const [kanbanStartDate, setKanbanStartDate] = useState<string>('')
  const [kanbanEndDate, setKanbanEndDate] = useState<string>('')

  // Funnel config with translations
  const funnelConfig: Record<FunnelStatus, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
    PROSPECTO: { label: t('sales.prospectos'), color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: FileText },
    COTIZADO: { label: t('sales.cotizados'), color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', icon: DollarSign },
    AGENDADO: { label: t('sales.agendados'), color: 'text-purple-400', bgColor: 'bg-purple-500/20', icon: Calendar },
    INSTALADO: { label: t('sales.instalados'), color: 'text-green-400', bgColor: 'bg-green-500/20', icon: CheckCircle },
    CANCELADO: { label: t('sales.cancelados'), color: 'text-red-400', bgColor: 'bg-red-500/20', icon: XCircle },
  }

  // Get the current user's data from the centralized mock data
  const currentUserData = useMemo(() => {
    if (!effectiveUser) return null
    // Try to find the user in our mock data by ID or email
    return getUserById(effectiveUser.id) ||
           mockUsers.find(u => u.email === effectiveUser.email) ||
           mockUsers[0] // fallback to first user
  }, [effectiveUser])

  // Get the user's sales from centralized data
  const userSales = useMemo(() => {
    if (!currentUserData) return []
    return getUserSales(currentUserData.id)
  }, [currentUserData])

  // Get team members (descendants of current user)
  const teamMembers = useMemo((): TeamMemberDisplay[] => {
    if (!currentUserData) return []
    const members = getTeamMembers(currentUserData.id)
    return members.map(m => ({
      id: m.id,
      name: m.name,
      level: getRelativeLevelLabel(m.level, currentUserData.level),
      ventas30Dias: m.sales30d,
      isActive: hasLlave(m.sales30d),
      pendingCount: m.pendingCount,
      lastSaleDate: m.lastSaleDate,
    }))
  }, [currentUserData])

  // Use the user's sales30d from centralized data (single source of truth)
  const ventas30Dias = currentUserData?.sales30d || 0

  // Calculate weekly sales from actual user sales
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const ventasEstaSemana = useMemo(() => {
    return userSales
      .filter(s => s.funnelStatus === 'INSTALADO' && s.installedAt && new Date(s.installedAt) >= sevenDaysAgo)
      .reduce((sum, s) => sum + s.amount, 0)
  }, [userSales])

  const ventasSemanaPasada = useMemo(() => {
    return userSales
      .filter(s => s.funnelStatus === 'INSTALADO' && s.installedAt &&
        new Date(s.installedAt) >= fourteenDaysAgo && new Date(s.installedAt) < sevenDaysAgo)
      .reduce((sum, s) => sum + s.amount, 0)
  }, [userSales])

  // Llave del Reino status based on centralized data
  const isActive = hasLlave(ventas30Dias)
  const progressToThreshold = Math.min((ventas30Dias / LLAVE_THRESHOLD) * 100, 100)
  const daysUntilEval = getDaysUntilWednesday()

  // Kanban filtered sales
  const kanbanFilteredSales = useMemo(() => {
    return userSales.filter(sale => {
      const saleDate = new Date(sale.capturedAt)
      if (kanbanStartDate) {
        const startDate = new Date(kanbanStartDate)
        startDate.setHours(0, 0, 0, 0)
        if (saleDate < startDate) return false
      }
      if (kanbanEndDate) {
        const endDate = new Date(kanbanEndDate)
        endDate.setHours(23, 59, 59, 999)
        if (saleDate > endDate) return false
      }
      return true
    })
  }, [userSales, kanbanStartDate, kanbanEndDate])

  const kanbanFunnelStats = useMemo(() => {
    const stats: Record<FunnelStatus, { count: number; value: number }> = {
      PROSPECTO: { count: 0, value: 0 },
      COTIZADO: { count: 0, value: 0 },
      AGENDADO: { count: 0, value: 0 },
      INSTALADO: { count: 0, value: 0 },
      CANCELADO: { count: 0, value: 0 },
    }
    kanbanFilteredSales.forEach(sale => {
      stats[sale.funnelStatus].count++
      stats[sale.funnelStatus].value += sale.amount
    })
    return stats
  }, [kanbanFilteredSales])

  const kanbanPendingSales = kanbanFilteredSales.filter(s => !['INSTALADO', 'CANCELADO'].includes(s.funnelStatus))

  const clearKanbanFilters = () => {
    setKanbanStartDate('')
    setKanbanEndDate('')
  }

  const hasKanbanFilters = kanbanStartDate || kanbanEndDate

  // Team filtering and sorting
  const filteredTeam = useMemo(() => {
    let members = [...teamMembers]

    if (teamFilter !== 'all') {
      members = members.filter(m => m.level === teamFilter)
    }

    if (statusFilter === 'active') {
      members = members.filter(m => m.isActive)
    } else if (statusFilter === 'inactive') {
      members = members.filter(m => !m.isActive)
    } else if (statusFilter === 'at-risk') {
      members = members.filter(m => m.ventas30Dias >= 12000 && m.ventas30Dias < 15000)
    }

    members.sort((a, b) => {
      if (teamSort === 'sales') return b.ventas30Dias - a.ventas30Dias
      if (teamSort === 'name') return a.name.localeCompare(b.name)
      if (teamSort === 'date') {
        if (!a.lastSaleDate) return 1
        if (!b.lastSaleDate) return -1
        return new Date(b.lastSaleDate).getTime() - new Date(a.lastSaleDate).getTime()
      }
      return 0
    })

    return members
  }, [teamMembers, teamFilter, statusFilter, teamSort])

  const weekChange = ventasSemanaPasada > 0
    ? ((ventasEstaSemana - ventasSemanaPasada) / ventasSemanaPasada * 100).toFixed(0)
    : '100'

  const maxWeeklySales = Math.max(...mockWeeklyData.map(d => d.sales))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('dashboard.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('dashboard.welcome', { name: effectiveUser?.name.split(' ')[0] })}
        </p>
      </div>

      {/* Section A: Mi Resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Ventas 30 días - Main KPI */}
        <Card className={`col-span-2 ${isActive ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {t('sales.sales30Days')}
              </span>
              <Badge variant={isActive ? 'success' : 'destructive'} className="text-sm">
                {isActive ? t('llave.active') : t('llave.inactive')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(ventas30Dias)}
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('llave.goal')}</span>
                <span className={isActive ? 'text-green-400' : 'text-red-400'}>
                  {progressToThreshold.toFixed(0)}%
                </span>
              </div>
              <Progress
                value={progressToThreshold}
                className={isActive ? 'bg-green-900/30' : 'bg-red-900/30'}
              />
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{t('llave.nextEvaluation', { days: daysUntilEval })}</span>
            </div>
          </CardContent>
        </Card>

        {/* Ventas esta semana */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('sales.salesThisWeek')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(ventasEstaSemana)}</div>
            <div className={`flex items-center gap-1 text-sm ${Number(weekChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {Number(weekChange) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingUp className="h-4 w-4 rotate-180" />}
              {weekChange}% {t('sales.vsLastWeek')}
            </div>
          </CardContent>
        </Card>

        {/* Ventas semana pasada */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('sales.salesLastWeek')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(ventasSemanaPasada)}</div>
            <p className="text-sm text-muted-foreground">{t('sales.referenceComparative')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Section B: Mi Embudo - Kanban Style */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {t('sales.myFunnel')}
              </CardTitle>
              <CardDescription>{t('sales.funnelDesc')}</CardDescription>
            </div>
            {/* Date Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t('common.from')}:</span>
                <Input
                  type="date"
                  value={kanbanStartDate}
                  onChange={(e) => setKanbanStartDate(e.target.value)}
                  className="w-36 h-8 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('common.to')}:</span>
                <Input
                  type="date"
                  value={kanbanEndDate}
                  onChange={(e) => setKanbanEndDate(e.target.value)}
                  className="w-36 h-8 text-sm"
                />
              </div>
              {hasKanbanFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearKanbanFilters}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t('common.clear')}
                </Button>
              )}
            </div>
          </div>
          {hasKanbanFilters && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                <Filter className="h-3 w-3 mr-1" />
                {t('dashboard.filtered', { count: kanbanFilteredSales.length, total: userSales.length })}
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {/* Kanban Board */}
          <div className="grid grid-cols-5 gap-0 min-h-[400px]">
            {(['PROSPECTO', 'COTIZADO', 'AGENDADO', 'INSTALADO', 'CANCELADO'] as FunnelStatus[]).map((status, colIndex) => {
              const config = funnelConfig[status]
              const Icon = config.icon
              const columnSales = kanbanFilteredSales.filter(s => s.funnelStatus === status)
              const isActiveStage = !['INSTALADO', 'CANCELADO'].includes(status)

              return (
                <div
                  key={status}
                  className={`flex flex-col ${colIndex < 4 ? 'border-r border-border' : ''} ${config.bgColor.replace('/20', '/10')}`}
                >
                  {/* Column Header */}
                  <div className={`sticky top-0 p-3 border-b ${config.bgColor} backdrop-blur-sm z-10`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
                        {columnSales.length}
                      </span>
                    </div>
                    <div className={`text-lg font-bold ${config.color}`}>
                      {formatCurrency(kanbanFunnelStats[status].value)}
                    </div>
                  </div>

                  {/* Column Cards */}
                  <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[320px]">
                    {columnSales.slice(0, isActiveStage ? 8 : 4).map((sale) => (
                      <div
                        key={sale.id}
                        className={`group rounded-lg border bg-card p-3 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-${config.color.replace('text-', '')}`}
                        onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{sale.customerName}</p>
                            <p className="text-xs text-muted-foreground truncate">{sale.productType}</p>
                          </div>
                          <span className={`text-sm font-bold ${config.color} whitespace-nowrap`}>
                            {formatCurrency(sale.amount)}
                          </span>
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(sale.capturedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
                          </div>
                          {sale.notes && (
                            <div className="flex items-center gap-1 text-yellow-500">
                              <FileText className="h-3 w-3" />
                            </div>
                          )}
                        </div>

                        {/* Expanded Details */}
                        {expandedSale === sale.id && (
                          <div className="mt-2 pt-2 border-t border-dashed text-xs space-y-1">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{sale.customerPhone}</span>
                            </div>
                            {sale.notes && (
                              <p className="text-muted-foreground italic">{sale.notes}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Show more indicator */}
                    {columnSales.length > (isActiveStage ? 8 : 4) && (
                      <div className="text-center py-2">
                        <span className="text-xs text-muted-foreground">
                          {t('common.moreCount', { count: columnSales.length - (isActiveStage ? 8 : 4) })}
                        </span>
                      </div>
                    )}

                    {/* Empty state */}
                    {columnSales.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                        <Icon className="h-8 w-8 mb-2 opacity-30" />
                        <span className="text-xs">{t('sales.noSalesInFunnel')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary Bar */}
          <div className="border-t p-3 bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                {t('sales.salesInProcess', { count: kanbanPendingSales.length })}
              </span>
              <span className="text-muted-foreground">
                {t('sales.potentialValue')}: <strong className="text-green-400">{formatCurrency(kanbanPendingSales.reduce((s, sale) => s + sale.amount, 0))}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{t('sales.clickForDetails')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section C: Mi Comunidad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('team.myCommunity')}
          </CardTitle>
          <CardDescription>{t('team.communityPerformance')}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value as typeof teamFilter)}>
                <option value="all">{t('team.allLevels')}</option>
                <option value="hijo">{t('team.hijos')}</option>
                <option value="nieto">{t('team.nietos')}</option>
                <option value="bisnieto">{t('team.bisnietos')}</option>
                <option value="tataranieto">{t('team.tataranietos')}</option>
              </Select>
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
              <option value="all">{t('common.all')}</option>
              <option value="active">{t('team.active')}</option>
              <option value="inactive">{t('team.inactive')}</option>
              <option value="at-risk">{t('team.atRisk')}</option>
            </Select>
            <Select value={teamSort} onChange={(e) => setTeamSort(e.target.value as typeof teamSort)}>
              <option value="sales">{t('team.sortBySales')}</option>
              <option value="name">{t('team.sortByName')}</option>
              <option value="date">{t('team.sortByLastSale')}</option>
            </Select>
          </div>

          {/* Team Table */}
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">{t('team.member')}</th>
                  <th className="text-left p-3 font-medium">{t('team.level')}</th>
                  <th className="text-right p-3 font-medium">{t('team.sales30d')}</th>
                  <th className="text-center p-3 font-medium">{t('team.status')}</th>
                  <th className="text-center p-3 font-medium">{t('team.inProcess')}</th>
                  <th className="text-right p-3 font-medium">{t('team.lastSale')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeam.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      {t('team.noMembers')}
                    </td>
                  </tr>
                ) : (
                  filteredTeam.map((member) => {
                    const memberAtRisk = member.ventas30Dias >= 12000 && member.ventas30Dias < 15000
                    return (
                      <tr key={member.id} className={`border-t ${memberAtRisk ? 'bg-yellow-500/10' : ''}`}>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {memberAtRisk && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                            <span className="font-medium">{member.name}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="capitalize">{t(`team.${member.level}`)}</Badge>
                        </td>
                        <td className={`p-3 text-right font-medium ${member.isActive ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(member.ventas30Dias)}
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={member.isActive ? 'success' : 'destructive'}>
                            {member.isActive ? t('team.active') : t('team.inactive')}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          {member.pendingCount > 0 ? (
                            <Badge variant="outline">{t('team.inProcessCount', { count: member.pendingCount })}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-3 text-right text-sm text-muted-foreground">
                          {member.lastSaleDate
                            ? new Date(member.lastSaleDate).toLocaleDateString('es-MX')
                            : '-'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          {teamMembers.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-green-500/10 p-3">
                <div className="text-2xl font-bold text-green-400">
                  {teamMembers.filter(m => m.isActive).length}
                </div>
                <div className="text-sm text-muted-foreground">{t('team.active')}</div>
              </div>
              <div className="rounded-lg bg-red-500/10 p-3">
                <div className="text-2xl font-bold text-red-400">
                  {teamMembers.filter(m => !m.isActive).length}
                </div>
                <div className="text-sm text-muted-foreground">{t('team.inactive')}</div>
              </div>
              <div className="rounded-lg bg-yellow-500/10 p-3">
                <div className="text-2xl font-bold text-yellow-400">
                  {teamMembers.filter(m => m.ventas30Dias >= 12000 && m.ventas30Dias < 15000).length}
                </div>
                <div className="text-sm text-muted-foreground">{t('team.atRiskLabel')}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section D: Tendencias */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('dashboard.weeklySales')}
            </CardTitle>
            <CardDescription>{t('dashboard.weeklySalesDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockWeeklyData.map((week) => (
                <div key={week.week} className="flex items-center gap-3">
                  <span className="w-16 text-sm text-muted-foreground">{week.week}</span>
                  <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                      style={{ width: `${(week.sales / maxWeeklySales) * 100}%` }}
                    />
                  </div>
                  <span className="w-20 text-right text-sm font-medium">{formatCurrency(week.sales)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('dashboard.topSellers')}
            </CardTitle>
            <CardDescription>{t('dashboard.topSellersDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('team.noMembers')}
              </div>
            ) : (
              <div className="space-y-3">
                {[...teamMembers]
                  .sort((a, b) => b.ventas30Dias - a.ventas30Dias)
                  .slice(0, 5)
                  .map((member, index) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-gray-400/20 text-gray-400' :
                        index === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{t(`team.${member.level}`)}</p>
                      </div>
                      <span className="font-bold text-green-400">{formatCurrency(member.ventas30Dias)}</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales by Product */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {t('dashboard.salesByProduct')}
            </CardTitle>
            <CardDescription>{t('dashboard.salesByProductDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {mockProductSalesData.map((product) => (
                <div key={product.product} className="text-center">
                  <div className="relative w-full aspect-square mb-2">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-muted/30"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${product.percentage} ${100 - product.percentage}`}
                        className="text-cyan-400"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold">{product.percentage}%</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{product.product}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(product.sales)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
