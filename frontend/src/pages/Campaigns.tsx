import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Megaphone,
  ArrowRight,
  Calendar,
  DollarSign,
  Target,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Users,
  Sparkles,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getUserById,
  getUserCampaignsAsParticipant,
  getCampaignChain,
  getCurrentWeekSnapshot,
  getCampaignSnapshots,
  getCampaignParticipants,
  getUserTotalBudgetThisWeek,
  hasLlave,
  CAMPAIGN_BUDGET_CAP,
} from '@/data/mockData'
import type { Campaign, CampaignWeeklySnapshot, CampaignStatus } from '@/types'

// Status badge component
function StatusBadge({ status }: { status: CampaignStatus }) {
  const { t } = useTranslation()
  const variants: Record<CampaignStatus, { variant: 'success' | 'secondary' | 'outline', label: string }> = {
    ACTIVE: { variant: 'success', label: t('campaigns.status.active') },
    PAUSED: { variant: 'secondary', label: t('campaigns.status.paused') },
    CLOSED: { variant: 'outline', label: t('campaigns.status.closed') },
  }
  const config = variants[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

// Period badge
function PeriodBadge({ isInitial }: { isInitial: boolean }) {
  const { t } = useTranslation()
  if (isInitial) {
    return (
      <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-700">
        <Sparkles className="h-3 w-3" />
        {t('campaigns.period.initial')}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1 border-blue-300 bg-blue-50 text-blue-700">
      <TrendingUp className="h-3 w-3" />
      {t('campaigns.period.floating')}
    </Badge>
  )
}

// Campaign chain visualization
function CampaignChainViz({ chain }: { chain: Campaign[] }) {
  const { t } = useTranslation()
  if (chain.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chain.map((campaign, idx) => {
        const snapshot = getCurrentWeekSnapshot(campaign.id)
        const isLast = idx === chain.length - 1

        return (
          <div key={campaign.id} className="flex items-center gap-2">
            <Link
              to={`/campaigns/${campaign.id}`}
              className="group flex flex-col items-center rounded-lg border bg-card p-3 shadow-sm transition-all hover:border-primary hover:shadow-md min-w-[140px]"
            >
              <span className="text-xs text-muted-foreground">
                {t('campaigns.campaignNumber', { position: campaign.chainPosition })}
              </span>
              <span className="font-semibold text-lg">
                ${snapshot?.totalBudget.toLocaleString() || 0}
              </span>
              <StatusBadge status={campaign.status} />
            </Link>
            {!isLast && snapshot && snapshot.overflowOut > 0 && (
              <div className="flex flex-col items-center px-1 text-muted-foreground">
                <span className="text-xs">${snapshot.overflowOut}</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            )}
            {!isLast && snapshot && snapshot.overflowOut === 0 && (
              <ArrowRight className="h-5 w-5 text-muted-foreground/30" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Campaign detail card (expandable)
interface CampaignCardProps {
  campaign: Campaign
  snapshot: CampaignWeeklySnapshot | undefined
  defaultExpanded?: boolean
}

function CampaignCard({ campaign, snapshot, defaultExpanded = false }: CampaignCardProps) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const participants = getCampaignParticipants(campaign.id)
  const snapshots = getCampaignSnapshots(campaign.id)

  return (
    <Card className={campaign.status === 'ACTIVE' ? 'border-primary/50' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{t('campaigns.campaignNumber', { position: campaign.chainPosition })}</CardTitle>
              <StatusBadge status={campaign.status} />
            </div>
            <CardDescription className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {t('campaigns.createdOn')} {new Date(campaign.createdAt).toLocaleDateString('es-MX')}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {participants.length}/4 {t('campaigns.participants')}
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {snapshot && <PeriodBadge isInitial={snapshot.isInitialPeriod} />}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Current Week Summary */}
      {snapshot && (
        <CardContent className="pb-3">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6 rounded-lg bg-muted/50 p-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{t('campaigns.table.sales')}</p>
              <p className="text-lg font-semibold">${snapshot.totalSales.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{t('campaigns.table.base')}</p>
              <p className="text-lg font-semibold">${snapshot.baseBudget.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{t('campaigns.table.cap')} ({CAMPAIGN_BUDGET_CAP})</p>
              <p className="text-lg font-semibold">${snapshot.cappedBudget.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{t('campaigns.table.overflowIn')}</p>
              <p className="text-lg font-semibold text-green-600">+${snapshot.overflowIn.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{t('campaigns.table.overflowOut')}</p>
              <p className="text-lg font-semibold text-amber-600">-${snapshot.overflowOut.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{t('campaigns.table.total')}</p>
              <p className="text-lg font-bold text-primary">${snapshot.totalBudget.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      )}

      {/* Expanded Details */}
      {expanded && (
        <CardContent className="border-t pt-4 space-y-4">
          {/* Recent History */}
          <div>
            <h4 className="text-sm font-medium mb-2">{t('campaigns.recentHistory')}</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">{t('campaigns.table.week')}</th>
                    <th className="pb-2 font-medium text-right">{t('campaigns.table.sales')}</th>
                    <th className="pb-2 font-medium text-right">{t('campaigns.table.base')}</th>
                    <th className="pb-2 font-medium text-right">{t('campaigns.table.in')}</th>
                    <th className="pb-2 font-medium text-right">{t('campaigns.table.out')}</th>
                    <th className="pb-2 font-medium text-right">{t('campaigns.table.total')}</th>
                    <th className="pb-2 font-medium">{t('campaigns.table.period')}</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshots.slice(0, 4).map((snap) => (
                    <tr key={snap.id} className="border-b last:border-0">
                      <td className="py-2">
                        {new Date(snap.weekDate).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-2 text-right">${snap.totalSales.toLocaleString()}</td>
                      <td className="py-2 text-right">${snap.baseBudget.toLocaleString()}</td>
                      <td className="py-2 text-right text-green-600">+${snap.overflowIn}</td>
                      <td className="py-2 text-right text-amber-600">-${snap.overflowOut}</td>
                      <td className="py-2 text-right font-medium">${snap.totalBudget.toLocaleString()}</td>
                      <td className="py-2">
                        <Badge variant="outline" className="text-xs">
                          {snap.isInitialPeriod ? t('campaigns.period.initialShort') : t('campaigns.period.floatingShort')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <Link to={`/campaigns/${campaign.id}`}>
              <Button variant="outline" size="sm">
                {t('common.viewDetailComplete')}
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Participated campaign card (simplified)
function ParticipatedCampaignCard({ campaign }: { campaign: Campaign }) {
  const { t } = useTranslation()
  const snapshot = getCurrentWeekSnapshot(campaign.id)
  const participants = getCampaignParticipants(campaign.id)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{t('campaigns.campaignNumber', { position: campaign.chainPosition })}</CardTitle>
            <CardDescription>
              {t('campaigns.owner')}: {campaign.ownerName}
            </CardDescription>
          </div>
          <StatusBadge status={campaign.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              {participants.length}/4
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              ${snapshot?.totalBudget.toLocaleString() || 0} {t('campaigns.thisWeek')}
            </span>
          </div>
          <Link to={`/campaigns/${campaign.id}`}>
            <Button variant="ghost" size="sm">
              {t('common.view')} <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// Weekly budget history table across all campaigns
function WeeklyBudgetHistory({ chain }: { chain: Campaign[] }) {
  const { t } = useTranslation()
  // Get all weeks from all campaigns
  const allWeeks = useMemo(() => {
    const weekSet = new Set<string>()
    chain.forEach(campaign => {
      getCampaignSnapshots(campaign.id).forEach(snap => {
        weekSet.add(snap.weekDate)
      })
    })
    return Array.from(weekSet).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  }, [chain])

  // Build table data
  const tableData = useMemo(() => {
    return allWeeks.map(weekDate => {
      const row: Record<string, number | string> = { weekDate }
      let total = 0
      chain.forEach(campaign => {
        const snapshot = getCampaignSnapshots(campaign.id).find(s => s.weekDate === weekDate)
        row[`campaign_${campaign.id}_budget`] = snapshot?.totalBudget || 0
        row[`campaign_${campaign.id}_overflow`] = snapshot?.overflowOut || 0
        total += snapshot?.totalBudget || 0
      })
      row.total = total
      return row
    })
  }, [allWeeks, chain])

  if (chain.length === 0 || tableData.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('campaigns.budgetHistory')}
        </CardTitle>
        <CardDescription>
          {t('campaigns.budgetHistoryDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium text-muted-foreground">{t('campaigns.table.week')}</th>
                {chain.map((campaign, idx) => (
                  <th key={campaign.id} className="pb-3 font-medium text-center" colSpan={idx < chain.length - 1 ? 1 : 1}>
                    {t('campaigns.campaignNumber', { position: campaign.chainPosition })}
                    {idx < chain.length - 1 && (
                      <span className="ml-4 text-muted-foreground">→</span>
                    )}
                  </th>
                ))}
                <th className="pb-3 font-medium text-right">{t('campaigns.table.total')}</th>
              </tr>
            </thead>
            <tbody>
              {tableData.slice(0, 8).map((row) => (
                <tr key={row.weekDate as string} className="border-b last:border-0">
                  <td className="py-3">
                    {new Date(row.weekDate as string).toLocaleDateString('es-MX', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  {chain.map((campaign, idx) => (
                    <td key={campaign.id} className="py-3 text-center">
                      <span className="font-medium">
                        ${(row[`campaign_${campaign.id}_budget`] as number || 0).toLocaleString()}
                      </span>
                      {idx < chain.length - 1 && (
                        <span className="ml-4 text-amber-600 text-xs">
                          {(row[`campaign_${campaign.id}_overflow`] as number) > 0
                            ? `→$${row[`campaign_${campaign.id}_overflow`]}`
                            : ''}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="py-3 text-right font-bold">
                    ${(row.total as number).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// Main component
export function Campaigns() {
  const { t } = useTranslation()
  const { effectiveUser } = useAuth()

  // Get user data from mock
  const currentUser = useMemo(() => {
    if (!effectiveUser) return null
    return getUserById(effectiveUser.id)
  }, [effectiveUser])

  // Check if user has Llave (qualified for campaigns)
  const userHasLlave = useMemo(() => {
    if (!currentUser) return false
    return hasLlave(currentUser.sales30d)
  }, [currentUser])

  // Get owned campaigns chain
  const campaignChain = useMemo(() => {
    if (!effectiveUser) return []
    return getCampaignChain(effectiveUser.id)
  }, [effectiveUser])

  // Get participated campaigns
  const participatedCampaigns = useMemo(() => {
    if (!effectiveUser) return []
    return getUserCampaignsAsParticipant(effectiveUser.id)
  }, [effectiveUser])

  // Calculate totals
  const totalBudgetThisWeek = useMemo(() => {
    if (!effectiveUser) return 0
    return getUserTotalBudgetThisWeek(effectiveUser.id)
  }, [effectiveUser])

  const totalSalesThisWeek = useMemo(() => {
    return campaignChain.reduce((total, campaign) => {
      const snapshot = getCurrentWeekSnapshot(campaign.id)
      return total + (snapshot?.totalSales || 0)
    }, 0)
  }, [campaignChain])

  const totalOverflowThisWeek = useMemo(() => {
    return campaignChain.reduce((total, campaign) => {
      const snapshot = getCurrentWeekSnapshot(campaign.id)
      return total + (snapshot?.overflowOut || 0)
    }, 0)
  }, [campaignChain])

  // User doesn't have Llave - show locked state
  if (!userHasLlave) {
    const progress = currentUser ? (currentUser.sales30d / 15000) * 100 : 0

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('campaigns.title')}</h1>
          <p className="text-muted-foreground">
            {t('campaigns.subtitle')}
          </p>
        </div>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Target className="h-5 w-5" />
              {t('campaigns.unlockCampaigns')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-amber-700">
              {t('campaigns.unlockDescription')}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-amber-700">{t('campaigns.yourProgress')}</span>
                <span className="font-medium text-amber-800">
                  ${currentUser?.sales30d.toLocaleString() || 0} / $15,000
                </span>
              </div>
              <div className="h-3 rounded-full bg-amber-200 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
            <div className="rounded-lg bg-white/60 p-4 text-sm">
              <h4 className="font-medium text-amber-800 mb-2">{t('campaigns.benefits')}</h4>
              <ul className="space-y-1 text-amber-700">
                <li>• {t('campaigns.benefit1', { cap: CAMPAIGN_BUDGET_CAP })}</li>
                <li>• {t('campaigns.benefit2')}</li>
                <li>• {t('campaigns.benefit3')}</li>
                <li>• {t('campaigns.benefit4')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User has no campaigns yet (shouldn't happen if hasLlave, but handle gracefully)
  if (campaignChain.length === 0 && participatedCampaigns.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('campaigns.myCampaigns')}</h1>
          <p className="text-muted-foreground">
            {t('campaigns.myCampaignsDesc')}
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">{t('campaigns.noCampaignsYet')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('campaigns.firstCampaignAutoCreated')}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('campaigns.myCampaigns')}</h1>
        <p className="text-muted-foreground">
          {t('campaigns.myCampaignsDesc')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('campaigns.chain')}</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignChain.length}</div>
            <p className="text-xs text-muted-foreground">
              {participatedCampaigns.length > 0 && t('campaigns.participatingAsCount', { count: participatedCampaigns.length })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('campaigns.budgetThisWeek')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${totalBudgetThisWeek.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{t('campaigns.budgetThisWeekDesc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('campaigns.salesThisWeek')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSalesThisWeek.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t('campaigns.salesThisWeekDesc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('campaigns.overflowTotal')}</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              ${totalOverflowThisWeek.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{t('campaigns.overflowDescription')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Owned Campaigns Section */}
      {campaignChain.length > 0 && (
        <>
          {/* Chain Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                {t('campaigns.myChain')}
              </CardTitle>
              <CardDescription>
                {t('campaigns.myChainDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignChainViz chain={campaignChain} />
            </CardContent>
          </Card>

          {/* Individual Campaign Cards */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t('campaigns.detailByCampaign')}</h2>
            {campaignChain.map((campaign, idx) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                snapshot={getCurrentWeekSnapshot(campaign.id)}
                defaultExpanded={idx === 0}
              />
            ))}
          </div>

          {/* Weekly History */}
          <WeeklyBudgetHistory chain={campaignChain} />
        </>
      )}

      {/* Participated Campaigns Section */}
      {participatedCampaigns.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{t('campaigns.participatingIn')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('campaigns.participatingInDesc')}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {participatedCampaigns.map(campaign => (
              <ParticipatedCampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      )}

      {/* Budget Formula Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t('campaigns.howItWorksTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1 rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">{t('campaigns.period.initial')}</p>
              <p className="text-sm font-medium">{t('campaigns.howItWorks.initialPeriod')}</p>
            </div>
            <div className="space-y-1 rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">{t('campaigns.period.floating')}</p>
              <p className="text-sm font-medium">{t('campaigns.howItWorks.floatingPeriod')}</p>
            </div>
            <div className="space-y-1 rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">{t('campaigns.howItWorks.maxCap')}</p>
              <p className="text-sm font-medium">{t('campaigns.howItWorks.maxCapValue', { cap: CAMPAIGN_BUDGET_CAP })}</p>
            </div>
            <div className="space-y-1 rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">{t('campaigns.overflow')}</p>
              <p className="text-sm font-medium">{t('campaigns.howItWorks.overflowRule')}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {t('campaigns.howItWorks.description', { cap: CAMPAIGN_BUDGET_CAP })}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
