// ============================================================================
// ★6 — Random Events. Fire occasionally on a new day to vary each run.
// Pure data + a roller; the store applies the deltas (keeps it decoupled).
// ============================================================================

export interface EventDelta {
  focus?: number
  energy?: number
  burnout?: number
  meaning?: number
  ideas?: number
  data?: number
  knowledge?: number
  narrative?: number
  reputation?: number
  influence?: number
  collab?: number
}

export interface RandomEvent {
  id: string
  message: string
  d: EventDelta
  needsAccepted?: boolean // only if the player has an accepted publication
}

export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: 'review_invite',
    message: 'You are invited to review for a venue.',
    d: { focus: -8, energy: -5, influence: 1 },
  },
  {
    id: 'collaboration_offer',
    message: 'A collaboration is proposed over coffee.',
    d: { collab: 2, meaning: 3, ideas: 1 },
  },
  {
    id: 'breakthrough',
    message: 'An experiment yields an unexpected breakthrough.',
    d: { ideas: 3, data: 2, meaning: 6 },
  },
  {
    id: 'sabbatical',
    message: 'A short sabbatical is granted. You actually rest.',
    d: { burnout: -20, focus: 10, energy: 10 },
  },
  {
    id: 'grant_awarded',
    message: 'A grant is awarded.',
    d: { reputation: 5, meaning: 4 },
  },
  {
    id: 'mentor_praise',
    message: 'Your advisor praises your recent progress.',
    d: { meaning: 5 },
  },
  {
    id: 'conference_travel',
    message: 'You travel to a conference and make connections.',
    d: { energy: -10, ideas: 2, collab: 1 },
  },
  {
    id: 'admin_burden',
    message: 'Administrative duties pile up.',
    d: { focus: -10, burnout: 6 },
  },
  {
    id: 'scooped',
    message: 'A competing group published your idea first.',
    d: { meaning: -10, reputation: -2 },
    needsAccepted: true,
  },
  {
    id: 'citation_surge',
    message: 'One of your papers is suddenly widely cited.',
    d: { influence: 3, meaning: 4, reputation: 2 },
    needsAccepted: true,
  },
]

// ~28% chance per day. Returns null if nothing happens.
export function rollEvent(hasAccepted: boolean): RandomEvent | null {
  if (Math.random() > 0.28) return null
  const pool = RANDOM_EVENTS.filter((e) => !e.needsAccepted || hasAccepted)
  return pool[Math.floor(Math.random() * pool.length)]
}
