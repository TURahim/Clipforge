import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { openFileDialog, validateVideoFile } from './handlers/file.handler'
import { extractMetadata, generateThumbnail, exportSingleClip, exportMultipleClips } from './handlers/ffmpeg.handler'
import type { TimelineClip } from '../src/types'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset', // macOS native look
    show: false, // Show window when ready to prevent flicker
  })

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    // Development mode
    console.log('Loading dev server from:', process.env.VITE_DEV_SERVER_URL)
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools() // Open DevTools in dev mode
  } else {
    // Production mode
    const indexPath = join(__dirname, '../renderer/index.html')
    console.log('Loading production build from:', indexPath)
    mainWindow.loadFile(indexPath)
  }

  // Error handling
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
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

// App lifecycle
app.whenReady().then(() => {
  registerIPCHandlers()
  createWindow()

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

