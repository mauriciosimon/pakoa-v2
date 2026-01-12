// Assistant Types

export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface AssistantConversation {
  messages: AssistantMessage[]
  isLoading: boolean
}

export interface QuickAction {
  label: string
  message: string
}

export interface UserContext {
  name: string
  hasLlave: boolean
  sales30d: number
  llavePercentage: number
  daysUntilWednesday: number
  team: {
    hijos: { total: number; withLlave: number }
    nietos: { total: number; withLlave: number }
    bisnietos: { total: number }
  }
  commissions: {
    total: number
    fromHijos: number
    fromNietos: number
    fromBisnietos: number
  }
  campaigns: {
    owned: number
    participating: number
    totalBudget: number
  }
  funnel: {
    prospectos: { count: number; value: number }
    cotizados: { count: number; value: number }
    agendados: { count: number; value: number }
    instalados: { count: number; value: number }
  }
  teamAtRisk: Array<{
    name: string
    relationship: string
    sales30d: number
    status: 'at_risk' | 'close_to_llave' | 'inactive'
  }>
}

export interface AssistantContextType {
  isOpen: boolean
  messages: AssistantMessage[]
  isLoading: boolean
  openAssistant: () => void
  closeAssistant: () => void
  toggleAssistant: () => void
  sendMessage: (content: string) => Promise<void>
  clearConversation: () => void
}
