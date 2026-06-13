// ============================================================================
// PHASE 8 + 10.5 — Venue System (5-tier: Top · Q1 · Q2 · Q3 · Q4)
// Venues belong to a "family" (a discipline's venue ecosystem). Each civilization
// has its own outlets. Hidden selectivity/variance + delayed reviews.
// Lower tier number = more prestigious (Top=1 … Q4=5).
// ============================================================================

import {
  DISCIPLINE_CONFIGS,
  type Discipline,
  type VenueFamily,
} from './disciplineSystem'

export type Tier = 1 | 2 | 3 | 4 | 5

export interface Venue {
  name: string
  family: VenueFamily | 'general'
  tier: Tier
  selectivity: number // hidden acceptance bar
  variance: number // hidden reviewer noise amplitude
}

export const VENUES: Venue[] = [
  // ---- General (visible to every discipline) ----
  { name: 'Nature', family: 'general', tier: 1, selectivity: 18, variance: 7 },
  { name: 'Science', family: 'general', tier: 1, selectivity: 17, variance: 7 },
  { name: 'PNAS', family: 'general', tier: 2, selectivity: 14, variance: 6 },
  { name: 'Open-Access Megajournal', family: 'general', tier: 4, selectivity: 7, variance: 4 },
  { name: 'Preprint Archive', family: 'general', tier: 5, selectivity: 3, variance: 2 },

  // ---- Computer Science / AI ----
  { name: 'NeurIPS', family: 'cs', tier: 1, selectivity: 17, variance: 7 },
  { name: 'ICML', family: 'cs', tier: 1, selectivity: 16, variance: 7 },
  { name: 'CVPR', family: 'cs', tier: 2, selectivity: 13, variance: 6 },
  { name: 'AAAI', family: 'cs', tier: 3, selectivity: 10, variance: 5 },
  { name: 'IEEE Access', family: 'cs', tier: 4, selectivity: 7, variance: 4 },
  { name: 'ML Workshop', family: 'cs', tier: 4, selectivity: 6, variance: 4 },
  { name: 'arXiv (cs)', family: 'cs', tier: 5, selectivity: 3, variance: 2 },

  // ---- Life / Environmental / Chemistry ----
  { name: 'Cell', family: 'bio', tier: 1, selectivity: 17, variance: 7 },
  { name: 'Nature Methods', family: 'bio', tier: 1, selectivity: 16, variance: 7 },
  { name: 'eLife', family: 'bio', tier: 2, selectivity: 13, variance: 6 },
  { name: 'Journal of Biology', family: 'bio', tier: 3, selectivity: 10, variance: 5 },
  { name: 'BMC Reports', family: 'bio', tier: 4, selectivity: 7, variance: 4 },
  { name: 'Experimental Reports', family: 'bio', tier: 4, selectivity: 6, variance: 4 },
  { name: 'bioRxiv', family: 'bio', tier: 5, selectivity: 3, variance: 2 },

  // ---- Physics / Mathematics ----
  { name: 'PRL', family: 'physics', tier: 1, selectivity: 17, variance: 7 },
  { name: 'Nature Physics', family: 'physics', tier: 1, selectivity: 16, variance: 7 },
  { name: 'Phys. Rev. X', family: 'physics', tier: 2, selectivity: 13, variance: 6 },
  { name: 'Physical Review', family: 'physics', tier: 3, selectivity: 10, variance: 5 },
  { name: 'J. Applied Physics', family: 'physics', tier: 4, selectivity: 7, variance: 4 },
  { name: 'Conference Proceedings', family: 'physics', tier: 4, selectivity: 6, variance: 4 },
  { name: 'arXiv (physics)', family: 'physics', tier: 5, selectivity: 3, variance: 2 },

  // ---- Engineering ----
  { name: 'IEEE Trans. Robotics', family: 'eng', tier: 1, selectivity: 16, variance: 6 },
  { name: 'IEEE Trans. Systems', family: 'eng', tier: 1, selectivity: 15, variance: 6 },
  { name: 'ACM Systems', family: 'eng', tier: 2, selectivity: 13, variance: 5 },
  { name: 'Applied Eng. Journal', family: 'eng', tier: 3, selectivity: 9, variance: 5 },
  { name: 'Engineering Letters', family: 'eng', tier: 4, selectivity: 7, variance: 4 },
  { name: 'Industry Demo Track', family: 'eng', tier: 4, selectivity: 6, variance: 4 },
  { name: 'Tech Report Server', family: 'eng', tier: 5, selectivity: 4, variance: 2 },

  // ---- Social Science (psych/socio/poli/econ/edu) ----
  { name: 'Top Social Science Review', family: 'psych', tier: 1, selectivity: 17, variance: 7 },
  { name: 'Psychological Science', family: 'psych', tier: 1, selectivity: 15, variance: 7 },
  { name: 'J. Cognitive Science', family: 'psych', tier: 2, selectivity: 13, variance: 6 },
  { name: 'Behavioral Quarterly', family: 'psych', tier: 3, selectivity: 10, variance: 5 },
  { name: 'Society & Policy', family: 'psych', tier: 4, selectivity: 7, variance: 4 },
  { name: 'PsyArXiv', family: 'psych', tier: 5, selectivity: 4, variance: 3 },
  { name: 'Working Paper Series', family: 'psych', tier: 5, selectivity: 3, variance: 2 },

  // ---- Humanities (history/philosophy/literature/classics) ----
  { name: 'Oxford University Press', family: 'humanities', tier: 1, selectivity: 17, variance: 8 },
  { name: 'Critical Inquiry', family: 'humanities', tier: 1, selectivity: 15, variance: 7 },
  { name: 'Cambridge Journal', family: 'humanities', tier: 2, selectivity: 13, variance: 6 },
  { name: 'Journal of the Humanities', family: 'humanities', tier: 3, selectivity: 10, variance: 5 },
  { name: 'Edited Volume', family: 'humanities', tier: 4, selectivity: 7, variance: 4 },
  { name: 'Conference Essay', family: 'humanities', tier: 4, selectivity: 6, variance: 4 },
  { name: 'Departmental Working Paper', family: 'humanities', tier: 5, selectivity: 4, variance: 3 },

  // ---- Medicine ----
  { name: 'NEJM', family: 'medicine', tier: 1, selectivity: 18, variance: 7 },
  { name: 'The Lancet', family: 'medicine', tier: 1, selectivity: 17, variance: 7 },
  { name: 'JAMA', family: 'medicine', tier: 2, selectivity: 14, variance: 6 },
  { name: 'Clinical Journal', family: 'medicine', tier: 3, selectivity: 10, variance: 5 },
  { name: 'Case Reports', family: 'medicine', tier: 4, selectivity: 7, variance: 4 },
  { name: 'Regional Med Journal', family: 'medicine', tier: 4, selectivity: 6, variance: 4 },
  { name: 'medRxiv', family: 'medicine', tier: 5, selectivity: 4, variance: 2 },

  // ---- Law ----
  { name: 'Harvard Law Review', family: 'law', tier: 1, selectivity: 16, variance: 7 },
  { name: 'Yale Law Journal', family: 'law', tier: 1, selectivity: 15, variance: 7 },
  { name: 'Flagship Law Journal', family: 'law', tier: 2, selectivity: 13, variance: 6 },
  { name: 'Legal Commentary', family: 'law', tier: 3, selectivity: 9, variance: 5 },
  { name: 'Case Analysis Review', family: 'law', tier: 4, selectivity: 7, variance: 4 },
  { name: 'Regional Law Review', family: 'law', tier: 4, selectivity: 6, variance: 4 },
  { name: 'SSRN (legal)', family: 'law', tier: 5, selectivity: 4, variance: 3 },

  // ---- Creative (design/architecture/media arts) ----
  { name: 'Biennale Exhibition', family: 'creative', tier: 1, selectivity: 15, variance: 9 },
  { name: 'Design Flagship', family: 'creative', tier: 1, selectivity: 14, variance: 9 },
  { name: 'Juried Showcase', family: 'creative', tier: 2, selectivity: 12, variance: 7 },
  { name: 'Design Journal', family: 'creative', tier: 3, selectivity: 9, variance: 6 },
  { name: 'Regional Exhibition', family: 'creative', tier: 4, selectivity: 7, variance: 5 },
  { name: 'Student Showcase', family: 'creative', tier: 4, selectivity: 6, variance: 5 },
  { name: 'Open Portfolio', family: 'creative', tier: 5, selectivity: 4, variance: 4 },
]

export function venuesFor(discipline: Discipline): Venue[] {
  const fam = DISCIPLINE_CONFIGS[discipline].venueFamily
  return VENUES.filter((v) => v.family === fam || v.family === 'general').sort(
    (a, b) => a.tier - b.tier,
  )
}

export function findVenue(name: string): Venue | undefined {
  return VENUES.find((v) => v.name === name)
}

// Discipline×venue fit (hidden multiplier on quality).
export function disciplineFit(pubDiscipline: Discipline, v: Venue): number {
  const fam = DISCIPLINE_CONFIGS[pubDiscipline].venueFamily
  if (v.family === fam) return 1.0
  if (v.family === 'general') return 0.8 // elite generalist: ok but brutal
  return 0.4 // mismatch penalty
}

export const TIERS: Tier[] = [1, 2, 3, 4, 5]

export const TIER_LABELS: Record<Tier, string> = {
  1: 'Top tier · flagship',
  2: 'Q1 · leading',
  3: 'Q2 · solid',
  4: 'Q3 · regional',
  5: 'Q4 · preprint / minor',
}

// Tier-indexed tuning (index 0 unused).
const REWARD = [0, 30, 20, 13, 8, 4]
const INFLUENCE = [0, 6, 4, 2, 1, 1]
const SUBMIT_BURN = [0, 5, 4, 3, 2, 1]
const MEANING_GAIN = [0, 15, 12, 9, 7, 6]
const CITE_BASE = [0, 5, 4, 3, 2, 1] // Top seeds most citations
const LAT_BASE = [0, 6, 5, 3, 2, 1]
const LAT_SPAN = [0, 4, 4, 3, 2, 2]

export const tierReward = (t: Tier) => REWARD[t]
export const tierInfluence = (t: Tier) => INFLUENCE[t]
export const tierSubmitBurnout = (t: Tier) => SUBMIT_BURN[t]
export const tierMeaningGain = (t: Tier) => MEANING_GAIN[t]
export const tierCitationBase = (t: number) => CITE_BASE[Math.min(5, Math.max(1, t))]
export const tierReviewers = (t: Tier) => (t <= 3 ? 3 : 2)

// Review latency in days — elite venues slow, preprints fast. `cycleLength`
// (discipline-specific) stretches it: medicine/education take much longer.
export function reviewLatency(venue: Venue, round: number, cycleLength = 1): number {
  const base = LAT_BASE[venue.tier]
  const jitter = Math.floor(Math.random() * LAT_SPAN[venue.tier])
  return Math.max(1, Math.round((base + jitter + (round >= 2 ? 1 : 0)) * cycleLength))
}

export function latencyHint(venue: Venue): string {
  return venue.tier <= 2
    ? 'a long wait'
    : venue.tier === 3
      ? 'a few rounds'
      : 'a quick turnaround'
}
