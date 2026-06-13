import { useGameStore } from '../store/useGameStore'
import { THEME_CONFIGS } from '../systems/themeSystem'
import { useLang } from '../systems/i18n'
import LangToggle from './LangToggle'

const MENUS = ['File', 'Edit', 'View', 'Run', 'Kernel', 'Tabs', 'Settings', 'Help']

export default function MenuBar() {
  const uiTheme = useGameStore((s) => s.uiTheme)
  const theme = THEME_CONFIGS[uiTheme]
  useLang((s) => s.lang) // re-render on language change

  return (
    <div className="flex items-center border-b border-neutral-800 bg-neutral-950 px-3 py-1">
      <span className="mr-3 flex items-center gap-1 font-semibold text-neutral-200">
        <span className={theme.accentText}>{theme.brandIcon}</span>
        <span className="font-mono text-sm">{theme.brand}</span>
      </span>
      {MENUS.map((m) => (
        <button
          key={m}
          className="rounded px-2 py-0.5 text-xs text-neutral-300 transition-colors hover:bg-neutral-800"
        >
          {m}
        </button>
      ))}
      <div className="ml-auto">
        <LangToggle />
      </div>
    </div>
  )
}
