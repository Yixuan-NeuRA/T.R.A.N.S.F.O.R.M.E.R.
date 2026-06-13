// ============================================================================
// PHASE 7.5 + 10.5 — Publication System
// Publication formats are civilization-cultural (papers vs books vs portfolios).
// Component weighting + reviewer voice come from the discipline config.
// ============================================================================

import {
  DISCIPLINE_CONFIGS,
  reviewerVoice,
  type Discipline,
  type PubFamily,
} from './disciplineSystem'
import type { Paper, PaperComponent } from '../types/paper'

export const PUBLICATION_COMPONENTS: PaperComponent[] = [
  'idea',
  'method',
  'results',
  'narrative',
]

export interface PublicationTypeDef {
  id: string
  label: string
  thresholdMod: number // higher = harder to accept
  rewardMult: number
  prestige: 'low' | 'mid' | 'high'
}

// Publication formats per civilization family.
export const PUBLICATION_TYPES_BY_FAMILY: Record<PubFamily, PublicationTypeDef[]> = {
  stem: [
    { id: 'workshop_paper', label: 'Workshop Paper', thresholdMod: -2, rewardMult: 0.8, prestige: 'low' },
    { id: 'conference_paper', label: 'Conference Paper', thresholdMod: 0, rewardMult: 1.0, prestige: 'mid' },
    { id: 'journal_paper', label: 'Journal Paper', thresholdMod: 2, rewardMult: 1.4, prestige: 'high' },
  ],
  social: [
    { id: 'working_paper', label: 'Working Paper', thresholdMod: -2, rewardMult: 0.8, prestige: 'low' },
    { id: 'empirical_study', label: 'Empirical Study', thresholdMod: 0, rewardMult: 1.0, prestige: 'mid' },
    { id: 'flagship_article', label: 'Flagship Article', thresholdMod: 2, rewardMult: 1.4, prestige: 'high' },
  ],
  humanities: [
    { id: 'essay', label: 'Essay', thresholdMod: -1, rewardMult: 0.9, prestige: 'low' },
    { id: 'book_chapter', label: 'Book Chapter', thresholdMod: 0, rewardMult: 1.1, prestige: 'mid' },
    { id: 'monograph', label: 'Monograph', thresholdMod: 2, rewardMult: 1.5, prestige: 'high' },
    { id: 'book', label: 'Book', thresholdMod: 3, rewardMult: 1.7, prestige: 'high' },
  ],
  medicine: [
    { id: 'case_report', label: 'Case Report', thresholdMod: -2, rewardMult: 0.8, prestige: 'low' },
    { id: 'clinical_study', label: 'Clinical Study', thresholdMod: 0, rewardMult: 1.1, prestige: 'mid' },
    { id: 'trial_paper', label: 'Trial Paper', thresholdMod: 2, rewardMult: 1.5, prestige: 'high' },
  ],
  law: [
    { id: 'legal_commentary', label: 'Legal Commentary', thresholdMod: -1, rewardMult: 0.9, prestige: 'low' },
    { id: 'case_analysis', label: 'Case Analysis', thresholdMod: 0, rewardMult: 1.0, prestige: 'mid' },
    { id: 'law_review', label: 'Law Review', thresholdMod: 2, rewardMult: 1.4, prestige: 'high' },
  ],
  creative: [
    { id: 'design_paper', label: 'Design Paper', thresholdMod: -1, rewardMult: 0.9, prestige: 'low' },
    { id: 'portfolio', label: 'Portfolio', thresholdMod: 0, rewardMult: 1.0, prestige: 'mid' },
    { id: 'exhibition', label: 'Exhibition', thresholdMod: 2, rewardMult: 1.4, prestige: 'high' },
  ],
}

export function publicationTypesFor(discipline: Discipline): PublicationTypeDef[] {
  return PUBLICATION_TYPES_BY_FAMILY[DISCIPLINE_CONFIGS[discipline].pubFamily]
}

type Components = Pick<Paper, 'idea' | 'method' | 'results' | 'narrative'>

// Diminishing returns per component: first 4 points full, beyond that 40%.
// Rewards balanced papers over single-stat dumping.
function dim(c: number): number {
  return c <= 4 ? c : 4 + (c - 4) * 0.4
}

export function weightedScore(p: Components, discipline: Discipline): number {
  const w = DISCIPLINE_CONFIGS[discipline].weights
  return (
    (dim(p.idea) * w.idea +
      dim(p.method) * w.method +
      dim(p.results) * w.results +
      dim(p.narrative) * w.narrative) *
    4
  )
}

export function findPublicationType(
  discipline: Discipline,
  id: string,
): PublicationTypeDef {
  const list = publicationTypesFor(discipline)
  return list.find((t) => t.id === id) ?? list[0]
}

function rawSum(p: Components): number {
  return p.idea + p.method + p.results + p.narrative
}

export function weakestComponent(p: Components): PaperComponent {
  let weakest: PaperComponent = PUBLICATION_COMPONENTS[0]
  for (const comp of PUBLICATION_COMPONENTS) {
    if (p[comp] < p[weakest]) weakest = comp
  }
  return weakest
}

// Discipline-aware Reviewer #2: criticizes the weakest component in the
// discipline's (or its civilization's) voice. Deterministic.
export function publicationReviewerComment(
  papers: Paper[],
  discipline: Discipline,
): string {
  const drafts = papers.filter((p) => p.status === 'draft')
  if (drafts.length === 0) return reviewerVoice(discipline, PUBLICATION_COMPONENTS[0])
  const target = drafts.reduce((a, b) => (rawSum(b) < rawSum(a) ? b : a))
  return reviewerVoice(discipline, weakestComponent(target))
}

// A "top-tier" accepted publication (high-prestige format) — for faculty ending.
export function isTopTierPub(p: Paper): boolean {
  if (p.verdict !== 'Accept') return false
  const cfg = DISCIPLINE_CONFIGS[p.discipline as Discipline]
  if (!cfg) return false
  const t = PUBLICATION_TYPES_BY_FAMILY[cfg.pubFamily].find((x) => x.id === p.type)
  return t?.prestige === 'high'
}
