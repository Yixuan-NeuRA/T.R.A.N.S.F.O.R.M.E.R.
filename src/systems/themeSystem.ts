// ============================================================================
// PHASE 6.5 — UI Theme Layer (cognitive framing)
// Changes presentation ONLY: brand, file labels, prompts, log prefixes, accent,
// and a light output framing. It never changes logic or game state.
// ============================================================================

export type UiTheme = 'jupyter' | 'matlab' | 'rstudio'

export interface ThemeConfig {
  id: UiTheme
  label: string
  brand: string
  brandIcon: string
  notebookFile: string
  notebookKernel: string
  terminalLabel: string
  logPrefix: string
  promptOpen: string // wraps the execution count, e.g. '[' .. ']'
  promptClose: string
  outputLabel: string | null // a header shown above cell output
  accentText: string // tailwind text color
  accentBorder: string // tailwind border color
}

export const THEME_CONFIGS: Record<UiTheme, ThemeConfig> = {
  jupyter: {
    id: 'jupyter',
    label: 'JupyterLab',
    brand: 'JupyterLab',
    brandIcon: '🪐',
    notebookFile: 'research_notebook.ipynb',
    notebookKernel: 'Python 3 (ipykernel)',
    terminalLabel: 'Terminal 1',
    logPrefix: '>>> ',
    promptOpen: '[',
    promptClose: ']',
    outputLabel: null,
    accentText: 'text-emerald-400',
    accentBorder: 'border-emerald-500',
  },
  matlab: {
    id: 'matlab',
    label: 'MATLAB',
    brand: 'MATLAB',
    brandIcon: '📐',
    notebookFile: 'untitled.m',
    notebookKernel: 'MATLAB R2026a',
    terminalLabel: 'Command Window',
    logPrefix: '>> ',
    promptOpen: '%',
    promptClose: '',
    outputLabel: 'Output:',
    accentText: 'text-orange-400',
    accentBorder: 'border-orange-500',
  },
  rstudio: {
    id: 'rstudio',
    label: 'RStudio',
    brand: 'RStudio',
    brandIcon: '📊',
    notebookFile: 'analysis.R',
    notebookKernel: 'R 4.5.0',
    terminalLabel: 'Console',
    logPrefix: '> ',
    promptOpen: '#',
    promptClose: '',
    outputLabel: 'Coefficients:',
    accentText: 'text-sky-400',
    accentBorder: 'border-sky-500',
  },
}

export const THEME_LIST: ThemeConfig[] = [
  THEME_CONFIGS.jupyter,
  THEME_CONFIGS.matlab,
  THEME_CONFIGS.rstudio,
]

// Render the execution prompt token in the active theme's style.
export function themePrompt(theme: ThemeConfig, inner: string): string {
  // inner is like ' ', '*', or a number string
  return `${theme.promptOpen}${inner}${theme.promptClose}`
}
