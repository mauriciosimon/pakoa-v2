/**
 * LanguageSwitcher - Toggle between Spanish and English
 */
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const languages = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
] as const

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'es'

  const toggleLanguage = () => {
    const newLang = currentLang === 'es' ? 'en' : 'es'
    i18n.changeLanguage(newLang)
  }

  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0]

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2"
      title={currentLang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
      <span className="sm:hidden">{currentLanguage.flag}</span>
    </Button>
  )
}

// Compact version for mobile or tight spaces
export function LanguageSwitcherCompact() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'es'

  const toggleLanguage = () => {
    const newLang = currentLang === 'es' ? 'en' : 'es'
    i18n.changeLanguage(newLang)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-1 text-xs font-medium"
    >
      <span className={cn(currentLang === 'es' ? 'text-foreground' : 'text-muted-foreground')}>
        ES
      </span>
      <span className="text-muted-foreground">|</span>
      <span className={cn(currentLang === 'en' ? 'text-foreground' : 'text-muted-foreground')}>
        EN
      </span>
    </Button>
  )
}
