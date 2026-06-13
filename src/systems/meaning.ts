// ============================================================================
// PHASE 7 — Meaning (hidden meta-variable)
// Burnout breaks the system; meaning breaks interpretation. SEPARATE systems.
// meaning is NEVER shown as a stat. It only shifts the interpretation layer.
// ============================================================================

export type MeaningTier = 'high' | 'medium' | 'low' | 'critical'

export const MEANING_START = 75

export const clampMeaning = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

export function meaningTier(m: number): MeaningTier {
  if (m >= 70) return 'high'
  if (m >= 40) return 'medium'
  if (m >= 10) return 'low'
  return 'critical'
}
