import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { useGameStore } from './store/useGameStore'
import { useTuning } from './systems/tuning'

// Dev-only debug handles (e.g. window.useGameStore.setState({ burnout: 85 })).
if (import.meta.env.DEV) {
  const w = window as unknown as {
    useGameStore: typeof useGameStore
    useTuning: typeof useTuning
  }
  w.useGameStore = useGameStore
  w.useTuning = useTuning
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
