/**
 * InvitationsList - Display pending campaign invitations with accept/decline actions
 */
import { UserPlus, Check, X, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/contexts/NotificationContext'
import { cn } from '@/lib/utils'
import type { CampaignInvitation, InvitationStatus } from '@/types/notifications'

const statusConfig: Record<InvitationStatus, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-amber-500 bg-amber-50', label: 'Pendiente' },
  accepted: { icon: CheckCircle, color: 'text-green-500 bg-green-50', label: 'Aceptada' },
  declined: { icon: XCircle, color: 'text-red-500 bg-red-50', label: 'Rechazada' },
  expired: { icon: Clock, color: 'text-gray-500 bg-gray-50', label: 'Expirada' },
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

interface InvitationItemProps {
  invitation: CampaignInvitation
  onAccept: (id: string) => void
  onDecline: (id: string) => void
}

function InvitationItem({ invitation, onAccept, onDecline }: InvitationItemProps) {
  const isPending = invitation.status === 'pending'
  const statusInfo = statusConfig[invitation.status]
  const StatusIcon = statusInfo.icon

  return (
    <div className="p-4 border-b last:border-b-0">
      <div className="flex gap-3">
        <div className="p-2 bg-primary/10 rounded-full shrink-0 h-fit">
          <UserPlus className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-sm">{invitation.campaignName}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Invitado por {invitation.inviterName}
              </p>
            </div>
            <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs', statusInfo.color)}>
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </div>
          </div>

          {invitation.message && (
            <div className="mt-2 p-2 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground italic">
                "{invitation.message}"
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            Recibida: {formatDate(invitation.createdAt)}
            {invitation.respondedAt && (
              <> · Respondida: {formatDate(invitation.respondedAt)}</>
            )}
          </p>

          {isPending && (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => onAccept(invitation.id)}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-1" />
                Aceptar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDecline(invitation.id)}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-1" />
                Rechazar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function InvitationsList() {
  const { invitations, acceptInvitation, declineInvitation } = useNotifications()

  // Separate pending from historical
  const pendingInvitations = invitations.filter(i => i.status === 'pending')
  const historicalInvitations = invitations.filter(i => i.status !== 'pending')

  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <UserPlus className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <h3 className="font-medium text-muted-foreground">Sin invitaciones</h3>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Cuando alguien te invite a una campaña, aparecerá aquí
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Pending invitations */}
      {pendingInvitations.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-amber-50 border-b">
            <h3 className="text-sm font-medium text-amber-700">
              Pendientes ({pendingInvitations.length})
            </h3>
          </div>
          {pendingInvitations.map(invitation => (
            <InvitationItem
              key={invitation.id}
              invitation={invitation}
              onAccept={acceptInvitation}
              onDecline={declineInvitation}
            />
          ))}
        </div>
      )}

      {/* Historical invitations */}
      {historicalInvitations.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-muted/50 border-b">
            <h3 className="text-sm font-medium text-muted-foreground">
              Historial
            </h3>
          </div>
          {historicalInvitations.map(invitation => (
            <InvitationItem
              key={invitation.id}
              invitation={invitation}
              onAccept={acceptInvitation}
              onDecline={declineInvitation}
            />
          ))}
        </div>
      )}
    </div>
  )
}
