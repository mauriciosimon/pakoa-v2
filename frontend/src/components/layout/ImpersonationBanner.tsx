import { Eye, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export function ImpersonationBanner() {
  const { isImpersonating, impersonatedUser, originalAdmin, stopImpersonation } = useAuth()

  if (!isImpersonating || !impersonatedUser) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 py-2 px-4 md:pl-68">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5" />
          <span className="text-sm font-medium">
            <span className="hidden sm:inline">{originalAdmin?.name} </span>
            viendo como:{' '}
            <span className="font-bold">{impersonatedUser.name}</span>
            <span className="hidden md:inline text-amber-800"> ({impersonatedUser.email})</span>
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-amber-950 hover:bg-amber-600 hover:text-amber-950"
          onClick={stopImpersonation}
        >
          <X className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Salir</span>
        </Button>
      </div>
    </div>
  )
}
