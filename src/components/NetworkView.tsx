import { useGameStore } from '../store/useGameStore'
import { collabLabel, influenceLabel } from '../systems/networkSystem'
import { fieldRank } from '../systems/rivalSystem'
import { rapportLabel } from '../systems/mentorSystem'
import { useT } from '../systems/i18n'

// Minimal, non-intrusive "Network View". Shows qualitative standings + a simple
// citation graph (nodes sized by citations). Raw influence/strength stay hidden.
export default function NetworkView() {
  const papers = useGameStore((s) => s.papers)
  const influence = useGameStore((s) => s.influence)
  const collab = useGameStore((s) => s.collab)
  const rivals = useGameStore((s) => s.rivals)
  const rapport = useGameStore((s) => s.rapport)

  const accepted = papers.filter((p) => p.verdict === 'Accept')
  const maxCit = Math.max(1, ...accepted.map((p) => p.citations ?? 0))
  const { t } = useT()

  return (
    <div className="flex w-64 shrink-0 flex-col overflow-y-auto border-l border-neutral-800 bg-neutral-950 p-3">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
        {t('Network View')}
      </div>

      <div className="mb-3 space-y-1 font-mono text-[11px] text-neutral-300">
        <div>
          {t('Influence')}:{' '}
          <span className="text-emerald-400">{t(influenceLabel(influence))}</span>
        </div>
        <div>
          {t('Collaboration')}:{' '}
          <span className="text-sky-400">{t(collabLabel(collab))}</span>
        </div>
        <div>
          {t('Advisor')}:{' '}
          <span className="text-amber-400">{t(rapportLabel(rapport))}</span>
        </div>
      </div>

      <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
        {t('Citation graph')}
      </div>
      {accepted.length === 0 ? (
        <div className="font-mono text-[11px] text-neutral-600">{t('# no accepted work yet')}</div>
      ) : (
        <div className="space-y-2">
          {accepted.map((p) => (
            <div key={p.id}>
              <div className="flex justify-between font-mono text-[10px] text-neutral-400">
                <span className="truncate">
                  ◉ {p.id} @ {p.venue}
                </span>
                <span>{p.citations ?? 0}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${Math.min(100, ((p.citations ?? 0) / maxCit) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* E — standing among rival labs (qualitative only) */}
      {rivals.length > 0 && (
        <>
          <div className="mt-3 mb-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            {t('Field standing')}
          </div>
          <div className="space-y-0.5 font-mono text-[11px]">
            {[
              { name: t('You'), influence, you: true },
              ...rivals.map((r) => ({ ...r, you: false })),
            ]
              .sort((a, b) => b.influence - a.influence)
              .map((e, i) => (
                <div
                  key={e.name}
                  className={`flex justify-between ${
                    e.you ? 'text-emerald-400' : 'text-neutral-500'
                  }`}
                >
                  <span className="truncate">
                    #{i + 1} {e.name}
                  </span>
                  {e.you && <span>◄</span>}
                </div>
              ))}
          </div>
          <div className="mt-1 font-mono text-[10px] text-neutral-600">
            {t('Rank')} #{fieldRank(influence, rivals)} / {rivals.length + 1}
          </div>
        </>
      )}

      <div className="mt-3 font-mono text-[10px] leading-relaxed text-neutral-600">
        {t('Cited work attracts more citations; influence eases future review.')}
      </div>
    </div>
  )
}
