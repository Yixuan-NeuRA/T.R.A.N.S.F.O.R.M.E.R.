// Academic Collapse Sequence — shared constants for the closure event.
// This is a single, irreversible termination. No restart, no replay loop.

export const COLLAPSE = {
  NONE: 0,
  NOTIFICATION: 1, // UI becomes calm; supervisor/reviewer stop
  ARCHIVE: 2, // folders & papers become read-only
  COMPRESSION: 3, // metrics merge into ACADEMIC RECORD
  SHUTDOWN: 4, // panels stop reacting
  FINAL: 5, // final cell + terminated
} as const

export const FINAL_CODE = `class Researcher:
    def work(self):
        pass

    def think(self):
        pass

    def rest(self):
        pass`

// Rare, subtle post-shutdown notes.
export const META_NOTES = [
  'System note:\nNo further optimization required.',
  'You are no longer being simulated.',
]
