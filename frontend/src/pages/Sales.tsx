import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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
import { Select } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Megaphone, Info, Calendar, Users, Clock, CheckCircle, XCircle, FileText } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getUserById,
  getUserCampaignsAsOwner,
  getUserCampaignsAsParticipant,
  getCurrentWeekSnapshot,
  getUserSales,
  hasLlave,
} from '@/data/mockData'

// Mock products (internet packages)
const internetPackages = [
  {
    id: '1',
    sku: 'PLAN-BASIC',
    name: 'Plan Básico',
    description: 'Internet 50Mbps + 500 min llamadas',
    price: 29.99,
  },
  {
    id: '2',
    sku: 'PLAN-PLUS',
    name: 'Plan Plus',
    description: 'Internet 100Mbps + llamadas ilimitadas',
    price: 49.99,
  },
  {
    id: '3',
    sku: 'PLAN-PREMIUM',
    name: 'Plan Premium',
    description: 'Internet 300Mbps + llamadas + TV',
    price: 89.99,
  },
]


export function Sales() {
  const { t } = useTranslation()
  const { effectiveUser } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewSaleForm, setShowNewSaleForm] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [quantity, setQuantity] = useState(1)

  // Date filter - default to last 30 days
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  // Get user data
  const currentUser = useMemo(() => {
    if (!effectiveUser) return null
    return getUserById(effectiveUser.id)
  }, [effectiveUser])

  // Check if user has Llave (required for campaigns)
  const userHasLlave = useMemo(() => {
    if (!currentUser) return false
    return hasLlave(currentUser.sales30d)
  }, [currentUser])

  // Get user's campaigns (owned + participating)
  const ownedCampaigns = useMemo(() => {
    if (!effectiveUser) return []
    return getUserCampaignsAsOwner(effectiveUser.id).filter(c => c.status === 'ACTIVE')
  }, [effectiveUser])

  const participatedCampaigns = useMemo(() => {
    if (!effectiveUser) return []
    return getUserCampaignsAsParticipant(effectiveUser.id).filter(c => c.status === 'ACTIVE')
  }, [effectiveUser])

  const hasCampaigns = ownedCampaigns.length > 0 || participatedCampaigns.length > 0

  // Get user's sales from mockData
  const userSales = useMemo(() => {
    if (!effectiveUser) return []
    return getUserSales(effectiveUser.id)
  }, [effectiveUser])

  // Status config for funnel statuses
  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
    PROSPECTO: { label: t('sales.status.prospecto'), variant: 'secondary' },
    COTIZADO: { label: t('sales.status.cotizado'), variant: 'outline' },
    AGENDADO: { label: t('sales.status.agendado'), variant: 'warning' },
    INSTALADO: { label: t('sales.status.instalado'), variant: 'success' },
    CANCELADO: { label: t('sales.status.cancelado'), variant: 'destructive' },
  }

  const selectedProduct = internetPackages.find(p => p.id === selectedProductId)
  const totalPrice = selectedProduct ? (selectedProduct.price * quantity).toFixed(2) : '0.00'

  // Filter sales by date range
  const dateFilteredSales = useMemo(() => {
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    return userSales.filter((sale) => {
      const saleDate = new Date(sale.capturedAt)
      return saleDate >= start && saleDate <= end
    })
  }, [userSales, startDate, endDate])

  // Calculate stats for the filtered period
  const salesStats = useMemo(() => {
    const stats = {
      PROSPECTO: { count: 0, amount: 0 },
      COTIZADO: { count: 0, amount: 0 },
      AGENDADO: { count: 0, amount: 0 },
      INSTALADO: { count: 0, amount: 0 },
      CANCELADO: { count: 0, amount: 0 },
      total: { count: 0, amount: 0 },
    }

    dateFilteredSales.forEach((sale) => {
      if (stats[sale.funnelStatus as keyof typeof stats]) {
        stats[sale.funnelStatus as keyof typeof stats].count++
        stats[sale.funnelStatus as keyof typeof stats].amount += sale.amount
      }
      stats.total.count++
      if (sale.funnelStatus !== 'CANCELADO') {
        stats.total.amount += sale.amount
      }
    })

    return stats
  }, [dateFilteredSales])

  // Apply search filter on top of date filter
  const filteredSales = dateFilteredSales.filter(
    (sale) =>
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.productType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('sales.title')}</h1>
          <p className="text-muted-foreground">
            {t('sales.subtitle')}
          </p>
        </div>
        <Button onClick={() => setShowNewSaleForm(!showNewSaleForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('sales.newSale')}
        </Button>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t('sales.filterByDate')}</span>
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">{t('common.from')}</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-auto"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">{t('common.to')}</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-auto"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Dashboard */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {/* Total */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">{t('common.total')}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{salesStats.total.count}</p>
            <p className="text-xs text-muted-foreground">${salesStats.total.amount.toLocaleString()}</p>
          </CardContent>
        </Card>

        {/* Prospecto */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-medium text-muted-foreground">{t('sales.status.prospecto')}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{salesStats.PROSPECTO.count}</p>
            <p className="text-xs text-muted-foreground">${salesStats.PROSPECTO.amount.toLocaleString()}</p>
          </CardContent>
        </Card>

        {/* Cotizado */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-muted-foreground">{t('sales.status.cotizado')}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{salesStats.COTIZADO.count}</p>
            <p className="text-xs text-muted-foreground">${salesStats.COTIZADO.amount.toLocaleString()}</p>
          </CardContent>
        </Card>

        {/* Agendado */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-muted-foreground">{t('sales.status.agendado')}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{salesStats.AGENDADO.count}</p>
            <p className="text-xs text-muted-foreground">${salesStats.AGENDADO.amount.toLocaleString()}</p>
          </CardContent>
        </Card>

        {/* Instalado */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium text-muted-foreground">{t('sales.status.instalado')}</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">{salesStats.INSTALADO.count}</p>
            <p className="text-xs text-green-600">${salesStats.INSTALADO.amount.toLocaleString()}</p>
          </CardContent>
        </Card>

        {/* Cancelado */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium text-muted-foreground">{t('sales.status.cancelado')}</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-red-600">{salesStats.CANCELADO.count}</p>
            <p className="text-xs text-red-600">${salesStats.CANCELADO.amount.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* New Sale Form (Shell) */}
      {showNewSaleForm && (
        <Card>
          <CardHeader>
            <CardTitle>{t('sales.registerNewSale')}</CardTitle>
            <CardDescription>
              {t('sales.registerNewSaleDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('sales.clientName')}
                </label>
                <Input placeholder={t('sales.clientNamePlaceholder')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('common.phone')}</label>
                <Input placeholder={t('sales.phonePlaceholder')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('sales.emailOptional')}</label>
                <Input type="email" placeholder={t('sales.emailPlaceholder')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('sales.product')}</label>
                <Select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">{t('sales.selectPackage')}</option>
                  {internetPackages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} - ${pkg.price} ({pkg.description})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('common.quantity')}</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('common.priceTotal')}</label>
                <Input type="text" value={`$${totalPrice}`} disabled />
              </div>

              {/* Campaign Selection */}
              <div className="col-span-full space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Megaphone className="h-4 w-4" />
                  {t('campaigns.title')}
                  {userHasLlave && hasCampaigns && (
                    <Badge variant="outline" className="text-xs">{t('common.required')}</Badge>
                  )}
                </label>
                {!userHasLlave ? (
                  <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
                    <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-amber-700">
                      <p className="font-medium">{t('sales.campaignsNotAvailable')}</p>
                      <p className="text-xs">{t('sales.campaignsNotAvailableDesc')}</p>
                    </div>
                  </div>
                ) : !hasCampaigns ? (
                  <div className="flex items-start gap-2 rounded-md border border-muted bg-muted/50 p-3 text-sm">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-muted-foreground">
                      <p className="font-medium">{t('sales.noCampaignsActive')}</p>
                      <p className="text-xs">{t('sales.noCampaignsActiveDesc')}</p>
                    </div>
                  </div>
                ) : (
                  <Select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                  >
                    <option value="">{t('sales.selectCampaign')}</option>
                    {ownedCampaigns.length > 0 && (
                      <optgroup label={t('sales.myCampaignsGroup')}>
                        {ownedCampaigns.map((campaign) => {
                          const snapshot = getCurrentWeekSnapshot(campaign.id)
                          return (
                            <option key={campaign.id} value={campaign.id}>
                              {t('campaigns.campaignNumber', { position: campaign.chainPosition })} - ${snapshot?.totalBudget.toLocaleString() || 0} {t('sales.available')}
                            </option>
                          )
                        })}
                      </optgroup>
                    )}
                    {participatedCampaigns.length > 0 && (
                      <optgroup label={t('sales.participatingCampaignsGroup')}>
                        {participatedCampaigns.map((campaign) => {
                          const snapshot = getCurrentWeekSnapshot(campaign.id)
                          return (
                            <option key={campaign.id} value={campaign.id}>
                              {t('campaigns.campaignNumber', { position: campaign.chainPosition })} ({campaign.ownerName}) - ${snapshot?.totalBudget.toLocaleString() || 0}
                            </option>
                          )
                        })}
                      </optgroup>
                    )}
                  </Select>
                )}
              </div>
              <div className="col-span-full flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewSaleForm(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit">{t('sales.registerSale')}</Button>
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
              <CardTitle>{t('sales.salesHistory')}</CardTitle>
              <CardDescription>
                {t('sales.salesFound', { count: filteredSales.length })}
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('sales.searchSales')}
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
                <TableHead>{t('common.client')}</TableHead>
                <TableHead>{t('sales.product')}</TableHead>
                <TableHead className="text-right">{t('common.amount')}</TableHead>
                <TableHead className="text-center">{t('common.status')}</TableHead>
                <TableHead className="text-right">{t('common.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {t('sales.noSales')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sale.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {sale.customerPhone || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{sale.productType}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${sale.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={statusConfig[sale.funnelStatus]?.variant || 'default'}>
                        {statusConfig[sale.funnelStatus]?.label || sale.funnelStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(sale.capturedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
