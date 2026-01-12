import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import { useTranslation } from 'react-i18next'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const icons = {
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
    system: <Monitor className="h-4 w-4" />,
  }

  const labels = {
    light: t('theme.light'),
    dark: t('theme.dark'),
    system: t('theme.system'),
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      title={labels[theme]}
      className="h-8 w-8"
    >
      {icons[theme]}
      <span className="sr-only">{t('theme.toggle')}</span>
    </Button>
  )
}
