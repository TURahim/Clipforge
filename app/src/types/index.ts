// Core video clip interface
export interface Clip {
  id: string
  filePath: string
  filename: string
  duration: number // in seconds
  thumbnail?: string // base64 or URL
  metadata?: VideoMetadata
}

// Timeline clip (extends Clip with timeline-specific props)
export interface TimelineClip extends Clip {
  startTime: number // position on timeline (seconds)
  trimStart: number // trim in-point (seconds)
  trimEnd: number // trim out-point (seconds)
  track: number // track number (0 = main, 1 = overlay)
  
  // For overlay positioning (used when track > 0)
  position?: { x: number; y: number } // pixel position for overlay
  scale?: number // scale factor for overlay (0.0 - 1.0)
}

// Video metadata from ffprobe
export interface VideoMetadata {
  width: number
  height: number
  codec: string
  fileSize: number
  bitrate?: number
  framerate?: number
}

// FFprobe JSON response structure
export interface FFprobeStream {
  codec_name: string
  codec_type: 'video' | 'audio'
  width?: number
  height?: number
  duration?: string
  r_frame_rate?: string
}

export interface FFprobeFormat {
  filename: string
  duration: string
  size: string
  bit_rate: string
}

export interface FFprobeResponse {
  streams: FFprobeStream[]
  format: FFprobeFormat
}

// Export progress
export interface ExportProgress {
  percentage: number
  currentTime: number
  totalDuration: number
  isExporting: boolean
  error?: string
}

// App state (Zustand store shape - will be implemented in PR #2)
export interface AppState {
  // Clips
  clips: Clip[]
  timelineClips: TimelineClip[]
  selectedClipId: string | null
  
  // Playback
  isPlaying: boolean
  playheadPosition: number
  
  // Export
  exportProgress: ExportProgress
  
  // Actions (will be added in each PR)
  addClip: (clip: Clip) => void
  removeClip: (id: string) => void
  addToTimeline: (clip: Clip) => void
  removeFromTimeline: (id: string) => void
  selectClip: (id: string | null) => void
  setPlayheadPosition: (position: number) => void
  setPlaying: (isPlaying: boolean) => void
  updateClipTrim: (id: string, trimStart: number, trimEnd: number) => void
  setExportProgress: (progress: Partial<ExportProgress>) => void
}

