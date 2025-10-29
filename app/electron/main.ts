import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron'
import { join } from 'path'
import { readFile, stat } from 'fs/promises'
import { openFileDialog, validateVideoFile } from './handlers/file.handler'
import { extractMetadata, generateThumbnail, exportSingleClip, exportMultipleClips, diagnoseFfmpeg } from './handlers/ffmpeg.handler'
import type { TimelineClip } from '../src/types'

// Safe logging wrapper to prevent EPIPE errors
function safeLog(...args: unknown[]) {
  try {
    console.log(...args)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_err) {
    // Silently ignore EPIPE and other logging errors
  }
}

// Register privileged schemes before app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'clipforge',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true, // Enable streaming for video
    },
  },
])

// Diagnostic logging for environment
safeLog('[Main] Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  VITE_DEV_SERVER_URL: process.env.VITE_DEV_SERVER_URL,
  ELECTRON_RENDERER_URL: process.env.ELECTRON_RENDERER_URL,
  isDev: !app.isPackaged
})

let mainWindow: BrowserWindow | null = null

function createWindow() {
  // Determine if we're in dev mode by checking for dev server environment variables
  // Don't rely on app.isPackaged as it's false when running with 'npx electron .'
  const hasDevServer = !!(process.env.VITE_DEV_SERVER_URL || process.env.ELECTRON_RENDERER_URL)
  const isDev = hasDevServer
  
  // Get the correct base path for resources
  const appPath = app.getAppPath()
  const resourcesPath = isDev ? __dirname : appPath
  
  safeLog('[Main] Paths:', {
    isDev,
    hasDevServer,
    __dirname,
    appPath,
    resourcesPath,
    isPackaged: app.isPackaged,
  })
  
  // Preload path: Always use .cjs now (bytecode disabled for preload)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs')
  const preloadPath = isDev 
    ? join(__dirname, '../preload/preload.cjs')
    : join(resourcesPath, 'out/preload/preload.cjs')
  
  safeLog('[Main] Preload path:', preloadPath)
  safeLog('[Main] Preload exists:', fs.existsSync(preloadPath))
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true, // Keep security enabled
    },
    titleBarStyle: 'hiddenInset', // macOS native look
    show: false, // Show window when ready to prevent flicker
  })

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    safeLog('[Main] Window ready to show')
    mainWindow?.show()
  })

  // Load the app
  const devServerUrl = process.env.VITE_DEV_SERVER_URL || process.env.ELECTRON_RENDERER_URL

  if (devServerUrl) {
    // Development mode - load from dev server
    console.log('[Main] Loading dev server from:', devServerUrl)
    mainWindow.loadURL(devServerUrl)
    mainWindow.webContents.openDevTools() // Open DevTools in dev mode
  } else {
    // Production mode - load built files
    const indexPath = join(resourcesPath, 'out/renderer/index.html')
    console.log('[Main] Loading production build from:', indexPath)
    
    // Try to load the file
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error('[Main] Failed to load renderer:', err)
      // Show error in window
      mainWindow?.loadURL(`data:text/html,<h1>Failed to load renderer</h1><pre>${err}</pre>`)
    })
  }

  // Error handling
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('[Main] Failed to load:', {
      errorCode,
      errorDescription,
      validatedURL,
    })
  })
  
  mainWindow.webContents.on('did-finish-load', () => {
    safeLog('[Main] Renderer finished loading')
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Register IPC handlers
function registerIPCHandlers() {
  // File picker dialog
  ipcMain.handle('open-file-dialog', async () => {
    return await openFileDialog()
  })

  // Import video with metadata and thumbnail
  ipcMain.handle('import-video', async (_event, filePath: string) => {
    try {
      // Validate file
      const validation = validateVideoFile(filePath)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Extract metadata
      const metadataResult = await extractMetadata(filePath)
      if (!metadataResult.success) {
        return { success: false, error: metadataResult.error }
      }

      // Generate thumbnail
      const thumbnailResult = await generateThumbnail(filePath)
      if (!thumbnailResult.success) {
        return { success: false, error: thumbnailResult.error }
      }

      return {
        success: true,
        data: {
          filePath,
          metadata: metadataResult.metadata,
          thumbnail: thumbnailResult.thumbnail,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to import video: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  })

  // Save file dialog
  ipcMain.handle('save-file-dialog', async () => {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Export Video',
        defaultPath: 'output.mp4',
        filters: [
          {
            name: 'Videos',
            extensions: ['mp4'],
          },
        ],
      })

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'No file selected' }
      }

      return { success: true, filePath: result.filePath }
    } catch (error) {
      return {
        success: false,
        error: `Failed to open save dialog: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  })

  // Export video
  ipcMain.handle('export-video', async (_event, clips: TimelineClip[], outputPath: string) => {
    try {
      let result

      if (clips.length === 1) {
        // Single clip export
        result = await exportSingleClip(clips[0], outputPath, mainWindow)
      } else {
        // Multiple clips export
        result = await exportMultipleClips(clips, outputPath, mainWindow)
      }

      return result
    } catch (error) {
      return {
        success: false,
        error: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  })
}

// Register custom protocol for serving local video files
function registerCustomProtocol() {
  protocol.handle('clipforge', async (request) => {
    try {
      // Extract file path from URL (e.g., clipforge://video/path/to/file.mp4)
      const url = request.url
      const filePath = decodeURIComponent(url.replace('clipforge://video/', ''))
      
      safeLog('[Protocol] Serving video file:', filePath)
      
      // Get file stats for Content-Length
      const fileStats = await stat(filePath)
      const fileSize = fileStats.size
      
      // Determine MIME type based on extension
      let mimeType = 'video/mp4'
      if (filePath.endsWith('.mov') || filePath.endsWith('.MOV')) mimeType = 'video/quicktime'
      else if (filePath.endsWith('.avi')) mimeType = 'video/x-msvideo'
      else if (filePath.endsWith('.mkv')) mimeType = 'video/x-matroska'
      else if (filePath.endsWith('.webm')) mimeType = 'video/webm'
      
      // Check for Range header (for video seeking)
      const rangeHeader = request.headers.get('range')
      
      if (rangeHeader) {
        // Parse range header
        const parts = rangeHeader.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const chunkSize = (end - start) + 1
        
        safeLog('[Protocol] Range request:', { start, end, chunkSize, fileSize })
        
        // Read the requested chunk
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs')
        const stream = fs.createReadStream(filePath, { start, end })
        
        // Convert stream to buffer
        const chunks: Buffer[] = []
        for await (const chunk of stream) {
          chunks.push(chunk)
        }
        const data = Buffer.concat(chunks)
        
        return new Response(data, {
          status: 206,
          headers: {
            'Content-Type': mimeType,
            'Content-Length': chunkSize.toString(),
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
          },
        })
      } else {
        // Serve entire file
        const data = await readFile(filePath)
        
        return new Response(data, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Content-Length': fileSize.toString(),
            'Accept-Ranges': 'bytes',
          },
        })
      }
    } catch (error) {
      console.error('[Protocol] Failed to serve video:', error)
      return new Response(`File not found: ${error}`, { status: 404 })
    }
  })
}

// App lifecycle
app.whenReady().then(() => {
  // Register custom protocol before creating window
  registerCustomProtocol()
  
  registerIPCHandlers()
  createWindow()
  
  // Run FFmpeg diagnostics on startup
  diagnoseFfmpeg()

  app.on('activate', () => {
    // macOS: Re-create window when dock icon is clicked and no windows open
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

