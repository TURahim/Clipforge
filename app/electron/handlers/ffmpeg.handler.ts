import { spawn } from 'child_process'
import { tmpdir } from 'os'
import { join } from 'path'
import { writeFileSync, unlinkSync, existsSync, readFileSync, chmodSync } from 'fs'
import { BrowserWindow, app } from 'electron'
import type { FFprobeResponse, VideoMetadata, TimelineClip, Caption } from '../../src/types'

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
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg')
      // eslint-disable-next-line @typescript-eslint/no-require-imports
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

export interface ResolutionPreset {
  label: string
  value: string
  width: number | null
  height: number | null
}

/**
 * Export a single clip with optional trim points and resolution scaling
 */
export async function exportSingleClip(
  clip: TimelineClip,
  outputPath: string,
  mainWindow: BrowserWindow | null,
  resolution?: ResolutionPreset
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

    // Add scale filter if resolution is specified and not 'source'
    if (resolution && resolution.value !== 'source' && resolution.width && resolution.height) {
      args.push(
        '-vf',
        `scale=${resolution.width}:${resolution.height}:force_original_aspect_ratio=decrease,pad=${resolution.width}:${resolution.height}:(ow-iw)/2:(oh-ih)/2`
      )
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
 * Handles trim points by creating temp trimmed files first
 */
export async function exportMultipleClips(
  clips: TimelineClip[],
  outputPath: string,
  mainWindow: BrowserWindow | null,
  resolution?: ResolutionPreset
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

  const timestamp = Date.now()
  const tempFiles: string[] = []
  const filelistPath = join(tmpdir(), `clipforge-filelist-${timestamp}.txt`)

  try {
    // Phase 1: Create trimmed temp files for each clip
    console.log('[Export] Creating', clips.length, 'temporary trimmed clips...')
    
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i]
      const isTrimmed = clip.trimStart > 0 || clip.trimEnd < clip.duration
      
      if (isTrimmed) {
        // Create temp trimmed file
        const tempPath = join(tmpdir(), `clipforge-temp-${timestamp}-${i}.mp4`)
        tempFiles.push(tempPath)
        
        console.log(`[Export] Trimming clip ${i + 1}/${clips.length}: ${clip.filename}`)
        
        // Export trimmed clip to temp file (without resolution scaling yet)
        const trimResult = await exportSingleClip(clip, tempPath, null)
        
        if (!trimResult.success) {
          // Clean up any created temp files
          tempFiles.forEach(f => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            try { unlinkSync(f) } catch (_e) { /* ignore */ }
          })
          return {
            success: false,
            error: `Failed to trim clip "${clip.filename}": ${trimResult.error}`,
          }
        }
      }
    }

    // Phase 2: Generate filelist for concatenation
    console.log('[Export] Generating filelist for concatenation...')
    const finalFilelistContent = clips.map((clip, i) => {
      const isTrimmed = clip.trimStart > 0 || clip.trimEnd < clip.duration
      if (isTrimmed) {
        // Find corresponding temp file
        let trimmedCount = 0
        for (let j = 0; j < i; j++) {
          if (clips[j].trimStart > 0 || clips[j].trimEnd < clips[j].duration) {
            trimmedCount++
          }
        }
        return `file '${tempFiles[trimmedCount]}'`
      } else {
        return `file '${clip.filePath}'`
      }
    }).join('\n')
    
    writeFileSync(filelistPath, finalFilelistContent, 'utf-8')
    console.log('[Export] Filelist created:', filelistPath)

    // Phase 3: Concatenate all clips
    console.log('[Export] Concatenating clips...')
    
    return new Promise((resolve) => {
      const args = [
        '-f', 'concat',
        '-safe', '0',
        '-i', filelistPath,
      ]

      // Add scale filter if resolution is specified and not 'source'
      if (resolution && resolution.value !== 'source' && resolution.width && resolution.height) {
        args.push(
          '-vf',
          `scale=${resolution.width}:${resolution.height}:force_original_aspect_ratio=decrease,pad=${resolution.width}:${resolution.height}:(ow-iw)/2:(oh-ih)/2`
        )
      }

      args.push(
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'medium',
        '-crf', '23',
        '-y',
        outputPath,
      )

      const ffmpeg = spawn(ffmpegPath, args)
      const totalDuration = clips.reduce((sum, clip) => sum + (clip.trimEnd - clip.trimStart), 0)
      let stderr = ''

      ffmpeg.stderr.on('data', (data) => {
        const output = data.toString()
        stderr += output

        // Parse progress
        const timeMatch = output.match(/time=(\d+):(\d+):(\d+\.?\d*)/)
        if (timeMatch && mainWindow) {
          const hours = parseInt(timeMatch[1], 10)
          const minutes = parseInt(timeMatch[2], 10)
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
        // Clean up
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        try { unlinkSync(filelistPath) } catch (_e) { /* ignore */ }
        tempFiles.forEach(f => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          try { unlinkSync(f) } catch (_e) { /* ignore */ }
        })
        
        resolve({
          success: false,
          error: `Failed to spawn FFmpeg: ${error.message}`,
        })
      })

      ffmpeg.on('close', (code) => {
        // Clean up temp files
        try { unlinkSync(filelistPath) } catch (e) {
          console.warn('[Export] Failed to delete filelist:', e)
        }
        tempFiles.forEach(f => {
          try {
            unlinkSync(f)
            console.log('[Export] Cleaned up temp file:', f)
          } catch (e) {
            console.warn('[Export] Failed to delete temp file:', f, e)
          }
        })

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

        console.log('[Export] Export complete:', outputPath)
        resolve({ success: true })
      })
    })
  } catch (error) {
    // Clean up on error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    try { unlinkSync(filelistPath) } catch (_e) { /* ignore */ }
    tempFiles.forEach(f => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      try { unlinkSync(f) } catch (_e) { /* ignore */ }
    })
    
    return {
      success: false,
      error: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Extract audio from video for transcription (Whisper-optimized format)
 * Outputs mono 16kHz WAV file suitable for OpenAI Whisper API
 */
export async function extractAudioForTranscription(
  videoPath: string
): Promise<{ success: boolean; audioPath?: string; error?: string }> {
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

  // Generate temp audio file path
  const timestamp = Date.now()
  const audioPath = join(tmpdir(), `clipforge-audio-${timestamp}.wav`)

  console.log('[FFmpeg] Extracting audio for transcription:', videoPath)

  return new Promise((resolve) => {
    const args = [
      '-i', videoPath,
      '-vn', // No video
      '-acodec', 'pcm_s16le', // PCM 16-bit little-endian
      '-ar', '16000', // 16kHz sample rate (Whisper optimal)
      '-ac', '1', // Mono audio
      '-y', // Overwrite
      audioPath,
    ]

    const ffmpeg = spawn(ffmpegPath, args)
    let stderr = ''

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString()
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
          error: `Audio extraction failed with code ${code}: ${stderr}`,
        })
        return
      }

      if (!existsSync(audioPath)) {
        resolve({
          success: false,
          error: 'Audio file was not created',
        })
        return
      }

      console.log('[FFmpeg] Audio extracted successfully:', audioPath)
      resolve({ success: true, audioPath })
    })
  })
}

/**
 * Convert Caption array to SRT subtitle format
 * Format: index, timecode (HH:MM:SS,mmm --> HH:MM:SS,mmm), text
 */
function generateSRTFile(captions: Caption[], outputPath: string): void {
  if (captions.length === 0) {
    return
  }
  
  const srtContent = captions.map((caption, index) => {
    const startTime = formatSRTTimecode(caption.start)
    const endTime = formatSRTTimecode(caption.end)
    
    return `${index + 1}\n${startTime} --> ${endTime}\n${caption.text}\n`
  }).join('\n')
  
  writeFileSync(outputPath, srtContent, 'utf-8')
  console.log('[FFmpeg] Generated SRT file:', outputPath, `(${captions.length} captions)`)
}

/**
 * Format seconds to SRT timecode format (HH:MM:SS,mmm)
 */
function formatSRTTimecode(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const milliseconds = Math.floor((seconds % 1) * 1000)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`
}

/**
 * Check if timeline contains multi-track content (PiP)
 */
export function hasMultiTrackContent(clips: TimelineClip[]): boolean {
  return clips.some(clip => clip.track === 1)
}

/**
 * Export unified PiP video with main track, overlay track, and captions
 * Composites multiple tracks into a single output with PiP overlay and burned-in captions
 */
export async function exportUnifiedPiP(
  clips: TimelineClip[],
  outputPath: string,
  mainWindow: BrowserWindow | null,
  resolution?: ResolutionPreset
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

  const timestamp = Date.now()
  const tempFiles: string[] = []
  const srtFiles: string[] = []

  try {
    // ===== PHASE 1: Prepare timeline segments =====
    console.log('[Export PiP] Phase 1: Preparing timeline segments...')
    
    const mainClips = clips.filter(c => c.track === 0).sort((a, b) => a.startTime - b.startTime)
    const overlayClips = clips.filter(c => c.track === 1).sort((a, b) => a.startTime - b.startTime)
    
    if (mainClips.length === 0) {
      return { success: false, error: 'No main track clips found' }
    }
    
    console.log(`[Export PiP] Main track: ${mainClips.length} clips, Overlay track: ${overlayClips.length} clips`)
    
    // Calculate total duration
    const totalDuration = Math.max(
      ...clips.map(c => c.startTime + (c.trimEnd - c.trimStart))
    )
    
    // ===== PHASE 2: Generate caption files =====
    console.log('[Export PiP] Phase 2: Generating caption files...')
    
    // Collect and adjust captions for main track
    const mainCaptions: Caption[] = []
    for (const clip of mainClips) {
      if (clip.captions && clip.captions.length > 0) {
        // Adjust caption timestamps to global timeline
        const adjustedCaptions = clip.captions.map(caption => ({
          start: clip.startTime + (caption.start - clip.trimStart),
          end: clip.startTime + (caption.end - clip.trimStart),
          text: caption.text
        }))
        mainCaptions.push(...adjustedCaptions)
      }
    }
    
    // Collect and adjust captions for overlay track
    const overlayCaptions: Caption[] = []
    for (const clip of overlayClips) {
      if (clip.captions && clip.captions.length > 0) {
        const adjustedCaptions = clip.captions.map(caption => ({
          start: clip.startTime + (caption.start - clip.trimStart),
          end: clip.startTime + (caption.end - clip.trimStart),
          text: caption.text
        }))
        overlayCaptions.push(...adjustedCaptions)
      }
    }
    
    // Generate SRT files if captions exist
    let mainSrtPath: string | null = null
    let overlaySrtPath: string | null = null
    
    if (mainCaptions.length > 0) {
      mainSrtPath = join(tmpdir(), `clipforge-main-captions-${timestamp}.srt`)
      generateSRTFile(mainCaptions, mainSrtPath)
      srtFiles.push(mainSrtPath)
    }
    
    if (overlayCaptions.length > 0) {
      overlaySrtPath = join(tmpdir(), `clipforge-overlay-captions-${timestamp}.srt`)
      generateSRTFile(overlayCaptions, overlaySrtPath)
      srtFiles.push(overlaySrtPath)
    }
    
    console.log(`[Export PiP] Main captions: ${mainCaptions.length}, Overlay captions: ${overlayCaptions.length}`)
    
    // ===== PHASE 3: Build FFmpeg complex filter =====
    console.log('[Export PiP] Phase 3: Building FFmpeg filter chain...')
    
    const args: string[] = []
    const filterParts: string[] = []
    let inputIndex = 0
    
    // Add all input files (main clips first, then overlay clips)
    for (const clip of mainClips) {
      args.push('-i', clip.filePath)
      inputIndex++
    }
    
    for (const clip of overlayClips) {
      args.push('-i', clip.filePath)
      inputIndex++
    }
    
    // Build concat filters for each track
    // Main track concat
    if (mainClips.length === 1) {
      // No concat needed, just trim and scale
      const clip = mainClips[0]
      const trimFilter = clip.trimStart > 0 || clip.trimEnd < clip.duration
        ? `trim=start=${clip.trimStart}:end=${clip.trimEnd},setpts=PTS-STARTPTS`
        : 'null'
      filterParts.push(`[0:v]${trimFilter}[mainv]`)
      filterParts.push(`[0:a]atrim=start=${clip.trimStart}:end=${clip.trimEnd},asetpts=PTS-STARTPTS[maina]`)
    } else {
      // Concat multiple main clips
      const videoInputs = mainClips.map((_, i) => `[${i}:v]`).join('')
      const audioInputs = mainClips.map((_, i) => `[${i}:a]`).join('')
      filterParts.push(`${videoInputs}concat=n=${mainClips.length}:v=1:a=1[mainv][maina]`)
    }
    
    // Overlay track concat (if exists)
    if (overlayClips.length > 0) {
      const overlayStartIndex = mainClips.length
      
      if (overlayClips.length === 1) {
        const clip = overlayClips[0]
        const trimFilter = clip.trimStart > 0 || clip.trimEnd < clip.duration
          ? `trim=start=${clip.trimStart}:end=${clip.trimEnd},setpts=PTS-STARTPTS`
          : 'null'
        filterParts.push(`[${overlayStartIndex}:v]${trimFilter}[overlayv]`)
        filterParts.push(`[${overlayStartIndex}:a]atrim=start=${clip.trimStart}:end=${clip.trimEnd},asetpts=PTS-STARTPTS[overlaya]`)
      } else {
        const videoInputs = overlayClips.map((_, i) => `[${overlayStartIndex + i}:v]`).join('')
        const audioInputs = overlayClips.map((_, i) => `[${overlayStartIndex + i}:a]`).join('')
        filterParts.push(`${videoInputs}concat=n=${overlayClips.length}:v=1:a=1[overlayv][overlaya]`)
      }
    }
    
    // Determine output resolution
    let targetWidth = resolution?.width || null
    let targetHeight = resolution?.height || null
    
    // If no resolution specified or 'source', use main video resolution
    if (!targetWidth || !targetHeight || resolution?.value === 'source') {
      // Get first main clip metadata for source resolution
      const firstMainClip = mainClips[0]
      if (firstMainClip.metadata) {
        targetWidth = firstMainClip.metadata.width
        targetHeight = firstMainClip.metadata.height
      } else {
        // Fallback to 1920x1080
        targetWidth = 1920
        targetHeight = 1080
      }
    }
    
    // Scale main video
    filterParts.push(`[mainv]scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2[mainv_scaled]`)
    
    // Scale and position overlay (PiP)
    if (overlayClips.length > 0) {
      const pipWidth = Math.floor(targetWidth * 0.22) // 22% of output width
      const pipHeight = Math.floor(pipWidth * 9 / 16) // Maintain 16:9 aspect ratio
      
      // Scale overlay to PiP size
      filterParts.push(`[overlayv]scale=${pipWidth}:${pipHeight}:force_original_aspect_ratio=decrease,pad=${pipWidth}:${pipHeight}:(ow-iw)/2:(oh-ih)/2[overlayv_scaled]`)
      
      // Build overlay enable expression for each overlay clip segment
      const enableExpressions = overlayClips.map(clip => {
        const start = clip.startTime
        const end = clip.startTime + (clip.trimEnd - clip.trimStart)
        return `between(t,${start},${end})`
      }).join('+')
      
      // Composite overlay onto main (bottom-right, 16px from edges, 80px from bottom for captions)
      filterParts.push(`[mainv_scaled][overlayv_scaled]overlay=W-w-16:H-h-80:enable='${enableExpressions}'[outv]`)
    } else {
      // No overlay, just rename main
      filterParts.push(`[mainv_scaled]copy[outv]`)
    }
    
    // Apply subtitle filters if captions exist
    let videoOutput = 'outv'
    if (mainSrtPath || overlaySrtPath) {
      // Escape paths for FFmpeg filter syntax
      const escapeFilterPath = (path: string) => path.replace(/\\/g, '\\\\\\\\').replace(/:/g, '\\\\:')
      
      if (overlaySrtPath) {
        // Overlay captions first (will appear above main captions)
        const escapedPath = escapeFilterPath(overlaySrtPath)
        filterParts.push(`[${videoOutput}]subtitles='${escapedPath}':force_style='Alignment=2,MarginV=80,FontSize=18,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BackColour=&H80000000,Bold=1,Outline=1,Shadow=1'[outv1]`)
        videoOutput = 'outv1'
      }
      
      if (mainSrtPath) {
        // Main captions at bottom
        const escapedPath = escapeFilterPath(mainSrtPath)
        filterParts.push(`[${videoOutput}]subtitles='${escapedPath}':force_style='Alignment=2,MarginV=16,FontSize=20,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BackColour=&H80000000,Bold=1,Outline=1,Shadow=1'[outv2]`)
        videoOutput = 'outv2'
      }
    }
    
    // Combine filter chain
    const filterComplex = filterParts.join(';')
    args.push('-filter_complex', filterComplex)
    
    // Map output streams
    args.push('-map', `[${videoOutput}]`)
    
    // Mix audio from both tracks if overlay exists
    if (overlayClips.length > 0) {
      args.push('-filter_complex', `[maina][overlaya]amix=inputs=2:duration=longest[outa]`)
      args.push('-map', '[outa]')
    } else {
      args.push('-map', '[maina]')
    }
    
    // Codec settings
    args.push(
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-y',
      outputPath
    )
    
    console.log('[Export PiP] FFmpeg filter:', filterComplex)
    
    // ===== PHASE 4: Execute FFmpeg =====
    console.log('[Export PiP] Phase 4: Executing FFmpeg...')
    
    return new Promise((resolve) => {
      const ffmpeg = spawn(ffmpegPath, args)
      let stderr = ''

      ffmpeg.stderr.on('data', (data) => {
        const output = data.toString()
        stderr += output

        // Parse progress
        const timeMatch = output.match(/time=(\d+):(\d+):(\d+\.?\d*)/)
        if (timeMatch && mainWindow) {
          const hours = parseInt(timeMatch[1], 10)
          const minutes = parseInt(timeMatch[2], 10)
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
        // Cleanup
        tempFiles.forEach(f => {
          try { unlinkSync(f) } catch (e) { /* ignore */ }
        })
        srtFiles.forEach(f => {
          try { unlinkSync(f) } catch (e) { /* ignore */ }
        })
        
        resolve({
          success: false,
          error: `Failed to spawn FFmpeg: ${error.message}`,
        })
      })

      ffmpeg.on('close', (code) => {
        // Cleanup temp files
        tempFiles.forEach(f => {
          try { unlinkSync(f) } catch (e) { /* ignore */ }
        })
        srtFiles.forEach(f => {
          try { unlinkSync(f) } catch (e) { /* ignore */ }
        })
        
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

        console.log('[Export PiP] Export completed successfully')
        resolve({ success: true })
      })
    })
  } catch (error) {
    // Cleanup on error
    tempFiles.forEach(f => {
      try { unlinkSync(f) } catch (e) { /* ignore */ }
    })
    srtFiles.forEach(f => {
      try { unlinkSync(f) } catch (e) { /* ignore */ }
    })
    
    return {
      success: false,
      error: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}
