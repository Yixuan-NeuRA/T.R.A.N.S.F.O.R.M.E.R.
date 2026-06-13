import { create } from 'zustand'

// Presentation-only "tick". It NEVER touches the simulation/game store.
// It exists purely so the interpretation layer can vary distortions over time
// (flicker, "changes after refresh", contradictions) without altering state.
interface GlitchState {
  tick: number
}

export const useGlitch = create<GlitchState>(() => ({ tick: 0 }))

let started = false
export function startGlitchClock() {
  if (started) return
  started = true
  setInterval(() => {
    useGlitch.setState((s) => ({ tick: s.tick + 1 }))
  }, 2200)
}
