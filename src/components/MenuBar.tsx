import { useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import { THEME_CONFIGS } from '../systems/themeSystem'
import { useT } from '../systems/i18n'
import { panelsInMenu } from '../systems/panels'
import LangToggle from './LangToggle'

const MENUS = ['File', 'Edit', 'View', 'Run', 'Kernel', 'Tabs', 'Settings', 'Help']

export default function MenuBar() {
  const uiTheme = useGameStore((s) => s.uiTheme)
  const openPanels = useGameStore((s) => s.openPanels)
  const togglePanel = useGameStore((s) => s.togglePanel)
  const theme = THEME_CONFIGS[uiTheme]
  const { t } = useT()

  // Which menu's dropdown is currently open (null = none).
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="relative flex items-center border-b border-neutral-800 bg-neutral-950 px-3 py-1">
      <span className="mr-3 flex items-center gap-1 font-semibold text-neutral-200">
        <span className={theme.accentText}>{theme.brandIcon}</span>
        <span className="font-mono text-sm">{theme.brand}</span>
      </span>

      {MENUS.map((m) => {
        const panels = panelsInMenu(m)
        const isOpen = open === m
        return (
          <div key={m} className="relative">
            <button
              onClick={() =>
                setOpen((cur) => (cur === m ? null : panels.length ? m : null))
              }
              className={`rounded px-2 py-0.5 text-xs transition-colors hover:bg-neutral-800 ${
                isOpen ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-300'
              }`}
            >
              {m}
            </button>

            {isOpen && panels.length > 0 && (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-44 rounded-md border border-neutral-700 bg-neutral-950 py-1 shadow-xl">
                {panels.map((p) => {
                  const active = openPanels.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        togglePanel(p.id)
                        setOpen(null)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1 text-left font-mono text-[11px] text-neutral-300 hover:bg-neutral-800"
                    >
                      <span className="w-3 text-emerald-400">
                        {active ? '✓' : ''}
                      </span>
                      <span className="flex-1">{t(p.title)}</span>
                      {p.shortcut && (
                        <span className="text-[9px] text-neutral-600">
                          {p.shortcut}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      <div className="ml-auto">
        <LangToggle />
      </div>

      {/* Click-away backdrop to dismiss an open dropdown. */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(null)} />
      )}
    </div>
  )
}
