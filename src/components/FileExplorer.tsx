import { useGameStore } from '../store/useGameStore'
import { LOCATIONS, type LocationId } from '../systems/locationSystem'
import { COLLAPSE } from '../systems/collapse'
import { useGlitch } from '../systems/glitch'
import { distortFolders, distortRoots, glitchClass } from '../systems/distortion'

export default function FileExplorer() {
  const currentLocation = useGameStore((s) => s.currentLocation)
  const setLocation = useGameStore((s) => s.setLocation)
  const burnout = useGameStore((s) => s.burnout)
  const graduated = useGameStore((s) => s.graduated)
  const collapsePhase = useGameStore((s) => s.collapsePhase)
  const tick = useGlitch((s) => s.tick)

  // After graduation the explorer stops updating (calm): no distortion.
  const archived = collapsePhase >= COLLAPSE.ARCHIVE
  const distBurnout = graduated ? 0 : burnout

  const items = graduated
    ? LOCATIONS.map((l) => ({
        label: archived ? `${l.label} (archived)` : l.label,
        locationId: l.id,
        active: l.id === currentLocation,
        ghost: false,
      }))
    : distortFolders(LOCATIONS, currentLocation, burnout, tick)
  const roots = graduated ? ['Research/'] : distortRoots(burnout, tick)

  return (
    <div className="flex shrink-0">
      {/* JupyterLab left icon rail */}
      <div className="flex w-10 flex-col items-center gap-3 border-r border-neutral-800 bg-neutral-950 py-3 text-neutral-500">
        <span className={graduated ? '' : 'text-emerald-400'} title="File Browser">
          📁
        </span>
        <span title="Running">▦</span>
        <span title="Commands">⌘</span>
        <span title="Kernels">◉</span>
        <span title="Extensions">🧩</span>
      </div>

      {/* File browser panel */}
      <div
        className={`flex w-52 flex-col border-r border-neutral-800 bg-neutral-950 ${
          archived ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            {archived ? 'File Browser · read-only' : 'File Browser'}
          </span>
          <span className="font-mono text-[10px] text-neutral-600">⟳</span>
        </div>
        <div className={`px-2 py-2 ${graduated ? '' : glitchClass(distBurnout)}`}>
          {roots.map((root, ri) => (
            <div key={root + ri}>
              <div
                className={`px-2 py-1 font-mono text-xs ${
                  ri === 0 ? 'text-neutral-300' : 'text-neutral-600 italic'
                }`}
              >
                📁 {root}
                {archived && ri === 0 && (
                  <span className="text-neutral-600"> (archived)</span>
                )}
              </div>
              {ri === 0 && (
                <div className="mt-1 space-y-0.5">
                  {items.map((it, i) => {
                    const active = !!it.active
                    const clickable = !graduated && !!it.locationId && !it.ghost
                    const last = i === items.length - 1
                    return (
                      <button
                        key={(it.locationId ?? 'ghost') + '-' + i}
                        disabled={!clickable}
                        onClick={() =>
                          clickable && setLocation(it.locationId as LocationId)
                        }
                        className={`flex w-full items-center gap-1 rounded px-2 py-1 text-left font-mono text-xs transition-colors ${
                          active
                            ? 'bg-neutral-800 text-emerald-300'
                            : it.ghost || graduated
                              ? 'cursor-default text-neutral-700 italic'
                              : 'text-neutral-300 hover:bg-neutral-900'
                        }`}
                      >
                        <span className="select-none text-neutral-600">
                          {last ? '└─' : '├─'}
                        </span>
                        <span>
                          {active ? '📂' : it.ghost ? '📄' : '📁'}
                        </span>
                        <span className="truncate">{it.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
