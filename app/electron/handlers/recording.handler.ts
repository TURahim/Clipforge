import { ipcMain, desktopCapturer } from 'electron'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { app } from 'electron'

/**
 * Get available desktop sources (screens and windows) for recording
 */
export function setupRecordingHandlers() {
  // Get available sources for screen recording
  ipcMain.handle('get-desktop-sources', async () => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 320, height: 180 }
      })
      
      return {
        success: true,
        sources: sources.map(source => ({
          id: source.id,
          name: source.name,
          thumbnail: source.thumbnail.toDataURL(),
          display_id: source.display_id,
          appIcon: source.appIcon ? source.appIcon.toDataURL() : null
        }))
      }
    } catch (error) {
      console.error('[Recording] Failed to get desktop sources:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get desktop sources'
      }
    }
  })
  
  // Save recording to disk
  ipcMain.handle('save-recording', async (_event, buffer: Uint8Array, filename: string) => {
    try {
      const downloadsPath = app.getPath('downloads')
      const timestamp = Date.now()
      const sanitizedFilename = filename.replace(/[^a-z0-9.-]/gi, '_')
      const finalFilename = `${timestamp}-${sanitizedFilename}`
      const filePath = join(downloadsPath, finalFilename)
      
      await writeFile(filePath, buffer)
      
      console.log('[Recording] Saved recording to:', filePath)
      
      return {
        success: true,
        filePath
      }
    } catch (error) {
      console.error('[Recording] Failed to save recording:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save recording'
      }
    }
  })
  
  console.log('[Recording] Recording handlers registered')
}

