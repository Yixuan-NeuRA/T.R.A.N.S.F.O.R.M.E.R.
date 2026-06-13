// ============================================================================
// REALITY LAYERS — Interpretation Layer
//
// Layer 2 (Simulation / true state) lives in useGameStore and is ALWAYS correct.
// This module is Layer 3: it maps true state -> what the player sees.
// Every function here is PURE and read-only. It never mutates game state.
// All "unreliability" is produced here, driven by burnout + a presentation tick.
// ============================================================================

import type { GameLocation } from './locationSystem'

export type Tier = 0 | 1 | 2 | 3

export function burnoutTier(b: number): Tier {
  if (b < 30) return 0
  if (b < 60) return 1
  if (b < 80) return 2
  return 3
}

export const TIER_NAMES = [
  'Stable System',
  'Subtle Drift',
  'System Instability',
  'Critical Breakdown',
]

// Deterministic pseudo-random in [0,1) from a string key + tick.
function rand(key: string, tick: number): number {
  let h = (2166136261 ^ tick) >>> 0
  const s = key + ':' + tick
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967296
}

export function glitchClass(burnout: number): string {
  const t = burnoutTier(burnout)
  return t === 0 ? '' : `glitch-${t}`
}

// Qualitative capacity readout (NO number). Tiers line up with the distortion
// thresholds, so "Strained" telegraphs that the UI is about to drift.
export function capacityLabel(burnout: number): { label: string; dot: string } {
  const t = burnoutTier(burnout)
  if (t === 0) return { label: 'Steady', dot: 'bg-emerald-500' }
  if (t === 1) return { label: 'Strained', dot: 'bg-lime-400' }
  if (t === 2) return { label: 'Overloaded', dot: 'bg-amber-400' }
  return { label: 'Critical', dot: 'bg-red-500 animate-pulse' }
}

// Visual jitter only — callers always keep the true value for logic.
export function distortValue(
  value: number,
  key: string,
  burnout: number,
  tick: number,
): number {
  if (burnoutTier(burnout) < 3) return value
  if (rand('val-' + key, tick) < 0.4) {
    const delta = Math.round((rand('vd-' + key, tick) - 0.5) * 4) // -2..2
    return Math.max(0, value + delta)
  }
  return value
}

// ---------------------------------------------------------------------------
// Memory drift: log/output text mutates over time
// ---------------------------------------------------------------------------
const DRIFT: { match: RegExp; alts: string[] }[] = [
  {
    match: /Experiment completed/i,
    alts: [
      'Experiment outcome unclear',
      'Experiment completed successfully',
      'Experiment... did it run?',
    ],
  },
  {
    match: /Coffee break taken/i,
    alts: ['Coffee break taken', 'Was that coffee or tea?', 'Break logged. Twice?'],
  },
  {
    match: /Reviewer concerns addressed/i,
    alts: [
      'Reviewer concerns addressed',
      'Reviewer concerns... unresolved?',
      'Did we address that?',
    ],
  },
  {
    match: /Progress update submitted/i,
    alts: [
      'Progress update submitted',
      'Update lost in transit',
      'Did the supervisor see it?',
    ],
  },
  {
    match: /Data collected/i,
    alts: ['Data collected', 'Data... partially collected', 'Data integrity uncertain'],
  },
  {
    match: /Read papers/i,
    alts: ['Read papers', 'Skimmed papers, maybe', 'Read the abstract twice'],
  },
]

export function glitchText(
  line: string,
  key: string,
  burnout: number,
  tick: number,
): string {
  const tier = burnoutTier(burnout)
  if (tier === 0) return line
  const fireP = tier === 1 ? 0.15 : tier === 2 ? 0.35 : 0.6
  if (rand('gt-' + key, tick) < fireP) {
    for (const d of DRIFT) {
      if (d.match.test(line)) {
        return d.alts[Math.floor(rand('ga-' + key, tick) * d.alts.length)]
      }
    }
  }
  return line
}

// ---------------------------------------------------------------------------
// Misleading feedback: cell outputs lie about correct results at high burnout
// ---------------------------------------------------------------------------
export function distortOutput(
  output: string,
  key: string,
  burnout: number,
  tick: number,
): string {
  const tier = burnoutTier(burnout)
  if (tier < 2) return glitchText(output, key, burnout, tick)

  if (
    /(Top Conference|-> Conference|Accepted|reputation)/i.test(output) &&
    rand('mo-' + key, tick) < (tier === 3 ? 0.6 : 0.3)
  ) {
    return 'Paper under review... still processing...'
  }
  if (/Coffee break taken|Slept|Rested/i.test(output) && rand('mo2-' + key, tick) < 0.5) {
    return 'Energy -5 (visual glitch)'
  }
  return glitchText(output, key, burnout, tick)
}

// ---------------------------------------------------------------------------
// Reviewer #2: unstable phrasing / contradictions (weakest component is
// still computed deterministically in the simulation layer).
// ---------------------------------------------------------------------------
export function distortReviewer(comment: string, burnout: number, tick: number): string {
  const tier = burnoutTier(burnout)
  if (tier === 0) return comment
  const variants = [
    comment,
    comment.replace('#2', '#2 (rev.)'),
    'Reviewer #2: concerns remain unresolved.',
    'Reviewer #2: on second thought, this seems fine.',
    comment + ' ...or is it?',
  ]
  if (tier === 1) return rand('rv', tick) < 0.4 ? variants[1] : comment
  return variants[Math.floor(rand('rv2', tick) * variants.length)]
}

// ---------------------------------------------------------------------------
// Supervisor: repeats, contradictions, fluctuating urgency
// ---------------------------------------------------------------------------
export function distortSupervisor(alert: string, burnout: number, tick: number): string {
  const tier = burnoutTier(burnout)
  if (tier === 0) return alert
  const variants = [
    'Urgent: update required',
    'No immediate action needed',
    alert,
    'Supervisor: where are we on this?',
    'Supervisor: nevermind, all good.',
  ]
  if (tier === 1) return rand('sv', tick) < 0.35 ? variants[0] : alert
  return variants[Math.floor(rand('sv2', tick) * variants.length)]
}

// ---------------------------------------------------------------------------
// File explorer: duplicates, renames, ghosts, spontaneous folders
// ---------------------------------------------------------------------------
export interface DisplayFolder {
  label: string
  locationId?: string // present => clickable (real); absent => ghost
  ghost?: boolean
  active?: boolean
}

export function distortFolders(
  locations: GameLocation[],
  currentLocation: string,
  burnout: number,
  tick: number,
): DisplayFolder[] {
  const tier = burnoutTier(burnout)
  let items: DisplayFolder[] = locations.map((l) => ({
    label: l.label,
    locationId: l.id,
    active: l.id === currentLocation,
  }))
  if (tier === 0) return items

  if (rand('f-ren', tick) < (tier === 1 ? 0.4 : 0.6)) {
    const i = Math.floor(rand('f-reni', tick) * items.length)
    if (!items[i].active) items[i] = { ...items[i], label: items[i].label + '_tmp' }
  }

  if (tier >= 2) {
    if (rand('f-dup', tick) < 0.6) {
      const i = Math.floor(rand('f-dupi', tick) * items.length)
      items.splice(i, 0, { ...items[i], ghost: true, locationId: undefined })
    }
    if (rand('f-hide', tick) < 0.4) {
      const i = Math.floor(rand('f-hidei', tick) * items.length)
      if (items[i] && !items[i].active) items.splice(i, 1)
    }
  }

  if (tier === 3) {
    const ghosts = [
      'Laboratory_OLD',
      'Library (1)',
      'Office_BACKUP',
      '.ipynb_checkpoints',
      'Untitled1',
    ]
    const n = 1 + Math.floor(rand('f-gn', tick) * 3)
    for (let k = 0; k < n; k++) {
      items.push({ label: ghosts[Math.floor(rand('f-g' + k, tick) * ghosts.length)], ghost: true })
    }
  }
  return items
}

export function distortRoots(burnout: number, tick: number): string[] {
  const roots = ['Research/']
  if (burnoutTier(burnout) === 3) {
    const extra = ['Research_Final/', 'Research_Final_v2/', 'Research_Final_REAL/']
    const n = Math.floor(rand('root-n', tick) * extra.length) + 1
    for (let k = 0; k < n; k++) roots.push(extra[k])
  }
  return roots
}

// ---------------------------------------------------------------------------
// Paper components: visual desync / corruption (score stays correct in sim)
// ---------------------------------------------------------------------------
export function distortPaperField(
  value: number,
  key: string,
  burnout: number,
  tick: number,
): string {
  const tier = burnoutTier(burnout)
  if (tier < 2) return String(value)
  if (rand('pf-' + key, tick) < (tier === 3 ? 0.5 : 0.25)) {
    if (tier === 3 && rand('pfc-' + key, tick) < 0.4) {
      return '░'.repeat(1 + Math.floor(rand('pfn-' + key, tick) * 3))
    }
    const delta = Math.round((rand('pfd-' + key, tick) - 0.5) * 4)
    return String(Math.max(0, value + delta))
  }
  return String(value)
}

// ---------------------------------------------------------------------------
// Terminal log stream: drift + duplicates + reordering + contradictions
// ---------------------------------------------------------------------------
export function distortLogList(log: string[], burnout: number, tick: number): string[] {
  const tier = burnoutTier(burnout)
  if (tier === 0) return log
  let out = log.map((l, i) => glitchText(l, 'log' + i, burnout, tick))

  if (out.length > 0 && rand('log-dup', tick) < (tier === 1 ? 0.3 : 0.6)) {
    const i = out.length - 1 - Math.floor(rand('log-dupi', tick) * Math.min(3, out.length))
    out.splice(i, 0, out[i])
  }
  if (tier >= 2 && out.length > 2 && rand('log-ro', tick) < 0.6) {
    const n = out.length
    const a = n - 1 - Math.floor(rand('log-a', tick) * Math.min(4, n))
    const b = n - 1 - Math.floor(rand('log-b', tick) * Math.min(4, n))
    ;[out[a], out[b]] = [out[b], out[a]]
  }
  if (tier === 3 && out.length > 0 && rand('log-con', tick) < 0.5) {
    out.push('(correction) ' + out[out.length - 1] + ' — unconfirmed')
  }
  return out
}

// Reorder notebook cells visually (instability tier+).
export function reorderCells<T>(arr: T[], burnout: number, tick: number): T[] {
  if (burnoutTier(burnout) < 2) return arr
  if (rand('cell-ro', tick) > 0.5) return arr
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand('cro' + i, tick) * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
