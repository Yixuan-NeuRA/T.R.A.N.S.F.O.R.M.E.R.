// Supervisor event rule.

export const SUPERVISOR_CHANCE = 0.2
export const SUPERVISOR_MESSAGE = 'Supervisor wants progress update.'

// 20% base chance each new day that the supervisor asks for an update.
// `mult` is the career's supervisor-pressure modifier (default 1).
export function rollSupervisor(mult = 1): string | null {
  return Math.random() < SUPERVISOR_CHANCE * mult ? SUPERVISOR_MESSAGE : null
}
