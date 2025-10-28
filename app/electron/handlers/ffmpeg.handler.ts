import { spawn, ChildProcess } from 'child_process'
import ffmpegPath from 'ffmpeg-static'
import { tmpdir } from 'os'
import { join } from 'path'
import { writeFileSync, unlinkSync, existsSync } from 'fs'
import type { FFprobeResponse, VideoMetadata, TimelineClip } from '../../src/types'
import { BrowserWindow } from 'electron'

// Get ffprobe path (same directory as ffmpeg)
const ffprobePath = ffmpegPath ? ffmpegPath.replace('ffmpeg', 'ffprobe') : 'ffprobe'

export interface MetadataResult {
  success: boolean
  metadata?: VideoMetadata
  error?: string
}

export interface ThumbnailResult {
  success: boolean
  thumbnail?: string // base64 data URI
  error?: string
}

/**
 * Extract video metadata using ffprobe
 */
export async function extractMetadata(filePath: string): Promise<MetadataResult> {
  try {
    const ffprobeOutput = await runFFprobe(filePath)
    const metadata = parseFFprobeOutput(ffprobeOutput)
    
    return { success: true, metadata }
  } catch (error) {
    return {
      success: false,
      error: `Failed to extract metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Run ffprobe and get JSON output
 */
function runFFprobe(filePath: string): Promise<FFprobeResponse> {
  return new Promise((resolve, reject) => {
    const args = [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath,
    ]

    const ffprobe = spawn(ffprobePath, args)
    let output = ''
    let errorOutput = ''

    ffprobe.stdout.on('data', (data) => {
      output += data.toString()
    })

    ffprobe.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    ffprobe.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe exited with code ${code}: ${errorOutput}`))
        return
      }

      try {
        const json = JSON.parse(output)
        resolve(json)
      } catch (error) {
        reject(new Error(`Failed to parse ffprobe output: ${error}`))
      }
    })

    ffprobe.on('error', (error) => {
      reject(new Error(`Failed to spawn ffprobe: ${error.message}`))
    })
  })
}

/**
 * Parse ffprobe JSON output into VideoMetadata
 */
export function parseFFprobeOutput(ffprobeJSON: FFprobeResponse): VideoMetadata {
  const videoStream = ffprobeJSON.streams.find((s) => s.codec_type === 'video')

  return {
    duration: parseFloat(ffprobeJSON.format.duration) || 0,
    width: videoStream?.width || 0,
    height: videoStream?.height || 0,
    codec: videoStream?.codec_name || 'unknown',
    fileSize: parseInt(ffprobeJSON.format.size) || 0,
  }
}

/**
 * Generate thumbnail from video at 1-second mark
 */
export async function generateThumbnail(filePath: string): Promise<ThumbnailResult> {
  try {
    if (!ffmpegPath) {
      throw new Error('FFmpeg path not found')
    }

    // Generate temp filename
    const tempPath = join(tmpdir(), `clipforge-thumb-${Date.now()}.jpg`)

    // Extract frame at 1 second
    await extractFrame(filePath, tempPath, 1)

    // Read file and convert to base64
    const fs = await import('fs/promises')
    const imageBuffer = await fs.readFile(tempPath)
    const base64 = imageBuffer.toString('base64')
    const dataURI = `data:image/jpeg;base64,${base64}`

    // Clean up temp file
    try {
      unlinkSync(tempPath)
    } catch (error) {
      // Ignore cleanup errors
    }

    return { success: true, thumbnail: dataURI }
  } catch (error) {
    return {
      success: false,
      error: `Failed to generate thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Extract a single frame from video at specified time
 */
function extractFrame(inputPath: string, outputPath: string, timeSeconds: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      '-ss', timeSeconds.toString(),
      '-i', inputPath,
      '-vframes', '1',
      '-q:v', '2', // Quality (1-31, lower is better)
      '-y', // Overwrite output file
      outputPath,
    ]

    const ffmpeg = spawn(ffmpegPath!, args)
    let errorOutput = ''

    ffmpeg.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`FFmpeg exited with code ${code}: ${errorOutput}`))
        return
      }

      // Verify file was created
      if (!existsSync(outputPath)) {
        reject(new Error('Thumbnail file was not created'))
        return
      }

      resolve()
    })

    ffmpeg.on('error', (error) => {
      reject(new Error(`Failed to spawn FFmpeg: ${error.message}`))
    })
  })
}

/**
 * Export single clip with progress tracking
 */
export async function exportSingleClip(
  clip: TimelineClip,
  outputPath: string,
  mainWindow: BrowserWindow | null
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    if (!ffmpegPath) {
      resolve({ success: false, error: 'FFmpeg not found' })
      return
    }

    const args: string[] = []

    // Add trim start if needed
    if (clip.trimStart > 0) {
      args.push('-ss', clip.trimStart.toString())
    }

    // Input file
    args.push('-i', clip.filePath)

    // Add trim duration if needed
    if (clip.trimEnd < clip.duration) {
      const duration = clip.trimEnd - clip.trimStart
      args.push('-t', duration.toString())
    }

    // Video codec
    args.push('-c:v', 'libx264')
    
    // Audio codec
    args.push('-c:a', 'aac')
    
    // Overwrite output
    args.push('-y')
    
    // Output file
    args.push(outputPath)

    const ffmpeg = spawn(ffmpegPath, args)
    const totalDuration = clip.trimEnd - clip.trimStart
    let errorOutput = ''

    ffmpeg.stderr.on('data', (data) => {
      const output = data.toString()
      errorOutput += output

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

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: `Export failed with code ${code}: ${errorOutput}`,
        })
        return
      }

      // Verify output file exists
      if (!existsSync(outputPath)) {
        resolve({ success: false, error: 'Output file was not created' })
        return
      }

      resolve({ success: true })
    })

    ffmpeg.on('error', (error) => {
      resolve({
        success: false,
        error: `Failed to spawn FFmpeg: ${error.message}`,
      })
    })
  })
}

/**
 * Export multiple clips using concat demuxer
 */
export async function exportMultipleClips(
  clips: TimelineClip[],
  outputPath: string,
  mainWindow: BrowserWindow | null
): Promise<{ success: boolean; error?: string }> {
  const filelistPath = join(tmpdir(), `clipforge-export-${Date.now()}.txt`)

  try {
    // Generate filelist.txt
    const filelistContent = clips
      .map((clip) => `file '${clip.filePath}'`)
      .join('\n')
    
    writeFileSync(filelistPath, filelistContent, 'utf-8')

    if (!ffmpegPath) {
      return { success: false, error: 'FFmpeg not found' }
    }

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

      const ffmpeg = spawn(ffmpegPath!, args)
      const totalDuration = clips.reduce(
        (sum, clip) => sum + (clip.trimEnd - clip.trimStart),
        0
      )
      let errorOutput = ''

      ffmpeg.stderr.on('data', (data) => {
        const output = data.toString()
        errorOutput += output

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

      ffmpeg.on('close', (code) => {
        // Clean up filelist
        try {
          unlinkSync(filelistPath)
        } catch (error) {
          // Ignore cleanup errors
        }

        if (code !== 0) {
          resolve({
            success: false,
            error: `Export failed with code ${code}: ${errorOutput}`,
          })
          return
        }

        if (!existsSync(outputPath)) {
          resolve({ success: false, error: 'Output file was not created' })
          return
        }

        resolve({ success: true })
      })

      ffmpeg.on('error', (error) => {
        // Clean up filelist
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
    })
  } catch (error) {
    return {
      success: false,
      error: `Failed to create filelist: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

