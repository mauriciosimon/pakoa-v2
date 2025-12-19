import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  Users,
  Megaphone,
  User,
  Settings,
  Package,
  RefreshCcw,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const mainNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sales', icon: ShoppingCart, label: 'Ventas' },
  { to: '/income', icon: DollarSign, label: 'Ingresos' },
  { to: '/team', icon: Users, label: 'Mi Equipo' },
  { to: '/campaigns', icon: Megaphone, label: 'Campañas' },
  { to: '/profile', icon: User, label: 'Perfil' },
]

const adminNavItems = [
  { to: '/admin/users', icon: Users, label: 'Usuarios' },
  { to: '/admin/products', icon: Package, label: 'Productos' },
  { to: '/admin/cycles', icon: RefreshCcw, label: 'Ciclos' },
]

export function Sidebar() {
  const { user, isAdmin, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavItem = ({
    to,
    icon: Icon,
    label,
  }: {
    to: string
    icon: typeof LayoutDashboard
    label: string
  }) => (
    <NavLink
      to={to}
      onClick={() => setMobileOpen(false)}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  )

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-xl font-bold text-primary">Pakoa</span>
      </div>

      {/* User Info */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback>
              {user?.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
          Principal
        </p>
        {mainNavItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase text-muted-foreground">
              Administración
            </p>
            {adminNavItems.map((item) => (
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
          <Settings className="h-4 w-4" />
          Cerrar Sesión
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
