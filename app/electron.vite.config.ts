import { defineConfig, externalizeDepsPlugin, bytecodePlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => ({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      ...(mode === 'production' ? [bytecodePlugin()] : [])
    ],
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: resolve(__dirname, 'electron/main.ts'),
        output: {
          format: 'cjs',
          entryFileNames: mode === 'production' ? '[name].js' : '[name].cjs'
        }
      }
    }
  },
  preload: {
    plugins: [
      externalizeDepsPlugin(),
      ...(mode === 'production' ? [bytecodePlugin()] : [])
    ],
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: resolve(__dirname, 'electron/preload.ts'),
        output: {
          format: 'cjs',
          entryFileNames: mode === 'production' ? '[name].js' : '[name].cjs'
        }
      }
    }
  },
  renderer: {
    root: '.',
    server: {
      port: 5175,
      strictPort: false,
      host: 'localhost',
    },
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: resolve(__dirname, 'index.html')
      }
    },
    plugins: [react()]
  }
}))

