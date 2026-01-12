import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, Award, Star, Zap, Crown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { TrophyCard } from '@/components/trophies/TrophyCard'
import {
  getAllTrophies,
  getUserTrophies,
  getTrophyCount,
  trophyCategories,
  getCurrentTopEarner,
  getTopEarnerName,
} from '@/data/trophies'
import type { TrophyCategory } from '@/types'

const categoryIcons: Record<TrophyCategory, React.ReactNode> = {
  ventas: <Zap className="h-4 w-4" />,
  legado: <Star className="h-4 w-4" />,
  campanas: <Award className="h-4 w-4" />,
  consistencia: <Trophy className="h-4 w-4" />,
  ingresos: <Crown className="h-4 w-4" />,
}

export function Trophies() {
  const { t } = useTranslation()
  const { effectiveUser } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<TrophyCategory | 'all'>('all')

  // Get all trophies and user's earned trophies
  const allTrophies = useMemo(() => getAllTrophies(), [])
  const userTrophyList = useMemo(
    () => (effectiveUser ? getUserTrophies(effectiveUser.id) : []),
    [effectiveUser]
  )
  const trophyCounts = useMemo(
    () => (effectiveUser ? getTrophyCount(effectiveUser.id) : { earned: 0, total: 13 }),
    [effectiveUser]
  )

  // Create a map of user trophies for quick lookup
  const userTrophyMap = useMemo(() => {
    const map = new Map<string, typeof userTrophyList[0]>()
    userTrophyList.forEach(ut => map.set(ut.trophyId, ut))
    return map
  }, [userTrophyList])

  // Filter trophies by category
  const filteredTrophies = useMemo(() => {
    if (selectedCategory === 'all') return allTrophies
    return allTrophies.filter(t => t.category === selectedCategory)
  }, [allTrophies, selectedCategory])

  // Get current top earner
  const topEarner = useMemo(() => getCurrentTopEarner(), [])
  const topEarnerName = useMemo(() => getTopEarnerName(), [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('trophies.title')}</h1>
          <p className="text-muted-foreground">
            {t('trophies.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Trophy className="h-5 w-5 mr-2 text-primary" />
            {trophyCounts.earned}/{trophyCounts.total} {t('trophies.unlocked')}
          </Badge>
        </div>
      </div>

      {/* Top Earner Highlight */}
      {topEarner && topEarnerName && (
        <Card className="border-amber-400/50 bg-gradient-to-r from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="relative">
              {/* Glow effect - pulsating from small to large */}
              <div
                className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 blur-xl"
                style={{
                  animation: 'glowPulse 2s ease-in-out infinite',
                }}
              />
              <style>{`
                @keyframes glowPulse {
                  0%, 100% {
                    opacity: 0.3;
                    transform: scale(0.8);
                  }
                  50% {
                    opacity: 0.8;
                    transform: scale(1.2);
                  }
                }
              `}</style>
              <div className="relative w-20 h-20 rounded-full overflow-hidden">
                <img
                  src={topEarner.trophy.imagePath}
                  alt={topEarner.trophy.name}
                  className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(234,179,8,0.8)]"
                />
              </div>
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                TOP
              </div>
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg text-amber-700 dark:text-amber-400">
                {t('trophies.topEarnerTitle')}
              </p>
              <p className="text-xl font-semibold text-foreground">
                {topEarnerName}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('trophies.topEarnerDescription')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          {t('common.all')}
        </Button>
        {trophyCategories.map(cat => (
          <Button
            key={cat.key}
            variant={selectedCategory === cat.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.key)}
            className="gap-1"
          >
            {categoryIcons[cat.key]}
            {t(cat.labelKey)}
          </Button>
        ))}
      </div>

      {/* Trophy Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {selectedCategory === 'all'
              ? t('trophies.allTrophies')
              : t(`trophies.categories.${selectedCategory}`)}
          </CardTitle>
          <CardDescription>
            {t('trophies.gridDescription', { count: filteredTrophies.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredTrophies.map(trophy => (
              <TrophyCard
                key={trophy.id}
                trophy={trophy}
                userTrophy={userTrophyMap.get(trophy.id)}
                size="md"
                showDetails={true}
                holderName={trophy.isSpecial ? topEarnerName : undefined}
              />
            ))}
          </div>

          {filteredTrophies.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>{t('trophies.noTrophiesInCategory')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {trophyCategories.map(cat => {
          const categoryTrophies = allTrophies.filter(t => t.category === cat.key)
          const earnedInCategory = categoryTrophies.filter(t => userTrophyMap.has(t.id)).length

          return (
            <Card
              key={cat.key}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setSelectedCategory(cat.key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {categoryIcons[cat.key]}
                  <span className="font-medium text-sm">{t(cat.labelKey)}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{earnedInCategory}</span>
                  <span className="text-muted-foreground">/ {categoryTrophies.length}</span>
                </div>
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${(earnedInCategory / categoryTrophies.length) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
