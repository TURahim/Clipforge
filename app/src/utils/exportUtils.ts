import type { TimelineClip } from '../types'

/**
 * Build FFmpeg command arguments for single-clip export
 */
export function buildSingleClipExportCommand(
  clip: TimelineClip,
  outputPath: string
): string[] {
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
  
  // Output file
  args.push(outputPath)

  return args
}

/**
 * Build FFmpeg command arguments for multi-clip export using concat demuxer
 */
export function buildConcatExportCommand(
  filelistPath: string,
  outputPath: string
): string[] {
  return [
    '-f', 'concat',
    '-safe', '0', // Allow absolute paths
    '-i', filelistPath,
    '-c:v', 'libx264',
    '-c:a', 'aac',
    outputPath,
  ]
}

/**
 * Generate filelist.txt content for concat demuxer
 */
export function generateFilelistContent(clips: TimelineClip[]): string {
  return clips
    .map((clip) => `file '${clip.filePath}'`)
    .join('\n')
}

/**
 * Parse FFmpeg progress from stderr output
 * Looks for "time=HH:MM:SS.ms" pattern
 */
export function parseExportProgress(
  stderr: string,
  totalDuration: number
): number {
  const match = stderr.match(/time=(\d+):(\d+):(\d+\.\d+)/)
  if (!match) return 0

  const hours = parseInt(match[1])
  const minutes = parseInt(match[2])
  const seconds = parseFloat(match[3])
  const currentTime = hours * 3600 + minutes * 60 + seconds

  const percentage = (currentTime / totalDuration) * 100
  return Math.min(Math.round(percentage), 100)
}

/**
 * Calculate total duration of timeline clips
 */
export function calculateTotalExportDuration(clips: TimelineClip[]): number {
  return clips.reduce((total, clip) => {
    const effectiveDuration = clip.trimEnd - clip.trimStart
    return total + effectiveDuration
  }, 0)
}

