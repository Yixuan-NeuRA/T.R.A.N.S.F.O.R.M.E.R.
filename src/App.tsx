import { useEffect } from 'react'
import MenuBar from './components/MenuBar'
import FileExplorer from './components/FileExplorer'
import StatusPanel from './components/StatusPanel'
import Notebook from './components/Notebook'
import Terminal from './components/Terminal'
import StatusBarBottom from './components/StatusBarBottom'
import StartScreen from './components/StartScreen'
import { startGlitchClock } from './systems/glitch'
import { useGameStore } from './store/useGameStore'
import { panelsInSlot, type PanelDef } from './systems/panels'

// Mounts a single registered panel and wires its standard onClose to the store.
function PanelHost({ def }: { def: PanelDef }) {
  const closePanel = useGameStore((s) => s.closePanel)
  const Comp = def.component
  return <Comp onClose={() => closePanel(def.id)} />
}

export default function App() {
  const careerPath = useGameStore((s) => s.careerPath)
  const discipline = useGameStore((s) => s.discipline)
  const graduated = useGameStore((s) => s.graduated)
  const collapsePhase = useGameStore((s) => s.collapsePhase)
  const advanceCollapse = useGameStore((s) => s.advanceCollapse)
  const openPanels = useGameStore((s) => s.openPanels)
  const togglePanel = useGameStore((s) => s.togglePanel)

  const openSide = panelsInSlot('side').filter((p) => openPanels.includes(p.id))
  const openOverlay = panelsInSlot('overlay').filter((p) =>
    openPanels.includes(p.id),
  )

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
        togglePanel('dev')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePanel])

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
                {openSide.map((p) => (
                  <PanelHost key={p.id} def={p} />
                ))}
              </div>
              <Terminal />
            </div>
          </div>
          <StatusBarBottom />
        </div>
      ) : (
        <StartScreen />
      )}

      {/* Floating overlay windows (e.g. Dev Tuning, toggled with Ctrl+`) */}
      {openOverlay.map((p) => (
        <PanelHost key={p.id} def={p} />
      ))}
    </>
  )
}
