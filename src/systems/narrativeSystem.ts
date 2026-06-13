// ============================================================================
// PHASE 10 — Narrative Compression Layer
// Compresses hidden system state into ONE structural interpretation sentence.
// This is NOT storytelling: it describes how the system interprets the player's
// state, never characters, emotions, or plot. Returns null when state is stable.
// ============================================================================

import { meaningTier } from './meaning'

export interface NarrativeState {
  burnout: number
  meaning: number
  influence: number
  acceptedCount: number
  rejectionStreak: number
}

export function compressNarrative(s: NarrativeState): string | null {
  // Reviewer non-convergence (repeated unstable outcomes).
  if (s.rejectionStreak >= 2) {
    return 'Evaluation is not converging across reviewers. Outcome depends on venue interpretation variance.'
  }
  // High structural pressure.
  if (s.burnout >= 60) {
    return 'You are operating under sustained structural pressure. The system is compressing your available decision space.'
  }
  // Low clarity (meaning).
  const mt = meaningTier(s.meaning)
  if (mt === 'low' || mt === 'critical') {
    return 'Your work is no longer interpreted consistently across the system. Meaning has become context-dependent.'
  }
  // High position (reputation precedes content).
  if (s.influence >= 9) {
    return 'Your work is increasingly interpreted through prior reputation rather than content alone.'
  }
  // Low position (not yet stabilized in the network).
  if (s.influence < 3 && s.acceptedCount === 0) {
    return 'Your outputs are not yet stabilized within the academic network.'
  }
  return null
}
