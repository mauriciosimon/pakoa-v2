import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WorldMap } from '@/components/WorldMap'
import { Globe } from 'lucide-react'

export function World() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Globe className="h-6 w-6" />
          Mundo
        </h1>
        <p className="text-muted-foreground">
          Visualización radial del árbol completo de usuarios
        </p>
      </div>

      {/* World Map */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa Global</CardTitle>
          <CardDescription>
            Vista completa de la red de distribución. Haz clic en un nodo para ver detalles.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <WorldMap />
        </CardContent>
      </Card>
    </div>
  )
}
