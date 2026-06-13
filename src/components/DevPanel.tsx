import { useState } from 'react'
import { type Tuning, useTuning } from '../systems/tuning'

interface FieldDef {
  key: keyof Tuning
  label: string
  min: number
  max: number
  step: number
}

interface Group {
  title: string
  fields: FieldDef[]
}

const GROUPS: Group[] = [
  {
    title: 'Daily loop',
    fields: [
      { key: 'maxActionsPerDay', label: 'Actions / day', min: 1, max: 12, step: 1 },
      { key: 'gainSuccess', label: 'Gain success rate', min: 0, max: 1, step: 0.05 },
      { key: 'discoveryChance', label: 'Experiment breakthrough', min: 0, max: 0.5, step: 0.01 },
      { key: 'burnoutMult', label: 'Burnout × (global)', min: 0, max: 3, step: 0.1 },
      { key: 'nextDayFocus', label: 'New-day focus +', min: 0, max: 40, step: 1 },
      { key: 'nextDayEnergy', label: 'New-day energy +', min: 0, max: 40, step: 1 },
      { key: 'nextDayBurnout', label: 'New-day burnout Δ', min: -20, max: 10, step: 1 },
    ],
  },
  {
    title: 'Submission / Review',
    fields: [
      { key: 'tierRewardMult', label: 'Reputation reward ×', min: 0.2, max: 3, step: 0.1 },
      { key: 'reviewDifficulty', label: 'Review difficulty +', min: -6, max: 6, step: 1 },
      { key: 'reviewVarianceMult', label: 'Reviewer variance ×', min: 0, max: 2, step: 0.1 },
      { key: 'latencyMult', label: 'Review wait ×', min: 0.2, max: 3, step: 0.1 },
    ],
  },
  {
    title: 'Career graduation',
    fields: [
      { key: 'masterPapers', label: 'Master: papers', min: 1, max: 5, step: 1 },
      { key: 'masterRep', label: 'Master: reputation', min: 1, max: 50, step: 1 },
      { key: 'phdPapers', label: 'PhD: papers', min: 1, max: 8, step: 1 },
      { key: 'phdRep', label: 'PhD: reputation', min: 1, max: 80, step: 1 },
      { key: 'postdocFacultyRep', label: 'Faculty: reputation', min: 10, max: 100, step: 1 },
      { key: 'postdocFacultyTop', label: 'Faculty: top papers', min: 0, max: 5, step: 1 },
      { key: 'rejectionLimitMaster', label: 'Master reject limit', min: 1, max: 10, step: 1 },
      { key: 'rejectionLimitPhd', label: 'PhD reject limit', min: 1, max: 12, step: 1 },
      { key: 'fundingLossChance', label: 'Funding-loss chance', min: 0, max: 0.5, step: 0.01 },
      { key: 'fundingLossDay', label: 'Funding-loss after day', min: 1, max: 40, step: 1 },
    ],
  },
  {
    title: 'Meaning / Network',
    fields: [
      { key: 'meaningStart', label: 'Meaning at start', min: 0, max: 100, step: 1 },
      { key: 'meaningDecayMult', label: 'Meaning decay ×', min: 0, max: 3, step: 0.1 },
      { key: 'distinguishedInfluence', label: 'Distinguished influence', min: 5, max: 50, step: 1 },
    ],
  },
  {
    title: 'Projects / Rivals',
    fields: [
      { key: 'extraDraftSlots', label: 'Extra project slots', min: 0, max: 3, step: 1 },
      { key: 'stalenessMult', label: 'Staleness ×', min: 0, max: 3, step: 0.1 },
      { key: 'deskRejectMargin', label: 'Desk-reject margin', min: 0, max: 15, step: 1 },
      { key: 'rebutSuccess', label: 'Rebuttal success rate', min: 0, max: 1, step: 0.05 },
      { key: 'rivalPublishChance', label: 'Rival publish chance', min: 0, max: 0.3, step: 0.01 },
      { key: 'fieldHeatMult', label: 'Field heat ×', min: 0, max: 3, step: 0.1 },
      { key: 'scoopChance', label: 'Scoop chance', min: 0, max: 0.3, step: 0.01 },
      { key: 'scoopAgeDays', label: 'Scoop after age (days)', min: 2, max: 25, step: 1 },
    ],
  },
  {
    title: 'Funding / Advisor',
    fields: [
      { key: 'fundingStart', label: 'Funding at start', min: 0, max: 200, step: 5 },
      { key: 'fundingDrainPerDay', label: 'Daily funding burn', min: 0, max: 10, step: 0.5 },
      { key: 'submitFundingCost', label: 'Submission cost', min: 0, max: 20, step: 1 },
      { key: 'experimentFundingCost', label: 'Experiment cost', min: 0, max: 10, step: 0.5 },
      { key: 'grantAmount', label: 'Grant payout', min: 0, max: 120, step: 5 },
      { key: 'grantSuccess', label: 'Grant success rate', min: 0, max: 1, step: 0.05 },
      { key: 'grantLatency', label: 'Grant decision (days)', min: 1, max: 12, step: 1 },
      { key: 'rapportStart', label: 'Advisor rapport at start', min: 0, max: 100, step: 5 },
    ],
  },
]

function Row({ f }: { f: FieldDef }) {
  const value = useTuning((t) => t[f.key])
  const setValue = useTuning((t) => t.setValue)
  const decimals = f.step < 1 ? (f.step < 0.1 ? 2 : 2) : 0
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-40 shrink-0 truncate font-mono text-[11px] text-neutral-300">
        {f.label}
      </span>
      <input
        type="range"
        min={f.min}
        max={f.max}
        step={f.step}
        value={value}
        onChange={(e) => setValue(f.key, Number(e.target.value))}
        className="h-1 flex-1 accent-emerald-500"
      />
      <input
        type="number"
        min={f.min}
        max={f.max}
        step={f.step}
        value={value}
        onChange={(e) => setValue(f.key, Number(e.target.value))}
        className="w-16 rounded border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-right font-mono text-[11px] text-neutral-100"
      />
      <span className="w-8 text-right font-mono text-[9px] text-neutral-600">
        {f.step < 1 ? Number(value).toFixed(decimals) : ''}
      </span>
    </div>
  )
}

export default function DevPanel({ onClose }: { onClose: () => void }) {
  const save = useTuning((t) => t.save)
  const reset = useTuning((t) => t.reset)
  const [savedAt, setSavedAt] = useState(0)
  const [folded, setFolded] = useState<Record<string, boolean>>({})

  return (
    <div className="fixed right-3 top-3 z-50 flex max-h-[92vh] w-80 flex-col rounded-md border border-neutral-700 bg-neutral-950/95 shadow-xl backdrop-blur">
      <div className="flex items-center gap-2 border-b border-neutral-800 px-3 py-2">
        <span className="font-mono text-xs text-emerald-400">🛠 Dev Tuning</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => {
              save()
              setSavedAt(Date.now())
            }}
            className="rounded bg-emerald-700 px-2 py-0.5 font-mono text-[10px] text-white hover:bg-emerald-600"
          >
            Save
          </button>
          <button
            onClick={reset}
            className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-[10px] text-neutral-300 hover:bg-neutral-700"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-[10px] text-neutral-300 hover:bg-neutral-700"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="overflow-y-auto px-3 py-2">
        {GROUPS.map((g) => {
          const collapsed = !!folded[g.title]
          return (
            <div key={g.title} className="mb-2">
              <button
                onClick={() =>
                  setFolded((m) => ({ ...m, [g.title]: !m[g.title] }))
                }
                className="mb-1 flex w-full items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400 hover:text-neutral-200"
              >
                <span className="text-neutral-600">{collapsed ? '▸' : '▾'}</span>
                {g.title}
              </button>
              {!collapsed && g.fields.map((f) => <Row key={f.key} f={f} />)}
            </div>
          )
        })}
      </div>

      <div className="border-t border-neutral-800 px-3 py-1.5 font-mono text-[9px] leading-relaxed text-neutral-500">
        Changes apply live. <b>Save</b> persists to localStorage and syncs to other
        tabs. Toggle with <b>Ctrl+`</b>.
        {savedAt > 0 && <span className="ml-1 text-emerald-400">saved ✓</span>}
      </div>
    </div>
  )
}
