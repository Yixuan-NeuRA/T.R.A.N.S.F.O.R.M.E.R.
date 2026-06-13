import type { PaperComponent, ResourceKey } from '../types/paper'

// Which research resource fuels improving each component (cost: 1 each).
// (Scoring/verdict logic now lives in publicationSystem + reviewSystem.)
export const IMPROVE_COST: Record<PaperComponent, ResourceKey> = {
  idea: 'ideas',
  method: 'knowledge',
  results: 'data',
  narrative: 'narrative',
}
