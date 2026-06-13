import { useLang } from '../systems/i18n'

// Compact 中 / EN switch. Persists + syncs across tabs (via the lang store).
export default function LangToggle() {
  const lang = useLang((s) => s.lang)
  const setLang = useLang((s) => s.setLang)
  return (
    <div className="flex overflow-hidden rounded border border-neutral-700 font-mono text-[10px]">
      <button
        onClick={() => setLang('zh')}
        className={`px-2 py-0.5 transition-colors ${
          lang === 'zh' ? 'bg-emerald-700 text-white' : 'text-neutral-400 hover:bg-neutral-800'
        }`}
      >
        中
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-2 py-0.5 transition-colors ${
          lang === 'en' ? 'bg-emerald-700 text-white' : 'text-neutral-400 hover:bg-neutral-800'
        }`}
      >
        EN
      </button>
    </div>
  )
}
