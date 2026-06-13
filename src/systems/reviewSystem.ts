// ============================================================================
// PHASE 8 — Stochastic Review Engine (hidden)
// Outcome = f(quality, fit, venue selectivity, reviewer strictness, burnout,
//             network bonus, randomness). No numbers exposed to the player.
// Multi-round: round 1 may request revision; round 2 is final accept/reject.
// ============================================================================

import type { Paper } from '../types/paper'
import type { Discipline } from './disciplineSystem'
import { CAREER_CONFIGS, type CareerPath } from './careerSystem'
import { DISCIPLINE_CONFIGS } from './disciplineSystem'
import { weightedScore } from './publicationSystem'
import { disciplineFit, tierReviewers, type Venue } from './venueSystem'
import { useTuning } from './tuning'

export type Decision = 'accept' | 'minor' | 'major' | 'reject'

const COMMENTS: Record<Decision, string[]> = {
  accept: [
    'A solid contribution; I recommend acceptance.',
    'Convincing and well-scoped. Accept.',
    'This meets the bar for the venue.',
  ],
  minor: [
    'Promising, but minor revisions are required.',
    'Methodology is promising but incomplete.',
    'Interesting; please clarify the framing.',
  ],
  major: [
    'Major revision needed before it can be assessed.',
    'Results are inconclusive under the current framing.',
    'Significant gaps remain; major revision.',
  ],
  reject: [
    'Insufficient novelty for this venue.',
    'The paper may fit better in a lower-tier venue.',
    'Not suitable for this venue in its current form.',
  ],
}

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}

export interface ReviewResult {
  decision: Decision
  comments: string[]
}

export function runReview(
  pub: Paper,
  venue: Venue,
  career: CareerPath,
  discipline: Discipline,
  burnout: number,
  round: number,
  networkBonus: number,
): ReviewResult {
  const c = CAREER_CONFIGS[career]
  const d = DISCIPLINE_CONFIGS[discipline]
  const fit = disciplineFit(discipline, venue)
  const base = weightedScore(pub, discipline) // ~0..20

  const effective =
    base * fit +
    networkBonus - // influence/citation/collaboration (Phase 9), hidden
    c.reviewerHarshness -
    d.harshness -
    d.venueCompetition - // discipline-specific competition (econ/AI/medicine hard)
    burnout / 20 + // burnout lowers perceived quality
    (round >= 2 ? 1 : 0) // revisions addressed / reviewer familiarity (modest)

  // Correlated "luck of the draw": the whole reviewer pool can be unusually
  // kind or harsh this round. This is why a strong paper can still be rejected,
  // and the same paper gets different outcomes across submissions.
  const poolLuck = (Math.random() - 0.5) * 4

  const T = useTuning.getState()
  // Some fields (creative, humanities) are far more subjective.
  const spread = (venue.variance + d.variance) * T.reviewVarianceMult

  const nReviewers = tierReviewers(venue.tier)
  const comments: string[] = []
  const cats: number[] = []

  for (let i = 0; i < nReviewers; i++) {
    // Each reviewer adds independent noise; round 2 only slightly calmer.
    const noise = (Math.random() - 0.5) * spread * (round >= 2 ? 0.8 : 1)
    const r = effective + poolLuck + noise
    const sel = venue.selectivity + T.reviewDifficulty
    const dec: Decision =
      r >= sel ? 'accept' : r >= sel - 3 ? 'minor' : r >= sel - 6 ? 'major' : 'reject'
    cats.push(dec === 'accept' ? 3 : dec === 'minor' ? 2 : dec === 'major' ? 1 : 0)
    comments.push(`Reviewer ${i + 1}: ${pick(COMMENTS[dec])}`)
  }

  const avg = cats.reduce((a, b) => a + b, 0) / cats.length
  let decision: Decision
  if (round >= 2) {
    decision = avg >= 1.5 ? 'accept' : 'reject' // final: no more loops
  } else {
    decision = avg >= 2.5 ? 'accept' : avg >= 1.5 ? 'minor' : avg >= 0.75 ? 'major' : 'reject'
  }
  return { decision, comments }
}
