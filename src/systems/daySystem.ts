// Day-cycle rules and the light roguelike daily modifier.

export const MAX_ACTIONS_PER_DAY = 6

export type ModifierId = 'focused' | 'tired' | 'coffee'

export interface DailyModifier {
  id: ModifierId
  title: string
  description: string
}

export const MODIFIERS: DailyModifier[] = [
  { id: 'focused', title: 'Focused Day', description: 'Experiment rewards +50%' },
  { id: 'tired', title: 'Tired Day', description: 'Energy costs +50%' },
  { id: 'coffee', title: 'Coffee Day', description: 'Coffee Break restores +50%' },
]

export function rollDailyModifier(): DailyModifier {
  return MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)]
}
