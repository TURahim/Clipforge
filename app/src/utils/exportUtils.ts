/**
 * Export Utilities - Functions for building FFmpeg export commands
 */

import { tmpdir } from 'os'
import { join } from 'path'
import type { TimelineClip } from '../types'

/**
 * Build FFmpeg command for single clip export
 */
export function buildSingleClipExportCommand(
  clip: TimelineClip,
  outputPath: string
): string[] {
  const args: string[] = []

  // Add trim start if needed (seek to start position)
  if (clip.trimStart > 0) {
    args.push('-ss', clip.trimStart.toString())
  }

  // Input file
  args.push('-i', clip.filePath)

  // Add duration if clip is trimmed
  const effectiveDuration = clip.trimEnd - clip.trimStart
  if (clip.trimEnd < clip.duration || clip.trimStart > 0) {
    args.push('-t', effectiveDuration.toString())
  }

  // Video codec - use libx264 for compatibility
  args.push('-c:v', 'libx264')
  
  // Audio codec - use aac for compatibility
  args.push('-c:a', 'aac')
  
  // Quality settings
  args.push('-preset', 'medium')
  args.push('-crf', '23')
  
  // Output file
  args.push(outputPath)

  return args
}

/**
 * Build FFmpeg command for concatenating multiple clips
 */
export function buildConcatExportCommand(
  filelistPath: string,
  outputPath: string
): string[] {
  return [
    '-f', 'concat',
    '-safe', '0', // Allow absolute file paths
    '-i', filelistPath,
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-preset', 'medium',
    '-crf', '23',
    outputPath,
  ]
}

/**
 * Generate filelist content for FFmpeg concat demuxer
 * Each line: file '/absolute/path/to/file.mp4'
 */
export function generateFilelistContent(clips: TimelineClip[]): string {
  return clips
    .map((clip) => `file '${clip.filePath}'`)
    .join('\n')
}

/**
 * Generate temporary filelist path
 */
export function generateTempFilelistPath(): string {
  const timestamp = Date.now()
  return join(tmpdir(), `clipforge-filelist-${timestamp}.txt`)
}

/**
 * Parse FFmpeg progress from stderr output
 * FFmpeg outputs progress like: time=00:01:23.45
 */
export function parseExportProgress(
  stderrLine: string,
  totalDuration: number
): number {
  // Match time=HH:MM:SS.MS pattern
  const timeMatch = stderrLine.match(/time=(\d+):(\d+):(\d+\.?\d*)/)
  
  if (!timeMatch) {
    return 0
  }

  const hours = parseInt(timeMatch[1], 10)
  const minutes = parseInt(timeMatch[2], 10)
  const seconds = parseFloat(timeMatch[3])

  const currentTime = hours * 3600 + minutes * 60 + seconds

  if (totalDuration === 0) {
    return 0
  }

  const percentage = (currentTime / totalDuration) * 100
  return Math.min(Math.round(percentage), 100)
}

/**
 * Calculate total duration of all clips (respecting trim)
 */
export function calculateTotalExportDuration(clips: TimelineClip[]): number {
  return clips.reduce((total, clip) => {
    const effectiveDuration = clip.trimEnd - clip.trimStart
    return total + effectiveDuration
  }, 0)
}

/**
 * Validate export clips
 */
export function validateExportClips(clips: TimelineClip[]): {
  valid: boolean
  error?: string
} {
  if (clips.length === 0) {
    return { valid: false, error: 'No clips to export' }
  }

  for (const clip of clips) {
    if (!clip.filePath) {
      return { valid: false, error: `Clip "${clip.filename}" has no file path` }
    }

    const effectiveDuration = clip.trimEnd - clip.trimStart
    if (effectiveDuration <= 0) {
      return { valid: false, error: `Clip "${clip.filename}" has invalid trim (duration: ${effectiveDuration}s)` }
    }
  }

  return { valid: true }
}

/**
 * Check if timeline has overlay clips (track > 0)
 */
export function hasOverlayTracks(clips: TimelineClip[]): boolean {
  return clips.some(clip => (clip.track || 0) > 0)
}

/**
 * Separate clips by track
 */
export function separateClipsByTrack(clips: TimelineClip[]): {
  mainTrack: TimelineClip[]
  overlayTrack: TimelineClip[]
} {
  const mainTrack = clips.filter(clip => (clip.track || 0) === 0)
  const overlayTrack = clips.filter(clip => (clip.track || 0) === 1)
  
  return { mainTrack, overlayTrack }
}

/**
 * Build FFmpeg command for multi-track export with overlay
 * Note: For MVP, we export with a simple PiP overlay
 * More complex multi-clip overlay requires advanced FFmpeg filters
 */
export function buildOverlayExportCommand(
  mainClips: TimelineClip[],
  overlayClips: TimelineClip[],
  outputPath: string
): string[] {
  // For MVP: Simple case - export main track, note that full overlay
  // composition requires more complex FFmpeg filter graphs
  // This is a simplified implementation
  
  const args: string[] = []
  
  // For now, export main track only
  // Full implementation would require complex filter_complex
  // with overlay filter for proper PiP composition
  
  console.warn('[Export] Multi-track overlay export is simplified in MVP')
  console.warn('[Export] Exporting main track only. Full PiP composition coming soon.')
  
  // Build concat for main track
  return buildConcatExportCommand(
    generateTempFilelistPath(),
    outputPath
  )
}
