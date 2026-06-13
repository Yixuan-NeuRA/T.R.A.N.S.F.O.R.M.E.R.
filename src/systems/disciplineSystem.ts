// ============================================================================
// PHASE 10.5 — Academic Civilizations
// Disciplines are grouped into civilizations (knowledge-production cultures).
// A discipline changes simulation behavior via hidden balancing knobs:
//   burnoutGrowthRate · meaningDecayRate · cycleLength · venueCompetition · variance
// plus per-civilization venue family, publication family, and reviewer voice.
// Existing 5 ids (cs/bio/psych/physics/eng) are preserved and reused.
// ============================================================================

import type { PaperComponent } from '../types/paper'
import type { UiTheme } from './themeSystem'

export type Civilization =
  | 'stem'
  | 'social'
  | 'humanities'
  | 'professional'
  | 'creative'

export type Discipline =
  // STEM
  | 'cs' // computer science
  | 'ai'
  | 'physics'
  | 'eng' // engineering
  | 'chemistry'
  | 'bio' // life sciences
  | 'envsci'
  // Social science
  | 'psych' // psychology
  | 'sociology'
  | 'polisci'
  | 'econ'
  | 'education'
  // Humanities
  | 'history'
  | 'philosophy'
  | 'literature'
  | 'classics'
  // Professional
  | 'medicine'
  | 'law'
  // Creative
  | 'design'
  | 'architecture'
  | 'media_arts'

export type VenueFamily =
  | 'cs'
  | 'bio'
  | 'psych'
  | 'physics'
  | 'eng'
  | 'humanities'
  | 'medicine'
  | 'law'
  | 'creative'

export type PubFamily =
  | 'stem'
  | 'social'
  | 'humanities'
  | 'medicine'
  | 'law'
  | 'creative'

export type SpecialMechanic =
  | 'obsolescence'
  | 'fieldwork'
  | 'elite'
  | 'longitudinal'
  | 'infinite'
  | 'ethics'
  | 'subjective'

type Weights = Record<PaperComponent, number>

// Reusable weighting archetypes (sum ≈ 1).
const W = {
  idea: { idea: 0.4, results: 0.3, method: 0.2, narrative: 0.1 } as Weights,
  rigor: { method: 0.5, idea: 0.3, results: 0.1, narrative: 0.1 } as Weights,
  data: { results: 0.4, method: 0.3, idea: 0.2, narrative: 0.1 } as Weights,
  interp: { narrative: 0.4, results: 0.3, idea: 0.2, method: 0.1 } as Weights,
  text: { narrative: 0.5, idea: 0.3, method: 0.1, results: 0.1 } as Weights,
  applied: { results: 0.4, method: 0.3, narrative: 0.2, idea: 0.1 } as Weights,
  craft: { narrative: 0.4, idea: 0.4, results: 0.1, method: 0.1 } as Weights,
}

export interface DisciplineConfig {
  id: Discipline
  label: string
  civ: Civilization
  defaultEnv: UiTheme
  venueFamily: VenueFamily
  pubFamily: PubFamily
  weights: Weights
  harshness: number // acceptance threshold shift
  reviewEvery: number // experiments per Reviewer #2 event
  // hidden balancing — players only perceive effects
  burnoutGrowthRate: number
  meaningDecayRate: number
  cycleLength: number // review latency multiplier
  venueCompetition: number // extra hidden selectivity penalty
  variance: number // extra reviewer noise (creative is high)
  special?: SpecialMechanic
  reviewerOverride?: Partial<Record<PaperComponent, string>>
}

export const DISCIPLINE_CONFIGS: Record<Discipline, DisciplineConfig> = {
  // ---------------- STEM ----------------
  cs: {
    id: 'cs', label: 'Computer Science', civ: 'stem', defaultEnv: 'jupyter',
    venueFamily: 'cs', pubFamily: 'stem', weights: W.idea, harshness: 1, reviewEvery: 4,
    burnoutGrowthRate: 1.1, meaningDecayRate: 1.1, cycleLength: 0.9, venueCompetition: 1, variance: 0,
    reviewerOverride: { idea: 'Reviewer #2: Not novel enough.' },
  },
  ai: {
    id: 'ai', label: 'Artificial Intelligence', civ: 'stem', defaultEnv: 'jupyter',
    venueFamily: 'cs', pubFamily: 'stem', weights: W.idea, harshness: 1, reviewEvery: 3,
    burnoutGrowthRate: 1.3, meaningDecayRate: 1.4, cycleLength: 0.8, venueCompetition: 2, variance: 1,
    special: 'obsolescence',
    reviewerOverride: { idea: 'Reviewer #2: A concurrent submission already does this.' },
  },
  physics: {
    id: 'physics', label: 'Physics / Mathematics', civ: 'stem', defaultEnv: 'matlab',
    venueFamily: 'physics', pubFamily: 'stem', weights: W.rigor, harshness: 2, reviewEvery: 4,
    burnoutGrowthRate: 1.0, meaningDecayRate: 0.8, cycleLength: 1.1, venueCompetition: 1, variance: 0,
    reviewerOverride: { method: 'Reviewer #2: Mathematical derivation insufficient.' },
  },
  eng: {
    id: 'eng', label: 'Engineering', civ: 'stem', defaultEnv: 'matlab',
    venueFamily: 'eng', pubFamily: 'stem', weights: W.applied, harshness: -1, reviewEvery: 6,
    burnoutGrowthRate: 1.0, meaningDecayRate: 0.9, cycleLength: 0.9, venueCompetition: 0, variance: 0,
    reviewerOverride: { results: 'Reviewer #2: Benchmarks insufficient.' },
  },
  chemistry: {
    id: 'chemistry', label: 'Chemistry', civ: 'stem', defaultEnv: 'rstudio',
    venueFamily: 'bio', pubFamily: 'stem', weights: W.rigor, harshness: 1, reviewEvery: 5,
    burnoutGrowthRate: 1.1, meaningDecayRate: 0.9, cycleLength: 1.1, venueCompetition: 1, variance: 0,
    reviewerOverride: { method: 'Reviewer #2: Synthesis is not adequately characterized.' },
  },
  bio: {
    id: 'bio', label: 'Life Sciences', civ: 'stem', defaultEnv: 'rstudio',
    venueFamily: 'bio', pubFamily: 'stem', weights: W.data, harshness: 0, reviewEvery: 5,
    burnoutGrowthRate: 1.1, meaningDecayRate: 1.0, cycleLength: 1.2, venueCompetition: 1, variance: 0,
    reviewerOverride: { results: 'Reviewer #2: Insufficient replicates.' },
  },
  envsci: {
    id: 'envsci', label: 'Environmental Science', civ: 'stem', defaultEnv: 'rstudio',
    venueFamily: 'bio', pubFamily: 'stem', weights: W.data, harshness: 0, reviewEvery: 5,
    burnoutGrowthRate: 1.0, meaningDecayRate: 1.0, cycleLength: 1.3, venueCompetition: 0, variance: 1,
    special: 'fieldwork',
    reviewerOverride: { results: 'Reviewer #2: Sampling coverage is incomplete.' },
  },
  // ------------- Social Science -------------
  psych: {
    id: 'psych', label: 'Psychology', civ: 'social', defaultEnv: 'rstudio',
    venueFamily: 'psych', pubFamily: 'social', weights: W.interp, harshness: 0, reviewEvery: 5,
    burnoutGrowthRate: 1.0, meaningDecayRate: 1.1, cycleLength: 1.1, venueCompetition: 0, variance: 1,
    reviewerOverride: { narrative: 'Reviewer #2: Interpretation is unclear.' },
  },
  sociology: {
    id: 'sociology', label: 'Sociology', civ: 'social', defaultEnv: 'rstudio',
    venueFamily: 'psych', pubFamily: 'social', weights: W.interp, harshness: 0, reviewEvery: 5,
    burnoutGrowthRate: 1.0, meaningDecayRate: 1.1, cycleLength: 1.2, venueCompetition: 0, variance: 1,
  },
  polisci: {
    id: 'polisci', label: 'Political Science', civ: 'social', defaultEnv: 'rstudio',
    venueFamily: 'psych', pubFamily: 'social', weights: W.interp, harshness: 1, reviewEvery: 5,
    burnoutGrowthRate: 1.1, meaningDecayRate: 1.1, cycleLength: 1.2, venueCompetition: 1, variance: 1,
    reviewerOverride: { method: 'Reviewer #2: Causal identification is weak.' },
  },
  econ: {
    id: 'econ', label: 'Economics', civ: 'social', defaultEnv: 'rstudio',
    venueFamily: 'psych', pubFamily: 'social', weights: W.rigor, harshness: 2, reviewEvery: 6,
    burnoutGrowthRate: 1.4, meaningDecayRate: 1.2, cycleLength: 1.3, venueCompetition: 3, variance: 0,
    special: 'elite',
    reviewerOverride: { method: 'Reviewer #2: Identification strategy is insufficient.' },
  },
  education: {
    id: 'education', label: 'Education', civ: 'social', defaultEnv: 'rstudio',
    venueFamily: 'psych', pubFamily: 'social', weights: W.interp, harshness: 0, reviewEvery: 5,
    burnoutGrowthRate: 1.0, meaningDecayRate: 1.0, cycleLength: 1.5, venueCompetition: 0, variance: 1,
    special: 'longitudinal',
  },
  // -------------- Humanities --------------
  history: {
    id: 'history', label: 'History', civ: 'humanities', defaultEnv: 'jupyter',
    venueFamily: 'humanities', pubFamily: 'humanities', weights: W.text, harshness: 1, reviewEvery: 6,
    burnoutGrowthRate: 0.9, meaningDecayRate: 0.6, cycleLength: 1.4, venueCompetition: 0, variance: 1,
    reviewerOverride: { narrative: 'Reviewer #2: The archival basis is thin.' },
  },
  philosophy: {
    id: 'philosophy', label: 'Philosophy', civ: 'humanities', defaultEnv: 'jupyter',
    venueFamily: 'humanities', pubFamily: 'humanities', weights: W.text, harshness: 1, reviewEvery: 6,
    burnoutGrowthRate: 0.9, meaningDecayRate: 0.5, cycleLength: 1.5, venueCompetition: 0, variance: 2,
    special: 'infinite',
    reviewerOverride: { idea: 'Reviewer #2: The argument remains underdeveloped.' },
  },
  literature: {
    id: 'literature', label: 'Literature', civ: 'humanities', defaultEnv: 'jupyter',
    venueFamily: 'humanities', pubFamily: 'humanities', weights: W.text, harshness: 1, reviewEvery: 6,
    burnoutGrowthRate: 0.9, meaningDecayRate: 0.6, cycleLength: 1.4, venueCompetition: 0, variance: 2,
    reviewerOverride: { narrative: 'Reviewer #2: The close reading is unconvincing.' },
  },
  classics: {
    id: 'classics', label: 'Classics', civ: 'humanities', defaultEnv: 'jupyter',
    venueFamily: 'humanities', pubFamily: 'humanities', weights: W.text, harshness: 1, reviewEvery: 6,
    burnoutGrowthRate: 0.9, meaningDecayRate: 0.6, cycleLength: 1.4, venueCompetition: 0, variance: 1,
  },
  // -------------- Professional --------------
  medicine: {
    id: 'medicine', label: 'Medicine', civ: 'professional', defaultEnv: 'rstudio',
    venueFamily: 'medicine', pubFamily: 'medicine', weights: W.data, harshness: 1, reviewEvery: 5,
    burnoutGrowthRate: 1.4, meaningDecayRate: 1.0, cycleLength: 1.4, venueCompetition: 1, variance: 0,
    special: 'ethics',
    reviewerOverride: { results: 'Reviewer #2: Clinical relevance is unclear.' },
  },
  law: {
    id: 'law', label: 'Law', civ: 'professional', defaultEnv: 'jupyter',
    venueFamily: 'law', pubFamily: 'law', weights: W.text, harshness: 1, reviewEvery: 6,
    burnoutGrowthRate: 1.1, meaningDecayRate: 0.9, cycleLength: 1.2, venueCompetition: 0, variance: 1,
    reviewerOverride: { idea: 'Reviewer #2: Insufficient engagement with precedent.' },
  },
  // ---------------- Creative ----------------
  design: {
    id: 'design', label: 'Design', civ: 'creative', defaultEnv: 'jupyter',
    venueFamily: 'creative', pubFamily: 'creative', weights: W.craft, harshness: 0, reviewEvery: 6,
    burnoutGrowthRate: 1.0, meaningDecayRate: 1.0, cycleLength: 1.0, venueCompetition: 0, variance: 3,
    special: 'subjective',
    reviewerOverride: { narrative: 'Reviewer #2: Aesthetically interesting, but the contribution is unclear.' },
  },
  architecture: {
    id: 'architecture', label: 'Architecture', civ: 'creative', defaultEnv: 'jupyter',
    venueFamily: 'creative', pubFamily: 'creative', weights: W.craft, harshness: 0, reviewEvery: 6,
    burnoutGrowthRate: 1.0, meaningDecayRate: 1.0, cycleLength: 1.1, venueCompetition: 0, variance: 2,
    special: 'subjective',
  },
  media_arts: {
    id: 'media_arts', label: 'Media Arts', civ: 'creative', defaultEnv: 'jupyter',
    venueFamily: 'creative', pubFamily: 'creative', weights: W.craft, harshness: 0, reviewEvery: 6,
    burnoutGrowthRate: 1.0, meaningDecayRate: 1.1, cycleLength: 1.0, venueCompetition: 0, variance: 3,
    special: 'subjective',
  },
}

// Per-civilization reviewer voice (fallback when a discipline has no override).
export interface CivilizationConfig {
  id: Civilization
  label: string
  philosophy: string
  reviewerVoice: Record<PaperComponent, string>
}

export const CIVILIZATIONS: Record<Civilization, CivilizationConfig> = {
  stem: {
    id: 'stem',
    label: 'STEM',
    philosophy: 'Knowledge emerges through experiments, models, and reproducibility.',
    reviewerVoice: {
      idea: 'Reviewer #2: Limited novelty.',
      method: 'Reviewer #2: Methodology is inadequate.',
      results: 'Reviewer #2: Results are not convincing.',
      narrative: 'Reviewer #2: The contribution is unclear.',
    },
  },
  social: {
    id: 'social',
    label: 'Social Science',
    philosophy: 'Knowledge emerges through interpretation of human systems.',
    reviewerVoice: {
      idea: 'Reviewer #2: The hypothesis is underspecified.',
      method: 'Reviewer #2: Causal inference is weak.',
      results: 'Reviewer #2: The effect is not robust.',
      narrative: 'Reviewer #2: Interpretation is not sufficiently supported.',
    },
  },
  humanities: {
    id: 'humanities',
    label: 'Humanities',
    philosophy: 'Knowledge emerges through argument, interpretation, and context.',
    reviewerVoice: {
      idea: 'Reviewer #2: The argument is underdeveloped.',
      method: 'Reviewer #2: The scholarly engagement is thin.',
      results: 'Reviewer #2: The evidence is selective.',
      narrative: 'Reviewer #2: The interpretation lacks originality.',
    },
  },
  professional: {
    id: 'professional',
    label: 'Professional',
    philosophy: 'Knowledge exists to influence practice.',
    reviewerVoice: {
      idea: 'Reviewer #2: The contribution to practice is unclear.',
      method: 'Reviewer #2: Methodological rigor is insufficient.',
      results: 'Reviewer #2: The findings are not actionable.',
      narrative: 'Reviewer #2: The framing is not convincing.',
    },
  },
  creative: {
    id: 'creative',
    label: 'Creative',
    philosophy: 'Knowledge emerges through creation.',
    reviewerVoice: {
      idea: 'Reviewer #2: The concept is not original enough.',
      method: 'Reviewer #2: The process is underexplained.',
      results: 'Reviewer #2: The execution is uneven.',
      narrative: 'Reviewer #2: The critical reflection is thin.',
    },
  },
}

export const CIVILIZATION_LIST: CivilizationConfig[] = [
  CIVILIZATIONS.stem,
  CIVILIZATIONS.social,
  CIVILIZATIONS.humanities,
  CIVILIZATIONS.professional,
  CIVILIZATIONS.creative,
]

export const DISCIPLINE_LIST: DisciplineConfig[] = Object.values(DISCIPLINE_CONFIGS)

export function disciplinesOf(civ: Civilization): DisciplineConfig[] {
  return DISCIPLINE_LIST.filter((d) => d.civ === civ)
}

export function reviewerVoice(discipline: Discipline, comp: PaperComponent): string {
  const d = DISCIPLINE_CONFIGS[discipline]
  return d.reviewerOverride?.[comp] ?? CIVILIZATIONS[d.civ].reviewerVoice[comp]
}
