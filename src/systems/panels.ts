// ============================================================================
// Panel registry. A single source of truth for every dockable / overlay window
// in the app. Adding a new window = write a component + add one entry here.
//
// The game store keeps only a flat list of *open* panel ids (`openPanels`);
// it knows nothing about how each panel renders. App.tsx walks this registry,
// filters by slot, and mounts whatever is open. MenuBar walks it to build real
// menu entries. Components stay decoupled from the layout.
// ============================================================================

import type { ComponentType } from 'react'
import NetworkView from '../components/NetworkView'
import DevPanel from '../components/DevPanel'

export type PanelId = 'network' | 'dev'

// Where a panel lives on screen.
//  - 'side'    : docked column to the right of the Notebook (in document flow).
//  - 'overlay' : floating layer above everything (fixed-position).
export type PanelSlot = 'side' | 'overlay'

// Every panel component receives the same props, so the registry can mount any
// of them uniformly. Panels that don't need to self-close (e.g. docked ones)
// may simply ignore `onClose`.
export interface PanelProps {
  onClose: () => void
}

export interface PanelDef {
  id: PanelId
  /** English label; passed through i18n `t()` at render time. */
  title: string
  slot: PanelSlot
  /** Which MenuBar menu surfaces this panel (e.g. 'View', 'Settings'). */
  menu?: string
  /** Human-readable shortcut hint shown in menus. */
  shortcut?: string
  /** Hidden panels are reachable only by shortcut, never listed in menus. */
  hidden?: boolean
  component: ComponentType<PanelProps>
}

export const PANELS: PanelDef[] = [
  {
    id: 'network',
    title: 'Network View',
    slot: 'side',
    menu: 'View',
    component: NetworkView,
  },
  {
    id: 'dev',
    title: 'Dev Tuning',
    slot: 'overlay',
    menu: 'Settings',
    shortcut: 'Ctrl+`',
    hidden: true,
    component: DevPanel,
  },
]

export const PANELS_BY_ID: Record<PanelId, PanelDef> = Object.fromEntries(
  PANELS.map((p) => [p.id, p]),
) as Record<PanelId, PanelDef>

export const panelsInSlot = (slot: PanelSlot): PanelDef[] =>
  PANELS.filter((p) => p.slot === slot)

/** Panels that should appear under a given MenuBar menu (excludes hidden ones). */
export const panelsInMenu = (menu: string): PanelDef[] =>
  PANELS.filter((p) => p.menu === menu && !p.hidden)
