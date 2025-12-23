import { useState, useMemo } from 'react'
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
import { Key, TrendingUp, Users, Calendar, CheckCircle2, XCircle, Link2, Link2Off, ChevronDown, ChevronRight } from 'lucide-react'

// =============================================================================
// CONSTANTS
// =============================================================================
const LLAVE_THRESHOLD = 15000 // $15,000 threshold

// =============================================================================
// MOCK DATA - Would come from API in production
// =============================================================================

// Current user's Llave status
const mockLlaveStatus = {
  hasLlave: true,
  rolling30DaySales: 18500,
  threshold: LLAVE_THRESHOLD,
  lastEvaluationDate: new Date('2024-12-18'), // Last Wednesday
  nextEvaluationDate: new Date('2024-12-25'), // Next Wednesday
}

// Last 8 weeks of Llave history
const mockLlaveHistory = [
  { weekDate: '2024-12-18', hasLlave: true, sales: 18500 },
  { weekDate: '2024-12-11', hasLlave: true, sales: 16200 },
  { weekDate: '2024-12-04', hasLlave: true, sales: 17800 },
  { weekDate: '2024-11-27', hasLlave: false, sales: 12500 },
  { weekDate: '2024-11-20', hasLlave: true, sales: 15200 },
  { weekDate: '2024-11-13', hasLlave: true, sales: 16800 },
  { weekDate: '2024-11-06', hasLlave: false, sales: 14200 },
  { weekDate: '2024-10-30', hasLlave: true, sales: 19500 },
]

// This week's commissions breakdown
const mockWeeklyCommissions = {
  weekDate: '2024-12-18',
  total: 1856.40,
  byLevel: {
    hijos: { total: 720.00, salesCount: 9, rate: 0.08 },
    nietos: { total: 576.00, salesCount: 4, rate: 0.12 },
    bisnietos: { total: 560.40, salesCount: 2, rate: 0.20 },
  },
  entries: [
    { id: '1', sourceAgent: 'Carlos Rodríguez', relationship: 'HIJO' as const, customer: 'Juan Pérez', saleAmount: 1200, commissionRate: 0.08, commissionAmount: 96, chainValid: true },
    { id: '2', sourceAgent: 'Ana Martínez', relationship: 'HIJO' as const, customer: 'Rosa Díaz', saleAmount: 950, commissionRate: 0.08, commissionAmount: 76, chainValid: true },
    { id: '3', sourceAgent: 'Pedro López', relationship: 'NIETO' as const, customer: 'Luis Moreno', saleAmount: 1400, commissionRate: 0.12, commissionAmount: 168, chainValid: true },
    { id: '4', sourceAgent: 'Sofía Hernández', relationship: 'NIETO' as const, customer: 'Carmen Vega', saleAmount: 1100, commissionRate: 0.12, commissionAmount: 132, chainValid: true },
    { id: '5', sourceAgent: 'Diego Ramírez', relationship: 'BISNIETO' as const, customer: 'Fernando Silva', saleAmount: 1800, commissionRate: 0.20, commissionAmount: 360, chainValid: true },
    { id: '6', sourceAgent: 'Roberto Gómez', relationship: 'HIJO' as const, customer: 'Patricia Ruiz', saleAmount: 800, commissionRate: 0.08, commissionAmount: 0, chainValid: false }, // Broken chain - Roberto doesn't have Llave
    { id: '7', sourceAgent: 'Gabriela Morales', relationship: 'NIETO' as const, customer: 'Alberto Torres', saleAmount: 1500, commissionRate: 0.12, commissionAmount: 0, chainValid: false }, // Under Roberto
  ],
}

// 12 weeks of commission history
const mockCommissionHistory = [
  { weekDate: '2024-12-18', total: 1856.40, hijos: 720, nietos: 576, bisnietos: 560.40 },
  { weekDate: '2024-12-11', total: 1420.00, hijos: 640, nietos: 480, bisnietos: 300 },
  { weekDate: '2024-12-04', total: 1680.50, hijos: 720, nietos: 540, bisnietos: 420.50 },
  { weekDate: '2024-11-27', total: 0, hijos: 0, nietos: 0, bisnietos: 0 }, // No Llave
  { weekDate: '2024-11-20', total: 1240.00, hijos: 560, nietos: 400, bisnietos: 280 },
  { weekDate: '2024-11-13', total: 1520.80, hijos: 680, nietos: 480, bisnietos: 360.80 },
  { weekDate: '2024-11-06', total: 0, hijos: 0, nietos: 0, bisnietos: 0 }, // No Llave
  { weekDate: '2024-10-30', total: 1780.00, hijos: 760, nietos: 580, bisnietos: 440 },
  { weekDate: '2024-10-23', total: 1340.00, hijos: 600, nietos: 440, bisnietos: 300 },
  { weekDate: '2024-10-16', total: 1560.00, hijos: 680, nietos: 520, bisnietos: 360 },
  { weekDate: '2024-10-09', total: 1420.00, hijos: 640, nietos: 480, bisnietos: 300 },
  { weekDate: '2024-10-02', total: 1680.00, hijos: 720, nietos: 560, bisnietos: 400 },
]

// Chain status for tree visualization
interface ChainMember {
  id: string
  name: string
  hasLlave: boolean
  relationship: 'HIJO' | 'NIETO' | 'BISNIETO'
  sales30d: number
  potentialCommission: number
  children?: ChainMember[]
}

const mockChainStatus: ChainMember[] = [
  {
    id: 'carlos',
    name: 'Carlos Rodríguez',
    hasLlave: true,
    relationship: 'HIJO',
    sales30d: 22000,
    potentialCommission: 0,
    children: [
      {
        id: 'pedro',
        name: 'Pedro López',
        hasLlave: true,
        relationship: 'NIETO',
        sales30d: 19000,
        potentialCommission: 0,
        children: [
          { id: 'diego', name: 'Diego Ramírez', hasLlave: true, relationship: 'BISNIETO', sales30d: 18200, potentialCommission: 0 },
          { id: 'carmen', name: 'Carmen Rivera', hasLlave: false, relationship: 'BISNIETO', sales30d: 6500, potentialCommission: 130 }, // Potential if she had Llave
        ],
      },
      {
        id: 'laura',
        name: 'Laura Sánchez',
        hasLlave: false,
        relationship: 'NIETO',
        sales30d: 7500,
        potentialCommission: 90, // Potential commission from her sales
        children: [
          { id: 'jorge', name: 'Jorge Ortiz', hasLlave: true, relationship: 'BISNIETO', sales30d: 16000, potentialCommission: 320 }, // Blocked by Laura
        ],
      },
    ],
  },
  {
    id: 'ana',
    name: 'Ana Martínez',
    hasLlave: true,
    relationship: 'HIJO',
    sales30d: 18500,
    potentialCommission: 0,
    children: [
      {
        id: 'sofia',
        name: 'Sofía Hernández',
        hasLlave: true,
        relationship: 'NIETO',
        sales30d: 21000,
        potentialCommission: 0,
        children: [
          { id: 'monica', name: 'Mónica Castillo', hasLlave: true, relationship: 'BISNIETO', sales30d: 17800, potentialCommission: 0 },
        ],
      },
    ],
  },
  {
    id: 'roberto',
    name: 'Roberto Gómez',
    hasLlave: false,
    relationship: 'HIJO',
    sales30d: 8500,
    potentialCommission: 68, // 8% of his sales blocked
    children: [
      {
        id: 'gabriela',
        name: 'Gabriela Morales',
        hasLlave: true,
        relationship: 'NIETO',
        sales30d: 17500,
        potentialCommission: 210, // Blocked by Roberto
        children: [
          { id: 'raul', name: 'Raúl Herrera', hasLlave: true, relationship: 'BISNIETO', sales30d: 15200, potentialCommission: 304 }, // Blocked by Roberto
        ],
      },
    ],
  },
  {
    id: 'elena',
    name: 'Elena Vázquez',
    hasLlave: true,
    relationship: 'HIJO',
    sales30d: 16200,
    potentialCommission: 0,
    children: [
      {
        id: 'daniela',
        name: 'Daniela Cruz',
        hasLlave: true,
        relationship: 'NIETO',
        sales30d: 15500,
        potentialCommission: 0,
        children: [
          { id: 'veronica', name: 'Verónica Medina', hasLlave: true, relationship: 'BISNIETO', sales30d: 19500, potentialCommission: 0 },
        ],
      },
    ],
  },
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getDaysUntilWednesday(): number {
  const now = new Date()
  const currentDay = now.getDay()
  // Wednesday is day 3
  let daysUntil = (3 - currentDay + 7) % 7
  if (daysUntil === 0) daysUntil = 7 // If today is Wednesday, next is in 7 days
  return daysUntil
}

function formatWeekDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
}

function getRelationshipConfig(rel: 'HIJO' | 'NIETO' | 'BISNIETO') {
  const configs = {
    HIJO: { label: 'Hijo', color: 'bg-green-500', textColor: 'text-green-600', rate: '8%' },
    NIETO: { label: 'Nieto', color: 'bg-purple-500', textColor: 'text-purple-600', rate: '12%' },
    BISNIETO: { label: 'Bisnieto', color: 'bg-orange-500', textColor: 'text-orange-600', rate: '20%' },
  }
  return configs[rel]
}

// =============================================================================
// COMPONENTS
// =============================================================================

// Chain Member Row (for Cadenas Activas section)
function ChainMemberRow({ member, depth = 0 }: { member: ChainMember; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = member.children && member.children.length > 0
  const config = getRelationshipConfig(member.relationship)

  return (
    <div className="space-y-1">
      <div
        className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
          member.hasLlave ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'
        }`}
        style={{ marginLeft: depth * 24 }}
      >
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2">
            {member.hasLlave ? (
              <Link2 className="h-4 w-4 text-green-600" />
            ) : (
              <Link2Off className="h-4 w-4 text-red-500" />
            )}
            <span className="font-medium">{member.name}</span>
            <Badge variant="outline" className={`text-xs ${config.textColor}`}>
              {config.label} ({config.rate})
            </Badge>
            {member.hasLlave ? (
              <Badge variant="success" className="text-xs">Llave</Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">Sin Llave</Badge>
            )}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Ventas 30d: ${member.sales30d.toLocaleString()}
            {!member.hasLlave && member.sales30d < LLAVE_THRESHOLD && (
              <span className="ml-2 text-amber-600">
                (Faltan ${(LLAVE_THRESHOLD - member.sales30d).toLocaleString()} para Llave)
              </span>
            )}
          </div>
        </div>

        {member.potentialCommission > 0 && (
          <div className="text-right">
            <div className="text-sm font-medium text-amber-600">
              +${member.potentialCommission.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">potencial</div>
          </div>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="border-l-2 border-dashed border-muted ml-6">
          {member.children!.map((child) => (
            <ChainMemberRow key={child.id} member={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function Income() {
  const [historyFilter, setHistoryFilter] = useState<'all' | 'HIJO' | 'NIETO' | 'BISNIETO'>('all')

  // Calculate totals
  const totalPotentialLost = useMemo(() => {
    function sumPotential(members: ChainMember[]): number {
      return members.reduce((sum, m) => {
        return sum + m.potentialCommission + (m.children ? sumPotential(m.children) : 0)
      }, 0)
    }
    return sumPotential(mockChainStatus)
  }, [])

  const progressPercentage = Math.min(100, (mockLlaveStatus.rolling30DaySales / mockLlaveStatus.threshold) * 100)
  const daysUntilEval = getDaysUntilWednesday()

  // Filter weekly entries for display
  const filteredEntries = historyFilter === 'all'
    ? mockWeeklyCommissions.entries
    : mockWeeklyCommissions.entries.filter(e => e.relationship === historyFilter)

  // Calculate max for chart scaling
  const maxWeeklyTotal = Math.max(...mockCommissionHistory.map(w => w.total))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis Ingresos</h1>
        <p className="text-muted-foreground">
          Comisiones de tu comunidad basadas en la Llave del Reino
        </p>
      </div>

      {/* ========================================================================= */}
      {/* SECTION A: MI LLAVE DEL REINO */}
      {/* ========================================================================= */}
      <Card className={mockLlaveStatus.hasLlave ? 'border-green-500/50' : 'border-red-500/50'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className={`h-5 w-5 ${mockLlaveStatus.hasLlave ? 'text-green-500' : 'text-red-500'}`} />
            Mi Llave del Reino
          </CardTitle>
          <CardDescription>
            Umbral: ${LLAVE_THRESHOLD.toLocaleString()} en ventas instaladas (últimos 30 días)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status and Progress */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Current Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  mockLlaveStatus.hasLlave ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                }`}>
                  {mockLlaveStatus.hasLlave ? (
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-500" />
                  )}
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {mockLlaveStatus.hasLlave ? 'ACTIVA' : 'INACTIVA'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {mockLlaveStatus.hasLlave
                      ? 'Estás recibiendo comisiones de tu comunidad'
                      : 'No recibes comisiones de tu comunidad esta semana'}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ventas 30 días: ${mockLlaveStatus.rolling30DaySales.toLocaleString()}</span>
                  <span className="text-muted-foreground">Meta: ${LLAVE_THRESHOLD.toLocaleString()}</span>
                </div>
                <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      mockLlaveStatus.hasLlave ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {mockLlaveStatus.hasLlave ? (
                    <span className="text-green-600">
                      ${(mockLlaveStatus.rolling30DaySales - LLAVE_THRESHOLD).toLocaleString()} por encima del umbral
                    </span>
                  ) : (
                    <span className="text-amber-600">
                      Te faltan ${(LLAVE_THRESHOLD - mockLlaveStatus.rolling30DaySales).toLocaleString()} para activar
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Next Evaluation & History */}
            <div className="space-y-4">
              {/* Next evaluation countdown */}
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Próxima Evaluación</div>
                  <div className="text-sm text-muted-foreground">
                    En {daysUntilEval} día{daysUntilEval !== 1 ? 's' : ''} (Miércoles 00:00 CST)
                  </div>
                </div>
              </div>

              {/* 8-week history */}
              <div>
                <div className="mb-2 text-sm font-medium">Historial de Llave (8 semanas)</div>
                <div className="flex gap-1">
                  {mockLlaveHistory.map((week, i) => (
                    <div
                      key={week.weekDate}
                      className={`relative flex-1 h-8 rounded ${
                        week.hasLlave ? 'bg-green-500' : 'bg-red-400'
                      }`}
                      title={`${formatWeekDate(week.weekDate)}: $${week.sales.toLocaleString()}`}
                    >
                      {i === 0 && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                          Hoy
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>Esta semana</span>
                  <span>8 semanas atrás</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* SECTION B: COMISIONES DE LA SEMANA */}
      {/* ========================================================================= */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Comisiones de la Semana
          </CardTitle>
          <CardDescription>
            Semana del {formatWeekDate(mockWeeklyCommissions.weekDate)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-4 text-white">
              <div className="text-sm opacity-90">Total Esta Semana</div>
              <div className="text-3xl font-bold">${mockWeeklyCommissions.total.toFixed(2)}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                De Hijos (8%)
              </div>
              <div className="text-2xl font-bold">${mockWeeklyCommissions.byLevel.hijos.total.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">{mockWeeklyCommissions.byLevel.hijos.salesCount} ventas</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                De Nietos (12%)
              </div>
              <div className="text-2xl font-bold">${mockWeeklyCommissions.byLevel.nietos.total.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">{mockWeeklyCommissions.byLevel.nietos.salesCount} ventas</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                De Bisnietos (20%)
              </div>
              <div className="text-2xl font-bold">${mockWeeklyCommissions.byLevel.bisnietos.total.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">{mockWeeklyCommissions.byLevel.bisnietos.salesCount} ventas</div>
            </div>
          </div>

          {/* Commission entries table */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm font-medium">Filtrar:</span>
              {(['all', 'HIJO', 'NIETO', 'BISNIETO'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setHistoryFilter(filter)}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    historyFilter === filter
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {filter === 'all' ? 'Todos' : getRelationshipConfig(filter).label + 's'}
                </button>
              ))}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Relación</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Venta</TableHead>
                  <TableHead className="text-right">Comisión</TableHead>
                  <TableHead className="text-center">Cadena</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => {
                  const config = getRelationshipConfig(entry.relationship)
                  return (
                    <TableRow key={entry.id} className={!entry.chainValid ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{entry.sourceAgent}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${config.color}`} />
                          <span>{config.label}</span>
                          <span className="text-xs text-muted-foreground">({config.rate})</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{entry.customer}</TableCell>
                      <TableCell className="text-right">${entry.saleAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">
                        {entry.chainValid ? (
                          <span className="text-green-600">${entry.commissionAmount.toFixed(2)}</span>
                        ) : (
                          <span className="text-red-500 line-through">${(entry.saleAmount * entry.commissionRate).toFixed(2)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.chainValid ? (
                          <Link2 className="mx-auto h-4 w-4 text-green-500" />
                        ) : (
                          <Link2Off className="mx-auto h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* SECTION C: HISTORIAL DE COMISIONES */}
      {/* ========================================================================= */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Comisiones</CardTitle>
          <CardDescription>Últimas 12 semanas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bar Chart */}
          <div className="space-y-2">
            <div className="flex items-end gap-1 h-40">
              {mockCommissionHistory.map((week, i) => {
                const height = maxWeeklyTotal > 0 ? (week.total / maxWeeklyTotal) * 100 : 0
                const noLlave = week.total === 0

                return (
                  <div
                    key={week.weekDate}
                    className="relative flex-1 group"
                    title={`${formatWeekDate(week.weekDate)}: $${week.total.toFixed(2)}`}
                  >
                    <div
                      className={`w-full rounded-t transition-all ${
                        noLlave ? 'bg-red-300' : 'bg-gradient-to-t from-green-600 to-green-400'
                      }`}
                      style={{ height: `${noLlave ? 10 : Math.max(height, 5)}%` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="rounded bg-popover px-2 py-1 text-xs shadow-lg whitespace-nowrap">
                        <div className="font-medium">{formatWeekDate(week.weekDate)}</div>
                        {noLlave ? (
                          <div className="text-red-500">Sin Llave</div>
                        ) : (
                          <>
                            <div>Total: ${week.total.toFixed(2)}</div>
                            <div className="text-muted-foreground">
                              H: ${week.hijos} | N: ${week.nietos} | B: ${week.bisnietos}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    {i === 0 && (
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                        Hoy
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pt-4">
              <span>Esta semana</span>
              <span>12 semanas atrás</span>
            </div>
          </div>

          {/* Weekly totals table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semana</TableHead>
                <TableHead className="text-right">De Hijos</TableHead>
                <TableHead className="text-right">De Nietos</TableHead>
                <TableHead className="text-right">De Bisnietos</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCommissionHistory.slice(0, 8).map((week) => (
                <TableRow key={week.weekDate} className={week.total === 0 ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                  <TableCell className="font-medium">{formatWeekDate(week.weekDate)}</TableCell>
                  <TableCell className="text-right">${week.hijos.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${week.nietos.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${week.bisnietos.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-bold">
                    {week.total === 0 ? (
                      <span className="text-red-500">Sin Llave</span>
                    ) : (
                      <span className="text-green-600">${week.total.toFixed(2)}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* SECTION D: CADENAS ACTIVAS */}
      {/* ========================================================================= */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Cadenas Activas
          </CardTitle>
          <CardDescription>
            Visualiza el estado de las cadenas en tu comunidad. Las comisiones solo fluyen a través de cadenas completas donde todos tienen la Llave.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Potential earnings alert */}
          {totalPotentialLost > 0 && (
            <div className="rounded-lg border border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 p-4">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Link2Off className="h-5 w-5" />
                <span className="font-medium">Comisiones perdidas por cadenas rotas</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-amber-600">
                ${totalPotentialLost.toFixed(2)} / semana
              </div>
              <p className="mt-1 text-sm text-amber-600/80">
                Podrías ganar esto adicional si todos los miembros marcados en rojo obtienen su Llave del Reino.
              </p>
            </div>
          )}

          {/* Chain legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-green-500" />
              <span>Cadena activa (tiene Llave)</span>
            </div>
            <div className="flex items-center gap-2">
              <Link2Off className="h-4 w-4 text-red-500" />
              <span>Cadena rota (sin Llave)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>Hijo (8%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500" />
              <span>Nieto (12%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500" />
              <span>Bisnieto (20%)</span>
            </div>
          </div>

          {/* Chain tree */}
          <div className="space-y-2 rounded-lg border p-4">
            {mockChainStatus.map((member) => (
              <ChainMemberRow key={member.id} member={member} />
            ))}
          </div>

          {/* Chain rules reminder */}
          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <div className="font-medium mb-2">Reglas de Cadena</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <strong>Hijo:</strong> Recibes 8% si TÚ tienes Llave</li>
              <li>• <strong>Nieto:</strong> Recibes 12% si TÚ y el HIJO intermedio tienen Llave</li>
              <li>• <strong>Bisnieto:</strong> Recibes 20% si TÚ, el HIJO y el NIETO intermedios tienen Llave</li>
              <li>• <strong>Tataranieto+:</strong> Nunca recibes comisiones (máximo 3 niveles)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
