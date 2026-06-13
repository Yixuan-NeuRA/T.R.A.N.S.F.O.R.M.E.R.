// Shared types for the resource + publication systems.
// Phase 7.5: a Paper is now a discipline-aware Publication (4 components).

export type ResourceKey =
  | 'knowledge'
  | 'ideas'
  | 'data'
  | 'narrative'
  | 'reputation'

export type PaperComponent = 'idea' | 'method' | 'results' | 'narrative'

export type PaperStatus = 'draft' | 'archived'

export interface Paper {
  id: string
  type: string // publication type id (discipline-specific)
  discipline: string // discipline id at creation
  idea: number
  method: number
  results: number
  narrative: number
  status: PaperStatus
  verdict?: string // Accept | Reject (final, after review)
  score?: number
  // Phase 8 — venue + multi-round review lifecycle
  // 'under_review' = submitted, waiting for a (delayed) decision.
  // 'revising' = a revision was requested; player must revise + resubmit.
  reviewStage?: 'under_review' | 'revising'
  venue?: string
  venueTier?: number
  round?: number
  revisionCount?: number
  reviewerComments?: string[]
  reviewDueDay?: number // day the decision arrives (delayed feedback)
  // Phase 9 — citation network
  citations?: number
  // B — project layer
  createdDay?: number // staleness reference
  // D — submission combo (transfer-down / rebuttal)
  rejectedVenues?: string[] // venues that already rejected this work
  rejections?: number // times rejected (capped experience bonus)
  rebutBonus?: number // hidden one-shot rebuttal effect for the next decision
}
