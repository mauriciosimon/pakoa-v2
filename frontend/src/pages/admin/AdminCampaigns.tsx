import { useMemo, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import {
  Megaphone,
  DollarSign,
  TrendingUp,
  Users,
  ArrowRight,
  Search,
  ChevronRight,
  Trophy,
} from 'lucide-react'
import {
  getAllCampaigns,
  getCampaignsWithOverflow,
  getLongestCampaignChains,
  getAverageChainLength,
  getTotalPlatformBudgetThisWeek,
  getCurrentWeekSnapshot,
  getCampaignParticipants,
} from '@/data/mockData'
import type { CampaignStatus } from '@/types'

// Status badge component
function StatusBadge({ status }: { status: CampaignStatus }) {
  const variants: Record<CampaignStatus, { variant: 'success' | 'secondary' | 'outline', label: string }> = {
    ACTIVE: { variant: 'success', label: 'Activa' },
    PAUSED: { variant: 'secondary', label: 'Pausada' },
    CLOSED: { variant: 'outline', label: 'Cerrada' },
  }
  const config = variants[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function AdminCampaigns() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'ALL'>('ALL')

  // Get all campaigns
  const allCampaigns = useMemo(() => getAllCampaigns(), [])

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return allCampaigns.filter(campaign => {
      // Status filter
      if (statusFilter !== 'ALL' && campaign.status !== statusFilter) return false

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          campaign.name.toLowerCase().includes(searchLower) ||
          campaign.ownerName.toLowerCase().includes(searchLower)
        )
      }

      return true
    })
  }, [allCampaigns, search, statusFilter])

  // Get stats
  const stats = useMemo(() => {
    const campaignsWithOverflow = getCampaignsWithOverflow()
    const longestChains = getLongestCampaignChains()
    const avgChainLength = getAverageChainLength()
    const totalBudget = getTotalPlatformBudgetThisWeek()

    const activeCampaigns = allCampaigns.filter(c => c.status === 'ACTIVE').length

    return {
      totalCampaigns: allCampaigns.length,
      activeCampaigns,
      totalBudget,
      campaignsWithOverflow: campaignsWithOverflow.length,
      avgChainLength,
      longestChains: longestChains.slice(0, 5),
    }
  }, [allCampaigns])

  // Get top overflow campaigns
  const topOverflowCampaigns = useMemo(() => {
    return allCampaigns
      .map(campaign => {
        const snapshot = getCurrentWeekSnapshot(campaign.id)
        return {
          campaign,
          overflowOut: snapshot?.overflowOut || 0,
        }
      })
      .filter(item => item.overflowOut > 0)
      .sort((a, b) => b.overflowOut - a.overflowOut)
      .slice(0, 5)
  }, [allCampaigns])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('campaigns.title')}</h1>
        <p className="text-muted-foreground">
          {t('admin.campaigns.subtitle')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.campaigns.totalCampaigns')}</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCampaigns} {t('campaigns.status.active').toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.campaigns.totalBudget')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${stats.totalBudget.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{t('campaigns.thisWeek')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.campaigns.withOverflow')}</CardTitle>
            <ArrowRight className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats.campaignsWithOverflow}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('admin.campaigns.campaignsWithOverflow')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.campaigns.avgChain')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgChainLength}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.campaigns.campaignsPerUser')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rankings Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Longest Chains */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-amber-500" />
              {t('admin.campaigns.longestChains')}
            </CardTitle>
            <CardDescription>{t('admin.campaigns.longestChainsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.longestChains.map((item, idx) => (
                <div key={item.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${idx < 3 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                      #{idx + 1}
                    </span>
                    <span className="font-medium">{item.userName}</span>
                  </div>
                  <Badge variant="outline">
                    {item.chainLength} {item.chainLength > 1 ? t('admin.campaigns.campaigns') : t('admin.campaigns.campaign')}
                  </Badge>
                </div>
              ))}
              {stats.longestChains.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('common.noDataAvailable')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Overflow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowRight className="h-4 w-4 text-amber-500" />
              {t('admin.campaigns.topOverflow')}
            </CardTitle>
            <CardDescription>{t('admin.campaigns.topOverflowDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topOverflowCampaigns.map((item, idx) => (
                <div key={item.campaign.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${idx < 3 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{t('campaigns.campaignNumber', { position: item.campaign.chainPosition })}</p>
                      <p className="text-xs text-muted-foreground">{item.campaign.ownerName}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-amber-600">
                    ${item.overflowOut.toLocaleString()}
                  </Badge>
                </div>
              ))}
              {topOverflowCampaigns.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('admin.campaigns.noOverflowThisWeek')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.campaigns.allCampaigns')}</CardTitle>
          <CardDescription>
            {t('admin.campaigns.allCampaignsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('admin.campaigns.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1">
              {(['ALL', 'ACTIVE', 'PAUSED', 'CLOSED'] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'ALL' ? 'Todas' : status === 'ACTIVE' ? 'Activas' : status === 'PAUSED' ? 'Pausadas' : 'Cerradas'}
                </Button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">{t('admin.campaigns.campaign')}</th>
                  <th className="pb-3 font-medium">{t('campaigns.owner')}</th>
                  <th className="pb-3 font-medium text-center">{t('campaigns.position')}</th>
                  <th className="pb-3 font-medium text-center">{t('common.status')}</th>
                  <th className="pb-3 font-medium text-center">{t('campaigns.participants')}</th>
                  <th className="pb-3 font-medium text-right">{t('campaigns.budget')}</th>
                  <th className="pb-3 font-medium text-right">{t('campaigns.overflow')}</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => {
                  const snapshot = getCurrentWeekSnapshot(campaign.id)
                  const participants = getCampaignParticipants(campaign.id)

                  return (
                    <tr key={campaign.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{t('campaigns.campaignNumber', { position: campaign.chainPosition })}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('campaigns.createdOn')} {new Date(campaign.createdAt).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                      </td>
                      <td className="py-3">{campaign.ownerName}</td>
                      <td className="py-3 text-center">
                        <Badge variant="outline">{campaign.chainPosition}</Badge>
                      </td>
                      <td className="py-3 text-center">
                        <StatusBadge status={campaign.status} />
                      </td>
                      <td className="py-3 text-center">
                        <span className="flex items-center justify-center gap-1">
                          <Users className="h-3 w-3" />
                          {participants.length}/4
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium">
                        ${snapshot?.totalBudget.toLocaleString() || 0}
                      </td>
                      <td className="py-3 text-right">
                        {snapshot?.overflowOut && snapshot.overflowOut > 0 ? (
                          <span className="text-amber-600 font-medium">
                            ${snapshot.overflowOut.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <Link to={`/campaigns/${campaign.id}`}>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">{t('admin.campaigns.noCampaignsFound')}</p>
              <p className="text-sm">{t('admin.campaigns.tryOtherFilters')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
