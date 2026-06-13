// ============================================================================
// C — Advisor / collaborator relationship ("rapport", hidden, 0..100).
// Responding to your supervisor and forming collaborations raise it; ignoring
// the supervisor and burning out (collaborations breaking) lower it.
//   High rapport → reviewer goodwill + a recommendation letter (easier faculty).
//   Low rapport  → nagging (more supervisor pressure) + authorship disputes.
// Numbers stay hidden; only a qualitative standing is shown.
// ============================================================================

export const clampRapport = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

// Hidden review goodwill from the advisor's network (±2).
export function rapportReviewBonus(rapport: number): number {
  return (rapport - 50) / 25
}

// A strong recommendation letter lowers the faculty reputation bar.
export function rapportFacultyDiscount(rapport: number): number {
  if (rapport >= 80) return 10
  if (rapport >= 65) return 5
  return 0
}

// Low rapport means the supervisor chases you harder.
export function rapportSupervisorMult(rapport: number): number {
  return rapport < 35 ? 1.6 : rapport < 50 ? 1.2 : 1
}

export function rapportLabel(rapport: number): string {
  if (rapport >= 80) return 'Devoted'
  if (rapport >= 60) return 'Supportive'
  if (rapport >= 40) return 'Cordial'
  if (rapport >= 20) return 'Distant'
  return 'Strained'
}
