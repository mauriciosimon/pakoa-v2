import { MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAssistant } from '@/contexts/AssistantContext'
import { cn } from '@/lib/utils'

export function AssistantButton() {
  const { isOpen, toggleAssistant } = useAssistant()

  return (
    <Button
      onClick={toggleAssistant}
      size="lg"
      className={cn(
        'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-200',
        'hover:scale-105 hover:shadow-xl',
        isOpen
          ? 'bg-muted text-muted-foreground hover:bg-muted/80'
          : 'bg-primary text-primary-foreground hover:bg-primary/90'
      )}
      aria-label={isOpen ? 'Cerrar asistente' : 'Abrir asistente'}
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <MessageCircle className="h-6 w-6" />
      )}
    </Button>
  )
}
