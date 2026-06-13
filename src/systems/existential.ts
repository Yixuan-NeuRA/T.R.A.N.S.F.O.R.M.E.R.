// ============================================================================
// PHASE 7 — Existential Drift (the Meaning interpretation layer)
// PURE + read-only. Driven by `meaning`, completely separate from the burnout
// distortion layer. Composes ON TOP of it at render time.
// ============================================================================

import { meaningTier } from './meaning'

function rand(key: string, tick: number): number {
  let h = (374761393 ^ tick) >>> 0
  const s = key + '#' + tick
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967296
}

// Meaning Masking: at low/critical meaning the system "simulates purpose",
// blurring the difference between success and failure.
export function maskText(
  text: string,
  meaning: number,
  key: string,
  tick: number,
): string {
  const t = meaningTier(meaning)
  if (t === 'high' || t === 'medium') return text

  if (t === 'low') {
    if (/reject/i.test(text)) return 'Minor revision required'
    if (
      /(Pondered|Replied to emails|no output|^Networked$|Rested)/i.test(text) &&
      rand('mk-' + key, tick) < 0.5
    ) {
      return 'Incremental improvement achieved'
    }
    return text
  }

  // critical: acceptance and rejection become indistinguishable
  if (/(Conference|Accepted|Reject|Workshop|reputation|revision|completed|collected)/i.test(text)) {
    return 'Outcome recorded.'
  }
  if (rand('mc-' + key, tick) < 0.4) return 'Outcome recorded.'
  return text
}

export const maskOutput = maskText

export function maskLogList(log: string[], meaning: number, tick: number): string[] {
  const t = meaningTier(meaning)
  if (t === 'high' || t === 'medium') return log
  return log.map((l, i) => maskText(l, meaning, 'log' + i, tick))
}

// Reviewer critique loses specificity as meaning falls.
export function driftReviewer(comment: string, meaning: number, tick: number): string {
  const t = meaningTier(meaning)
  if (t === 'high') return comment
  if (t === 'medium') return rand('dr', tick) < 0.4 ? comment + ' (as before)' : comment
  if (t === 'low') return 'Reviewer #2: see previous comments.'
  return 'Voice: concerns noted.' // critical: voices merge
}

// Supervisor guidance becomes interchangeable as meaning falls.
export function driftSupervisor(alert: string, meaning: number, tick: number): string {
  const t = meaningTier(meaning)
  if (t === 'high') return alert
  if (t === 'medium') return rand('ds', tick) < 0.4 ? alert + ' (reminder)' : alert
  if (t === 'low') return 'Supervisor: proceed as discussed.'
  return 'Voice: continue.' // critical: voices merge
}

// Passive, non-interactive system query at low meaning. Rare.
export function whyDoIWork(meaning: number, tick: number): string | null {
  const t = meaningTier(meaning)
  const q = 'System Query:\nWhy are you continuing this project?'
  if (t === 'low' && tick % 9 === 4) return q
  if (t === 'critical' && tick % 5 === 2) return q
  return null
}
