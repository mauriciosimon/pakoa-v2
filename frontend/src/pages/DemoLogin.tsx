import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function DemoLogin() {
  const navigate = useNavigate()
  const { loginAsAgent } = useAuth()

  useEffect(() => {
    // Auto-login as María and redirect to profile
    loginAsAgent()
    navigate('/profile', { replace: true })
  }, [loginAsAgent, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Cargando...</p>
    </div>
  )
}
