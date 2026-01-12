import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { AssistantMessage, AssistantContextType } from '@/types/assistant'
import { useAuth } from '@/contexts/AuthContext'
import { sendAssistantMessage } from '@/services/assistantService'

const AssistantContext = createContext<AssistantContextType | undefined>(undefined)

export function AssistantProvider({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation()
  const { effectiveUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const openAssistant = useCallback(() => setIsOpen(true), [])
  const closeAssistant = useCallback(() => setIsOpen(false), [])
  const toggleAssistant = useCallback(() => setIsOpen(prev => !prev), [])

  const clearConversation = useCallback(() => {
    setMessages([])
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !effectiveUser) return

    // Add user message
    const userMessage: AssistantMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Send to API and get response with current language
      const reply = await sendAssistantMessage(
        content.trim(),
        messages,
        effectiveUser.id,
        i18n.language
      )

      // Add assistant message
      const assistantMessage: AssistantMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: reply,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)

      // Add error message
      const errorMessage: AssistantMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: t('assistant.errorMessage'),
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [effectiveUser, messages, i18n.language, t])

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        messages,
        isLoading,
        openAssistant,
        closeAssistant,
        toggleAssistant,
        sendMessage,
        clearConversation
      }}
    >
      {children}
    </AssistantContext.Provider>
  )
}

export function useAssistant() {
  const context = useContext(AssistantContext)
  if (context === undefined) {
    throw new Error('useAssistant must be used within an AssistantProvider')
  }
  return context
}
