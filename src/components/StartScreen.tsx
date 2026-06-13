import { useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import {
  CIVILIZATION_LIST,
  DISCIPLINE_CONFIGS,
  disciplinesOf,
  type Civilization,
  type Discipline,
} from '../systems/disciplineSystem'
import { CAREER_LIST, type CareerPath } from '../systems/careerSystem'
import { THEME_LIST, type UiTheme } from '../systems/themeSystem'
import { useT } from '../systems/i18n'
import LangToggle from './LangToggle'

function Card({
  active,
  onClick,
  title,
  tagline,
  desc,
}: {
  active: boolean
  onClick: () => void
  title: string
  tagline?: string
  desc?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full flex-col rounded-md border px-3 py-2 text-left transition-colors ${
        active
          ? 'border-emerald-500 bg-neutral-800'
          : 'border-neutral-700 bg-neutral-900 hover:border-neutral-500'
      }`}
    >
      <span className="font-mono text-sm text-neutral-100">{title}</span>
      {tagline && (
        <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
          {tagline}
        </span>
      )}
      {desc && (
        <span className="mt-1 font-mono text-[11px] leading-snug text-neutral-400">
          {desc}
        </span>
      )}
    </button>
  )
}

function Step({ n, label }: { n: number; label: string }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">
      {n} · {label}
    </span>
  )
}

export default function StartScreen() {
  const selectConfig = useGameStore((s) => s.selectConfig)
  const [civ, setCiv] = useState<Civilization | null>(null)
  const [discipline, setDiscipline] = useState<Discipline | null>(null)
  const [career, setCareer] = useState<CareerPath | null>(null)
  const [theme, setTheme] = useState<UiTheme>('jupyter')

  const ready = civ && discipline && career
  const { t } = useT()

  return (
    <div className="flex h-screen flex-col bg-neutral-900 text-neutral-100">
      <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-950 px-4 py-2">
        <span className="text-amber-400">🪐</span>
        <span className="font-mono text-sm text-neutral-200">
          {t('T.R.A.N.S.F.O.R.M.E.R — Configuration Wizard')}
        </span>
        <div className="ml-auto">
          <LangToggle />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 font-mono text-xs text-neutral-500">
            {t(
              'Different academic civilizations produce knowledge in fundamentally different ways. Configure your run — this choice is permanent.',
            )}
          </p>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* 1 — Civilization */}
            <section>
              <Step n={1} label={t('Civilization')} />
              <div className="mt-2 space-y-2">
                {CIVILIZATION_LIST.map((c) => (
                  <Card
                    key={c.id}
                    active={civ === c.id}
                    onClick={() => {
                      setCiv(c.id)
                      setDiscipline(null)
                    }}
                    title={t(c.label)}
                    desc={t(c.philosophy)}
                  />
                ))}
              </div>
            </section>

            {/* 2 — Discipline */}
            <section>
              <Step n={2} label={t('Discipline')} />
              <div className="mt-2 space-y-2">
                {!civ && (
                  <div className="font-mono text-[11px] text-neutral-600">
                    {t('# choose a civilization first')}
                  </div>
                )}
                {civ &&
                  disciplinesOf(civ).map((d) => (
                    <Card
                      key={d.id}
                      active={discipline === d.id}
                      onClick={() => {
                        setDiscipline(d.id)
                        setTheme(d.defaultEnv) // suggest the field's native tool
                      }}
                      title={t(d.label)}
                      tagline={d.special ? `special: ${d.special}` : undefined}
                    />
                  ))}
              </div>
            </section>

            {/* 3 — Career */}
            <section>
              <Step n={3} label={t('Career Stage')} />
              <div className="mt-2 space-y-2">
                {CAREER_LIST.map((c) => (
                  <Card
                    key={c.id}
                    active={career === c.id}
                    onClick={() => setCareer(c.id)}
                    title={t(c.label)}
                    tagline={t(c.tagline)}
                  />
                ))}
              </div>
            </section>

            {/* 4 — Research Environment */}
            <section>
              <Step n={4} label={t('Research Environment')} />
              <div className="mt-2 space-y-2">
                {THEME_LIST.map((th) => (
                  <Card
                    key={th.id}
                    active={theme === th.id}
                    onClick={() => setTheme(th.id)}
                    title={`${th.brandIcon} ${th.label}`}
                    tagline={
                      discipline && DISCIPLINE_CONFIGS[discipline].defaultEnv === th.id
                        ? t('native to this field')
                        : undefined
                    }
                  />
                ))}
              </div>
            </section>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button
              disabled={!ready}
              onClick={() => {
                if (civ && discipline && career) selectConfig(career, discipline, theme)
              }}
              className="rounded-md bg-emerald-600 px-5 py-2 font-mono text-sm text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('▶ Launch Simulation')}
            </button>
            <span className="font-mono text-[11px] text-neutral-600">
              {ready
                ? `${civ} · ${discipline} · ${career} · ${theme}`
                : t('Select a civilization, discipline and career to continue.')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
