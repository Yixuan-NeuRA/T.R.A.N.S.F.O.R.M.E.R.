import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/useGameStore'
import { COLLAPSE } from '../systems/collapse'
import { THEME_CONFIGS } from '../systems/themeSystem'
import { useGlitch } from '../systems/glitch'
import { distortLogList, glitchClass } from '../systems/distortion'
import { maskLogList } from '../systems/existential'
import { useT } from '../systems/i18n'

export default function Terminal() {
  const log = useGameStore((s) => s.log)
  const burnout = useGameStore((s) => s.burnout)
  const meaning = useGameStore((s) => s.meaning)
  const graduated = useGameStore((s) => s.graduated)
  const collapsePhase = useGameStore((s) => s.collapsePhase)
  const uiTheme = useGameStore((s) => s.uiTheme)
  const tick = useGlitch((s) => s.tick)
  const theme = THEME_CONFIGS[uiTheme]
  const { t } = useT()

  // Only the recent tail is rendered/processed — keeps the per-tick distortion
  // cost bounded no matter how long the session runs.
  const recent = log.slice(-150)

  // After graduation the log is final and calm (no distortion / no masking).
  // Otherwise: burnout distortion FIRST, then the meaning interpretation layer.
  const distBurnout = graduated ? 0 : burnout
  const shown = graduated
    ? recent
    : maskLogList(distortLogList(recent, distBurnout, tick), meaning, tick)
  const frozen = collapsePhase >= COLLAPSE.SHUTDOWN

  // Auto-scroll to the newest line whenever the log grows.
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [log.length])

  return (
    <div
      className={`flex h-44 flex-col border-t border-neutral-800 bg-black ${
        frozen ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2 border-b border-neutral-900 bg-neutral-950 px-3">
        <span
          className={`border-b-2 ${theme.accentBorder} px-2 py-1 font-mono text-[11px] text-neutral-200`}
        >
          {theme.terminalLabel}
        </span>
        <span className="px-2 py-1 font-mono text-[11px] text-neutral-600">Log</span>
      </div>
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto px-4 py-2 ${glitchClass(distBurnout)}`}
      >
        <div className="space-y-0.5">
          {shown.map((entry, i) => (
            <div key={i} className={`font-mono text-xs ${theme.accentText}`}>
              <span className="text-neutral-600">{theme.logPrefix}</span>
              {t(entry)}
            </div>
          ))}
          {!frozen && (
            <div className="font-mono text-xs text-neutral-200">
              <span className="text-neutral-600">{theme.logPrefix}</span>
              <span className="animate-pulse">▋</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
