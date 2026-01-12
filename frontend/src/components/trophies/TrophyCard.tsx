import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { Trophy, UserTrophy } from '@/types'

interface TrophyCardProps {
  trophy: Trophy
  userTrophy?: UserTrophy
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  holderName?: string  // For Penacho de Pakoa - who holds it
}

export function TrophyCard({ trophy, userTrophy, size = 'md', showDetails = true, holderName }: TrophyCardProps) {
  const { t } = useTranslation()
  const isEarned = !!userTrophy
  const isCurrentTopEarner = userTrophy?.isCurrentHolder && trophy.isSpecial
  const isPenachoTrophy = trophy.isSpecial

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
  }

  const containerSizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col items-center rounded-xl border bg-card transition-all duration-300',
        containerSizeClasses[size],
        isEarned
          ? isCurrentTopEarner
            ? 'border-amber-400/50 bg-gradient-to-b from-amber-50/20 to-yellow-50/10 dark:from-amber-950/30 dark:to-yellow-950/20'
            : 'border-primary/40 bg-gradient-to-b from-primary/5 to-transparent hover:border-primary/60'
          : 'border-muted hover:border-muted-foreground/30'
      )}
    >
      {/* Trophy Image Container with glow */}
      <div className={cn('relative', sizeClasses[size])}>
        {/* Glow effect for earned trophies */}
        {isEarned && (
          <div
            className={cn(
              'absolute inset-0 rounded-full blur-xl opacity-60',
              isCurrentTopEarner
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                : 'bg-gradient-to-r from-primary/50 to-cyan-400/50'
            )}
          />
        )}

        {/* Trophy image */}
        <div className={cn(
          'relative rounded-full overflow-hidden',
          sizeClasses[size]
        )}>
          <img
            src={trophy.imagePath}
            alt={trophy.name}
            className={cn(
              'w-full h-full object-contain transition-all duration-300',
              isEarned
                ? isCurrentTopEarner
                  ? 'drop-shadow-[0_0_20px_rgba(234,179,8,0.7)]'
                  : 'drop-shadow-[0_0_15px_rgba(20,184,166,0.6)]'
                : 'grayscale opacity-40 group-hover:opacity-50'
            )}
          />
        </div>

        {/* Current Top Earner Badge */}
        {isCurrentTopEarner && (
          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
            TOP
          </div>
        )}

        {/* Penacho indicator when not earned but showing holder */}
        {isPenachoTrophy && !isEarned && holderName && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-500/90 text-white text-[8px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
            {holderName}
          </div>
        )}
      </div>

      {/* Trophy Details */}
      {showDetails && (
        <div className="mt-2 text-center w-full">
          <p className={cn(
            'text-xs font-medium truncate',
            isEarned ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {trophy.name}
          </p>

          {isEarned && userTrophy && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {new Date(userTrophy.earnedAt).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          )}

          {/* Show holder name for Penacho when earned */}
          {isCurrentTopEarner && holderName && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
              {holderName}
            </p>
          )}

          {!isEarned && !isPenachoTrophy && (
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
              {trophy.description}
            </p>
          )}

          {!isEarned && isPenachoTrophy && holderName && (
            <p className="text-[10px] text-amber-600/70 mt-0.5">
              {t('trophies.currentHolder')}: {holderName}
            </p>
          )}
        </div>
      )}

      {/* Hover Tooltip for small sizes */}
      {size === 'sm' && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-48">
          <p className="font-medium text-sm">{trophy.name}</p>
          <p className="text-xs text-muted-foreground mt-1">{trophy.description}</p>
          {isEarned && userTrophy && (
            <p className="text-xs text-primary mt-1">
              {t('trophies.earnedOn', {
                date: new Date(userTrophy.earnedAt).toLocaleDateString('es-MX')
              })}
            </p>
          )}
          {isPenachoTrophy && holderName && (
            <p className="text-xs text-amber-600 mt-1">
              {t('trophies.currentHolder')}: {holderName}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Compact version for profile preview
export function TrophyBadge({ trophy, userTrophy }: { trophy: Trophy; userTrophy?: UserTrophy }) {
  const isEarned = !!userTrophy
  const isCurrentTopEarner = userTrophy?.isCurrentHolder && trophy.isSpecial

  return (
    <div className="group relative">
      <div
        className={cn(
          'relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-300',
          isEarned
            ? isCurrentTopEarner
              ? 'border-amber-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]'
              : 'border-primary/50 shadow-[0_0_10px_rgba(20,184,166,0.4)]'
            : 'border-muted'
        )}
      >
        <img
          src={trophy.imagePath}
          alt={trophy.name}
          className={cn(
            'w-full h-full object-contain transition-all duration-300',
            !isEarned && 'grayscale opacity-40'
          )}
        />
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
        <p className="text-xs font-medium">{trophy.name}</p>
      </div>
    </div>
  )
}
