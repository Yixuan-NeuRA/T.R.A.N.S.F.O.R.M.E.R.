// ============================================================================
// Developer Tuning — a single runtime config for every balance knob.
// Systems read live values via useTuning.getState(); the Dev Panel edits them.
// Changes apply immediately; Save persists to localStorage and syncs across tabs
// (so you can keep the panel in one tab and the game in another).
// ============================================================================

import { create } from 'zustand'

export interface Tuning {
  // Daily loop
  maxActionsPerDay: number
  gainSuccess: number // chance a productive action yields its point
  discoveryChance: number // experiment breakthrough chance
  burnoutMult: number // global multiplier on burnout gains
  nextDayFocus: number
  nextDayEnergy: number
  nextDayBurnout: number // delta applied each new day (negative recovers)
  // Submission / review
  tierRewardMult: number // multiplier on reputation reward
  reviewDifficulty: number // added to every venue's acceptance bar (harder if +)
  reviewVarianceMult: number // multiplier on reviewer noise
  latencyMult: number // multiplier on review wait time
  // Career graduation
  masterPapers: number
  masterRep: number
  phdPapers: number
  phdRep: number
  postdocFacultyRep: number
  postdocFacultyTop: number
  rejectionLimitMaster: number
  rejectionLimitPhd: number
  fundingLossChance: number
  fundingLossDay: number
  // Meaning / network
  meaningStart: number
  meaningDecayMult: number
  distinguishedInfluence: number
  // Projects / rivals (B/D/E)
  extraDraftSlots: number // added to the career's project-slot cap
  stalenessMult: number // multiplier on project staleness penalty
  deskRejectMargin: number // bigger = editors bounce less (quick < sel - margin)
  rebutSuccess: number // chance a rebuttal helps (else it backfires)
  rivalPublishChance: number // per rival per day
  fieldHeatMult: number // multiplier on heat each rival paper adds
  scoopChance: number // per old draft per day
  scoopAgeDays: number // drafts older than this can be scooped
  // Funding (A)
  fundingStart: number
  fundingDrainPerDay: number // base daily burn (× discipline cost)
  submitFundingCost: number // per submission (× discipline cost)
  experimentFundingCost: number // per experiment (× discipline cost)
  grantAmount: number // funding gained on a successful grant
  grantSuccess: number // chance a grant application succeeds
  grantLatency: number // days until a grant decision arrives
  // Advisor / collaborators (C)
  rapportStart: number
}

export const DEFAULT_TUNING: Tuning = {
  maxActionsPerDay: 6,
  gainSuccess: 0.2,
  discoveryChance: 0.08,
  burnoutMult: 1,
  nextDayFocus: 10,
  nextDayEnergy: 15,
  nextDayBurnout: -5,
  tierRewardMult: 1,
  reviewDifficulty: 0,
  reviewVarianceMult: 1,
  latencyMult: 1,
  masterPapers: 1,
  masterRep: 9,
  phdPapers: 3,
  phdRep: 27,
  postdocFacultyRep: 40,
  postdocFacultyTop: 2,
  rejectionLimitMaster: 3,
  rejectionLimitPhd: 5,
  fundingLossChance: 0.05,
  fundingLossDay: 15,
  meaningStart: 75,
  meaningDecayMult: 1,
  distinguishedInfluence: 18,
  extraDraftSlots: 0,
  stalenessMult: 1,
  deskRejectMargin: 7,
  rebutSuccess: 0.75,
  rivalPublishChance: 0.07,
  fieldHeatMult: 1,
  scoopChance: 0.05,
  scoopAgeDays: 8,
  fundingStart: 60,
  fundingDrainPerDay: 2,
  submitFundingCost: 4,
  experimentFundingCost: 1,
  grantAmount: 40,
  grantSuccess: 0.35,
  grantLatency: 4,
  rapportStart: 50,
}

const KEY = 'transformer.tuning'

function load(): Tuning {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULT_TUNING, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_TUNING }
}

interface TuningStore extends Tuning {
  setValue: (key: keyof Tuning, value: number) => void
  save: () => void
  reset: () => void
}

export const useTuning = create<TuningStore>((set, get) => ({
  ...load(),
  setValue: (key, value) => set({ [key]: value } as Partial<Tuning>),
  save: () => {
    const s = get()
    const out: Record<string, number> = {}
    for (const k of Object.keys(DEFAULT_TUNING) as (keyof Tuning)[]) out[k] = s[k]
    try {
      localStorage.setItem(KEY, JSON.stringify(out))
    } catch {
      /* ignore */
    }
  },
  reset: () => set({ ...DEFAULT_TUNING }),
}))

// Cross-tab sync: when another tab saves, mirror the values here live.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY && e.newValue) {
      try {
        useTuning.setState({ ...DEFAULT_TUNING, ...JSON.parse(e.newValue) })
      } catch {
        /* ignore */
      }
    }
  })
}
