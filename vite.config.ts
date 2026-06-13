import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `base: './'` + singlefile = one self-contained index.html that runs from
// file:// (double-click to play, no server, no Node needed).
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
})
