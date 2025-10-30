import { create } from 'zustand'
import type { Clip, TimelineClip, ExportProgress } from '../types'
import type { StateCreator } from 'zustand'

/**
 * Helper: Safely coerce numeric clip fields to valid numbers
 * Accepts any object with optional duration, trimStart, trimEnd
 * Handles both numbers and string representations of numbers
 */
function sanitizeClipNumbers(incoming: { 
  duration?: number | string
  trimStart?: number | string
  trimEnd?: number | string
  [key: string]: unknown
}): {
  trimStart: number
  trimEnd: number
  duration: number
} {
  // Convert to number first, then check if finite (handles string "1.23" → 1.23)
  const parsedDuration = Number(incoming?.duration)
  const parsedTrimStart = Number(incoming?.trimStart)
  const parsedTrimEnd = Number(incoming?.trimEnd)
  
  const safeDuration = Number.isFinite(parsedDuration) ? parsedDuration : 0
  const safeTrimStart = Number.isFinite(parsedTrimStart) ? parsedTrimStart : 0
  const safeTrimEnd = Number.isFinite(parsedTrimEnd) ? parsedTrimEnd : safeDuration
  
  return {
    trimStart: safeTrimStart,
    trimEnd: safeTrimEnd,
    duration: safeDuration,
  }
}

/**
 * Helper: Calculate the total duration of clips (NaN-safe)
 */
function getTotalDuration(clips: TimelineClip[]): number {
  return clips.reduce((total, c) => {
    const dur = Number.isFinite(c?.trimEnd) && Number.isFinite(c?.trimStart)
      ? Math.max(0, c.trimEnd - c.trimStart)
      : 0
    return total + dur
  }, 0)
}

interface AppState {
  // Clips
  clips: Clip[]
  timelineClips: TimelineClip[]
  selectedClipId: string | null
  
  // Playback
  isPlaying: boolean
  playheadPosition: number
  
  // Timeline
  zoomLevel: number // 1.0 = 100px/s (default), 0.25-4.0 range
  snapEnabled: boolean
  
  // Export
  exportProgress: ExportProgress
  
  // Actions
  addClip: (clip: Clip) => void
  removeClip: (id: string) => void
  addToTimeline: (clip: Clip, track?: number) => void
  removeFromTimeline: (id: string) => void
  selectClip: (id: string | null) => void
  setPlayheadPosition: (position: number) => void
  setPlaying: (isPlaying: boolean) => void
  updateClipTrim: (id: string, trimStart: number, trimEnd: number) => void
  setExportProgress: (progress: Partial<ExportProgress>) => void
  splitClipAtPlayhead: (clipId: string) => void
  deleteClip: (clipId: string) => void
  updateClipTrack: (clipId: string, track: number) => void
  updateClipStartTime: (clipId: string, startTime: number) => void
  updateClipPosition: (clipId: string, position: { x: number; y: number }, scale?: number) => void
  setZoomLevel: (level: number) => void
  zoomIn: () => void
  zoomOut: () => void
  toggleSnap: () => void
  setClipCaptions: (clipId: string, captions: import('../types').Caption[]) => void
}

const storeConfig: StateCreator<AppState> = (set) => ({
  // Initial state
  clips: [],
  timelineClips: [],
  selectedClipId: null,
  isPlaying: false,
  playheadPosition: 0,
  zoomLevel: 1.0, // 1.0 = 100px per second (default)
  snapEnabled: true,
  exportProgress: {
    percentage: 0,
    currentTime: 0,
    totalDuration: 0,
    isExporting: false,
  },
  
  // Actions
  addClip: (clip: Clip) =>
    set((state) => {
      console.log('[Store] addClip called:', clip.filename)
      
      // Validate incoming clip
      if (!clip.id || !clip.filename || !clip.filePath) {
        console.error('[Store] Invalid clip: missing required fields', clip)
        return state
      }
      
      // Check for duplicate ID
      if (state.clips.some((c: Clip) => c.id === clip.id)) {
        console.warn('[Store] Clip with ID already exists in library:', clip.id)
        return state
      }
      
      // Sanitize numeric fields
      const { duration } = sanitizeClipNumbers(clip as never)
      
      const sanitizedClip: Clip = {
        ...clip,
        duration,
      }
      
      console.log('[Store] Clip added to library:', {
        id: sanitizedClip.id,
        filename: sanitizedClip.filename,
        duration: sanitizedClip.duration,
      })
      
      return {
        clips: [...state.clips, sanitizedClip],
      }
    }),
  
  removeClip: (id: string) =>
    set((state) => ({
      clips: state.clips.filter((c: Clip) => c.id !== id),
      timelineClips: state.timelineClips.filter((c: TimelineClip) => c.id !== id),
      selectedClipId: state.selectedClipId === id ? null : state.selectedClipId,
    })),
  
  addToTimeline: (incoming: Clip, track?: number) =>
    set((state) => {
      console.log('[Store] addToTimeline called with:', incoming.filename, 'track:', track)
      console.log('[Store] Current timeline clips:', state.timelineClips.length)
      
      // Validate incoming clip has required fields
      if (!incoming.id || !incoming.filename) {
        console.error('[Store] Invalid clip: missing id or filename', incoming)
        return state // No change
      }
      
      // Check for duplicate ID
      if (state.timelineClips.some((c: TimelineClip) => c.id === incoming.id)) {
        console.warn('[Store] Clip with ID already exists on timeline:', incoming.id)
        return state // No change
      }
      
      // Sanitize numeric fields with helper function
      const { trimStart, trimEnd, duration } = sanitizeClipNumbers(incoming as never)
      
      console.log('[Store] Coerced values:', { trimStart, trimEnd, duration })
      
      // Use provided track or default to main track (0)
      const assignedTrack = track !== undefined ? Math.max(0, Math.min(1, track)) : 0
      
      // Calculate start time based on total duration of existing clips on the same track
      const clipsOnSameTrack = state.timelineClips.filter((c: TimelineClip) => c.track === assignedTrack)
      const startTime = getTotalDuration(clipsOnSameTrack)
      
      // Validate that trim values are within bounds
      const boundedTrimStart = Math.max(0, Math.min(trimStart, duration))
      const boundedTrimEnd = Math.max(boundedTrimStart, Math.min(trimEnd, duration))
      
      if (boundedTrimStart !== trimStart || boundedTrimEnd !== trimEnd) {
        console.warn('[Store] Trim values adjusted to bounds:', {
          original: { trimStart, trimEnd },
          bounded: { trimStart: boundedTrimStart, trimEnd: boundedTrimEnd }
        })
      }
      
      const timelineClip: TimelineClip = {
        ...incoming,
        startTime,
        trimStart: boundedTrimStart,
        trimEnd: boundedTrimEnd,
        duration,
        track: assignedTrack,
        scale: assignedTrack === 1 ? 0.25 : 1.0, // Small for overlay, full size for main
        position: assignedTrack === 1 ? { x: 20, y: 20 } : undefined, // Default overlay position
      }
      
      console.log('[Store] New timeline clip created:', {
        id: timelineClip.id,
        filename: timelineClip.filename,
        startTime: timelineClip.startTime,
        trimStart: timelineClip.trimStart,
        trimEnd: timelineClip.trimEnd,
        duration: timelineClip.duration,
        effectiveDuration: timelineClip.trimEnd - timelineClip.trimStart,
      })
      
      const newTimelineClips = [...state.timelineClips, timelineClip]
      console.log('[Store] New timeline clips count:', newTimelineClips.length)
      console.log('[Store] Total timeline duration:', getTotalDuration(newTimelineClips))
      
      return {
        timelineClips: newTimelineClips,
      }
    }),
  
  removeFromTimeline: (id: string) =>
    set((state) => {
      console.log('[Store] removeFromTimeline called:', id)
      
      const clipExists = state.timelineClips.some((c: TimelineClip) => c.id === id)
      if (!clipExists) {
        console.warn('[Store] Clip not found for removal:', id)
        return state
      }
      
      // Remove the clip
      const filteredClips = state.timelineClips.filter((c: TimelineClip) => c.id !== id)
      
      // Recalculate startTime for all remaining clips
      let currentStartTime = 0
      const repositionedClips = filteredClips.map((c: TimelineClip) => {
        const updatedClip = {
          ...c,
          startTime: currentStartTime,
        }
        const effectiveDuration = c.trimEnd - c.trimStart
        currentStartTime += effectiveDuration
        return updatedClip
      })
      
      console.log('[Store] Timeline clips repositioned after removal')
      console.log('[Store] Remaining clips:', repositionedClips.length)
      
      return {
        timelineClips: repositionedClips,
        selectedClipId: state.selectedClipId === id ? null : state.selectedClipId,
      }
    }),
  
  selectClip: (id: string | null) =>
    set({ selectedClipId: id }),
  
  setPlayheadPosition: (position: number) =>
    set({ playheadPosition: position }),
  
  setPlaying: (isPlaying: boolean) =>
    set({ isPlaying }),
  
  updateClipTrim: (id: string, trimStart: number, trimEnd: number) =>
    set((state) => {
      console.log('[Store] updateClipTrim called:', { id, trimStart, trimEnd })
      
      const clipIndex = state.timelineClips.findIndex((c: TimelineClip) => c.id === id)
      if (clipIndex === -1) {
        console.warn('[Store] Clip not found for trim update:', id)
        return state
      }
      
      const clip = state.timelineClips[clipIndex]
      
      // Sanitize and bound trim values
      const safeTrimStart = Number.isFinite(trimStart) ? Number(trimStart) : 0
      const safeTrimEnd = Number.isFinite(trimEnd) ? Number(trimEnd) : clip.duration
      
      // Ensure trim values are within clip duration
      const boundedTrimStart = Math.max(0, Math.min(safeTrimStart, clip.duration))
      const boundedTrimEnd = Math.max(boundedTrimStart, Math.min(safeTrimEnd, clip.duration))
      
      if (boundedTrimStart === clip.trimStart && boundedTrimEnd === clip.trimEnd) {
        console.log('[Store] No trim change detected, skipping update')
        return state
      }
      
      console.log('[Store] Trim values adjusted:', {
        original: { trimStart, trimEnd },
        bounded: { trimStart: boundedTrimStart, trimEnd: boundedTrimEnd }
      })
      
      // Update the clip with new trim values
      const updatedClips = [...state.timelineClips]
      updatedClips[clipIndex] = {
        ...clip,
        trimStart: boundedTrimStart,
        trimEnd: boundedTrimEnd,
      }
      
      // Recalculate startTime for all subsequent clips
      let currentStartTime = 0
      for (let i = 0; i < updatedClips.length; i++) {
        const c = updatedClips[i]
        updatedClips[i] = {
          ...c,
          startTime: currentStartTime,
        }
        const effectiveDuration = c.trimEnd - c.trimStart
        currentStartTime += effectiveDuration
      }
      
      console.log('[Store] Timeline clips repositioned after trim update')
      
      return {
        timelineClips: updatedClips,
      }
    }),
  
  setExportProgress: (progress: Partial<ExportProgress>) =>
    set((state) => ({
      exportProgress: { ...state.exportProgress, ...progress },
    })),
  
  // Split clip at playhead position
  splitClipAtPlayhead: (clipId: string) =>
    set((state) => {
      const clip = state.timelineClips.find((c: TimelineClip) => c.id === clipId)
      if (!clip) {
        console.warn('[Store] Clip not found for split:', clipId)
        return state
      }
      
      // Calculate split point relative to clip start
      const splitPoint = state.playheadPosition - clip.startTime
      
      // Validate split point is within the clip's effective duration
      const effectiveDuration = clip.trimEnd - clip.trimStart
      if (splitPoint <= 0 || splitPoint >= effectiveDuration) {
        console.warn('[Store] Split point outside clip bounds:', splitPoint, effectiveDuration)
        return state
      }
      
      // Create two new clips
      const timestamp = Date.now()
      const clip1: TimelineClip = {
        ...clip,
        id: `${clip.id}-split1-${timestamp}`,
        trimEnd: clip.trimStart + splitPoint,
      }
      
      const clip2: TimelineClip = {
        ...clip,
        id: `${clip.id}-split2-${timestamp}`,
        trimStart: clip.trimStart + splitPoint,
        startTime: clip.startTime + splitPoint,
      }
      
      // Replace original with two new clips
      const newClips = state.timelineClips
        .filter((c: TimelineClip) => c.id !== clipId)
        .concat([clip1, clip2])
        .sort((a, b) => a.startTime - b.startTime)
      
      console.log('[Store] Split clip:', { original: clip.id, clip1: clip1.id, clip2: clip2.id })
      
      return {
        timelineClips: newClips,
        selectedClipId: clip1.id, // Select first half
      }
    }),
  
  // Delete clip and close gap
  deleteClip: (clipId: string) =>
    set((state) => {
      const deletedClip = state.timelineClips.find((c: TimelineClip) => c.id === clipId)
      if (!deletedClip) {
        console.warn('[Store] Clip not found for delete:', clipId)
        return state
      }
      
      const deletedDuration = deletedClip.trimEnd - deletedClip.trimStart
      
      // Remove the clip and shift remaining clips left ON THE SAME TRACK
      const remainingClips = state.timelineClips
        .filter((c: TimelineClip) => c.id !== clipId)
        .map((c: TimelineClip) => {
          // Only shift clips on the same track that come after deleted clip
          if (c.track === deletedClip.track && c.startTime > deletedClip.startTime) {
            return {
              ...c,
              startTime: c.startTime - deletedDuration,
            }
          }
          return c
        })
      
      console.log('[Store] Deleted clip:', clipId, 'duration:', deletedDuration)
      
      return {
        timelineClips: remainingClips,
        selectedClipId: null,
      }
    }),
  
  // Update clip track
  updateClipTrack: (clipId: string, track: number) =>
    set((state) => {
      const clip = state.timelineClips.find((c: TimelineClip) => c.id === clipId)
      if (!clip) {
        console.warn('[Store] Clip not found for track update:', clipId)
        return state
      }
      
      // Constrain track to valid range (0-1)
      const validTrack = Math.max(0, Math.min(1, track))
      
      const updatedClips = state.timelineClips.map((c: TimelineClip) => {
        if (c.id === clipId) {
          return {
            ...c,
            track: validTrack,
            // Set default overlay position/scale if moving to overlay track
            ...(validTrack === 1 && c.track === 0 ? {
              position: c.position || { x: 20, y: 20 },
              scale: c.scale || 0.25
            } : {}),
            // Reset position/scale if moving to main track
            ...(validTrack === 0 && c.track === 1 ? {
              position: undefined,
              scale: 1.0
            } : {})
          }
        }
        return c
      })
      
      console.log('[Store] Updated clip track:', clipId, 'to', validTrack)
      
      return { timelineClips: updatedClips }
    }),
  
  // Update clip startTime (for horizontal repositioning)
  updateClipStartTime: (clipId: string, startTime: number) =>
    set((state) => {
      const updatedClips = state.timelineClips.map((c: TimelineClip) => {
        if (c.id === clipId) {
          return {
            ...c,
            startTime: Math.max(0, startTime) // Ensure startTime is not negative
          }
        }
        return c
      })
      
      // Sort clips by startTime and track
      updatedClips.sort((a, b) => {
        if (a.track !== b.track) return a.track - b.track
        return a.startTime - b.startTime
      })
      
      console.log('[Store] Updated clip startTime:', clipId, 'to', startTime)
      
      return { timelineClips: updatedClips }
    }),
  
  // Update clip position and scale (for overlay track)
  updateClipPosition: (clipId: string, position: { x: number; y: number }, scale?: number) =>
    set((state) => {
      const updatedClips = state.timelineClips.map((c: TimelineClip) => {
        if (c.id === clipId) {
          return {
            ...c,
            position,
            ...(scale !== undefined ? { scale } : {})
          }
        }
        return c
      })
      
      console.log('[Store] Updated clip position:', clipId, position, scale)
      
      return { timelineClips: updatedClips }
    }),
  
  // Zoom controls
  setZoomLevel: (level: number) =>
    set({ zoomLevel: Math.max(0.25, Math.min(4.0, level)) }),
  
  zoomIn: () =>
    set((state) => ({ 
      zoomLevel: Math.min(4.0, state.zoomLevel * 1.5) 
    })),
  
  zoomOut: () =>
    set((state) => ({ 
      zoomLevel: Math.max(0.25, state.zoomLevel / 1.5) 
    })),
  
  toggleSnap: () =>
    set((state) => ({ snapEnabled: !state.snapEnabled })),
  
  // Caption management
  setClipCaptions: (clipId: string, captions: import('../types').Caption[]) =>
    set((state) => ({
      clips: state.clips.map((c) =>
        c.id === clipId ? { ...c, captions } : c
      ),
      timelineClips: state.timelineClips.map((c) =>
        c.id === clipId ? { ...c, captions } : c
      ),
    })),
})

export const useStore = create<AppState>(storeConfig)

// Runtime diagnostic - log store on creation
if (typeof window !== 'undefined') {
  const store = useStore.getState()
  console.log('[Store] Initialized with actions:', Object.keys(store).filter(k => typeof store[k as keyof typeof store] === 'function'))
  
  if (typeof store.addToTimeline !== 'function') {
    console.error('[Store] ❌ CRITICAL: addToTimeline is NOT a function!', typeof store.addToTimeline)
  } else {
    console.log('[Store] ✅ addToTimeline is correctly exported')
  }
}

