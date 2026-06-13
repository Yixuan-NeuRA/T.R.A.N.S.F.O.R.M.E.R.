import type { ReactNode } from 'react'

interface NotebookCellProps {
  type: 'code' | 'markdown'
  prompt?: string
  code?: string
  output?: string
  disabled?: boolean
  onRun?: () => void
  children?: ReactNode
}

export default function NotebookCell({
  type,
  prompt = '[ ]',
  code,
  output,
  disabled,
  onRun,
  children,
}: NotebookCellProps) {
  if (type === 'markdown') {
    return (
      <div className="mb-3 border-l-2 border-neutral-800 px-3 py-1">
        <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-neutral-400">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="group mb-3">
      <div className="flex items-stretch overflow-hidden rounded-md border border-neutral-800 bg-[#1b1b1d]">
        {/* gutter: run button + execution prompt */}
        <div className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-neutral-800 bg-neutral-950/60 py-2">
          <button
            onClick={onRun}
            disabled={disabled}
            title="Run cell"
            className="flex h-6 w-6 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ▶
          </button>
          <span className="font-mono text-[10px] text-sky-400">{prompt}</span>
        </div>
        {/* source */}
        <pre className="flex-1 overflow-x-auto px-3 py-2 font-mono text-sm text-neutral-100">
          {code}
        </pre>
      </div>
      {/* output block under the cell */}
      {output && (
        <div className="ml-16 mt-1 rounded-md border-l-2 border-neutral-700 bg-neutral-950 px-3 py-1.5">
          <pre className="whitespace-pre-wrap font-mono text-xs text-emerald-300">
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}
