import { useMemo } from 'react'
import { Link } from 'react-router-dom'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { User, Mail, Phone, Calendar, Shield, Trophy, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TrophyCard } from '@/components/trophies/TrophyCard'
import { getAllTrophies, getUserTrophies, getTrophyCount } from '@/data/trophies'

export function Profile() {
  const { user, effectiveUser } = useAuth()
  const { t } = useTranslation()

  const displayUser = effectiveUser || user

  const initials = displayUser?.name
    .split(' ')
    .map((n) => n[0])
    .join('')

  // Get user's trophies
  const allTrophies = useMemo(() => getAllTrophies(), [])
  const userTrophyList = useMemo(
    () => (displayUser ? getUserTrophies(displayUser.id) : []),
    [displayUser]
  )
  const trophyCounts = useMemo(
    () => (displayUser ? getTrophyCount(displayUser.id) : { earned: 0, total: 13 }),
    [displayUser]
  )

  // Create a map of user trophies for quick lookup
  const userTrophyMap = useMemo(() => {
    const map = new Map<string, typeof userTrophyList[0]>()
    userTrophyList.forEach(ut => map.set(ut.trophyId, ut))
    return map
  }, [userTrophyList])

  // Get earned trophies for display (up to 5)
  const earnedTrophies = useMemo(() => {
    return allTrophies
      .filter(t => userTrophyMap.has(t.id))
      .slice(0, 5)
  }, [allTrophies, userTrophyMap])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('profile.title')}</h1>
        <p className="text-muted-foreground">
          {t('profile.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={displayUser?.avatarUrl} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{displayUser?.name}</CardTitle>
            <CardDescription>{displayUser?.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Badge variant={displayUser?.isActive ? 'success' : 'secondary'}>
                {displayUser?.isActive ? t('profile.accountActive') : t('profile.accountPending')}
              </Badge>
              {displayUser?.role === 'admin' && (
                <Badge variant="default">
                  <Shield className="mr-1 h-3 w-3" />
                  {t('admin.title')}
                </Badge>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {t('profile.memberSince', {
                  date: displayUser?.createdAt
                    ? new Date(displayUser.createdAt).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                      })
                    : 'N/A'
                })}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="h-4 w-4" />
                {t('profile.achievementsCount', { count: trophyCounts.earned })}
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                ${displayUser?.totalRevenue?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-muted-foreground">{t('profile.totalEarnings')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('profile.personalInfo')}
            </CardTitle>
            <CardDescription>
              {t('profile.personalInfoDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('profile.fullName')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      defaultValue={displayUser?.name}
                      placeholder={t('profile.yourName')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('profile.emailAddress')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      type="email"
                      defaultValue={displayUser?.email}
                      placeholder={t('profile.emailPlaceholder')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('common.phone')}</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      defaultValue={displayUser?.phone || ''}
                      placeholder={t('sales.phonePlaceholder')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('profile.avatarUrl')}
                  </label>
                  <Input
                    defaultValue={displayUser?.avatarUrl || ''}
                    placeholder={t('profile.avatarUrlPlaceholder')}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">{t('common.saveChanges')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Trophies Section */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  {t('trophies.title')}
                </CardTitle>
                <CardDescription>
                  {trophyCounts.earned}/{trophyCounts.total} {t('trophies.unlocked')}
                </CardDescription>
              </div>
              <Link to="/trophies">
                <Button variant="ghost" size="sm" className="gap-1">
                  {t('trophies.viewAll')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {earnedTrophies.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                {earnedTrophies.map(trophy => (
                  <TrophyCard
                    key={trophy.id}
                    trophy={trophy}
                    userTrophy={userTrophyMap.get(trophy.id)}
                    size="sm"
                    showDetails={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>{t('profile.noTrophiesYet')}</p>
                <Link to="/trophies">
                  <Button variant="link" size="sm">
                    {t('trophies.viewAll')}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('profile.security')}
            </CardTitle>
            <CardDescription>
              {t('profile.securityDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('profile.currentPassword')}
                  </label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('profile.newPassword')}</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('profile.confirmPassword')}
                  </label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="outline">
                  {t('profile.changePassword')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
