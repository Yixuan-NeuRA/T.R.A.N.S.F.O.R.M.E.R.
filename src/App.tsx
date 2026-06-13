import { useEffect, useState } from 'react'
import MenuBar from './components/MenuBar'
import FileExplorer from './components/FileExplorer'
import StatusPanel from './components/StatusPanel'
import Notebook from './components/Notebook'
import Terminal from './components/Terminal'
import StatusBarBottom from './components/StatusBarBottom'
import StartScreen from './components/StartScreen'
import NetworkView from './components/NetworkView'
import DevPanel from './components/DevPanel'
import { startGlitchClock } from './systems/glitch'
import { useGameStore } from './store/useGameStore'

export default function App() {
  const careerPath = useGameStore((s) => s.careerPath)
  const discipline = useGameStore((s) => s.discipline)
  const showNetwork = useGameStore((s) => s.showNetwork)
  const graduated = useGameStore((s) => s.graduated)
  const collapsePhase = useGameStore((s) => s.collapsePhase)
  const advanceCollapse = useGameStore((s) => s.advanceCollapse)

  const [devOpen, setDevOpen] = useState(false)

  useEffect(() => {
    startGlitchClock()
  }, [])

  // Toggle the dev tuning panel with Ctrl+` or F9.
  // Uses e.code (physical key) so it works even when a Chinese IME is active,
  // which rewrites e.key to 'Process' and broke the old e.key check in Chrome.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.code === 'Backquote') || e.code === 'F9') {
        e.preventDefault()
        setDevOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Drive the staged Academic Collapse Sequence after any ending.
  useEffect(() => {
    if (graduated && collapsePhase > 0 && collapsePhase < 5) {
      const t = window.setTimeout(advanceCollapse, 2600)
      return () => window.clearTimeout(t)
    }
  }, [graduated, collapsePhase, advanceCollapse])

  const configured = careerPath && discipline

  return (
    <>
      {configured ? (
        <div className="flex h-screen flex-col bg-neutral-900 text-neutral-100">
          <MenuBar />
          <div className="flex min-h-0 flex-1">
            <FileExplorer />
            <div className="flex min-w-0 flex-1 flex-col">
              <StatusPanel />
              <div className="flex min-h-0 flex-1">
                <Notebook />
                {showNetwork && <NetworkView />}
              </div>
              <Terminal />
            </div>
          </div>
          <StatusBarBottom />
        </div>
      ) : (
        <StartScreen />
      )}

      {/* Developer tuning panel — hidden; toggle only with Ctrl+` */}
      {devOpen && <DevPanel onClose={() => setDevOpen(false)} />}
    </>
  )
}
