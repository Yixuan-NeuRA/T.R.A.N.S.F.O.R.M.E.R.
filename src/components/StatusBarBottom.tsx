import { useGameStore } from '../store/useGameStore'
import { burnoutTier, TIER_NAMES } from '../systems/distortion'
import { THEME_CONFIGS } from '../systems/themeSystem'
import { CAREER_CONFIGS } from '../systems/careerSystem'
import { useT } from '../systems/i18n'

export default function StatusBarBottom() {
  const burnout = useGameStore((s) => s.burnout)
  const graduated = useGameStore((s) => s.graduated)
  const uiTheme = useGameStore((s) => s.uiTheme)
  const careerPath = useGameStore((s) => s.careerPath)
  const theme = THEME_CONFIGS[uiTheme]
  const career = careerPath ? CAREER_CONFIGS[careerPath] : null
  const tier = burnoutTier(burnout)
  const { t } = useT()

  if (graduated) {
    return (
      <div className="flex items-center justify-between border-t border-neutral-800 bg-[#0f0f10] px-3 py-0.5 font-mono text-[10px] text-neutral-600">
        <div className="flex items-center gap-3">
          <span>{t('Archived')}</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-700" />
            {t('kernel: terminated')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>{theme.notebookFile} (read-only)</span>
          <span>{t('No Kernel')}</span>
        </div>
      </div>
    )
  }

  const dot =
    tier === 0
      ? 'bg-emerald-500'
      : tier === 1
        ? 'bg-emerald-400'
        : tier === 2
          ? 'bg-amber-400'
          : 'bg-red-500 animate-pulse'

  return (
    <div className="flex items-center justify-between border-t border-neutral-800 bg-[#0f0f10] px-3 py-0.5 font-mono text-[10px] text-neutral-500">
      <div className="flex items-center gap-3">
        {career && <span>{t(career.label)}</span>}
        <span>Mode: Command ⌨</span>
        <span className="flex items-center gap-1">
          <span className={`h-2 w-2 rounded-full ${dot}`} />
          {tier === 0
            ? t('kernel: healthy')
            : t(`kernel: ${TIER_NAMES[tier].toLowerCase()}`)}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span>Ln 1, Col 1</span>
        <span>{theme.notebookFile}</span>
        <span>{theme.notebookKernel}</span>
      </div>
    </div>
  )
}
