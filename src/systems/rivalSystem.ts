// ============================================================================
// E — Rival labs. A few competing groups publish in your field: their output
// heats up venue competition (temporary review difficulty), they can scoop
// stale projects, and the Network panel shows your standing among them.
// All numbers stay hidden — only qualitative ranking is shown.
// ============================================================================

import { useTuning } from './tuning'

export interface Rival {
  name: string
  influence: number
}

const NAME_POOL = [
  'Chen Lab',
  'Vasquez Group',
  'K. Tanaka',
  'Müller et al.',
  'Okafor Lab',
  'Ivanova Group',
  'R. Almeida',
  'Park Collective',
]

export function spawnRivals(): Rival[] {
  const pool = [...NAME_POOL]
  const out: Rival[] = []
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    // Rivals start with a small head start — you are the newcomer.
    out.push({ name: pool.splice(idx, 1)[0], influence: 1 + Math.random() * 4 })
  }
  return out
}

// One day of rival activity. Returns the new state + log lines.
export function tickRivals(
  rivals: Rival[],
  fieldHeat: number,
): { rivals: Rival[]; fieldHeat: number; logs: string[] } {
  const T = useTuning.getState()
  const logs: string[] = []
  let heat = fieldHeat * 0.6 // yesterday's noise cools off
  const next = rivals.map((r) => {
    let inf = r.influence + Math.random() * 0.35
    if (Math.random() < T.rivalPublishChance) {
      // a rival lands a paper — the field heats up
      inf += 1.5
      heat += 1.5 * T.fieldHeatMult
      logs.push(`[field] ${r.name} published — competition intensifies.`)
    }
    return { ...r, influence: inf }
  })
  return { rivals: next, fieldHeat: Math.min(4 * T.fieldHeatMult, heat), logs }
}

// Standing among rivals (qualitative; 1 = leading).
export function fieldRank(myInfluence: number, rivals: Rival[]): number {
  return 1 + rivals.filter((r) => r.influence > myInfluence).length
}
