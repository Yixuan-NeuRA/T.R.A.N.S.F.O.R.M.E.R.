import { useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import { useTuning } from '../systems/tuning'
import { getLocation } from '../systems/locationSystem'
import { IMPROVE_COST } from '../systems/paperSystem'
import { CAREER_CONFIGS } from '../systems/careerSystem'
import {
  PUBLICATION_COMPONENTS,
  publicationTypesFor,
  findPublicationType,
  isTopTierPub,
} from '../systems/publicationSystem'
import { TIER_LABELS, TIERS, venuesFor } from '../systems/venueSystem'
import { isStale, maxDraftSlots } from '../systems/projectSystem'
import { THEME_CONFIGS, themePrompt } from '../systems/themeSystem'
import { COLLAPSE, FINAL_CODE } from '../systems/collapse'
import { getEnding } from '../systems/endings'
import { meaningTier } from '../systems/meaning'
import { compressNarrative } from '../systems/narrativeSystem'
import { useGlitch } from '../systems/glitch'
import {
  distortOutput,
  distortPaperField,
  distortReviewer,
  distortSupervisor,
  glitchClass,
  reorderCells,
} from '../systems/distortion'
import {
  driftReviewer,
  driftSupervisor,
  maskOutput,
  whyDoIWork,
} from '../systems/existential'
import { useT } from '../systems/i18n'
import NotebookCell from './NotebookCell'

export default function Notebook() {
  const s = useGameStore()
  const tick = useGlitch((g) => g.tick)
  const theme = THEME_CONFIGS[s.uiTheme]
  const career = s.careerPath ? CAREER_CONFIGS[s.careerPath] : null
  const { t } = useT()

  const [execCount, setExecCount] = useState(0)
  const [busyCell, setBusyCell] = useState<string | null>(null)
  const [cellState, setCellState] = useState<
    Record<string, { count: number; out: string }>
  >({})

  const { burnout, meaning, graduated, collapsePhase, careerPath, discipline } = s
  const distBurnout = graduated ? 0 : burnout

  const runCell = (key: string, action: () => void) => {
    if (busyCell || graduated) return
    setBusyCell(key)
    const before = useGameStore.getState().log.length
    action()
    const produced = useGameStore.getState().log.slice(before)
    const out = produced.join('\n') || '[no output]'
    const n = execCount + 1
    window.setTimeout(() => {
      setExecCount(n)
      setCellState((prev) => ({ ...prev, [key]: { count: n, out } }))
      setBusyCell(null)
    }, 180)
  }

  const codeCell = (
    cellKey: string,
    code: string,
    action: () => void,
    disabled = false,
  ) => {
    const st = cellState[cellKey]
    const running = busyCell === cellKey
    const inner = running ? '*' : st ? String(st.count) : ' '
    const prompt = themePrompt(theme, inner)
    let shownOut: string | undefined
    if (!running && st) {
      // Burnout distortion FIRST, then the meaning interpretation layer.
      const raw = graduated
        ? st.out
        : maskOutput(distortOutput(st.out, cellKey, distBurnout, tick), meaning, cellKey, tick)
      shownOut = theme.outputLabel ? `${theme.outputLabel}\n${raw}` : raw
    }
    return (
      <NotebookCell
        key={cellKey}
        type="code"
        prompt={prompt}
        code={code}
        output={shownOut}
        disabled={disabled || busyCell !== null || graduated}
        onRun={() => runCell(cellKey, action)}
      />
    )
  }

  const maxActions = useTuning((t) => t.maxActionsPerDay)
  const dayComplete = s.currentDayActions >= maxActions
  const location = getLocation(s.currentLocation)
  const drafts = s.papers.filter((p) => p.status === 'draft')
  const actionsLeft = Math.max(0, maxActions - s.currentDayActions)

  const actionCells = reorderCells(
    location.actions.map((a) =>
      codeCell(
        `loc.${a.id}`,
        `${location.label}.${a.id}()`,
        () => s.performAction(a.id),
        dayComplete,
      ),
    ),
    distBurnout,
    tick,
  )

  const bodyDim =
    collapsePhase >= COLLAPSE.SHUTDOWN
      ? 'opacity-40 pointer-events-none'
      : collapsePhase >= COLLAPSE.ARCHIVE
        ? 'opacity-70'
        : ''

  // Career-ending availability (thresholds come from the live tuning config).
  const T = useTuning((tn) => tn)
  const thesisEligible =
    career?.thesisRequired &&
    !s.thesisSubmitted &&
    s.graduationProgress >= T.phdPapers &&
    s.reputation >= T.phdRep
  const topPapers = s.papers.filter(isTopTierPub).length
  const facultyEligible =
    careerPath === 'postdoc' &&
    s.reputation >= T.postdocFacultyRep &&
    topPapers >= T.postdocFacultyTop
  // Distinguished: open to anyone whose influence becomes self-sustaining.
  const distinguishedEligible = !graduated && s.influence >= T.distinguishedInfluence
  // Extension: a late-game soft exit for a Master who hasn't graduated.
  const extensionEligible = !graduated && careerPath === 'master' && s.day > 20

  // Passive "Why do I work?" query (meaning layer).
  const query = !graduated ? whyDoIWork(meaning, tick) : null

  // Narrative Compression: structural interpretation of the current state.
  const narrative = !graduated
    ? compressNarrative({
        burnout,
        meaning,
        influence: s.influence,
        acceptedCount: s.papers.filter((p) => p.verdict === 'Accept').length,
        rejectionStreak: s.rejectionStreak,
      })
    : null

  // Final ending output.
  const ending = getEnding(s.endingId)
  const endingArbitrary =
    s.endingId !== 'erosion' && meaningTier(meaning) === 'low'

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-neutral-900">
      {/* tab bar */}
      <div className="flex items-center border-b border-neutral-800 bg-neutral-950">
        <div
          className={`flex items-center gap-2 border-r border-neutral-800 border-t-2 ${theme.accentBorder} bg-neutral-900 px-3 py-1.5`}
        >
          <span className="text-amber-400">▢</span>
          <span className="font-mono text-xs text-neutral-200">
            {theme.notebookFile}
          </span>
          <span className="text-neutral-600">✕</span>
        </div>
      </div>

      {/* toolbar */}
      <div className="flex items-center gap-1 border-b border-neutral-800 bg-neutral-950 px-2 py-1 text-neutral-400">
        {['💾', '＋', '✂', '⧉', '▶', '◼', '⟳'].map((ic, i) => (
          <span
            key={i}
            className={`rounded px-1.5 py-0.5 text-xs ${
              graduated ? 'opacity-40' : 'hover:bg-neutral-800'
            }`}
          >
            {ic}
          </span>
        ))}
        <span className="mx-1 text-neutral-700">|</span>
        <span className="rounded border border-neutral-700 px-2 py-0.5 font-mono text-[11px]">
          Code ▾
        </span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px]">
          <span
            className={`h-2 w-2 rounded-full ${
              graduated
                ? 'bg-red-600'
                : busyCell
                  ? 'animate-pulse bg-amber-400'
                  : 'bg-emerald-500'
            }`}
          />
          {graduated
            ? 'No Kernel · Terminated'
            : `${theme.notebookKernel} · ${busyCell ? 'Busy' : 'Idle'}`}
        </span>
      </div>

      {/* cells */}
      <div className={`flex-1 overflow-y-auto px-6 py-5 ${glitchClass(distBurnout)}`}>
        {/* Narrative Compression banner — structural interpretation, not story */}
        {narrative && (
          <div className="mb-4 rounded-md border-l-2 border-neutral-600 bg-neutral-950/70 px-4 py-2">
            <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">
              {t('system interpretation')}
            </div>
            <div className="mt-1 font-mono text-xs italic leading-relaxed text-neutral-400">
              {t(narrative)}
            </div>
          </div>
        )}

        {graduated && (
          <div className="mb-4 rounded-md border border-neutral-700 bg-neutral-950 px-4 py-3">
            <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-neutral-400">
              {`# ${t(ending.title)}\n# >>> ${t(ending.notice)}\n# >>> ${t('Finalizing academic record...')}\n# >>> ${t('Preparing system shutdown...')}`}
              {collapsePhase >= COLLAPSE.ARCHIVE &&
                '\n# ' + t('Archive mode — workspace is read-only.')}
            </div>
          </div>
        )}

        {/* passive existential query */}
        {query && (
          <NotebookCell type="markdown">
            {t(query)
              .split('\n')
              .map((l) => `# ${l}`)
              .join('\n')}
          </NotebookCell>
        )}

        <div className={bodyDim}>
          <NotebookCell type="markdown">
            {`# Day ${s.day} — 📂 ${location.label}\n# ${location.hint}\n# Modifier: ${t(s.dailyModifier.title)} (${t(s.dailyModifier.description)})\n# Actions left today: ${actionsLeft}`}
          </NotebookCell>

          {/* events stop after graduation; meaning + burnout both shape them */}
          {!graduated && s.supervisorAlert && (
            <>
              <NotebookCell type="markdown">
                {`# ⚠ ${t(driftSupervisor(distortSupervisor(s.supervisorAlert, burnout, tick), meaning, tick))}`}
              </NotebookCell>
              {codeCell(
                'supervisor.respond',
                'supervisor.respond()  # submit progress update',
                s.respondToSupervisor,
              )}
            </>
          )}
          {!graduated && s.reviewerComment && (
            <>
              <NotebookCell type="markdown">
                {`# 📝 ${t(driftReviewer(distortReviewer(s.reviewerComment, burnout, tick), meaning, tick))}`}
              </NotebookCell>
              {codeCell(
                'reviewer.address',
                'reviewer.address()  # address reviewer concerns',
                s.addressReviewer,
              )}
            </>
          )}

          {/* location actions */}
          <NotebookCell type="markdown">{`# --- ${location.label} actions ---`}</NotebookCell>
          {actionCells}

          {/* next day */}
          {!graduated && dayComplete && (
            <>
              <NotebookCell type="markdown">
                {`# ✅ Day ${s.day} complete. Run the next cell to advance.`}
              </NotebookCell>
              {codeCell(
                'kernel.next_day',
                'kernel.next_day()  # +10 focus, +15 energy, -5 burnout',
                s.nextDay,
              )}
            </>
          )}

          {/* publications — types are discipline-specific; drafts use project slots */}
          <NotebookCell type="markdown">{`# ===== Publications (${discipline}) — projects ${drafts.length}/${careerPath ? maxDraftSlots(careerPath) : 3} =====`}</NotebookCell>
          {discipline &&
            publicationTypesFor(discipline).map((t) =>
              codeCell(
                `pub.create.${t.id}`,
                `publications.new("${t.id}")  # ${t.label} · costs 2 ideas`,
                () => s.createPaperDraft(t.id),
              ),
            )}

          {drafts.map((p) => {
            const tLabel = discipline ? findPublicationType(discipline, p.type).label : p.type
            const f = (c: (typeof PUBLICATION_COMPONENTS)[number]) =>
              distortPaperField(p[c], `${p.id}.${c}`, distBurnout, tick)
            const revising = p.reviewStage === 'revising'
            const underReview = p.reviewStage === 'under_review'
            const statusTag = underReview
              ? ` — under review @ ${p.venue}`
              : revising
                ? ` — in revision @ ${p.venue}`
                : ''
            const age = s.day - (p.createdDay ?? s.day)
            const stale = discipline ? isStale(discipline, p, s.day) : false
            const meta = [
              `age ${age}d${stale ? ' · going stale' : ''}`,
              (p.rejections ?? 0) > 0 ? `rejected ${p.rejections}×` : '',
            ]
              .filter(Boolean)
              .join(' · ')
            return (
              <div key={p.id}>
                <NotebookCell type="markdown">
                  {`# ${p.id} : ${tLabel}${statusTag}\n# {idea:${f('idea')}, method:${f('method')}, results:${f('results')}, narrative:${f('narrative')}}  · ${meta}`}
                </NotebookCell>
                {underReview ? (
                  <NotebookCell type="markdown">
                    {`# ${t('⏳ awaiting decision... (advance days to hear back)')}`}
                  </NotebookCell>
                ) : revising ? (
                  <>
                    {(p.reviewerComments ?? []).map((cmt, i) => (
                      <NotebookCell key={`${p.id}.rc.${i}`} type="markdown">
                        {`# 📝 ${t(cmt)}`}
                      </NotebookCell>
                    ))}
                    {codeCell(
                      `${p.id}.revise`,
                      `${p.id}.revise()  # address reviews (costs focus/energy)`,
                      () => s.reviseSubmission(p.id),
                    )}
                    {p.rebutBonus === undefined &&
                      codeCell(
                        `${p.id}.rebut`,
                        `${p.id}.rebut()  # argue with the reviewers (once; faster round 2)`,
                        () => s.rebutSubmission(p.id),
                      )}
                    {codeCell(
                      `${p.id}.resubmit`,
                      `${p.id}.resubmit()  # send back — decision comes later`,
                      () => s.resubmit(p.id),
                    )}
                  </>
                ) : (
                  <>
                    {PUBLICATION_COMPONENTS.map((c) =>
                      codeCell(
                        `${p.id}.improve.${c}`,
                        `${p.id}.improve("${c}")  # +1 ${c}, costs 1 ${IMPROVE_COST[c]}`,
                        () => s.improvePaper(p.id, c),
                      ),
                    )}
                    {codeCell(
                      `${p.id}.abandon`,
                      `${p.id}.abandon()  # shelve this project (frees the slot)`,
                      () => s.abandonDraft(p.id),
                    )}
                    {discipline &&
                      TIERS.map((tier) => {
                        const vs = venuesFor(discipline).filter(
                          (v) => v.tier === tier && !p.rejectedVenues?.includes(v.name),
                        )
                        if (vs.length === 0) return null
                        return (
                          <div key={`${p.id}.tier${tier}`}>
                            <NotebookCell type="markdown">
                              {`# submit to — ${TIER_LABELS[tier]}`}
                            </NotebookCell>
                            {vs.map((v) =>
                              codeCell(
                                `${p.id}.submit.${v.name}`,
                                `${p.id}.submit_to("${v.name}")`,
                                () => s.submitToVenue(p.id, v.name),
                              ),
                            )}
                          </div>
                        )
                      })}
                  </>
                )}
              </div>
            )
          })}

          {/* A — Funding: apply for grants (slow, low odds, refills funding) */}
          {!graduated && (
            <>
              <NotebookCell type="markdown">{`# ===== Funding =====`}</NotebookCell>
              {s.grantDueDay !== null ? (
                <NotebookCell type="markdown">
                  {`# ${t('⏳ grant decision pending...')}`}
                </NotebookCell>
              ) : (
                codeCell(
                  'grants.apply',
                  'grants.apply()  # write a grant (slow · low odds · refills funding)',
                  () => s.applyForGrant(),
                )
              )}
            </>
          )}

          {/* career-specific termination paths */}
          {!graduated &&
            (thesisEligible ||
              distinguishedEligible ||
              extensionEligible ||
              careerPath === 'phd' ||
              careerPath === 'postdoc') && (
              <NotebookCell type="markdown">{`# ===== Career =====`}</NotebookCell>
            )}
          {!graduated &&
            thesisEligible &&
            codeCell('thesis.submit', 'thesis.submit()  # defend & graduate', s.submitThesis)}
          {!graduated &&
            facultyEligible &&
            codeCell(
              'career.faculty',
              'career.accept_faculty()  # secure a faculty position',
              () => s.chooseEnding('faculty'),
            )}
          {!graduated &&
            distinguishedEligible &&
            codeCell(
              'career.distinguished',
              'career.retire_distinguished()  # step back as a distinguished researcher',
              () => s.chooseEnding('distinguished'),
            )}
          {!graduated &&
            extensionEligible &&
            codeCell(
              'career.extension',
              'career.request_extension()  # defer graduation indefinitely',
              () => s.chooseEnding('extension'),
            )}
          {!graduated &&
            (careerPath === 'phd' || careerPath === 'postdoc') &&
            codeCell(
              'career.exit',
              'career.exit_academia()  # leave the system voluntarily',
              () => s.chooseEnding('exit'),
            )}
        </div>

        {/* final output cell */}
        {collapsePhase >= COLLAPSE.FINAL && (
          <div className="mt-6 border-t border-neutral-800 pt-6">
            <div className="mb-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
              {t(ending.title)}
            </div>
            <NotebookCell
              type="code"
              prompt={themePrompt(theme, '∞')}
              code={FINAL_CODE}
              disabled
              output={
                ending.lines.map((l) => t(l)).join('\n') +
                (endingArbitrary
                  ? '\n\n' + t('(it is difficult to feel the difference.)')
                  : '')
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}
