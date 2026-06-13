// ============================================================================
// A — Funding / survival pressure. A hidden funding balance drains every day and
// is spent on experiments and submissions. Wet-lab / clinical fields burn money
// fast; humanities barely spend any. When it hits zero, the run ends (no longer
// a random event). Grants refill it — slowly, and with a low success rate.
// ============================================================================

import type { Discipline } from './disciplineSystem'

// Per-discipline cost multiplier on all funding spend + daily drain.
const COST: Partial<Record<Discipline, number>> = {
  medicine: 1.8,
  econ: 1.5,
  bio: 1.5,
  chemistry: 1.5,
  envsci: 1.4,
  physics: 1.3,
  eng: 1.3,
  cs: 1.1,
  ai: 1.1,
  law: 0.7,
  history: 0.5,
  philosophy: 0.5,
  literature: 0.5,
  classics: 0.5,
  design: 0.9,
  architecture: 1.0,
  media_arts: 0.9,
}

export function fundingCostMult(discipline: Discipline): number {
  return COST[discipline] ?? 1.0
}

// Qualitative funding readout (no number shown to the player).
export function fundingLabel(funding: number): { label: string; dot: string } {
  if (funding > 40) return { label: 'Comfortable', dot: 'bg-emerald-500' }
  if (funding > 18) return { label: 'Adequate', dot: 'bg-lime-400' }
  if (funding > 6) return { label: 'Tight', dot: 'bg-amber-400' }
  return { label: 'Running out', dot: 'bg-red-500 animate-pulse' }
}
