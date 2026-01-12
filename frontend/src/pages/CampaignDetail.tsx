import { useMemo, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  DollarSign,
  Users,
  Sparkles,
  TrendingUp,
  UserPlus,
  UserMinus,
  Crown,
  Search,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Clock,
  X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'
import {
  getCampaignById,
  getCampaignSnapshots,
  getCampaignParticipants,
  getCurrentWeekSnapshot,
  getUserParticipation,
  isCampaignFull,
  mockUsers,
  CAMPAIGN_BUDGET_CAP,
  CAMPAIGN_MAX_PARTICIPANTS,
} from '@/data/mockData'
import type { CampaignWeeklySnapshot, CampaignParticipant, CampaignStatus } from '@/types'
import type { CampaignInvitation } from '@/types/notifications'

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

// Budget flow visualization
function BudgetFlowViz({ snapshot }: { snapshot: CampaignWeeklySnapshot }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 p-4 rounded-lg bg-muted/50">
      {/* Sales */}
      <div className="flex flex-col items-center p-3 rounded-lg bg-background border min-w-[100px]">
        <span className="text-xs text-muted-foreground">Ventas</span>
        <span className="text-xl font-bold">${snapshot.totalSales.toLocaleString()}</span>
      </div>

      <ArrowRight className="h-5 w-5 text-muted-foreground" />

      {/* Base calculation */}
      <div className="flex flex-col items-center p-3 rounded-lg bg-background border min-w-[100px]">
        <span className="text-xs text-muted-foreground">
          {snapshot.isInitialPeriod ? 'Inicial' : '÷ 2.5'}
        </span>
        <span className="text-xl font-bold">${snapshot.baseBudget.toLocaleString()}</span>
      </div>

      <ArrowRight className="h-5 w-5 text-muted-foreground" />

      {/* Capped */}
      <div className="flex flex-col items-center p-3 rounded-lg bg-background border min-w-[100px]">
        <span className="text-xs text-muted-foreground">Tope ${CAMPAIGN_BUDGET_CAP}</span>
        <span className="text-xl font-bold">${snapshot.cappedBudget.toLocaleString()}</span>
      </div>

      {/* Overflow In */}
      {snapshot.overflowIn > 0 && (
        <>
          <span className="text-green-600 font-medium">+</span>
          <div className="flex flex-col items-center p-3 rounded-lg bg-green-50 border border-green-200 min-w-[100px]">
            <span className="text-xs text-green-600">Overflow In</span>
            <span className="text-xl font-bold text-green-600">+${snapshot.overflowIn.toLocaleString()}</span>
          </div>
        </>
      )}

      <span className="font-medium">=</span>

      {/* Total */}
      <div className="flex flex-col items-center p-3 rounded-lg bg-primary/10 border border-primary/30 min-w-[100px]">
        <span className="text-xs text-primary">Total</span>
        <span className="text-xl font-bold text-primary">${snapshot.totalBudget.toLocaleString()}</span>
      </div>

      {/* Overflow Out */}
      {snapshot.overflowOut > 0 && (
        <>
          <ArrowRight className="h-5 w-5 text-amber-600" />
          <div className="flex flex-col items-center p-3 rounded-lg bg-amber-50 border border-amber-200 min-w-[100px]">
            <span className="text-xs text-amber-600">Overflow Out</span>
            <span className="text-xl font-bold text-amber-600">${snapshot.overflowOut.toLocaleString()}</span>
          </div>
        </>
      )}
    </div>
  )
}

// Participant row
interface ParticipantRowProps {
  participant: CampaignParticipant
  canManage: boolean
  onRemove?: () => void
}

function ParticipantRow({ participant, canManage, onRemove }: ParticipantRowProps) {
  const { t, i18n } = useTranslation()
  const initials = participant.userName
    .split(' ')
    .map(n => n[0])
    .join('')

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className={participant.role === 'owner' ? 'bg-primary/10 text-primary' : ''}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{participant.userName}</span>
            {participant.role === 'owner' && (
              <Badge variant="outline" className="gap-1 text-xs">
                <Crown className="h-3 w-3" />
                {t('campaigns.owner')}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{participant.userEmail}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right text-sm">
          <p className="text-muted-foreground">{t('common.since')}</p>
          <p>{new Date(participant.joinedAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-MX')}</p>
        </div>
        {canManage && participant.role !== 'owner' && onRemove && (
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onRemove}>
            <UserMinus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

// Pending invitation row
interface PendingInvitationRowProps {
  invitation: CampaignInvitation
  onCancel: () => void
}

function PendingInvitationRow({ invitation, onCancel }: PendingInvitationRowProps) {
  const { t, i18n } = useTranslation()
  const initials = invitation.inviteeName
    .split(' ')
    .map(n => n[0])
    .join('')

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-amber-300 bg-amber-50/50">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-amber-100 text-amber-700">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{invitation.inviteeName}</span>
            <Badge variant="outline" className="gap-1 text-xs border-amber-300 bg-amber-100 text-amber-700">
              <Clock className="h-3 w-3" />
              {t('notifications.pending')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('campaigns.invitationSent')} {new Date(invitation.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-MX')}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={onCancel}
      >
        <X className="h-4 w-4 mr-1" />
        {t('common.cancel')}
      </Button>
    </div>
  )
}

// Invite participant section
function InviteParticipantSection({ campaignId, isFull }: { campaignId: string; isFull: boolean }) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [invitedUsers, setInvitedUsers] = useState<Set<string>>(new Set())
  const { sendInvitation } = useNotifications()
  const participants = getCampaignParticipants(campaignId)
  const participantIds = new Set(participants.map(p => p.userId))

  // Filter users who can be invited
  const availableUsers = useMemo(() => {
    if (!search || search.length < 2) return []
    const searchLower = search.toLowerCase()
    return mockUsers
      .filter(u => !participantIds.has(u.id))
      .filter(u =>
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
      )
      .slice(0, 5)
  }, [search, participantIds])

  const handleInvite = (userId: string) => {
    sendInvitation(campaignId, userId, t('campaigns.inviteMessage'))
    setInvitedUsers(prev => new Set([...prev, userId]))
    // Clear search after inviting
    setSearch('')
  }

  if (isFull) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="font-medium">{t('campaigns.campaignFull', { max: CAMPAIGN_MAX_PARTICIPANTS })}</p>
        <p className="text-sm">{t('campaigns.cannotAddMore')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('campaigns.searchUserPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      {availableUsers.length > 0 && (
        <div className="space-y-2 rounded-lg border p-2">
          {availableUsers.map(user => {
            const alreadyInvited = invitedUsers.has(user.id)
            return (
              <div key={user.id} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={alreadyInvited ? 'secondary' : 'outline'}
                  onClick={() => handleInvite(user.id)}
                  disabled={alreadyInvited}
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  {alreadyInvited ? 'Invitado' : 'Invitar'}
                </Button>
              </div>
            )
          })}
        </div>
      )}
      {search.length >= 2 && availableUsers.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          No se encontraron usuarios
        </p>
      )}
    </div>
  )
}

export function CampaignDetail() {
  const { t } = useTranslation()
  const { campaignId } = useParams<{ campaignId: string }>()
  const { effectiveUser } = useAuth()
  const { getPendingInvitationsForCampaign, cancelInvitation } = useNotifications()

  // Get campaign data
  const campaign = useMemo(() => {
    if (!campaignId) return null
    return getCampaignById(campaignId)
  }, [campaignId])

  // Get pending invitations for this campaign
  const pendingInvitations = useMemo(() => {
    if (!campaignId) return []
    return getPendingInvitationsForCampaign(campaignId)
  }, [campaignId, getPendingInvitationsForCampaign])

  // Get current snapshot
  const currentSnapshot = useMemo(() => {
    if (!campaignId) return null
    return getCurrentWeekSnapshot(campaignId)
  }, [campaignId])

  // Get all snapshots
  const snapshots = useMemo(() => {
    if (!campaignId) return []
    return getCampaignSnapshots(campaignId)
  }, [campaignId])

  // Get participants
  const participants = useMemo(() => {
    if (!campaignId) return []
    return getCampaignParticipants(campaignId)
  }, [campaignId])

  // Check user's role
  const userParticipation = useMemo(() => {
    if (!effectiveUser || !campaignId) return null
    return getUserParticipation(effectiveUser.id, campaignId)
  }, [effectiveUser, campaignId])

  const isOwner = campaign?.ownerId === effectiveUser?.id
  const isParticipant = !!userParticipation && !isOwner
  const canManage = isOwner // Only owner can manage participants

  // Get parent/child campaigns for navigation
  const parentCampaign = useMemo(() => {
    if (!campaign?.parentCampaignId) return null
    return getCampaignById(campaign.parentCampaignId)
  }, [campaign])

  const childCampaign = useMemo(() => {
    if (!campaign?.childCampaignId) return null
    return getCampaignById(campaign.childCampaignId)
  }, [campaign])

  // Campaign not found
  if (!campaign) {
    return <Navigate to="/campaigns" replace />
  }

  // Check if user has access (owner or participant)
  const hasAccess = isOwner || isParticipant
  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-destructive/50" />
            <h3 className="text-lg font-medium mb-2">{t('campaigns.noAccess')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('campaigns.noAccessDescription')}
            </p>
            <Link to="/campaigns">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('campaigns.backToCampaigns')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to="/campaigns">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">{t('campaigns.campaignNumber', { position: campaign.chainPosition })}</h1>
            <StatusBadge status={campaign.status} />
            {currentSnapshot && <PeriodBadge isInitial={currentSnapshot.isInitialPeriod} />}
          </div>
          <p className="text-muted-foreground pl-10">
            {isOwner ? t('campaigns.yourCampaign') : t('campaigns.campaignBy', { owner: campaign.ownerName })} • {t('campaigns.chainPosition', { position: campaign.chainPosition })}
          </p>
        </div>

        {/* Chain navigation */}
        <div className="flex items-center gap-2">
          {parentCampaign && (
            <Link to={`/campaigns/${parentCampaign.id}`}>
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t('campaigns.campaignNumber', { position: parentCampaign.chainPosition })}
              </Button>
            </Link>
          )}
          {childCampaign && (
            <Link to={`/campaigns/${childCampaign.id}`}>
              <Button variant="outline" size="sm">
                {t('campaigns.campaignNumber', { position: childCampaign.chainPosition })}
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Current Week Stats */}
      {currentSnapshot && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Esta Semana</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${currentSnapshot.totalSales.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${currentSnapshot.totalBudget.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overflow Entrante</CardTitle>
              <ArrowRight className="h-4 w-4 text-green-500 rotate-180" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+${currentSnapshot.overflowIn.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overflow Saliente</CardTitle>
              <ArrowRight className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">${currentSnapshot.overflowOut.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Flow Visualization */}
      {currentSnapshot && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('campaigns.budgetFlow')}
            </CardTitle>
            <CardDescription>
              {t('campaigns.budgetFlowDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetFlowViz snapshot={currentSnapshot} />
          </CardContent>
        </Card>
      )}

      {/* Participants Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('campaigns.participants')}
              </CardTitle>
              <CardDescription>
                {t('campaigns.participantsInCampaign', { count: participants.length, max: CAMPAIGN_MAX_PARTICIPANTS })}
              </CardDescription>
            </div>
            {isParticipant && (
              <Badge variant="secondary">{t('campaigns.youAreParticipant')}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Participant list */}
          <div className="space-y-2">
            {participants.map(participant => (
              <ParticipantRow
                key={participant.id}
                participant={participant}
                canManage={canManage}
                onRemove={() => {
                  // TODO: Implement remove participant
                  console.log('Remove participant:', participant.id)
                }}
              />
            ))}
          </div>

          {/* Pending invitations (owner only) */}
          {canManage && pendingInvitations.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                Invitaciones Pendientes ({pendingInvitations.length})
              </h4>
              <div className="space-y-2">
                {pendingInvitations.map(invitation => (
                  <PendingInvitationRow
                    key={invitation.id}
                    invitation={invitation}
                    onCancel={() => cancelInvitation(invitation.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Invite section (owner only) */}
          {canManage && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Invitar Participante
              </h4>
              <InviteParticipantSection
                campaignId={campaign.id}
                isFull={isCampaignFull(campaign.id)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Weekly History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('campaigns.fullHistory')}
          </CardTitle>
          <CardDescription>
            {t('campaigns.fullHistoryDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">{t('campaigns.table.week')}</th>
                  <th className="pb-3 font-medium text-right">{t('campaigns.table.sales')}</th>
                  <th className="pb-3 font-medium text-right">{t('campaigns.table.base')}</th>
                  <th className="pb-3 font-medium text-right">{t('campaigns.table.cap')}</th>
                  <th className="pb-3 font-medium text-right">{t('campaigns.table.in')}</th>
                  <th className="pb-3 font-medium text-right">{t('campaigns.table.out')}</th>
                  <th className="pb-3 font-medium text-right">{t('campaigns.table.total')}</th>
                  <th className="pb-3 font-medium">{t('campaigns.table.period')}</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((snap) => (
                  <tr key={snap.id} className="border-b last:border-0">
                    <td className="py-3">
                      {new Date(snap.weekDate).toLocaleDateString('es-MX', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 text-right">${snap.totalSales.toLocaleString()}</td>
                    <td className="py-3 text-right">${snap.baseBudget.toLocaleString()}</td>
                    <td className="py-3 text-right">${snap.cappedBudget.toLocaleString()}</td>
                    <td className="py-3 text-right text-green-600">+${snap.overflowIn}</td>
                    <td className="py-3 text-right text-amber-600">-${snap.overflowOut}</td>
                    <td className="py-3 text-right font-bold">${snap.totalBudget.toLocaleString()}</td>
                    <td className="py-3">
                      <Badge variant="outline" className="text-xs">
                        {snap.isInitialPeriod ? t('campaigns.period.initialShort') : t('campaigns.period.floatingShort')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {snapshots.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t('campaigns.noHistoryAvailable')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('campaigns.campaignInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">{t('campaigns.owner')}</dt>
              <dd className="font-medium">{campaign.ownerName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t('campaigns.position')}</dt>
              <dd className="font-medium">{campaign.chainPosition}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t('campaigns.createdOn')}</dt>
              <dd className="font-medium">
                {new Date(campaign.createdAt).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t('campaigns.initialPeriodEnds')}</dt>
              <dd className="font-medium">
                {new Date(campaign.initialPeriodEndsAt).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </dd>
            </div>
            {campaign.parentCampaignId && (
              <div>
                <dt className="text-sm text-muted-foreground">{t('campaigns.parentCampaign')}</dt>
                <dd>
                  <Link to={`/campaigns/${campaign.parentCampaignId}`} className="text-primary hover:underline">
                    {t('campaigns.viewParent')}
                  </Link>
                </dd>
              </div>
            )}
            {campaign.childCampaignId && (
              <div>
                <dt className="text-sm text-muted-foreground">{t('campaigns.childCampaign')}</dt>
                <dd>
                  <Link to={`/campaigns/${campaign.childCampaignId}`} className="text-primary hover:underline">
                    {t('campaigns.viewChild')}
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
