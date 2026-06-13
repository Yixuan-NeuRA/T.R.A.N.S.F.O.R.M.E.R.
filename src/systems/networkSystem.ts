// ============================================================================
// PHASE 9 — Academic Ecosystem Dynamics (mostly hidden, emergent)
// Three interacting networks expressed as compact hidden scalars:
//   citations (per accepted publication) · influence · collaboration strength
// They feed back into the stochastic review as a hidden bonus.
// ============================================================================

import type { Paper } from '../types/paper'

// Hidden bonus added to review "effective quality". Capped so it tilts, not breaks.
export function networkBonus(
  influence: number,
  totalCitations: number,
  collab: number,
): number {
  return Math.min(6, influence * 0.08 + totalCitations * 0.04 + collab * 0.4)
}

// Citation growth for one accepted publication on a new day.
// Preferential attachment (cited papers gain faster); burnout suppresses it.
export function citationGrowth(p: Paper, burnout: number): number {
  if (p.verdict !== 'Accept') return 0
  // Prestige seed: Top (tier 1) seeds the most, Q4 (tier 5) the least.
  const tierBase = Math.max(1, 6 - (p.venueTier ?? 3))
  const existing = p.citations ?? 0
  const g =
    tierBase + // prestigious venues seed more citations
    0.15 * existing - // rich-get-richer
    burnout / 45 + // burnout reduces productivity/visibility
    Math.random() * 1.5
  return Math.max(0, Math.round(g))
}

// Qualitative standings — never expose raw numbers.
export function influenceLabel(i: number): string {
  if (i >= 18) return 'Eminent'
  if (i >= 9) return 'Established'
  if (i >= 3) return 'Rising'
  return 'Unknown'
}

export function collabLabel(c: number): string {
  if (c >= 6) return 'Strong'
  if (c >= 3) return 'Moderate'
  if (c >= 1) return 'Weak'
  return 'Isolated'
}
