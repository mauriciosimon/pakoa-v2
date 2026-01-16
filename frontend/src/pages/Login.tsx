import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from '@/contexts/ThemeContext'

// Demo credentials
const DEMO_USERS = {
  'admin@pakoa.com': { password: 'admin123', type: 'admin' as const },
  'maria@pakoa.com': { password: 'maria123', type: 'agent' as const },
}

export function Login() {
  const navigate = useNavigate()
  const { loginAsAdmin, loginAsAgent } = useAuth()
  const { resolvedTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const user = DEMO_USERS[email.toLowerCase() as keyof typeof DEMO_USERS]

    if (!user) {
      setError('Usuario no encontrado')
      return
    }

    if (user.password !== password) {
      setError('Contrasena incorrecta')
      return
    }

    if (user.type === 'admin') {
      loginAsAdmin()
    } else {
      loginAsAgent()
    }

    navigate('/profile')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src={resolvedTheme === 'dark' ? '/images/branding/logo-dark.png' : '/images/branding/logo-light.png'}
              alt="PAKOA"
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-2xl">Iniciar Sesion</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Correo electronico</label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Contrasena</label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Iniciar Sesion
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Credenciales de demo:
            </p>
            <div className="space-y-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <div>
                <span className="font-medium">Admin:</span> admin@pakoa.com / admin123
              </div>
              <div>
                <span className="font-medium">Agente:</span> maria@pakoa.com / maria123
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
