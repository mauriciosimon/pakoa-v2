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
import { User, Mail, Phone, Calendar, Shield, Trophy } from 'lucide-react'

// Mock achievements
const mockUserAchievements = [
  { name: 'Primera Venta', icon: '🎯', earnedAt: '2024-01-15' },
  { name: 'Activado', icon: '⚡', earnedAt: '2024-02-01' },
  { name: 'Club 5K', icon: '💎', earnedAt: '2024-06-15' },
]

export function Profile() {
  const { user } = useAuth()

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Gestiona tu información personal y configuración
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user?.name}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Badge variant={user?.isActive ? 'success' : 'secondary'}>
                {user?.isActive ? 'Cuenta Activa' : 'Por Activar'}
              </Badge>
              {user?.role === 'admin' && (
                <Badge variant="default">
                  <Shield className="mr-1 h-3 w-3" />
                  Admin
                </Badge>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Miembro desde{' '}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                    })
                  : 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="h-4 w-4" />
                {mockUserAchievements.length} logros obtenidos
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                ${user?.totalRevenue?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-muted-foreground">Ingresos totales</p>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
            <CardDescription>
              Actualiza tu información de contacto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      defaultValue={user?.name}
                      placeholder="Tu nombre"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      type="email"
                      defaultValue={user?.email}
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      defaultValue={user?.phone || ''}
                      placeholder="+52 555 123 4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    URL de Avatar (opcional)
                  </label>
                  <Input
                    defaultValue={user?.avatarUrl || ''}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">Guardar Cambios</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Mis Logros
            </CardTitle>
            <CardDescription>Badges y reconocimientos obtenidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockUserAchievements.map((achievement) => (
                <div
                  key={achievement.name}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <span className="text-4xl">{achievement.icon}</span>
                  <div>
                    <p className="font-medium">{achievement.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Obtenido el{' '}
                      {new Date(achievement.earnedAt).toLocaleDateString(
                        'es-MX'
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguridad
            </CardTitle>
            <CardDescription>
              Configura tu contraseña y opciones de seguridad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Contraseña Actual
                  </label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nueva Contraseña</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Confirmar Contraseña
                  </label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="outline">
                  Cambiar Contraseña
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
