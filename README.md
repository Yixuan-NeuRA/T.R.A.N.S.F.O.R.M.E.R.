# T.R.A.N.S.F.O.R.M.E.R

Task-avoiding Researcher's Academic Napping & Slack-off Framework for Optimized
Recreational Mental Escape & Relaxation.

A simulation of academic life disguised as research software (JupyterLab /
MATLAB / RStudio). You pick an academic **civilization → discipline → career →
research environment**, then publish your way toward a (terminal) ending.

## Run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).

To ship a single double-clickable file:

```bash
npm run build      # produces a self-contained dist/index.html
```

## Deploy

Pushing to `main` auto-builds and deploys to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) — no manual build
or copy needed. One-time setup: **Settings → Pages → Build and deployment →
Source = GitHub Actions**. The playable URL then appears in the Actions run and
on the Pages settings page.

## Play

- Configure your run in the startup wizard (civilization, discipline, career,
  environment).
- Everything happens by **running notebook/script cells** (▶). Visit locations
  to gather resources, build publications from 4 components
  (idea/method/results/narrative), then **submit to a venue**.
- Submissions are **stochastic and delayed** — fast venues reply in 1–2 days,
  elite venues take many; advance days with `next_day()` to hear back. Even a
  strong paper can be rejected.
- **Burnout has no number** — watch the qualitative *Capacity* readout; high
  burnout distorts the UI. A hidden *meaning* variable distorts interpretation.
- Career sets the win condition (Master 1 paper · PhD 3 papers + thesis ·
  Postdoc choose your ending). There are 14 endings; graduation is terminal.

## Language

A **中 / EN** switch sits in the top menu bar (and on the start-screen wizard).
It toggles between English and Chinese for all player-facing text — the wizard,
status bars, capacity/kernel readouts, network panel, endings, narrative, events,
reviewer comments and the terminal log. Code-cell syntax stays in English (it is
fake research-software output). The choice persists and syncs across tabs.
Default is English; to start in Chinese change `load()` in `src/systems/i18n.ts`.

## Developer tuning panel

A live balance console is built in. It has no visible button — toggle it with
**Ctrl+`** or **F9** (matched on the physical key via `e.code`, so it works
even with a Chinese IME active, which used to break the shortcut in Chrome).
It has ~40 knobs in collapsible groups — daily loop, review, graduation,
meaning/network, projects/rivals, and funding/advisor. It exposes ~24 knobs (actions/day, gain-success
rate, burnout, review difficulty/variance/latency, reputation rewards,
graduation thresholds, funding-loss, meaning decay, …).

- Changes apply **immediately** to the running game.
- **Save** persists them to `localStorage` and **syncs across tabs** — so you
  can keep the panel open in one tab and the game in another; saving updates the
  game tab live.
- **Reset** restores defaults. (To ship to players, remove the `<DevPanel>` /
  toggle button in `src/App.tsx`.)

Full strategy guide: `完整攻略.md`.

## Stack

Vite · React · TypeScript · Zustand · TailwindCSS. No backend. Progress is not
saved between sessions.
