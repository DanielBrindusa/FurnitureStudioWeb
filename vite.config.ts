import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.')
  return {
    // Relative assets work everywhere by default. Set VITE_BASE_PATH when a
    // host requires an explicit absolute repository path.
    base: env.VITE_BASE_PATH || './',
    plugins: [react()],
  }
})
