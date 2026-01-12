import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  Users,
  Megaphone,
  User,
  Trophy,
  LogOut,
  Menu,
  X,
  Globe,
  FileBarChart,
  Shield,
  Eye,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

// Navigation item definitions (labels will be translated)
const agentNavKeys = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/sales', icon: ShoppingCart, labelKey: 'nav.sales' },
  { to: '/income', icon: DollarSign, labelKey: 'nav.income' },
  { to: '/team', icon: Users, labelKey: 'nav.team' },
  { to: '/campaigns', icon: Megaphone, labelKey: 'nav.campaigns' },
  { to: '/trophies', icon: Trophy, labelKey: 'nav.trophies' },
  { to: '/profile', icon: User, labelKey: 'nav.profile' },
]

const adminNavKeys = [
  { to: '/admin', icon: LayoutDashboard, labelKey: 'admin.globalDashboard' },
  { to: '/admin/users', icon: Users, labelKey: 'admin.users' },
  { to: '/admin/mundo', icon: Globe, labelKey: 'nav.world' },
  { to: '/admin/campaigns', icon: Megaphone, labelKey: 'nav.campaigns' },
  { to: '/admin/reports', icon: FileBarChart, labelKey: 'admin.weeklyReport', placeholder: true },
]

export function Sidebar() {
  const { t } = useTranslation()
  const { user, isAdmin, isImpersonating, impersonatedUser, stopImpersonation, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'admin' | 'agent'>('admin')

  // When impersonating, always show agent view
  const effectiveViewMode = isImpersonating ? 'agent' : viewMode
  const displayUser = isImpersonating ? impersonatedUser : user

  // Determine which nav items to show
  const showAdminNav = isAdmin && effectiveViewMode === 'admin' && !isImpersonating

  const NavItem = ({
    to,
    icon: Icon,
    labelKey,
    placeholder = false,
  }: {
    to: string
    icon: typeof LayoutDashboard
    labelKey: string
    placeholder?: boolean
  }) => (
    <NavLink
      to={placeholder ? '#' : to}
      onClick={(e) => {
        if (placeholder) {
          e.preventDefault()
        } else {
          setMobileOpen(false)
        }
      }}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          placeholder && 'cursor-not-allowed opacity-50',
          isActive && !placeholder
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )
      }
    >
      <Icon className="h-4 w-4" />
      {t(labelKey)}
      {placeholder && (
        <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0">
          {t('common.loading').replace('...', '')}
        </Badge>
      )}
    </NavLink>
  )

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        <span className="text-xl font-bold text-primary">Pakoa</span>
        {isAdmin && !isImpersonating && (
          <Badge variant={effectiveViewMode === 'admin' ? 'default' : 'secondary'} className="text-xs">
            {effectiveViewMode === 'admin' ? 'Admin' : t('admin.users')}
          </Badge>
        )}
      </div>

      {/* User Info */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className={isImpersonating ? 'ring-2 ring-amber-500' : ''}>
            <AvatarImage src={displayUser?.avatarUrl} />
            <AvatarFallback className={isImpersonating ? 'bg-amber-100 text-amber-800' : ''}>
              {displayUser?.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{displayUser?.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {displayUser?.email}
            </p>
          </div>
        </div>

        {/* Impersonation indicator */}
        {isImpersonating && (
          <div className="mt-3 rounded-md bg-amber-500/10 p-2 border border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-600">
              <Eye className="h-4 w-4" />
              <span className="text-xs font-medium">{t('admin.viewingAs')}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full h-7 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-500/20"
              onClick={stopImpersonation}
            >
              {t('admin.exitImpersonation')}
            </Button>
          </div>
        )}

        {/* Admin/Agent view toggle */}
        {isAdmin && !isImpersonating && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full text-xs"
            onClick={() => setViewMode(viewMode === 'admin' ? 'agent' : 'admin')}
          >
            <ChevronRight className="h-3 w-3 mr-1" />
            {viewMode === 'admin' ? t('admin.viewAsUser') : t('admin.title')}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {showAdminNav ? (
          <>
            <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
              <Shield className="h-3 w-3" />
              {t('admin.title')}
            </p>
            {adminNavKeys.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </>
        ) : (
          <>
            <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
              {t('nav.dashboard')}
            </p>
            {agentNavKeys.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          {t('nav.logout')}
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-3 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-sidebar transition-transform md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
