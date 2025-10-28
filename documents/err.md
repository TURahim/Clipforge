Title: Fix renderer loading production build in dev mode (ensure Vite dev server is used)

Context / Problem
The Electron main process currently logs:

Loading production build from: /Users/.../app/out/renderer/index.html


when running pnpm dev.
This means the BrowserWindow is opening the stale production bundle (file://…/out/renderer/index.html) instead of the Vite dev server (http://localhost:5173).

As a result:

UI changes don’t hot-reload (HMR is bypassed).

Some assets (like scripts or styles) may be outdated or missing.

Drag-and-drop / IPC behaviors can differ between prod vs. dev.

Additionally, the console shows harmless but noisy Chrome DevTools messages:

"Request Autofill.enable failed..."
"Request Autofill.setAddresses failed..."


These should be ignored or filtered out in dev logs.

Goals

Ensure that when running pnpm dev, Electron loads the Vite dev server URL (not the built files).

Keep production behavior unchanged — when packaged, Electron should load the built index.html.

Optionally filter or suppress irrelevant Chrome DevTools warnings (Autofill errors).

Confirm FFmpeg still initializes correctly under this new flow.

Tasks

Update Electron main process window loader

Locate where BrowserWindow is created (e.g., main/index.ts or main/main.ts).

Replace hardcoded loadFile('out/renderer/index.html') with a dynamic check:

import path from 'node:path'
import { app, BrowserWindow } from 'electron'

const isDev = !app.isPackaged

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'
    await win.loadURL(devUrl)
    win.webContents.openDevTools()
    console.log('[Renderer] Loaded from Vite dev server:', devUrl)
  } else {
    const prodIndex = path.join(__dirname, '../renderer/index.html')
    await win.loadFile(prodIndex)
    console.log('[Renderer] Loaded production build:', prodIndex)
  }
}

app.whenReady().then(createWindow)


Keep the existing FFmpeg initialization untouched.

Update pnpm dev script (if needed)

Ensure your package.json dev script starts both Vite and Electron concurrently, e.g.:

"scripts": {
  "dev": "cross-env VITE_DEV_SERVER_URL=http://localhost:5173 concurrently \"vite\" \"wait-on http://localhost:5173 && electron .\""
}


Install concurrently and wait-on if missing:

pnpm add -D concurrently wait-on cross-env


Clean old build artifacts

Remove stale build output to avoid confusion:

rm -rf out dist .vite


Suppress irrelevant DevTools logs

Optional: filter Autofill-related errors to declutter console.

win.webContents.on('console-message', (_, level, message) => {
  if (message.includes('Autofill.enable') || message.includes('Autofill.setAddresses')) return
  console.log(message)
})


Verify

Run pnpm dev → logs should show:

[Renderer] Loaded from Vite dev server: http://localhost:5173


Confirm live reloading works when editing React components.

Ensure packaged build (pnpm build + pnpm start or pnpm make) still loads file://.../index.html.

Acceptance Criteria

✅ In dev, pnpm dev opens http://localhost:5173 (Vite HMR active).
✅ In prod, packaged app loads out/renderer/index.html.
✅ No stale builds or missing assets.
✅ FFmpeg still initializes correctly.
✅ DevTools Autofill warnings are suppressed.