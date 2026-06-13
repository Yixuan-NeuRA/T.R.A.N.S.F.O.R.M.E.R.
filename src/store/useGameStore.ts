import { create } from 'zustand'
import { rollDailyModifier, type DailyModifier } from '../systems/daySystem'
import { rollSupervisor } from '../systems/eventSystem'
import { IMPROVE_COST } from '../systems/paperSystem'
import { CAREER_CONFIGS, type CareerPath } from '../systems/careerSystem'
import { DISCIPLINE_CONFIGS, type Discipline } from '../systems/disciplineSystem'
import { type UiTheme } from '../systems/themeSystem'
import {
  isTopTierPub,
  publicationReviewerComment,
  weakestComponent,
  weightedScore,
} from '../systems/publicationSystem'
import {
  experienceBonus,
  maxDraftSlots,
  stalenessPenalty,
} from '../systems/projectSystem'
import { spawnRivals, tickRivals, type Rival } from '../systems/rivalSystem'
import { fundingCostMult } from '../systems/fundingSystem'
import {
  clampRapport,
  rapportFacultyDiscount,
  rapportReviewBonus,
  rapportSupervisorMult,
} from '../systems/mentorSystem'
import {
  disciplineFit,
  findVenue,
  latencyHint,
  reviewLatency,
  tierInfluence,
  tierMeaningGain,
  tierReward,
  tierSubmitBurnout,
} from '../systems/venueSystem'
import { runReview } from '../systems/reviewSystem'
import { citationGrowth, networkBonus } from '../systems/networkSystem'
import { rollEvent } from '../systems/randomEvents'
import { MEANING_START, clampMeaning, meaningTier } from '../systems/meaning'
import { compressNarrative } from '../systems/narrativeSystem'
import { ENDINGS } from '../systems/endings'
import { useTuning } from '../systems/tuning'
import type { LocationId } from '../systems/locationSystem'
import type { Paper, PaperComponent, ResourceKey } from '../types/paper'

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))
const nn = (n: number) => Math.max(0, Math.round(n)) // resources: 0+
const chance = (p: number) => Math.random() < p

// PHASE 10 — Universal Burnout Pressure. Every action carries a burnout cost
// EXCEPT the safe actions (rest / coffee). Costs are halved vs the old 3-action
// day, because you now get 6 lighter attempts per day.
const ACTION_STRESS: Record<string, number> = {
  // low stress
  read_papers: 1,
  think: 1,
  collect_data: 1,
  literature_review: 1,
  write_paper: 1,
  attend_talk: 1,
  // medium stress
  network: 2,
  reply_emails: 2,
  run_experiment: 2,
  // safe actions (decrease / stabilize)
  rest: -5,
  sleep: -10,
  coffee_break: -3,
}

export const RESOURCE_KEYS: ResourceKey[] = [
  'knowledge',
  'ideas',
  'data',
  'narrative',
  'reputation',
]

interface GameState {
  // Phase 1
  focus: number
  energy: number
  burnout: number
  log: string[]
  // Phase 2
  day: number
  currentDayActions: number
  supervisorAlert: string | null
  reviewerComment: string | null
  dailyModifier: DailyModifier
  experimentCount: number
  // Phase 3 — resources
  knowledge: number
  ideas: number
  data: number
  narrative: number
  reputation: number
  // Phase 3 — world & papers
  currentLocation: LocationId
  papers: Paper[]
  graduationProgress: number
  graduated: boolean
  // Phase 5 — collapse
  collapsePhase: number
  endingId: string | null
  // Phase 6 / 6.5 — configuration axes
  careerPath: CareerPath | null
  discipline: Discipline | null
  uiTheme: UiTheme
  rejectionStreak: number
  thesisSubmitted: boolean
  // Phase 7 — hidden meaning
  meaning: number
  // Phase 9 — hidden ecosystem scalars
  influence: number
  collab: number
  showNetwork: boolean
  // E — rival labs (hidden values; only ranking is shown)
  rivals: Rival[]
  fieldHeat: number
  // A — funding (hidden balance) / C — advisor rapport (hidden)
  funding: number
  grantDueDay: number | null
  rapport: number
  // Config actions
  selectConfig: (career: CareerPath, discipline: Discipline, theme: UiTheme) => void
  setTheme: (theme: UiTheme) => void
  // Actions
  setLocation: (loc: LocationId) => void
  performAction: (actionId: string) => void
  createPaperDraft: (type: string) => void
  improvePaper: (id: string, component: PaperComponent) => void
  submitToVenue: (id: string, venueName: string) => void
  reviseSubmission: (id: string) => void
  rebutSubmission: (id: string) => void
  resubmit: (id: string) => void
  abandonDraft: (id: string) => void
  applyForGrant: () => void
  toggleNetwork: () => void
  submitThesis: () => void
  chooseEnding: (kind: 'faculty' | 'exit' | 'distinguished' | 'extension') => void
  nextDay: () => void
  respondToSupervisor: () => void
  addressReviewer: () => void
  advanceCollapse: () => void
}

// Build the ending patch. Critical meaning overrides any ending with Erosion.
function makeEnding(
  baseId: string,
  meaning: number,
  log: string[],
): Partial<GameState> {
  const id =
    meaningTier(meaning) === 'critical' && baseId !== 'erosion' ? 'erosion' : baseId
  const e = ENDINGS[id] ?? ENDINGS.master_graduation
  return {
    graduated: true,
    endingId: id,
    collapsePhase: 1,
    supervisorAlert: null,
    reviewerComment: null,
    log: [
      ...log,
      e.notice,
      'Finalizing academic record...',
      'Preparing system shutdown...',
    ],
  }
}

// Detect whether the current (post-resolution) state triggers an ending.
// Returns an ending patch, or null if play continues. Shared by review
// resolution (nextDay) and voluntary endings.
function checkEndings(
  careerPath: CareerPath,
  graduationProgress: number,
  reputation: number,
  rejectionStreak: number,
  burnout: number,
  thesisSubmitted: boolean,
  meaning: number,
  log: string[],
): Partial<GameState> | null {
  const career = CAREER_CONFIGS[careerPath]
  const T = useTuning.getState()
  const streakLimit =
    careerPath === 'master'
      ? T.rejectionLimitMaster
      : careerPath === 'phd'
        ? T.rejectionLimitPhd
        : 0
  if (streakLimit > 0 && rejectionStreak >= streakLimit) {
    return makeEnding(
      careerPath === 'phd' ? 'phd_stagnation' : 'master_rejection_exit',
      meaning,
      log,
    )
  }
  if (burnout >= 100) {
    return makeEnding(
      careerPath === 'master'
        ? 'master_dropout'
        : careerPath === 'phd'
          ? 'phd_dropout'
          : 'postdoc_exit',
      meaning,
      log,
    )
  }
  const reqPapers = careerPath === 'master' ? T.masterPapers : T.phdPapers
  const reqRep = careerPath === 'master' ? T.masterRep : T.phdRep
  const meetsPapers = graduationProgress >= reqPapers
  const meetsRep = reputation >= reqRep
  const thesisOK = !career.thesisRequired || thesisSubmitted
  if (careerPath !== 'postdoc' && meetsPapers && meetsRep && thesisOK) {
    return makeEnding(
      careerPath === 'master' ? 'master_graduation' : 'phd_graduation',
      meaning,
      log,
    )
  }
  return null
}

export const useGameStore = create<GameState>((set) => ({
  focus: 100,
  energy: 100,
  burnout: 0,
  log: [],

  day: 1,
  currentDayActions: 0,
  supervisorAlert: null,
  reviewerComment: null,
  dailyModifier: rollDailyModifier(),
  experimentCount: 0,

  knowledge: 1,
  ideas: 2,
  data: 1,
  narrative: 1,
  reputation: 0,

  currentLocation: 'Laboratory',
  papers: [],
  graduationProgress: 0,
  graduated: false,

  collapsePhase: 0,
  endingId: null,

  careerPath: null, // null => start screen
  discipline: null,
  uiTheme: 'jupyter',
  rejectionStreak: 0,
  thesisSubmitted: false,

  meaning: MEANING_START,
  influence: 0,
  collab: 0,
  showNetwork: false,
  rivals: [],
  fieldHeat: 0,
  funding: 60,
  grantDueDay: null,
  rapport: 50,

  selectConfig: (career, discipline, theme) =>
    set((s) => ({
      careerPath: career,
      discipline,
      uiTheme: theme,
      meaning: useTuning.getState().meaningStart,
      funding: useTuning.getState().fundingStart,
      rapport: useTuning.getState().rapportStart,
      grantDueDay: null,
      rivals: spawnRivals(),
      log: [
        ...s.log,
        `Career: ${career} · Discipline: ${discipline} · UI: ${theme}`,
        `--- Day 1 ---`,
        `Modifier: ${s.dailyModifier.title} (${s.dailyModifier.description})`,
      ],
    })),

  setTheme: (theme) => set({ uiTheme: theme }),

  setLocation: (loc) =>
    set((s) =>
      s.graduated || !s.careerPath || loc === s.currentLocation
        ? s
        : { currentLocation: loc, log: [...s.log, `Moved to ${loc}`] },
    ),

  performAction: (actionId) =>
    set((s) => {
      if (s.graduated || !s.careerPath || !s.discipline) return s
      const T = useTuning.getState()
      if (s.currentDayActions >= T.maxActionsPerDay) return s
      const career = CAREER_CONFIGS[s.careerPath]

      let focus = s.focus
      let energy = s.energy
      let burnout = s.burnout
      let knowledge = s.knowledge
      let ideas = s.ideas
      let data = s.data
      let narrative = s.narrative
      let reputation = s.reputation
      let experimentCount = s.experimentCount
      let reviewerComment = s.reviewerComment
      let meaning = s.meaning
      let collab = s.collab
      let funding = s.funding
      let rapport = s.rapport
      const log = [...s.log]
      const mod = s.dailyModifier.id
      const costMult = fundingCostMult(s.discipline)

      switch (actionId) {
        case 'run_experiment': {
          let fc = 5
          let ec = 8
          if (mod === 'focused') {
            fc *= 0.5
            ec *= 0.5
          }
          if (mod === 'tired') ec *= 1.5
          focus -= fc
          energy -= ec
          funding -= T.experimentFundingCost * costMult
          experimentCount += 1
          if (chance(T.discoveryChance)) {
            // rare breakthrough — the big success
            meaning += 5
            data += 1
            log.push('Experiment — unexpected breakthrough! (+1 data, +meaning)')
          } else if (chance(T.gainSuccess)) {
            data += 1
            log.push('Experiment yielded usable data (+1 data)')
          } else {
            log.push('Experiment failed — no usable result.')
          }
          if (experimentCount % DISCIPLINE_CONFIGS[s.discipline].reviewEvery === 0) {
            reviewerComment = publicationReviewerComment(s.papers, s.discipline)
            log.push(reviewerComment)
            meaning -= 3 // excessive Reviewer #2 erodes meaning
          }
          break
        }
        case 'collect_data':
          focus -= 3
          energy -= 5
          if (chance(T.gainSuccess)) {
            data += 1
            log.push('Collected usable data (+1 data)')
          } else {
            log.push('Data collection came up empty.')
          }
          break
        case 'read_papers':
          focus -= 3
          energy -= 3
          if (chance(T.gainSuccess)) {
            knowledge += 1
            log.push('A paper proved useful (+1 knowledge)')
          } else {
            log.push('Read papers — nothing stuck.')
          }
          break
        case 'literature_review':
          focus -= 5
          energy -= 5
          if (chance(T.gainSuccess)) {
            ideas += 1
            log.push('Literature review sparked an idea (+1 idea)')
          } else {
            log.push('Literature review — no new ideas.')
          }
          break
        case 'write_paper':
          focus -= 5
          energy -= 5
          if (chance(T.gainSuccess)) {
            narrative += 1
            log.push('Wrote a usable section (+1 narrative)')
          } else {
            log.push('Wrote and deleted. Nothing usable.')
          }
          break
        case 'reply_emails':
          focus -= 3
          energy -= 3
          meaning -= 1 // low-impact task
          log.push('Replied to emails')
          break
        case 'attend_talk':
          focus -= 3
          energy -= 5
          if (chance(T.gainSuccess)) {
            ideas += 2
            log.push('A talk inspired you (+2 ideas)')
          } else {
            log.push('Attended a forgettable talk.')
          }
          break
        case 'network':
          focus -= 3
          energy -= 5
          if (chance(T.gainSuccess)) {
            reputation += 1
            if (chance(0.4)) {
              meaning += 2
              collab += 1 // collaboration network strengthens
              rapport += 2 // new collaborators warm the network
              log.push('Networked — a collaboration forms (+1 reputation)')
            } else {
              log.push('Networked (+1 reputation)')
            }
          } else {
            log.push('Networked — no connection made.')
          }
          break
        case 'sleep':
          focus += 20
          energy += 25
          log.push('Slept')
          break
        case 'rest':
          focus += 10
          energy += 10
          log.push('Rested')
          break
        case 'coffee_break': {
          let eg = 10
          let fg = 5
          if (mod === 'coffee') {
            eg *= 1.5
            fg *= 1.5
          }
          energy += eg
          focus += fg
          log.push('Coffee break taken')
          break
        }
        case 'think':
          focus += 3
          energy += 3
          if (chance(T.gainSuccess)) {
            ideas += 1
            log.push('Deep thought (+1 idea)')
          } else {
            log.push('Pondered, inconclusively.')
          }
          break
        default:
          return s
      }

      // Universal Burnout Pressure: stress cost per action (career × discipline
      // scaled); collaboration relieves it. Safe actions are not scaled.
      const stress = ACTION_STRESS[actionId] ?? 1
      if (stress > 0) {
        const relief = Math.min(0.3, s.collab * 0.05)
        const rate =
          career.burnoutMult *
          DISCIPLINE_CONFIGS[s.discipline].burnoutGrowthRate *
          T.burnoutMult
        burnout = s.burnout + stress * rate * (1 - relief)
      } else {
        burnout = s.burnout + stress
      }
      burnout = clamp(burnout)
      if (burnout > 70) meaning -= 1 // high-burnout periods erode meaning
      meaning = clampMeaning(meaning)

      const base: Partial<GameState> = {
        focus: clamp(focus),
        energy: clamp(energy),
        burnout,
        knowledge: nn(knowledge),
        ideas: nn(ideas),
        data: nn(data),
        narrative: nn(narrative),
        reputation: nn(reputation),
        experimentCount,
        reviewerComment,
        meaning,
        collab: Math.max(0, Math.round(collab)),
        funding: Math.round(funding),
        rapport: clampRapport(rapport),
        currentDayActions: s.currentDayActions + 1,
        log,
      }

      // Failure: burnout collapse -> career-specific dropout/exit.
      if (burnout >= 100) {
        const id =
          s.careerPath === 'master'
            ? 'master_dropout'
            : s.careerPath === 'phd'
              ? 'phd_dropout'
              : 'postdoc_exit'
        return { ...base, ...makeEnding(id, meaning, log) }
      }
      return base
    }),

  createPaperDraft: (type) =>
    set((s) => {
      if (s.graduated || !s.careerPath || !s.discipline) return s
      if (s.ideas < 2) {
        return { log: [...s.log, 'Not enough ideas for a draft (need 2).'] }
      }
      // B — limited concurrent project slots (career-dependent).
      const slots = maxDraftSlots(s.careerPath)
      const active = s.papers.filter((p) => p.status === 'draft').length
      if (active >= slots) {
        return {
          log: [
            ...s.log,
            `All ${slots} project slots are busy — finish or shelve one first.`,
          ],
        }
      }
      const id = `pub_${String(s.papers.length + 1).padStart(2, '0')}`
      const paper: Paper = {
        id,
        type,
        discipline: s.discipline,
        idea: 2,
        method: 0,
        results: 0,
        narrative: 0,
        status: 'draft',
        createdDay: s.day,
        rejectedVenues: [],
        rejections: 0,
      }
      return {
        ideas: s.ideas - 2,
        papers: [...s.papers, paper],
        log: [...s.log, `Created ${id} (${type})`],
      }
    }),

  improvePaper: (id, component) =>
    set((s) => {
      if (s.graduated) return s
      const resource = IMPROVE_COST[component]
      if (s[resource] < 1) {
        return { log: [...s.log, `Need 1 ${resource} to improve ${component}.`] }
      }
      const papers = s.papers.map((p) =>
        p.id === id && p.status === 'draft'
          ? { ...p, [component]: p[component] + 1 }
          : p,
      )
      const patch: Partial<GameState> = {
        papers,
        log: [...s.log, `Improved ${component} on ${id}`],
      }
      ;(patch as Record<ResourceKey, number>)[resource] = s[resource] - 1
      return patch
    }),

  // Phase 8: submit to a venue. Enters review; the decision arrives LATER
  // (on a future day). Fast venues are quick; elite venues are slow.
  submitToVenue: (id, venueName) =>
    set((s) => {
      if (s.graduated || !s.careerPath || !s.discipline) return s
      const target = s.papers.find(
        (p) => p.id === id && p.status === 'draft' && !p.reviewStage,
      )
      if (!target) return s
      const venue = findVenue(venueName)
      if (!venue) return s
      if (target.rejectedVenues?.includes(venue.name)) {
        return {
          log: [...s.log, `${venue.name} already rejected ${id} — pick another venue.`],
        }
      }

      // D — Desk reject: editors bounce hopeless submissions without review.
      // Fast (no waiting), cheaper than a full rejection, but the venue is burned.
      const quick = weightedScore(target, s.discipline) * disciplineFit(s.discipline, venue)
      if (quick < venue.selectivity - useTuning.getState().deskRejectMargin) {
        const papers = s.papers.map((p) =>
          p.id === id
            ? { ...p, rejectedVenues: [...(p.rejectedVenues ?? []), venue.name] }
            : p,
        )
        return {
          papers,
          burnout: clamp(s.burnout + 2),
          meaning: clampMeaning(s.meaning - 5),
          log: [
            ...s.log,
            `Submitted ${id} to ${venue.name}.`,
            `Desk reject from ${venue.name} — returned without review.`,
          ],
        }
      }

      const T = useTuning.getState()
      const cyc = DISCIPLINE_CONFIGS[s.discipline].cycleLength * T.latencyMult
      const due = s.day + reviewLatency(venue, 1, cyc)
      // The act of submitting is taxing (more so for elite venues) and costs money
      // (page charges / travel), scaled by the field's expense.
      const burnout = clamp(s.burnout + tierSubmitBurnout(venue.tier))
      const cost = Math.round(
        T.submitFundingCost * fundingCostMult(s.discipline) * (1 + (venue.tier <= 2 ? 0.5 : 0)),
      )
      const papers = s.papers.map((p) =>
        p.id === id
          ? {
              ...p,
              reviewStage: 'under_review' as const,
              venue: venue.name,
              venueTier: venue.tier,
              round: 1,
              reviewDueDay: due,
              reviewerComments: undefined,
            }
          : p,
      )
      return {
        papers,
        burnout,
        funding: s.funding - cost,
        log: [
          ...s.log,
          `Submitted ${id} to ${venue.name}. Now under review (${latencyHint(venue)}).`,
        ],
      }
    }),

  // Address the reviews: improve the weakest component, at a cost.
  reviseSubmission: (id) =>
    set((s) => {
      if (s.graduated) return s
      const target = s.papers.find((p) => p.id === id && p.reviewStage === 'revising')
      if (!target) return s
      const weakest = weakestComponent(target)
      const papers = s.papers.map((p) =>
        p.id === id
          ? { ...p, [weakest]: p[weakest] + 1, revisionCount: (p.revisionCount ?? 0) + 1 }
          : p,
      )
      return {
        papers,
        focus: clamp(s.focus - 8),
        energy: clamp(s.energy - 8),
        burnout: clamp(s.burnout + 7), // major revision: high stress
        meaning: clampMeaning(s.meaning - 1),
        log: [...s.log, `Revised ${id} — addressed ${weakest}.`],
      }
    }),

  // D — Rebuttal: argue with the reviewers instead of (or besides) revising.
  // One shot per paper. Usually helps the final decision; sometimes backfires.
  // The outcome is decided now but NEVER shown — you find out with the verdict.
  rebutSubmission: (id) =>
    set((s) => {
      if (s.graduated) return s
      const target = s.papers.find((p) => p.id === id && p.reviewStage === 'revising')
      if (!target || target.rebutBonus !== undefined) return s
      const papers = s.papers.map((p) =>
        p.id === id
          ? { ...p, rebutBonus: chance(useTuning.getState().rebutSuccess) ? 2 : -1 }
          : p,
      )
      return {
        papers,
        focus: clamp(s.focus - 8),
        energy: clamp(s.energy - 8),
        burnout: clamp(s.burnout + 5),
        log: [...s.log, `Rebuttal sent for ${id}. The committee will weigh it.`],
      }
    }),

  // B — Shelve a project to free its slot. It hurts a little.
  abandonDraft: (id) =>
    set((s) => {
      if (s.graduated) return s
      const target = s.papers.find((p) => p.id === id && p.status === 'draft' && !p.reviewStage)
      if (!target) return s
      return {
        papers: s.papers.filter((p) => p.id !== id),
        meaning: clampMeaning(s.meaning - 2),
        log: [...s.log, `${id} shelved. The folder stays on disk.`],
      }
    }),

  // A — Apply for a grant: costs effort now, the decision arrives later (and
  // usually fails). A success refills funding. Only one application at a time.
  applyForGrant: () =>
    set((s) => {
      if (s.graduated || !s.careerPath) return s
      if (s.grantDueDay !== null) {
        return { log: [...s.log, 'A grant decision is already pending.'] }
      }
      const T = useTuning.getState()
      return {
        focus: clamp(s.focus - 12),
        energy: clamp(s.energy - 10),
        burnout: clamp(s.burnout + 4),
        grantDueDay: s.day + Math.max(1, Math.round(T.grantLatency)),
        log: [...s.log, 'Grant application submitted. The panel will deliberate.'],
      }
    }),

  // Resubmit a revised paper: re-enters review (round 2 = final). Delayed.
  // A rebuttal shortens the wait — you are arguing, not redoing the work.
  resubmit: (id) =>
    set((s) => {
      if (s.graduated || !s.careerPath || !s.discipline) return s
      const target = s.papers.find((p) => p.id === id && p.reviewStage === 'revising')
      if (!target || !target.venue) return s
      const venue = findVenue(target.venue)
      if (!venue) return s
      const cyc =
        DISCIPLINE_CONFIGS[s.discipline].cycleLength *
        useTuning.getState().latencyMult *
        (target.rebutBonus !== undefined ? 0.6 : 1)
      const due = s.day + reviewLatency(venue, 2, cyc)
      const burnout = clamp(s.burnout + 3 + (target.revisionCount ?? 0))
      const papers = s.papers.map((p) =>
        p.id === id
          ? {
              ...p,
              reviewStage: 'under_review' as const,
              round: 2,
              reviewDueDay: due,
              reviewerComments: undefined,
            }
          : p,
      )
      return {
        papers,
        burnout,
        log: [
          ...s.log,
          `Resubmitted ${id} to ${venue.name}. Under review again (${latencyHint(venue)}).`,
        ],
      }
    }),

  toggleNetwork: () => set((s) => ({ showNetwork: !s.showNetwork })),

  submitThesis: () =>
    set((s) => {
      if (s.graduated || s.careerPath !== 'phd') return s
      const T = useTuning.getState()
      if (s.graduationProgress < T.phdPapers || s.reputation < T.phdRep) {
        return {
          log: [
            ...s.log,
            'Thesis blocked: need ' +
              T.phdPapers +
              ' accepted papers and reputation ' +
              T.phdRep +
              '.',
          ],
        }
      }
      const meaning = clampMeaning(s.meaning + 10)
      const log = [...s.log, 'Thesis submitted and defended.']
      return { thesisSubmitted: true, meaning, ...makeEnding('phd_graduation', meaning, log) }
    }),

  chooseEnding: (kind) =>
    set((s) => {
      if (s.graduated || !s.careerPath) return s
      if (kind === 'faculty') {
        const topPapers = s.papers.filter(isTopTierPub).length
        const T = useTuning.getState()
        // C — a strong advisor recommendation lowers the reputation bar.
        const repReq = Math.max(0, T.postdocFacultyRep - rapportFacultyDiscount(s.rapport))
        if (
          s.careerPath !== 'postdoc' ||
          s.reputation < repReq ||
          topPapers < T.postdocFacultyTop
        ) {
          return {
            log: [
              ...s.log,
              `Faculty application denied: need reputation ${repReq} and ${T.postdocFacultyTop} top-tier papers.`,
            ],
          }
        }
        return makeEnding('postdoc_faculty', s.meaning, [
          ...s.log,
          'Faculty committee convened.',
        ])
      }
      if (kind === 'distinguished') {
        if (s.influence < useTuning.getState().distinguishedInfluence) {
          return { log: [...s.log, 'Not yet recognized as distinguished.'] }
        }
        return makeEnding('distinguished', s.meaning, [
          ...s.log,
          'Your standing is acknowledged.',
        ])
      }
      if (kind === 'extension') {
        if (s.careerPath !== 'master') return s
        return makeEnding('master_extension', s.meaning, [
          ...s.log,
          'Extension paperwork filed.',
        ])
      }
      // exit academia (voluntary)
      let baseId: string
      if (s.careerPath === 'phd') {
        // Left with results but no degree = All But Dissertation.
        baseId =
          s.graduationProgress > 0 && !s.thesisSubmitted ? 'phd_abd' : 'phd_exit_industry'
      } else if (s.careerPath === 'postdoc') {
        baseId = 'postdoc_exit'
      } else {
        baseId = 'master_dropout'
      }
      return makeEnding(baseId, s.meaning, [...s.log, 'You chose to leave.'])
    }),

  nextDay: () =>
    set((s) => {
      if (s.graduated || !s.careerPath || !s.discipline) return s
      const T = useTuning.getState()
      const career = CAREER_CONFIGS[s.careerPath]
      const day = s.day + 1
      const dailyModifier = rollDailyModifier()
      // C — low rapport means the supervisor chases you harder.
      const supervisorAlert = rollSupervisor(
        career.supervisorChanceMult * rapportSupervisorMult(s.rapport),
      )

      const log = [
        ...s.log,
        `--- Day ${day} ---`,
        `Modifier: ${dailyModifier.title} (${dailyModifier.description})`,
      ]
      if (supervisorAlert) log.push(supervisorAlert)

      // Accumulators (reviews + events mutate these).
      let reputation = s.reputation
      let graduationProgress = s.graduationProgress
      let rejectionStreak = s.rejectionStreak
      let influence = s.influence
      const disc = DISCIPLINE_CONFIGS[s.discipline]
      const decayBase = s.careerPath === 'postdoc' ? 2 : s.careerPath === 'master' ? 0 : 1
      let meaning = s.meaning - decayBase * disc.meaningDecayRate * T.meaningDecayMult
      let focus = s.focus + T.nextDayFocus
      let energy = s.energy + T.nextDayEnergy
      let burnout = s.burnout + T.nextDayBurnout
      let collab = s.collab
      let knowledge = s.knowledge
      let ideas = s.ideas
      let data = s.data
      let narrative = s.narrative
      let funding = s.funding
      let rapport = s.rapport
      let grantDueDay = s.grantDueDay

      // C — ignoring an outstanding supervisor request strains the relationship.
      if (s.supervisorAlert) {
        rapport -= 3
      }

      // 1) DELAYED REVIEW RESOLUTION — decisions whose wait has elapsed.
      const totalCitations = s.papers.reduce((a, p) => a + (p.citations ?? 0), 0)
      const bonus = networkBonus(s.influence, totalCitations, s.collab)
      let papers = s.papers.map((p) => {
        if (p.reviewStage !== 'under_review' || (p.reviewDueDay ?? Infinity) > day) {
          return p
        }
        const venue = findVenue(p.venue ?? '')
        if (!venue) return p
        // Per-paper modifiers: rebuttal (hidden), reviewer-feedback experience,
        // staleness of the project, and current field competition heat.
        const pBonus =
          bonus +
          (p.rebutBonus ?? 0) +
          experienceBonus(p) +
          rapportReviewBonus(s.rapport) - // C — the advisor's goodwill in review
          stalenessPenalty(s.discipline!, p.createdDay, day) -
          s.fieldHeat
        const review = runReview(p, venue, s.careerPath!, s.discipline!, s.burnout, p.round ?? 1, pBonus)
        log.push(`Decision from ${venue.name} on ${p.id}:`, ...review.comments)
        const finalRound = (p.round ?? 1) >= 2
        if (review.decision === 'accept' || review.decision === 'reject' || finalRound) {
          const accepted = review.decision === 'accept'
          const reward = accepted
            ? Math.round(tierReward(venue.tier) * career.rewardScale * T.tierRewardMult)
            : 0
          reputation += reward
          graduationProgress += accepted ? 1 : 0
          rejectionStreak = accepted ? 0 : rejectionStreak + 1
          influence += accepted ? tierInfluence(venue.tier) : 0
          meaning += accepted ? tierMeaningGain(venue.tier) : -10
          if (accepted) {
            log.push(`→ ${p.id}: ACCEPT (+${reward} reputation)`)
            return {
              ...p,
              status: 'archived' as const,
              reviewStage: undefined,
              reviewDueDay: undefined,
              rebutBonus: undefined,
              verdict: 'Accept',
              citations: 0,
            }
          }
          // D — Rejected work is NOT dead: it returns to your desk with the
          // venue burned and a little hard-won reviewer experience. Transfer it
          // down-tier — but staleness keeps cycling from being free.
          log.push(`→ ${p.id}: REJECT — back on your desk.`)
          return {
            ...p,
            status: 'draft' as const,
            reviewStage: undefined,
            reviewDueDay: undefined,
            round: undefined,
            rebutBonus: undefined,
            reviewerComments: undefined,
            rejections: (p.rejections ?? 0) + 1,
            rejectedVenues: [...(p.rejectedVenues ?? []), venue.name],
          }
        }
        meaning -= 3
        log.push(
          `→ ${p.id}: ${review.decision === 'minor' ? 'Minor' : 'Major'} revision requested`,
        )
        return {
          ...p,
          reviewStage: 'revising' as const,
          reviewDueDay: undefined,
          revisionCount: p.revisionCount ?? 0,
          reviewerComments: review.comments,
        }
      })

      // 2) Citation growth (preferential attachment; burnout suppresses it).
      let gainedCitations = 0
      papers = papers.map((p) => {
        const g = citationGrowth(p, s.burnout)
        if (g > 0) gainedCitations += g
        return g > 0 ? { ...p, citations: (p.citations ?? 0) + g } : p
      })
      influence += gainedCitations * 0.1
      // C — burnout strains collaborations; a breaking one can mean being
      // scooped on first authorship (a real hit to standing).
      if (s.burnout > 70 && collab > 0) {
        collab = Math.max(0, collab - 1)
        rapport -= 2
        if (chance(0.25)) {
          reputation = nn(reputation - 3)
          meaning -= 6
          log.push('[field] A collaboration soured — you were scooped on first authorship.')
        }
      }

      // A — daily funding burn (heavier in expensive fields) + grant decisions.
      funding -= T.fundingDrainPerDay * fundingCostMult(s.discipline)
      if (grantDueDay !== null && grantDueDay <= day) {
        grantDueDay = null
        if (chance(T.grantSuccess)) {
          funding += T.grantAmount
          meaning += 3
          log.push(`Grant awarded — funding secured (+${Math.round(T.grantAmount)}).`)
        } else {
          log.push('Grant rejected. Back to the drawing board.')
        }
      }

      // 2b) AI Research Obsolescence — accepted work can be surpassed over time.
      if (disc.special === 'obsolescence') {
        papers = papers.map((p) =>
          p.verdict === 'Accept' && (p.citations ?? 0) > 0
            ? { ...p, citations: Math.max(0, (p.citations ?? 0) - 1) }
            : p,
        )
        if (papers.some((p) => p.verdict === 'Accept') && chance(0.18)) {
          influence = Math.max(0, influence - 1)
          meaning -= 2
          log.push(
            chance(0.5)
              ? '[field] A competing model surpassed your approach.'
              : '[field] Community attention shifted elsewhere.',
          )
        }
      }

      // 2c) E — Rival labs: they publish (heating the field) and may scoop
      // a project you have left sitting too long.
      const rt = tickRivals(s.rivals, s.fieldHeat)
      const rivals = rt.rivals
      let fieldHeat = rt.fieldHeat
      log.push(...rt.logs)
      papers = papers.map((p) => {
        if (
          p.status === 'draft' &&
          !p.reviewStage &&
          day - (p.createdDay ?? day) > T.scoopAgeDays &&
          chance(T.scoopChance)
        ) {
          const rival = rivals[Math.floor(Math.random() * rivals.length)]
          meaning -= 4
          log.push(`[field] ${rival.name} published something very close to ${p.id}.`)
          return { ...p, idea: Math.max(0, p.idea - 2) }
        }
        return p
      })

      // 3) Random event (★6).
      const ev = rollEvent(papers.some((p) => p.verdict === 'Accept'))
      if (ev) {
        const d = ev.d
        focus += d.focus ?? 0
        energy += d.energy ?? 0
        burnout += d.burnout ?? 0
        meaning += d.meaning ?? 0
        ideas += d.ideas ?? 0
        data += d.data ?? 0
        knowledge += d.knowledge ?? 0
        narrative += d.narrative ?? 0
        reputation += d.reputation ?? 0
        influence += d.influence ?? 0
        collab += d.collab ?? 0
        log.push(`[event] ${ev.message}`)
      }

      focus = clamp(focus)
      energy = clamp(energy)
      burnout = clamp(burnout)
      meaning = clampMeaning(meaning)
      reputation = nn(reputation)
      ideas = nn(ideas)
      data = nn(data)
      knowledge = nn(knowledge)
      narrative = nn(narrative)
      collab = Math.max(0, Math.round(collab))
      funding = Math.round(funding)
      rapport = clampRapport(rapport)

      // 4) Narrative compression.
      const note = compressNarrative({
        burnout,
        meaning,
        influence,
        acceptedCount: papers.filter((p) => p.verdict === 'Accept').length,
        rejectionStreak,
      })
      if (note) log.push(`[system] ${note}`)

      const base: Partial<GameState> = {
        focus,
        energy,
        burnout,
        day,
        currentDayActions: 0,
        dailyModifier,
        supervisorAlert,
        meaning,
        reputation,
        graduationProgress,
        rejectionStreak,
        influence,
        collab,
        rivals,
        fieldHeat,
        funding,
        rapport,
        grantDueDay,
        knowledge,
        ideas,
        data,
        narrative,
        papers,
        log,
      }

      // 5a) A — Funding depletion ends the run (career-specific). No longer random.
      if (funding <= 0) {
        const id =
          s.careerPath === 'phd'
            ? 'phd_funding_loss'
            : s.careerPath === 'master'
              ? 'master_dropout'
              : 'postdoc_exit'
        return {
          ...base,
          ...makeEnding(id, meaning, [...log, 'Funding ran out. The lab cannot continue.']),
        }
      }

      // 5b) Endings: streak / burnout / graduation.
      const ending = checkEndings(
        s.careerPath,
        graduationProgress,
        reputation,
        rejectionStreak,
        burnout,
        s.thesisSubmitted,
        meaning,
        log,
      )
      if (ending) return { ...base, ...ending }
      return base
    }),

  respondToSupervisor: () =>
    set((s) =>
      s.graduated
        ? s
        : {
            focus: clamp(s.focus - 5),
            energy: clamp(s.energy - 5),
            supervisorAlert: null,
            rapport: clampRapport(s.rapport + 4), // responsiveness builds goodwill
            log: [...s.log, 'Progress update submitted.'],
          },
    ),

  addressReviewer: () =>
    set((s) =>
      s.graduated
        ? s
        : {
            focus: clamp(s.focus - 10),
            energy: clamp(s.energy - 10),
            burnout: clamp(s.burnout + 6), // respond to reviewers: high stress
            meaning: clampMeaning(s.meaning - 1),
            reviewerComment: null,
            log: [...s.log, 'Reviewer concerns addressed.'],
          },
    ),

  advanceCollapse: () =>
    set((s) => {
      if (!s.graduated || s.collapsePhase >= 5) return s
      const collapsePhase = s.collapsePhase + 1
      if (collapsePhase === 5) {
        const e = ENDINGS[s.endingId ?? 'master_graduation'] ?? ENDINGS.master_graduation
        return { collapsePhase, log: [...s.log, ...e.lines] }
      }
      return { collapsePhase }
    }),
}))
