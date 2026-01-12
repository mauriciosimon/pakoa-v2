import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Send, Trash2, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAssistant } from '@/contexts/AssistantContext'
import { MessageBubble, TypingIndicator } from './MessageBubble'
import { cn } from '@/lib/utils'
import type { QuickAction } from '@/types/assistant'

export function AssistantPanel() {
  const { t } = useTranslation()
  const { isOpen, messages, isLoading, closeAssistant, sendMessage, clearConversation } = useAssistant()

  // Quick action buttons - translated
  const quickActions: QuickAction[] = [
    { label: t('assistant.askAboutLlave'), message: t('assistant.askAboutLlave') },
    { label: t('assistant.askAboutCommissions'), message: t('assistant.askAboutCommissions') },
    { label: t('assistant.askAboutTeam'), message: t('assistant.askAboutTeam') },
  ]
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const message = inputValue.trim()
    setInputValue('')
    await sendMessage(message)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as FormEvent)
    }
  }

  const handleQuickAction = async (action: QuickAction) => {
    if (isLoading) return
    await sendMessage(action.message)
  }

  if (!isOpen) return null

  return (
    <div
      className={cn(
        'fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)]',
        'bg-background border rounded-2xl shadow-2xl',
        'flex flex-col overflow-hidden',
        'animate-in slide-in-from-bottom-4 fade-in duration-200'
      )}
      style={{ height: 'min(600px, calc(100vh - 140px))' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{t('assistant.title')}</h3>
            <p className="text-xs text-muted-foreground">{t('assistant.name')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={clearConversation}
              title={t('common.delete')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={closeAssistant}
            title={t('common.close')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h4 className="font-medium mb-1">{t('assistant.greeting')}</h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
              {t('assistant.description')}
            </p>

            {/* Quick Actions */}
            <div className="space-y-2 w-full max-w-[280px]">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action)}
                  disabled={isLoading}
                  className={cn(
                    'w-full px-4 py-2.5 text-sm text-left rounded-lg border',
                    'bg-background hover:bg-muted transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Quick Actions (when there are messages) */}
      {messages.length > 0 && !isLoading && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickAction(action)}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 text-xs rounded-full border',
                'bg-background hover:bg-muted transition-colors'
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-muted/30">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('assistant.inputPlaceholder')}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
