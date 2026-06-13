// ============================================================================
// B — Project layer. Drafts are projects: limited concurrent slots, and ideas
// go STALE over time (fast in AI/CS, slow in humanities). Rejections grant a
// small capped "reviewer feedback" experience bonus, so transferring a paper
// down-tier is viable — but staleness keeps endless cycling from being free.
// ============================================================================

import { DISCIPLINE_CONFIGS, type Discipline } from './disciplineSystem'
import type { CareerPath } from './careerSystem'
import type { Paper } from '../types/paper'
import { useTuning } from './tuning'

// Concurrent draft slots per career (+ dev-tunable bonus).
export function maxDraftSlots(career: CareerPath): number {
  const base = career === 'master' ? 2 : career === 'phd' ? 3 : 4
  return base + Math.round(useTuning.getState().extraDraftSlots)
}

interface StaleProfile {
  grace: number // days before decay starts
  rate: number // penalty per day after grace
}

// How fast a field moves. AI ideas rot in days; books age well.
function staleProfile(discipline: Discipline): StaleProfile {
  const d = DISCIPLINE_CONFIGS[discipline]
  if (d.special === 'obsolescence') return { grace: 6, rate: 0.4 } // AI
  switch (d.civ) {
    case 'stem':
      return { grace: 9, rate: 0.2 }
    case 'social':
      return { grace: 12, rate: 0.15 }
    case 'professional':
      return { grace: 12, rate: 0.15 }
    case 'creative':
      return { grace: 10, rate: 0.2 }
    case 'humanities':
      return { grace: 20, rate: 0.05 }
  }
}

// Hidden review penalty for an aging project (0 while fresh).
export function stalenessPenalty(
  discipline: Discipline,
  createdDay: number | undefined,
  day: number,
): number {
  if (createdDay === undefined) return 0
  const { grace, rate } = staleProfile(discipline)
  return Math.max(0, (day - createdDay - grace) * rate) * useTuning.getState().stalenessMult
}

export function isStale(discipline: Discipline, p: Paper, day: number): boolean {
  return stalenessPenalty(discipline, p.createdDay, day) > 0
}

// Capped bonus from having been reviewed/rejected before ("feedback hardens").
export function experienceBonus(p: Paper): number {
  return Math.min(2, p.rejections ?? 0)
}
