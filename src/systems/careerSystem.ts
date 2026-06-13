// ============================================================================
// PHASE 6 — Career Path System
// A career is a "simulation contract": it sets thresholds + multipliers that
// existing systems respect. It applies parameters only; it never rewrites logic.
// ============================================================================

export type CareerPath = 'master' | 'phd' | 'postdoc'

export interface CareerConfig {
  id: CareerPath
  label: string
  tagline: string
  description: string
  // graduation thresholds
  acceptedPapersRequired: number
  reputationRequired: number
  thesisRequired: boolean
  // system modifiers
  burnoutMult: number // scales positive burnout gains
  reviewerHarshness: number // shifts acceptance thresholds (higher = harsher)
  supervisorChanceMult: number // scales supervisor event frequency
  rewardScale: number // scales reputation reward
  // failure
  rejectionStreakLimit: number // consecutive rejects -> forced exit (0 = none)
  // postdoc-only ending thresholds
  facultyReputation: number
  facultyTopPapers: number
}

export const CAREER_CONFIGS: Record<CareerPath, CareerConfig> = {
  master: {
    id: 'master',
    label: 'Master Student',
    tagline: 'Tutorial · fragile system',
    description:
      'Learn the system and survive the pressure. Forgiving reviewers, slower burnout, lower reward ceiling.',
    acceptedPapersRequired: 1,
    reputationRequired: 9,
    thesisRequired: false,
    burnoutMult: 0.7,
    reviewerHarshness: -1,
    supervisorChanceMult: 0.7,
    rewardScale: 0.85,
    rejectionStreakLimit: 3,
    facultyReputation: 999,
    facultyTopPapers: 999,
  },
  phd: {
    id: 'phd',
    label: 'PhD Candidate',
    tagline: 'Core game · balanced',
    description:
      'Survive the system and publish meaningful work. Standard difficulty. Requires 3 accepted papers and a thesis.',
    acceptedPapersRequired: 3,
    reputationRequired: 27,
    thesisRequired: true,
    burnoutMult: 1.0,
    reviewerHarshness: 0,
    supervisorChanceMult: 1.0,
    rewardScale: 1.0,
    rejectionStreakLimit: 5,
    facultyReputation: 999,
    facultyTopPapers: 999,
  },
  postdoc: {
    id: 'postdoc',
    label: 'Postdoc Researcher',
    tagline: 'Endgame · endurance',
    description:
      'Survive the productivity system indefinitely. No fixed graduation — you must choose how it ends. Harsh reviewers, fast burnout, high reward scaling.',
    acceptedPapersRequired: Number.POSITIVE_INFINITY,
    reputationRequired: Number.POSITIVE_INFINITY,
    thesisRequired: false,
    burnoutMult: 1.3,
    reviewerHarshness: 1,
    supervisorChanceMult: 1.2,
    rewardScale: 1.3,
    rejectionStreakLimit: 0,
    facultyReputation: 40,
    facultyTopPapers: 2,
  },
}

export const CAREER_LIST: CareerConfig[] = [
  CAREER_CONFIGS.master,
  CAREER_CONFIGS.phd,
  CAREER_CONFIGS.postdoc,
]
