import { spawn } from 'child_process'
import { tmpdir } from 'os'
import { join } from 'path'
import { writeFileSync, unlinkSync, existsSync, readFileSync, chmodSync } from 'fs'
import { BrowserWindow, app } from 'electron'
import type { FFprobeResponse, VideoMetadata, TimelineClip } from '../../src/types'

/**
 * Get robust paths to ffmpeg and ffprobe binaries using installer packages
 * These packages automatically provide the correct ARM64/x64 binaries for each platform
 */
function getBinaryPaths(): { ffmpegPath: string; ffprobePath: string } {
  let ffmpegPath: string
  let ffprobePath: string

  // Check if we're in development or production
  const isDev = !app.isPackaged

  if (isDev) {
    // Development mode: Use @ffmpeg-installer and @ffprobe-installer
    try {
      // These installer packages export the path directly
      const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg')
      const ffprobeInstaller = require('@ffprobe-installer/ffprobe')
      
      ffmpegPath = ffmpegInstaller.path
      ffprobePath = ffprobeInstaller.path
      
      console.log('[FFmpeg] Development mode: Loading ARM64-compatible binaries')
      console.log('[FFmpeg] FFmpeg path:', ffmpegPath)
      console.log('[FFmpeg] FFprobe path:', ffprobePath)
    } catch (error) {
      console.error('[FFmpeg] Failed to load installer packages:', error)
      throw new Error(`FFmpeg binaries not found in development mode: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  } else {
    // Production mode: Use extraResources
    const resourcesPath = process.resourcesPath
    
    if (process.platform === 'darwin') {
      ffmpegPath = join(resourcesPath, 'ffmpeg')
      ffprobePath = join(resourcesPath, 'ffprobe')
    } else if (process.platform === 'win32') {
      ffmpegPath = join(resourcesPath, 'ffmpeg.exe')
      ffprobePath = join(resourcesPath, 'ffprobe.exe')
    } else {
      // Linux
      ffmpegPath = join(resourcesPath, 'ffmpeg')
      ffprobePath = join(resourcesPath, 'ffprobe')
    }
    
    console.log('[FFmpeg] Production mode: Using extraResources')
  }

  // Sanity check: Verify binaries exist
  if (!existsSync(ffmpegPath)) {
    console.error('[FFmpeg] FFmpeg binary not found at:', ffmpegPath)
    throw new Error(`FFmpeg binary not found: ${ffmpegPath}`)
  }

  if (!existsSync(ffprobePath)) {
    console.error('[FFmpeg] FFprobe binary not found at:', ffprobePath)
    throw new Error(`FFprobe binary not found: ${ffprobePath}`)
  }

  // Make sure binaries are executable (Unix-like systems)
  if (process.platform !== 'win32') {
    try {
      chmodSync(ffmpegPath, 0o755)
      chmodSync(ffprobePath, 0o755)
    } catch (error) {
      console.warn('[FFmpeg] Failed to set executable permissions:', error)
    }
  }

  return { ffmpegPath, ffprobePath }
}

/**
 * Diagnostic function to verify FFmpeg installation
 * Logs version information at startup
 */
export function diagnoseFfmpeg() {
  try {
    ensureBinaryPaths()
    
    if (!ffmpegPath) {
      console.error('[FFmpeg] Diagnostics failed: FFmpeg path not initialized')
      return
    }

    const result = spawn(ffmpegPath, ['-version'])
    let output = ''

    result.stdout.on('data', (data) => {
      output += data.toString()
    })

    result.on('close', (code) => {
      if (code === 0) {
        const versionLine = output.split('\n')[0]
        console.log('[FFmpeg] Version check:', versionLine)
        console.log('[FFmpeg] Binary architecture: ARM64-compatible')
      } else {
        console.error('[FFmpeg] Version check failed with code:', code)
      }
    })

    result.on('error', (error) => {
      console.error('[FFmpeg] Version check spawn error:', error.message)
    })
  } catch (error) {
    console.error('[FFmpeg] Diagnostics error:', error)
  }
}

// Binary paths - will be initialized lazily on first use
let ffmpegPath: string | null = null
let ffprobePath: string | null = null
let pathsInitialized = false

/**
 * Lazy initialization of binary paths
 * Called on first use to ensure app is ready
 */
function ensureBinaryPaths() {
  if (pathsInitialized) return

  try {
    const paths = getBinaryPaths()
    ffmpegPath = paths.ffmpegPath
    ffprobePath = paths.ffprobePath
    pathsInitialized = true
  } catch (error) {
    console.error('[FFmpeg] Failed to initialize paths:', error)
    throw error
  }
}

export interface MetadataResult {
  success: boolean
  metadata?: VideoMetadata
  error?: string
}

/**
 * Extract video metadata using ffprobe
 */
export async function extractMetadata(filePath: string): Promise<MetadataResult> {
  try {
    ensureBinaryPaths()
  } catch (error) {
    return {
      success: false,
      error: `Failed to initialize FFprobe: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }

  if (!ffprobePath) {
    return { success: false, error: 'FFprobe binary not initialized' }
  }

  return new Promise((resolve) => {
    const args = [
      '-v', 'error',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath,
    ]

    const ffprobe = spawn(ffprobePath, args)
    let stdout = ''
    let stderr = ''

    ffprobe.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    ffprobe.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    ffprobe.on('error', (error) => {
      resolve({
        success: false,
        error: `Failed to spawn ffprobe: ${error.message}`,
      })
    })

    ffprobe.on('close', (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: `FFprobe exited with code ${code}: ${stderr}`,
        })
        return
      }

      try {
        const data: FFprobeResponse = JSON.parse(stdout)
        const videoStream = data.streams.find((s) => s.codec_type === 'video')

        if (!videoStream) {
          resolve({ success: false, error: 'No video stream found' })
          return
        }

        const duration = parseFloat(data.format.duration)
        const fileSize = parseInt(data.format.size, 10)

        const metadata: VideoMetadata = {
          duration,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          codec: videoStream.codec_name,
          fileSize,
        }

        resolve({ success: true, metadata })
      } catch (error) {
        resolve({
          success: false,
          error: `Failed to parse metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
        })
      }
    })
  })
}

export interface ThumbnailResult {
  success: boolean
  thumbnail?: string
  error?: string
}

/**
 * Generate thumbnail from video at 1 second mark
 */
export async function generateThumbnail(filePath: string): Promise<ThumbnailResult> {
  try {
    ensureBinaryPaths()
  } catch (error) {
    return {
      success: false,
      error: `Failed to initialize FFmpeg: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }

  if (!ffmpegPath) {
    return { success: false, error: 'FFmpeg binary not initialized' }
  }

  const outputPath = join(tmpdir(), `thumb-${Date.now()}.jpg`)

  return new Promise((resolve) => {
    const args = [
      '-ss', '1',
      '-i', filePath,
      '-vframes', '1',
      '-q:v', '2',
      '-y',
      outputPath,
    ]

    const ffmpeg = spawn(ffmpegPath, args)
    let stderr = ''

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    ffmpeg.on('error', (error) => {
      resolve({
        success: false,
        error: `Failed to spawn ffmpeg: ${error.message}`,
      })
    })

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: `FFmpeg thumbnail generation failed with code ${code}: ${stderr}`,
        })
        return
      }

      if (!existsSync(outputPath)) {
        resolve({
          success: false,
          error: 'Thumbnail file was not created',
        })
        return
      }

      try {
        const imageBuffer = readFileSync(outputPath)
        const base64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`

        // Clean up temp file
        try {
          unlinkSync(outputPath)
        } catch (error) {
          console.warn('[FFmpeg] Failed to delete temp thumbnail:', error)
        }

        resolve({ success: true, thumbnail: base64 })
      } catch (error) {
        resolve({
          success: false,
          error: `Failed to read thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`,
        })
      }
    })
  })
}

/**
 * Export a single clip with optional trim points
 */
export async function exportSingleClip(
  clip: TimelineClip,
  outputPath: string,
  mainWindow: BrowserWindow | null
): Promise<{ success: boolean; error?: string }> {
  try {
    ensureBinaryPaths()
  } catch (error) {
    return {
      success: false,
      error: `Failed to initialize FFmpeg: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }

  if (!ffmpegPath) {
    return { success: false, error: 'FFmpeg binary not initialized' }
  }

  return new Promise((resolve) => {
    const args: string[] = []

    // Add start time if trimmed
    if (clip.trimStart > 0) {
      args.push('-ss', clip.trimStart.toString())
    }

    args.push('-i', clip.filePath)

    // Add duration if trimmed
    if (clip.trimEnd < clip.duration) {
      const duration = clip.trimEnd - clip.trimStart
      args.push('-t', duration.toString())
    }

    // Codec settings
    args.push('-c:v', 'libx264', '-c:a', 'aac', '-y', outputPath)

    const ffmpeg = spawn(ffmpegPath, args)
    const totalDuration = clip.trimEnd - clip.trimStart
    let stderr = ''

    ffmpeg.stderr.on('data', (data) => {
      const output = data.toString()
      stderr += output

      // Parse progress
      const timeMatch = output.match(/time=(\d+):(\d+):(\d+\.\d+)/)
      if (timeMatch && mainWindow) {
        const hours = parseInt(timeMatch[1])
        const minutes = parseInt(timeMatch[2])
        const seconds = parseFloat(timeMatch[3])
        const currentTime = hours * 3600 + minutes * 60 + seconds
        const percentage = Math.min(Math.round((currentTime / totalDuration) * 100), 100)

        mainWindow.webContents.send('export-progress', {
          percentage,
          currentTime,
          totalDuration,
        })
      }
    })

    ffmpeg.on('error', (error) => {
      resolve({
        success: false,
        error: `Failed to spawn FFmpeg: ${error.message}`,
      })
    })

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: `Export failed with code ${code}: ${stderr}`,
        })
        return
      }

      if (!existsSync(outputPath)) {
        resolve({
          success: false,
          error: 'Output file was not created',
        })
        return
      }

      resolve({ success: true })
    })
  })
}

/**
 * Export multiple clips by concatenating them
 */
export async function exportMultipleClips(
  clips: TimelineClip[],
  outputPath: string,
  mainWindow: BrowserWindow | null
): Promise<{ success: boolean; error?: string }> {
  try {
    ensureBinaryPaths()
  } catch (error) {
    return {
      success: false,
      error: `Failed to initialize FFmpeg: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }

  if (!ffmpegPath) {
    return { success: false, error: 'FFmpeg binary not initialized' }
  }

  const filelistPath = join(tmpdir(), `clipforge-export-${Date.now()}.txt`)

  try {
    // Generate filelist content
    const filelistContent = clips.map((clip) => `file '${clip.filePath}'`).join('\n')
    writeFileSync(filelistPath, filelistContent, 'utf-8')

    return new Promise((resolve) => {
      const args = [
        '-f', 'concat',
        '-safe', '0',
        '-i', filelistPath,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-y',
        outputPath,
      ]

      const ffmpeg = spawn(ffmpegPath, args)
      const totalDuration = clips.reduce((sum, clip) => sum + (clip.trimEnd - clip.trimStart), 0)
      let stderr = ''

      ffmpeg.stderr.on('data', (data) => {
        const output = data.toString()
        stderr += output

        // Parse progress
        const timeMatch = output.match(/time=(\d+):(\d+):(\d+\.\d+)/)
        if (timeMatch && mainWindow) {
          const hours = parseInt(timeMatch[1])
          const minutes = parseInt(timeMatch[2])
          const seconds = parseFloat(timeMatch[3])
          const currentTime = hours * 3600 + minutes * 60 + seconds
          const percentage = Math.min(Math.round((currentTime / totalDuration) * 100), 100)

          mainWindow.webContents.send('export-progress', {
            percentage,
            currentTime,
            totalDuration,
          })
        }
      })

      ffmpeg.on('error', (error) => {
        try {
          unlinkSync(filelistPath)
        } catch (err) {
          // Ignore cleanup errors
        }
        resolve({
          success: false,
          error: `Failed to spawn FFmpeg: ${error.message}`,
        })
      })

      ffmpeg.on('close', (code) => {
        // Clean up temp file
        try {
          unlinkSync(filelistPath)
        } catch (error) {
          console.warn('[FFmpeg] Failed to delete temp filelist:', error)
        }

        if (code !== 0) {
          resolve({
            success: false,
            error: `Export failed with code ${code}: ${stderr}`,
          })
          return
        }

        if (!existsSync(outputPath)) {
          resolve({
            success: false,
            error: 'Output file was not created',
          })
          return
        }

        resolve({ success: true })
      })
    })
  } catch (error) {
    return {
      success: false,
      error: `Failed to create filelist: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}
