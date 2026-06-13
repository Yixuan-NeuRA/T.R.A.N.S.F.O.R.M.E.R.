// The six locations (folders) and the actions available at each.

export type LocationId =
  | 'Laboratory'
  | 'Library'
  | 'Office'
  | 'Conference'
  | 'Home'
  | 'CoffeeShop'

export interface LocationActionDef {
  id: string
  label: string
}

export interface GameLocation {
  id: LocationId
  label: string
  hint: string
  actions: LocationActionDef[]
}

export const LOCATIONS: GameLocation[] = [
  {
    id: 'Laboratory',
    label: 'Laboratory',
    hint: 'Generate data and results.',
    actions: [
      { id: 'run_experiment', label: 'Run Experiment' },
      { id: 'collect_data', label: 'Collect Data' },
    ],
  },
  {
    id: 'Library',
    label: 'Library',
    hint: 'Build knowledge and ideas.',
    actions: [
      { id: 'read_papers', label: 'Read Papers' },
      { id: 'literature_review', label: 'Literature Review' },
    ],
  },
  {
    id: 'Office',
    label: 'Office',
    hint: 'Write narrative, clear inbox.',
    actions: [
      { id: 'write_paper', label: 'Write Paper' },
      { id: 'reply_emails', label: 'Reply Emails' },
    ],
  },
  {
    id: 'Conference',
    label: 'Conference',
    hint: 'Chance at ideas and reputation.',
    actions: [
      { id: 'attend_talk', label: 'Attend Talk' },
      { id: 'network', label: 'Network' },
    ],
  },
  {
    id: 'Home',
    label: 'Home',
    hint: 'Recover focus and energy.',
    actions: [
      { id: 'sleep', label: 'Sleep' },
      { id: 'rest', label: 'Rest' },
    ],
  },
  {
    id: 'CoffeeShop',
    label: 'CoffeeShop',
    hint: 'Small recovery, maybe an idea.',
    actions: [
      { id: 'coffee_break', label: 'Coffee Break' },
      { id: 'think', label: 'Think' },
    ],
  },
]

export function getLocation(id: LocationId): GameLocation {
  return LOCATIONS.find((l) => l.id === id) ?? LOCATIONS[0]
}
