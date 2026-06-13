import { RESOURCE_KEYS, useGameStore } from '../store/useGameStore'
import { useTuning } from '../systems/tuning'
import { CAREER_CONFIGS } from '../systems/careerSystem'
import { COLLAPSE } from '../systems/collapse'
import { useGlitch } from '../systems/glitch'
import { capacityLabel, distortValue, glitchClass } from '../systems/distortion'
import { fundingLabel } from '../systems/fundingSystem'
import { useT } from '../systems/i18n'

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
        {label}
      </span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="w-9 font-mono text-[10px] text-neutral-300">{value}%</span>
    </div>
  )
}

export default function StatusPanel() {
  const s = useGameStore()
  const tick = useGlitch((g) => g.tick)
  const maxActions = useTuning((t) => t.maxActionsPerDay)
  const actionsLeft = Math.max(0, maxActions - s.currentDayActions)
  const { t, lang } = useT()
  const career = s.careerPath ? CAREER_CONFIGS[s.careerPath] : null
  const gradTarget =
    career && Number.isFinite(career.acceptedPapersRequired)
      ? `${s.graduationProgress}/${career.acceptedPapersRequired}`
      : `${s.graduationProgress}/∞`

  // Phase 3 (Identity Compression): all metrics merge into one record.
  if (s.collapsePhase >= COLLAPSE.COMPRESSION) {
    return (
      <div className="flex items-center gap-3 border-b border-neutral-800 bg-neutral-950 px-4 py-2 opacity-80">
        <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
          ACADEMIC RECORD
        </span>
        <span className="font-mono text-[10px] text-neutral-600">
          [read-only]
        </span>
        <span className="ml-auto font-mono text-[10px] text-neutral-500">
          🎓 Degree Conferred · Master Student
        </span>
      </div>
    )
  }

  // During earlier collapse phases the system goes calm — distortion stops.
  const distBurnout = s.graduated ? 0 : s.burnout
  // Phase 10: burnout is NOT shown as a number. Only operational resources
  // (focus/energy) appear; burnout manifests via distortion + narrative.
  const labelSwap = !s.graduated && s.burnout >= 30 && tick % 6 === 0
  const meterDefs = [
    { label: labelSwap ? 'Mem' : 'CPU', value: distortValue(s.focus, 'm0', distBurnout, tick) },
    { label: labelSwap ? 'CPU' : 'Mem', value: distortValue(s.energy, 'm1', distBurnout, tick) },
  ]

  return (
    <div
      className={`flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-neutral-800 bg-neutral-950 px-4 py-2 ${glitchClass(
        distBurnout,
      )}`}
    >
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="h-3 w-3 rounded-full bg-yellow-500" />
        <span className="h-3 w-3 rounded-full bg-green-500" />
        <span className="ml-1 font-mono text-xs text-neutral-400">
          system_monitor.py
        </span>
      </div>

      {career && (
        <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-[10px] text-neutral-300">
          {t(career.label)}
        </span>
      )}
      <span className="font-mono text-xs text-neutral-200">
        {lang === 'zh' ? `第 ${s.day} 天` : `Day ${s.day}`}
      </span>
      <span className="font-mono text-[10px] text-neutral-500">
        {lang === 'zh' ? `(剩余 ${actionsLeft} 次)` : `(${actionsLeft} actions left)`}
      </span>

      {/* Qualitative capacity (no number) — how close to collapse you feel */}
      <span
        className="flex items-center gap-1 font-mono text-[10px] text-neutral-400"
        title={t('Researcher capacity')}
      >
        <span className={`h-2 w-2 rounded-full ${capacityLabel(s.burnout).dot}`} />
        {t(capacityLabel(s.burnout).label)}
      </span>

      {/* Qualitative funding (no number) */}
      <span
        className="flex items-center gap-1 font-mono text-[10px] text-neutral-400"
        title={t('Funding')}
      >
        <span className={`h-2 w-2 rounded-full ${fundingLabel(s.funding).dot}`} />
        💰 {t(fundingLabel(s.funding).label)}
      </span>

      {meterDefs.map((m, i) => (
        <Bar key={i} label={m.label} value={m.value} />
      ))}

      <div className="flex items-center gap-2.5 font-mono text-[10px] text-neutral-300">
        {RESOURCE_KEYS.map((k) => (
          <span key={k}>
            <span className="text-neutral-500">{k}</span>{' '}
            {distortValue(s[k], 'r-' + k, distBurnout, tick)}
          </span>
        ))}
      </div>

      <button
        onClick={s.toggleNetwork}
        className={`ml-auto rounded px-2 py-0.5 font-mono text-[10px] transition-colors ${
          s.showNetwork
            ? 'bg-neutral-800 text-sky-300'
            : 'text-neutral-400 hover:bg-neutral-800'
        }`}
      >
        🕸 {t('Network')}
      </button>
      <span className="font-mono text-[10px] text-emerald-400">
        🎓 {gradTarget}
        {s.graduated ? ' ✓' : ''}
      </span>
    </div>
  )
}
